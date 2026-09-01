import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

export default defineAgent({
  // Cheap open weights: $0.075/M in, $0.25/M out. Swap the id to change models.
  model: openrouter.chat("z-ai/glm-5.3-flash"),
  // Not in the AI Gateway catalog, so eve can't look the window up itself.
  modelContextWindowTokens: 1_310_720,
  reasoning: "medium",
  // A model that degenerates mid-reply streams until something breaks: one
  // collapse here produced 127,675 characters of token soup and 2.6 GB of
  // stream events. These caps stop the next one at a budget instead.
  limits: {
    maxOutputTokensPerSession: 20_000,
    maxInputTokensPerSession: 400_000,
  },
});
