import json
import logging
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
logger = logging.getLogger(__name__)

# SDK logs this once per process on every generate_content call, even with zero
# tools passed — the automatic-function-calling machinery just always announces
# itself. Harmless, but noisy for a background job; keep to errors only.
logging.getLogger("google_genai.models").setLevel(logging.ERROR)

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    return _client


TAGS_SCHEMA = types.Schema(
    type=types.Type.ARRAY,
    items=types.Schema(type=types.Type.STRING),
)


def _build_prompt(metadata: dict) -> str:
    fields = [
        ("Title", metadata.get("title")),
        ("Description", metadata.get("description")),
        ("Site name", metadata.get("site_name")),
        ("Domain", metadata.get("domain")),
        ("Content type", metadata.get("content_type")),
        ("Existing keywords", ", ".join(metadata.get("keywords") or [])),
        ("Page excerpt", metadata.get("text_snippet")),
    ]
    lines = [f"{label}: {value}" for label, value in fields if value]
    return "\n".join(lines)


def suggest_tags(metadata: dict, max_tags: int = 6) -> list:
    """
    Suggests short, lowercase, searchable tags for a link (e.g. 'amazon', 'tech',
    'video') from its scraped metadata. Returns [] if there's nothing usable to
    tag from, or if the API call fails — callers should treat this as best-effort,
    not a required step.
    """
    metadata_block = _build_prompt(metadata)
    if not metadata_block.strip():
        return []

    try:
        response = _get_client().models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=(
                f"Suggest up to {max_tags} short, lowercase, searchable tags for this "
                f"saved link, based on the metadata below. Tags should be single words "
                f"or short phrases a user would later search by (site/brand, topic, "
                f"content type — e.g. 'amazon', 'tech', 'blog', 'video'). No duplicates, "
                f"no punctuation-only tags.\n\n{metadata_block}"
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TAGS_SCHEMA,
            ),
        )
    except Exception as e:
        logger.error("AI tagging failed: %s", str(e))
        return []

    try:
        tags = json.loads(response.text)
    except (json.JSONDecodeError, TypeError):
        return []

    if not isinstance(tags, list):
        return []
    return [t.strip().lower() for t in tags if isinstance(t, str) and t.strip()][:max_tags]
