import { createVercel } from "@ai-sdk/vercel";

const defaultScoutLoopModel = "v0-1.5-md";

export function getScoutLoopModel() {
  const modelName = process.env.SCOUTLOOP_MODEL || defaultScoutLoopModel;

  // ScoutLoop's intended hackathon provider is v0 Model API. Set
  // SCOUTLOOP_MODEL=v0-1.5-lg for a larger v0 model, or change this wrapper to
  // return an AI Gateway provider/model string when testing a cheaper fallback.
  return createVercel({
    apiKey: process.env.V0_API_KEY || process.env.VERCEL_API_KEY,
  })(modelName);
}

export function getScoutLoopModelName() {
  return process.env.SCOUTLOOP_MODEL || defaultScoutLoopModel;
}
