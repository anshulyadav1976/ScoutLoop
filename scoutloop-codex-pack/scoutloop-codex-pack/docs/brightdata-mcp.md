# Bright Data MCP / Evidence Layer

## Goal

Use Bright Data to give ScoutLoop live/public evidence, search, and page scraping.

## Docs

- https://docs.brightdata.com/mcp-server
- https://docs.brightdata.com/mcp-server/faqs

Bright Data MCP supports search and scraping tools such as:

- `search_engine`
- `scrape_as_markdown`
- `scrape_as_html`
- usage/session stats

Use the minimum viable tools:

1. Search web.
2. Scrape homepage as Markdown.
3. Scrape one or two relevant search result pages.

## Environment

```bash
BRIGHT_DATA_API_KEY=
BRIGHTDATA_API_KEY=
BRIGHT_DATA_MCP_URL=
```

Prefer `BRIGHT_DATA_API_KEY`, support alias `BRIGHTDATA_API_KEY`.

## Internal interface

Create:

`lib/scoutloop/evidence/brightdata.ts`

Export:

```ts
export async function searchWeb(query: string): Promise<SearchResult[]>;
export async function scrapeMarkdown(url: string): Promise<ScrapedPage>;
export async function gatherStartupEvidence(input: NormalizedScoutLoopInput): Promise<EvidenceBundle>;
```

## EvidenceBundle shape

```ts
type EvidenceBundle = {
  homepage?: ScrapedPage;
  searchResults: SearchResult[];
  competitorResults: SearchResult[];
  marketResults: SearchResult[];
  evidenceCards: EvidenceCard[];
  warnings: string[];
};
```

## Evidence card shape

```ts
type EvidenceCard = {
  id: string;
  title: string;
  url?: string;
  snippet: string;
  sourceType: "homepage" | "search" | "competitor" | "market" | "pitch" | "uploaded_text";
  confidence: "low" | "medium" | "high";
};
```

## Search queries

Given input URL/company/pitch, run no more than 3-5 searches for hackathon MVP:

1. `"${companyName}" startup product`
2. `"${companyName}" competitors`
3. `"${category}" market size`
4. `"${category}" startup competitors`
5. `"${companyName}" pricing customers traction`

Avoid huge crawling.

## Fallback behavior

If Bright Data fails:

- Do not crash.
- Use URL/pitch/uploaded text as evidence.
- Create warning:

```txt
Bright Data evidence unavailable; evaluation used pasted/provided text only.
```

## UI

Show evidence cards and warnings.

The judge should see that the dashboard is evidence-backed, not pure LLM theatre.
