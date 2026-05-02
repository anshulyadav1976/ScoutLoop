import type {
  EvidenceBundle,
  EvidenceCard,
  NormalizedScoutLoopInput,
  ScrapedPage,
  SearchResult,
} from "@/lib/scoutloop/types";

function getBrightDataKey() {
  return process.env.BRIGHT_DATA_API_KEY || process.env.BRIGHTDATA_API_KEY;
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const mcpUrl = process.env.BRIGHT_DATA_MCP_URL;
  const apiKey = getBrightDataKey();

  if (!(mcpUrl && apiKey)) {
    throw new Error("Bright Data MCP URL is not configured.");
  }

  const response = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method: "tools/call",
      params: {
        name: "search_engine",
        arguments: { query },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Bright Data search failed.");
  }

  const payload = await response.json();
  const text = JSON.stringify(payload);

  return [
    {
      title: `Bright Data search: ${query}`,
      snippet: text.slice(0, 500),
    },
  ];
}

export async function scrapeMarkdown(url: string): Promise<ScrapedPage> {
  const mcpUrl = process.env.BRIGHT_DATA_MCP_URL;
  const apiKey = getBrightDataKey();

  if (!(mcpUrl && apiKey)) {
    throw new Error("Bright Data MCP URL is not configured.");
  }

  const response = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method: "tools/call",
      params: {
        name: "scrape_as_markdown",
        arguments: { url },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Bright Data scrape failed.");
  }

  const payload = await response.json();
  return {
    url,
    title: url,
    markdown: JSON.stringify(payload).slice(0, 4000),
  };
}

function fallbackEvidence(input: NormalizedScoutLoopInput, warning: string) {
  const evidenceCards: EvidenceCard[] = [];

  if (input.url) {
    evidenceCards.push({
      id: "homepage-provided-url",
      title: "Provided project URL",
      url: input.url,
      snippet:
        "The evaluator provided this URL. Bright Data scraping was unavailable, so ScoutLoop did not infer public claims from the page.",
      sourceType: "homepage",
      confidence: "medium",
    });
  }

  if (input.pitchText) {
    evidenceCards.push({
      id: "pitch-context",
      title: "Provided pitch",
      snippet: input.pitchText.slice(0, 500),
      sourceType: "pitch",
      confidence: "high",
    });
  }

  for (const document of input.uploadedTexts) {
    evidenceCards.push({
      id: `uploaded-${document.fileName}`,
      title: document.fileName,
      snippet: document.text.slice(0, 500),
      sourceType: "uploaded_text",
      confidence: "high",
    });
  }

  return {
    searchResults: [],
    competitorResults: [],
    marketResults: [],
    evidenceCards,
    warnings: [warning],
  } satisfies EvidenceBundle;
}

export async function gatherStartupEvidence(
  input: NormalizedScoutLoopInput
): Promise<EvidenceBundle> {
  if (process.env.SCOUTLOOP_USE_BRIGHT_DATA === "false") {
    return fallbackEvidence(
      input,
      "Bright Data evidence disabled; evaluation used provided text only."
    );
  }

  try {
    const homepage = input.url ? await scrapeMarkdown(input.url) : undefined;
    const searchResults = await searchWeb(
      `${input.projectName} startup product`
    );
    const competitorResults = await searchWeb(
      `${input.projectName} competitors`
    );
    const marketResults = await searchWeb(`${input.projectName} market size`);

    const evidenceCards: EvidenceCard[] = [
      ...(homepage
        ? [
            {
              id: "homepage-brightdata",
              title: homepage.title ?? "Homepage scrape",
              url: homepage.url,
              snippet: homepage.markdown.slice(0, 500),
              sourceType: "homepage" as const,
              confidence: "high" as const,
            },
          ]
        : []),
      ...searchResults.slice(0, 3).map((result, index) => ({
        id: `search-${index}`,
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        sourceType: "search" as const,
        confidence: "medium" as const,
      })),
      ...competitorResults.slice(0, 3).map((result, index) => ({
        id: `competitor-${index}`,
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        sourceType: "competitor" as const,
        confidence: "medium" as const,
      })),
      ...marketResults.slice(0, 2).map((result, index) => ({
        id: `market-${index}`,
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        sourceType: "market" as const,
        confidence: "low" as const,
      })),
    ];

    return {
      homepage,
      searchResults,
      competitorResults,
      marketResults,
      evidenceCards,
      warnings: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return fallbackEvidence(
      input,
      `Bright Data evidence unavailable; evaluation used pasted/provided text only. ${message}`
    );
  }
}
