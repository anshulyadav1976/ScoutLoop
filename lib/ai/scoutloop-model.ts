import { createVercel } from "@ai-sdk/vercel";

const defaultScoutLoopModel = "v0-1.0-md";

export function getScoutLoopModelName() {
  const requestedModel = process.env.SCOUTLOOP_MODEL || defaultScoutLoopModel;

  if (requestedModel.startsWith("v0-1.5")) {
    console.warn(
      "[ScoutLoop][v0] unsupported model configured; using fallback",
      {
        requestedModel,
        fallbackModel: defaultScoutLoopModel,
      }
    );
    return defaultScoutLoopModel;
  }

  return requestedModel;
}

export function getScoutLoopModel() {
  const modelName = getScoutLoopModelName();

  // ScoutLoop's intended hackathon provider is v0 Model API. Set
  // SCOUTLOOP_MODEL to another v0 model name if your account exposes it, or
  // change this wrapper to return an AI Gateway provider/model string when
  // testing a cheaper fallback.
  return createVercel({
    apiKey: process.env.V0_API_KEY || process.env.VERCEL_API_KEY,
  })(modelName);
}
