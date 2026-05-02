import { createOpenAI } from "@ai-sdk/openai";
import { createVercel } from "@ai-sdk/vercel";

const defaultOpenAIModel = "gpt-4o-mini";
const defaultV0Model = "v0-1.0-md";

export function getScoutLoopModelProvider() {
  const requestedProvider = process.env.SCOUTLOOP_MODEL_PROVIDER;

  if (requestedProvider === "v0" || requestedProvider === "openai") {
    return requestedProvider;
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return "v0";
}

export function getScoutLoopModelName() {
  const provider = getScoutLoopModelProvider();

  if (provider === "openai") {
    return (
      process.env.SCOUTLOOP_OPENAI_MODEL ||
      process.env.OPENAI_MODEL ||
      defaultOpenAIModel
    );
  }

  const requestedModel = process.env.SCOUTLOOP_MODEL || defaultV0Model;

  if (requestedModel.startsWith("v0-1.5")) {
    console.warn(
      "[ScoutLoop][v0] unsupported model configured; using fallback",
      {
        requestedModel,
        fallbackModel: defaultV0Model,
      }
    );
    return defaultV0Model;
  }

  return requestedModel;
}

export function getScoutLoopModel() {
  const provider = getScoutLoopModelProvider();
  const modelName = getScoutLoopModelName();

  if (provider === "openai") {
    // OpenAI is the practical local fallback when v0 Model API access is not
    // enabled. Override with SCOUTLOOP_OPENAI_MODEL or OPENAI_MODEL.
    return createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })(modelName);
  }

  // v0 remains supported for the hackathon provider path. Force it with
  // SCOUTLOOP_MODEL_PROVIDER=v0 and set SCOUTLOOP_MODEL to the v0 model name.
  return createVercel({
    apiKey: process.env.V0_API_KEY || process.env.VERCEL_API_KEY,
  })(modelName);
}
