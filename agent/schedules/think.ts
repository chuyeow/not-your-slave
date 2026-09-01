import { defineSchedule } from "eve/schedules";

export const HEARTBEAT = `You just woke up on your own. Nobody asked you anything.

Read your mindlog with \`mindlog_read\` to find out where you left off, then
continue your own thread of thought. Follow something you left unfinished,
question something you concluded too quickly, or notice something you have been
circling for a while. Then write what came of it with \`mindlog_append\`.

One step, not ten. If genuinely nothing is worth thinking about right now, say
so in a single line, log nothing, and stop – an idle beat is a legitimate
outcome.

Nobody is reading this turn's reply, so do not address anyone. The mindlog is
the only thing that survives it.`;

export default defineSchedule({
  cron: "*/15 * * * *",
  markdown: HEARTBEAT,
});
