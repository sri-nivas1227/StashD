import re
import json
import socket
import logging
import ipaddress
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

logger = logging.getLogger(__name__)
NOISE_TAGS = ["script", "style", "nav", "footer", "header", "aside", "form", "noscript", "iframe"]


def extract_domain(url: str) -> str:
    """Bare hostname, www-stripped — used as a site_name fallback and is itself
    a strong, always-available tag candidate (e.g. 'amazon.com') even when
    scraping fails entirely."""
    hostname = urlparse(url).hostname or ""
    return hostname[4:] if hostname.startswith("www.") else hostname


def domain_to_site_name(domain: str) -> str:
    """'app.joinhandshake.com' -> 'Joinhandshake', 'amazon.com' -> 'Amazon'."""
    if not domain:
        return ""
    parts = domain.split(".")
    label = parts[-2] if len(parts) >= 2 else parts[0]
    return label.capitalize()


def dedupe_keywords(keywords: list) -> list:
    seen = set()
    result = []
    for kw in keywords:
        key = kw.lower().strip()
        if key and key not in seen:
            seen.add(key)
            result.append(kw.strip())
    return result


def extract_meta_signals(soup) -> dict:
    """Meta keywords, article:tag, og:type, og:site_name — pre-made tag
    candidates sites embed for their own SEO/link-preview needs."""
    keywords = []
    meta_keywords = soup.find("meta", attrs={"name": "keywords"})
    if meta_keywords and meta_keywords.get("content"):
        keywords.extend(meta_keywords["content"].split(","))

    for tag in soup.find_all("meta", attrs={"property": "article:tag"}):
        if tag.get("content"):
            keywords.append(tag["content"])

    og_type = soup.find("meta", attrs={"property": "og:type"})
    content_type = og_type["content"].strip() if og_type and og_type.get("content") else ""

    og_site_name = soup.find("meta", attrs={"property": "og:site_name"})
    site_name = og_site_name["content"].strip() if og_site_name and og_site_name.get("content") else ""

    return {"keywords": keywords, "content_type": content_type, "site_name": site_name}


def extract_json_ld_signals(soup) -> dict:
    """Pulls keywords/@type/category out of schema.org JSON-LD blocks — sites
    embed these for their own SEO, and they're often cleaner tag signal than
    scraped body text."""
    keywords = []
    content_type = ""
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            payload = json.loads(script.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        items = payload if isinstance(payload, list) else [payload]
        for item in items:
            if not isinstance(item, dict):
                continue
            raw_keywords = item.get("keywords")
            if isinstance(raw_keywords, str):
                keywords.extend(raw_keywords.split(","))
            elif isinstance(raw_keywords, list):
                keywords.extend(str(k) for k in raw_keywords)
            category = item.get("category")
            if isinstance(category, str) and category.strip():
                keywords.append(category)
            if not content_type and isinstance(item.get("@type"), str):
                content_type = item["@type"]
    return {"keywords": keywords, "content_type": content_type}


def clean_text_snippet(soup, limit: int = 500) -> str:
    """Strips script/style/nav/footer/etc before pulling text — otherwise the
    snippet is often JS/CSS or nav-link noise instead of real page content."""
    for tag in soup.find_all(NOISE_TAGS):
        tag.decompose()
    body_text = soup.get_text(separator=" ", strip=True)
    return body_text[:limit]


def fetch_link_metadata(url:str)->dict:
    """
    Get Title, Description, Content from a URL
    """
    # Reject garbage input early — no point resolving/scraping something that isn't a URL
    if not is_valid_url(url):
        domain = extract_domain(url)
        return {
            "title": "",
            "description": "",
            "text_snippet": "",
            "source": "invalid_url",
            "resolved_url": url,
            "url": url,
            "blocked": True,
            "domain": domain,
            "site_name": domain_to_site_name(domain),
            "keywords": [],
            "content_type": ""
        }

    # SSRF guard — refuse to fetch anything resolving to a private/internal IP.
    # (This should ALSO be checked at link-submission time, before saving to the DB —
    # this check here is defense-in-depth, not a substitute for that.)
    if not is_safe_url(url):
        domain = extract_domain(url)
        return {
            "title": "",
            "description": "",
            "text_snippet": "",
            "source": "unsafe_url",
            "resolved_url": url,
            "url": url,
            "blocked": True,
            "domain": domain,
            "site_name": domain_to_site_name(domain),
            "keywords": [],
            "content_type": ""
        }

    # Resolved shortened or redirected URL to get the URL we're targeting for.
    resolved_url = resolve_url(url)

    # Redirects can land somewhere new (e.g. a shortener bouncing to an internal IP) —
    # re-check safety on the FINAL destination, not just the original URL.
    if not is_safe_url(resolved_url):
        domain = extract_domain(resolved_url)
        return {
            "title": "",
            "description": "",
            "text_snippet": "",
            "source": "unsafe_url",
            "resolved_url": resolved_url,
            "url": url,
            "blocked": True,
            "domain": domain,
            "site_name": domain_to_site_name(domain),
            "keywords": [],
            "content_type": ""
        }

    try:
        response = requests.get(resolved_url,timeout=5, headers={"User-Agent":"Mozilla/5.0"})
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Open Graph tags first — sites keep these accurate since their own link
        # previews (iMessage, Slack, Twitter cards) depend on them. Falls back to
        # <title> and meta description when OG tags aren't present.
        og_title = soup.find("meta", attrs={"property": "og:title"})
        og_description = soup.find("meta", attrs={"property": "og:description"})

        title = ""
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()
        elif soup.title and soup.title.string:
            title = soup.title.string.strip()

        description = ""
        if og_description and og_description.get("content"):
            description = og_description["content"].strip()
        else:
            meta_desc = soup.find("meta", attrs={"name":"description"})
            if meta_desc and meta_desc.get("content"):
                description = meta_desc["content"].strip()

        # Tag signal sites already hand us for free — meta keywords, article:tag,
        # og:type/og:site_name, and schema.org JSON-LD. Cheaper and cleaner than
        # inferring tags from scraped body text alone.
        meta_signals = extract_meta_signals(soup)
        json_ld_signals = extract_json_ld_signals(soup)
        keywords = dedupe_keywords(meta_signals["keywords"] + json_ld_signals["keywords"])
        content_type = meta_signals["content_type"] or json_ld_signals["content_type"]
        domain = extract_domain(resolved_url)
        site_name = meta_signals["site_name"] or domain_to_site_name(domain)

        text_snippet = clean_text_snippet(soup)

        data = {
            "title": title,
            "description":description,
            "text_snippet": text_snippet,
            "domain": domain,
            "site_name": site_name,
            "keywords": keywords,
            "content_type": content_type,
            "error" : None
        }
        # A page can return 200 OK and still be worthless — CAPTCHA walls, login walls,
        # soft "continue shopping" redirects. Catch both cases, not just CAPTCHA phrasing.
        if looks_like_bot_wall(title=title, text_snippet=text_snippet) or is_low_signal(title, description, text_snippet):
            data["blocked"] = True
        else:
            data["blocked"] = False

        if not data["blocked"] and (data["title"] or data["description"]):
            data["source"] = "scrape"
            data["resolved_url"] = resolved_url
            data["url"] = url
            return data
    except requests.RequestException as e:
        logger.log("Error occurred:",str(e))

    # 2. Scraping failed, bot-walled, or low-signal — try oEmbed (works for YT/Twitter/TikTok/Pinterest)
    oembed_result = try_OEMBED(resolved_url)
    if oembed_result and (oembed_result["title"] or oembed_result["description"]):
        domain = extract_domain(resolved_url)
        oembed_result["source"] = "oembed"
        oembed_result["resolved_url"] = resolved_url
        oembed_result["url"] = url
        oembed_result["blocked"] = False
        oembed_result["domain"] = domain
        oembed_result["site_name"] = domain_to_site_name(domain)
        oembed_result["keywords"] = []
        oembed_result.setdefault("content_type", "")
        return oembed_result

    # 3. Both failed — fall back to slug extraction, always available
    slug_text = extract_signal_from_url(resolved_url)
    domain = extract_domain(resolved_url)
    final_data = {
        "title": slug_text,
        "description": "",
        "text_snippet": "",
        "source": "url_slug",
        "resolved_url": resolved_url,
        "url":url,
        "blocked": True,
        "domain": domain,
        "site_name": domain_to_site_name(domain),
        "keywords": [],
        "content_type": ""
    }
    return final_data
        

def resolve_url(url:str)->str:
    """Follows redirects to get the canonical URL. Useful for shortened URLs"""
    try:
        response = requests.head(url, allow_redirects=True, timeout=5, headers={"User-Agent":"Mozilla/5.0"})
        
        if response.status_code in [404,403]:
            response = requests.get(url, allow_redirects=True, timeout=5, stream=True, headers={"User-Agent":"Mozilla/5.0"})
        
        final_url = response.url
        response.close()
        return final_url
    except requests.RequestException:
        return url

def try_OEMBED(url:str)->dict | None:
    OEMBED_Config = {
        "youtube.com": "https://www.youtube.com/oembed?url={url}&format=json",
        "youtu.be": "https://www.youtube.com/oembed?url={url}&format=json",
        "vimeo.com": "https://vimeo.com/api/oembed.json?url={url}",
        "twitter.com": "https://publish.twitter.com/oembed?url={url}",
        "x.com": "https://publish.twitter.com/oembed?url={url}",
        "tiktok.com": "https://www.tiktok.com/oembed?url={url}",
        "pinterest.com": "https://www.pinterest.com/oembed.json?url={url}",
        "spotify.com": "https://open.spotify.com/oembed?url={url}",
    }
    OEMBED_CONTENT_TYPE = {
        "youtube.com": "video", "youtu.be": "video", "vimeo.com": "video", "tiktok.com": "video",
        "twitter.com": "social", "x.com": "social",
        "pinterest.com": "image",
        "spotify.com": "audio",
    }
    domain = urlparse(url).netloc.replace("www.", "")
    for key, endpoint in OEMBED_Config.items():
        if key in domain:
            try:
                resp = requests.get(endpoint.format(url=url), timeout=5)
                if resp.ok:
                    data = resp.json()
                    return {
                        "title": data.get("title", ""),
                        "description": data.get("author_name", ""),
                        "content_type": OEMBED_CONTENT_TYPE.get(key, "")
                    }
            except requests.RequestException:
                pass
    return None

def extract_signal_from_url(url: str) -> str:
    """Turns a URL slug into readable text. e.g. /Product-Name-Here/dp/B0XX -> 'Product Name Here'"""
    path = urlparse(url).path
    slug = max(path.split("/"), key=len, default="")  # longest path segment = usually the product name
    words = re.sub(r"[-_]", " ", slug)
    words = re.sub(r"\b[A-Z0-9]{6,}\b", "", words)  # strip product IDs like B0XXXXXX
    return words.strip()

def looks_like_bot_wall(title: str, text_snippet: str) -> bool:
    BOT_WALL_SIGNALS = [
        "robot or human",
        "verify you are human",
        "captcha",
        "access denied",
        "are you a robot",
        "unusual traffic",
    ]
    combined = f"{title} {text_snippet}".lower()
    return any(signal in combined for signal in BOT_WALL_SIGNALS)


def is_low_signal(title: str, description: str, text_snippet: str) -> bool:
    """
    Catches pages that scraped 'successfully' (200 OK) but carry no real content —
    login walls, soft redirect pages ('continue shopping'), empty shells.
    These don't look like CAPTCHAs, so looks_like_bot_wall() misses them.
    """
    JUNK_PATTERNS = [
        "continue shopping",
        "sign in", "log in", "sign up",
        "access denied", "verify you are human", "robot or human",
    ]
    combined = f"{title} {description} {text_snippet}".lower()
    if any(p in combined for p in JUNK_PATTERNS):
        return True
    meaningful_chars = len((title + description).strip())
    if meaningful_chars < 15:
        return True
    return False


def is_valid_url(url: str) -> bool:
    """Rejects plain garbage input ('asdf', 'Rcecr') before it enters the pipeline."""
    try:
        parsed = urlparse(url)
        return bool(parsed.scheme in ("http", "https") and parsed.netloc)
    except (ValueError, AttributeError):
        return False


def is_safe_url(url: str) -> bool:
    """
    SSRF guard. Blocks URLs that resolve to internal/private/loopback IPs
    so the server can't be tricked into fetching localhost, LAN devices,
    or cloud metadata endpoints (e.g. 169.254.169.254) on the user's behalf.

    Call this at TWO points:
      1. Link submission — reject before ever saving to the DB.
      2. Before scraping — defense-in-depth in case of stale/legacy data,
         and because DNS can resolve differently between submit-time and fetch-time.
    """
    if not is_valid_url(url):
        return False

    hostname = urlparse(url).hostname
    if not hostname:
        return False

    try:
        # Resolve ALL IPs for the hostname (a domain can have multiple A/AAAA records) —
        # checking only the first one is a bypass an attacker could exploit.
        addr_infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return False  # can't resolve — treat as unsafe rather than silently allowing it

    for family, _, _, _, sockaddr in addr_infos:
        ip_str = sockaddr[0]
        try:
            ip = ipaddress.ip_address(ip_str)
        except ValueError:
            return False

        if (
            ip.is_private        # RFC1918 LAN ranges (10.x, 172.16-31.x, 192.168.x)
            or ip.is_loopback    # 127.0.0.1, ::1
            or ip.is_link_local  # 169.254.x.x — includes cloud metadata endpoints
            or ip.is_reserved
            or ip.is_multicast
        ):
            return False

    return True
