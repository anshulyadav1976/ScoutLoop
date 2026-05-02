import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

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

function mcpUrlHasToken(mcpUrl?: string) {
  if (!mcpUrl) {
    return false;
  }

  try {
    return Boolean(new URL(mcpUrl).searchParams.get("token"));
  } catch {
    return false;
  }
}

function getBrightDataHeaders(mcpUrl: string, apiKey?: string) {
  const headers: Record<string, string> = {
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
  };

  if (apiKey && !mcpUrlHasToken(mcpUrl)) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

function normalizeScrapeUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol === "http:") {
      parsedUrl.protocol = "https:";
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

type McpToolContentPart = {
  type?: string;
  text?: string;
  resource?: {
    text?: string;
  };
};

function mcpToolResultToText(result: Awaited<ReturnType<Client["callTool"]>>) {
  const content = "content" in result ? result.content : undefined;

  if (Array.isArray(content)) {
    return content
      .map((part: McpToolContentPart) => {
        if (part.type === "text") {
          return part.text;
        }

        if (part.type === "resource" && part.resource?.text) {
          return part.resource.text;
        }

        return JSON.stringify(part);
      })
      .join("\n")
      .trim();
  }

  return JSON.stringify(result.toolResult);
}

async function callBrightDataTool(
  toolName: "scrape_as_markdown" | "search_engine",
  args: Record<string, unknown>
) {
  const mcpUrl = process.env.BRIGHT_DATA_MCP_URL;
  const apiKey = getBrightDataKey();
  const hasTokenInUrl = mcpUrlHasToken(mcpUrl);

  if (!(mcpUrl && (apiKey || hasTokenInUrl))) {
    console.warn("[ScoutLoop][BrightData] tool:skipped missing config", {
      toolName,
      hasMcpUrl: Boolean(mcpUrl),
      hasApiKey: Boolean(apiKey),
      hasTokenInUrl,
    });
    throw new Error("Bright Data MCP URL is not configured.");
  }

  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
    requestInit: {
      headers: getBrightDataHeaders(mcpUrl, apiKey),
    },
  });
  const client = new Client({ name: "scoutloop", version: "1.0.0" });

  try {
    console.log("[ScoutLoop][BrightData] mcp:connect", {
      toolName,
      hasMcpUrl: Boolean(mcpUrl),
      hasApiKey: Boolean(apiKey),
      hasTokenInUrl,
    });

    await client.connect(transport);

    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    console.log("[ScoutLoop][BrightData] mcp:tools", { toolNames });

    if (!toolNames.includes(toolName)) {
      throw new Error(
        `Bright Data MCP tool ${toolName} is unavailable. Available tools: ${toolNames.join(
          ", "
        )}`
      );
    }

    const result = await client.callTool({ name: toolName, arguments: args });
    const text = mcpToolResultToText(result);
    console.log("[ScoutLoop][BrightData] tool:success", {
      toolName,
      responseChars: text.length,
    });

    return text;
  } catch (error) {
    console.error("[ScoutLoop][BrightData] tool:failed", {
      toolName,
      message: error instanceof Error ? error.message : "unknown error",
    });
    throw error;
  } finally {
    await transport.close().catch(() => undefined);
  }
}

function parseSearchResults(query: string, text: string): SearchResult[] {
  try {
    const payload = JSON.parse(text) as {
      organic?: Array<{
        link?: string;
        title?: string;
        description?: string;
      }>;
    };

    if (Array.isArray(payload.organic) && payload.organic.length > 0) {
      return payload.organic.slice(0, 5).map((result, index) => ({
        title: result.title || `Bright Data search result ${index + 1}`,
        url: result.link,
        snippet: result.description || text.slice(0, 500),
      }));
    }
  } catch {
    // Bright Data tools may return markdown/plain text for some queries.
  }

  return [
    {
      title: `Bright Data search: ${query}`,
      snippet: text.slice(0, 500),
    },
  ];
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  console.log("[ScoutLoop][BrightData] search:start", { query });

  const text = await callBrightDataTool("search_engine", { query });
  const results = parseSearchResults(query, text);
  console.log("[ScoutLoop][BrightData] search:success", {
    query,
    results: results.length,
    responseChars: text.length,
  });

  return results;
}

export async function scrapeMarkdown(url: string): Promise<ScrapedPage> {
  const normalizedUrl = normalizeScrapeUrl(url);

  console.log("[ScoutLoop][BrightData] scrape:start", {
    url,
    normalizedUrl,
  });

  const markdown = await callBrightDataTool("scrape_as_markdown", {
    url: normalizedUrl,
  });

  if (!markdown.trim()) {
    throw new Error("Bright Data scrape returned empty content.");
  }

  console.log("[ScoutLoop][BrightData] scrape:success", {
    url: normalizedUrl,
    responseChars: markdown.length,
  });

  return {
    url: normalizedUrl,
    title: normalizedUrl,
    markdown: markdown.slice(0, 4000),
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
    console.warn("[ScoutLoop][BrightData] disabled by env");
    return fallbackEvidence(
      input,
      "Bright Data evidence disabled; evaluation used provided text only."
    );
  }

  const warnings: string[] = [];
  let homepage: ScrapedPage | undefined;

  if (input.url) {
    try {
      homepage = await scrapeMarkdown(input.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.warn("[ScoutLoop][BrightData] homepage:warning", { message });
      warnings.push(`Homepage scrape unavailable: ${message}`);
    }
  }

  async function searchWithWarning(query: string) {
    try {
      return await searchWeb(query);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.warn("[ScoutLoop][BrightData] search:warning", {
        query,
        message,
      });
      warnings.push(`Search unavailable for "${query}": ${message}`);
      return [];
    }
  }

  const [searchResults, competitorResults, marketResults] = await Promise.all([
    searchWithWarning(`${input.projectName} startup product`),
    searchWithWarning(`${input.projectName} competitors`),
    searchWithWarning(`${input.projectName} market size`),
  ]);

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

  if (evidenceCards.length === 0) {
    return fallbackEvidence(
      input,
      `Bright Data evidence unavailable; evaluation used pasted/provided text only. ${warnings.join(
        " "
      )}`
    );
  }

  return {
    homepage,
    searchResults,
    competitorResults,
    marketResults,
    evidenceCards,
    warnings,
  };
}
