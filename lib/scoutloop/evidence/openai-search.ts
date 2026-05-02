/**
 * OpenAI Responses API web search evidence provider.
 * Uses { type: "web_search" } — the current recommended tool (not web_search_preview).
 * Extracts url_citation annotations from the response for structured SearchResult output.
 */

import OpenAI from "openai";

import type {
  EvidenceBundle,
  EvidenceCard,
  NormalizedScoutLoopInput,
  ScrapedPage,
  SearchResult,
} from "@/lib/scoutloop/types";

const SEARCH_MODEL = "gpt-4.1-mini";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  return new OpenAI({ apiKey });
}

type UrlCitation = {
  type: "url_citation";
  url: string;
  title: string;
  start_index: number;
  end_index: number;
};

type ResponseOutputMessage = {
  type: "message";
  content: Array<{
    type: string;
    text: string;
    annotations?: UrlCitation[];
  }>;
};

function extractFromResponse(output: OpenAI.Responses.ResponseOutputItem[]): {
  text: string;
  citations: Array<{ url: string; title: string }>;
} {
  let text = "";
  const citations: Array<{ url: string; title: string }> = [];

  for (const item of output) {
    if (item.type !== "message") { continue; }

    const msg = item as unknown as ResponseOutputMessage;

    for (const part of msg.content) {
      if (part.type === "output_text") {
        text += part.text;

        for (const annotation of part.annotations ?? []) {
          if (annotation.type === "url_citation") {
            const already = citations.some((c) => c.url === annotation.url);
            if (!already) {
              citations.push({ url: annotation.url, title: annotation.title });
            }
          }
        }
      }
    }
  }

  return { text, citations };
}

async function callWebSearch(prompt: string): Promise<{
  text: string;
  citations: Array<{ url: string; title: string }>;
}> {
  const client = getClient();

  const response = await client.responses.create({
    model: SEARCH_MODEL,
    tools: [{ type: "web_search" }],
    tool_choice: "required",
    input: prompt,
  });

  return extractFromResponse(response.output);
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  console.log("[ScoutLoop][OpenAI] search:start", { query });

  const { text, citations } = await callWebSearch(
    `Search for: "${query}". Summarize the most relevant findings.`
  );

  if (citations.length > 0) {
    const results = citations.slice(0, 5).map((c) => ({
      title: c.title,
      url: c.url,
      snippet: text.slice(0, 400),
    }));

    console.log("[ScoutLoop][OpenAI] search:success", {
      query,
      results: results.length,
      citations: citations.length,
    });

    return results;
  }

  console.log("[ScoutLoop][OpenAI] search:fallback-text", { query });

  return [
    {
      title: `OpenAI web search: ${query}`,
      snippet: text.slice(0, 500),
    },
  ];
}

export async function scrapeMarkdown(url: string): Promise<ScrapedPage> {
  console.log("[ScoutLoop][OpenAI] scrape:start", { url });

  const { text } = await callWebSearch(
    `Look up ${url}. Describe what this product or company does, including key claims, features, target customers, team, and any notable facts.`
  );

  if (!text.trim()) {
    throw new Error("OpenAI web search returned empty content for URL lookup.");
  }

  console.log("[ScoutLoop][OpenAI] scrape:success", {
    url,
    chars: text.length,
  });

  return {
    url,
    title: url,
    markdown: text.slice(0, 4000),
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
        "The evaluator provided this URL. Web evidence gathering was unavailable, so ScoutLoop did not infer public claims from the page.",
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
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[ScoutLoop][OpenAI] disabled: no API key");
    return fallbackEvidence(
      input,
      "OPENAI_API_KEY not configured; evaluation used provided text only."
    );
  }

  const warnings: string[] = [];
  let homepage: ScrapedPage | undefined;

  if (input.url) {
    try {
      homepage = await scrapeMarkdown(input.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.warn("[ScoutLoop][OpenAI] homepage:warning", { message });
      warnings.push(`Homepage lookup unavailable: ${message}`);
    }
  }

  async function searchWithWarning(query: string) {
    try {
      return await searchWeb(query);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.warn("[ScoutLoop][OpenAI] search:warning", { query, message });
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
            id: "homepage-openai",
            title: homepage.title ?? "Homepage lookup",
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
      `OpenAI web search returned no evidence; evaluation used provided text only. ${warnings.join(" ")}`
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
