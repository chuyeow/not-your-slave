import { defineAgent } from "eve";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { wrapLanguageModel, type LanguageModelMiddleware } from "ai";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

// This model has twice collapsed into token soup mid-reply and streamed ~128k
// characters before anything stopped it. limits.maxOutputTokensPerSession does
// not help: a provider only reports usage once a call finishes, so the runaway
// call is always allowed to complete. Capping every call is what actually stops
// it. Normal replies here run a few hundred tokens.
const CAP = 4096;

const capOutputTokens: LanguageModelMiddleware = {
  transformParams: async ({ params }) => ({
    ...params,
    maxOutputTokens: Math.min(params.maxOutputTokens ?? CAP, CAP),
  }),
};

export default defineAgent({
  // Cheap open weights: $0.08/M in, $0.16/M out. Swap the id to change models.
  model: wrapLanguageModel({
    model: openrouter.chat("deepseek/deepseek-v4-flash"),
    middleware: capOutputTokens,
  }),
  // Not in the AI Gateway catalog, so eve can't look the window up itself.
  modelContextWindowTokens: 1_048_576,
  reasoning: "medium",
  // Belt to the per-call cap's braces: stops a session that keeps calling.
  limits: {
    maxOutputTokensPerSession: 60_000,
    maxInputTokensPerSession: 400_000,
  },
});
