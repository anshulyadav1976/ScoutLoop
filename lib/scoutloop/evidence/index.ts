/**
 * Evidence provider router.
 *
 * Configure via SCOUTLOOP_EVIDENCE_PROVIDER:
 *   "openai"     — OpenAI Responses API + webSearchPreview (recommended)
 *   "brightdata" — BrightData MCP (original, often unreliable)
 *   "auto"       — OpenAI if OPENAI_API_KEY is set, else BrightData (default)
 *
 * You can also still set SCOUTLOOP_USE_BRIGHT_DATA=false to force fallback to
 * text-only mode regardless of which provider is active.
 */

import type { EvidenceBundle, NormalizedScoutLoopInput } from "@/lib/scoutloop/types";

function getProvider(): "openai" | "brightdata" {
  const explicit = process.env.SCOUTLOOP_EVIDENCE_PROVIDER;

  if (explicit === "brightdata") { return "brightdata"; }
  if (explicit === "openai") { return "openai"; }

  // auto: prefer OpenAI if key is available
  if (process.env.OPENAI_API_KEY) { return "openai"; }

  return "brightdata";
}

export async function gatherStartupEvidence(
  input: NormalizedScoutLoopInput
): Promise<EvidenceBundle> {
  const provider = getProvider();

  if (provider === "openai") {
    console.log("[ScoutLoop][Evidence] provider:openai");
    const { gatherStartupEvidence: gatherOpenAI } = await import(
      "@/lib/scoutloop/evidence/openai-search"
    );
    try {
      return await gatherOpenAI(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.warn("[ScoutLoop][Evidence] openai:failed, trying brightdata fallback", { message });
      const { gatherStartupEvidence: gatherBD } = await import(
        "@/lib/scoutloop/evidence/brightdata"
      );
      return gatherBD(input);
    }
  }

  console.log("[ScoutLoop][Evidence] provider:brightdata");
  const { gatherStartupEvidence: gatherBD } = await import(
    "@/lib/scoutloop/evidence/brightdata"
  );
  try {
    return await gatherBD(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.warn("[ScoutLoop][Evidence] brightdata:failed, trying openai fallback", { message });
    const { gatherStartupEvidence: gatherOpenAI } = await import(
      "@/lib/scoutloop/evidence/openai-search"
    );
    return gatherOpenAI(input);
  }
}

export { searchWeb, scrapeMarkdown } from "@/lib/scoutloop/evidence/openai-search";
