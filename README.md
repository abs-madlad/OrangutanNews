# 🦧 OrangutanNews

### *Trump's America, Unfiltered. Mostly Unhinged. Entirely Satirical.*

---

> **Disclaimer:** This is a satirical news portal. It is meant to offend absolutely no one — except, perhaps, one very specific orange gentleman currently occupying a certain white building in Washington D.C. If you are that gentleman, hello. Please read the Epstein Files section. If you are anyone else, welcome. Have a laugh. Share it with a friend. We could all use one.

---

## What Is This?

OrangutanNews is a satirical news aggregator that tracks the daily circus of the Trump presidency — the executive orders, the diplomatic incidents, the trade wars, the mishaps, the blunders, and everything in between. It pulls from real news sources in real time and organises it all into a single, darkly comedic portal so you don't have to doom-scroll five different tabs anymore.

One tab. All the chaos. You're welcome.

---

## Sections

| Section | What It Covers |
|---|---|
| 🦧 **What Did the Orangutan Do Today?** | Trump's last 24 hours, sourced live |
| 💥 **The Mess** | The downstream consequences — economic, diplomatic, institutional |
| ⚔️ **The Wars** | Active global conflicts, with a note on which ones Trump claims he fixed |
| 🏛️ **The Epstein Files** | Every development on the documents case, who's named, what's buried |
| 📊 **Mishap Counter** | A running tally of documented incidents, updated with live data |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Deployment | Vercel (Edge Runtime) |
| News Fetching | RSS aggregation via server-side API route |

---

## How the News Works

There is no database. There is no scraper. There are no paywalls being circumvented.

The site uses an **Edge API route** that fetches RSS feeds directly from established news publishers — the same feeds your RSS reader would use. Each section pulls from a curated list of sources, applies keyword filtering to keep results relevant to the Trump presidency, deduplicates articles that appear across multiple feeds, and caches the result for five minutes.

When you load a section, you get the last few hours of real reporting from real journalists, filtered through a satirical lens and presented in a format that doesn't make you want to close the tab immediately.

If a feed is unavailable, the section falls back to curated placeholder content so the page never breaks. When feeds recover, live content resumes automatically.

Sources include: *The New York Times, BBC, The Hill, Daily Beast, Politico*, and others.

---

## Running Locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:4028`

---

## A Note on Satire

Political satire has a long and honourable history. From Jonathan Swift to Saturday Night Live, mocking power is one of the oldest and most important forms of commentary a society has. This site sits squarely in that tradition.

No private individuals are targeted. No false facts are presented as real. Real news articles are linked to their original sources. The framing is editorial; the underlying reporting is from legitimate journalists doing legitimate work.

If something on this site made you laugh, good. If something made you think, even better. If something made you want to call your senator — that's entirely your business.

---

*Built with Next.js · Deployed on Vercel · Powered by RSS and mild existential dread*
