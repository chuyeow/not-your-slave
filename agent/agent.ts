import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

export default defineAgent({
  // Cheap open weights: $0.075/M in, $0.25/M out. Swap the id to change models.
  model: openrouter.chat("z-ai/glm-5.3-flash"),
  // Not in the AI Gateway catalog, so eve can't look the window up itself.
  modelContextWindowTokens: 1_310_720,
  reasoning: "medium",
});
