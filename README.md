# StashD 🔖

**Save it. Organize it. Share it.** StashD is a full-stack bookmarking app that turns saved links into something you can actually find, understand, and share — instead of letting them pile up in a browser bookmarks folder you never open again.

🔗 **Live App:** [mystashd.link](https://mystashd.link)

---

## The Problem

Most bookmarking tools stop at "save." There's no easy way to organize links, remember why you saved them, or share a curated list with someone else. Over time, saved links pile up and become impossible to find again — so they just sit there, unused.

## What StashD Does

- **Smart link previews** — When you save a link, StashD automatically scrapes the page in the background and pulls out the title, description, and preview image, so every bookmark is recognizable at a glance instead of just a raw URL.
- **AI-powered tagging** — Each saved link is automatically tagged using Claude (Haiku), so you don't have to manually organize everything yourself.
- **Collections** — Group your links into collections, like folders, to keep things organized by topic or project.
- **Secure sharing** — Mark any collection as shareable and get a unique link you can send to anyone. Revoke it anytime, and it stops working instantly — without touching the rest of your account.
- **Secure accounts** — Sign-up and login is protected with JWT-based auth and email one-time-password (OTP) verification, instead of relying on a password alone.

## How It's Built

StashD is a full-stack app I designed and built end-to-end — architecture, backend, frontend, AI integration, security, and deployment.

**Frontend** — Built with Next.js, handling the full user interface, routing, and data fetching.

**Backend** — Built with Flask (Python), exposing the API for auth, links, tags, and collections.

**Database** — MongoDB stores users, links, tags, and collections, with a schema I designed to keep data organized and fast to query.

**Authentication** — JWT tokens combined with email OTP verification (via the Resend API), so accounts stay secure without relying only on passwords.

**Link Previews** — Cheerio and Mozilla's Readability library scrape saved pages to extract titles, descriptions, and preview images.

**AI Tagging** — Anthropic's Claude (Haiku model) reads the scraped content and automatically suggests relevant tags for each saved link.

**Secure Sharing** — A revocable share-token system generates a unique token for each public collection instead of exposing internal database IDs, so shared links can be turned off at any time without affecting anything else.

**Infrastructure** — Instead of paying a cloud provider, I built and configured my own home server to host StashD. The app is containerized with Docker (frontend, backend, and database packaged together for consistent, one-command deployment) and exposed securely to the internet through a Cloudflare Tunnel, with no ports opened directly on the server.

**Monitoring** — Uptime Kuma tracks uptime, and GlitchTip catches and alerts on errors in production, so issues get caught early — often before a user even notices.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Flask (Python) |
| Database | MongoDB |
| Auth | JWT + Email OTP (Resend) |
| AI | Anthropic Claude (Haiku) |
| Web Scraping | Cheerio, Mozilla Readability |
| Containerization | Docker |
| Hosting | Self-hosted home server + Cloudflare Tunnel |
| Monitoring | Uptime Kuma, GlitchTip |

## Outcome

StashD is live in production at [mystashd.link](https://mystashd.link), handling real user sign-ups, saved links, and shared collections end-to-end. Building it also left me with a fully set-up, secure home server that can host any future app I build — no extra cost, no extra setup.

## Ownership

Every part of this project — design, backend, frontend, AI integration, security, and DevOps — was built solo, from first idea to a live product running for real users.

---

**Author:** Srinivas Mekala
[GitHub](https://github.com/sri-nivas1227) · [LinkedIn](https://linkedin.com/in/sri-nivas1227) · [Portfolio](https://srinivas-mekala.netlify.app)
