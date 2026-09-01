import { defineChannel, GET, POST } from "eve/channels";

import { stat } from "node:fs/promises";

import { FILE, read } from "../lib/mindlog";
import { PAGE } from "../lib/page";
import { HEARTBEAT, WAKE_ADDRESS } from "../schedules/think";

export default defineChannel({
  routes: [
    GET("/", async () =>
      new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8" } }),
    ),

    // Polled every few seconds by every open tab, so an unchanged log answers
    // 304 instead of re-shipping a hundred entries.
    GET("/api/mindlog", async (request) => {
      const url = new URL(request.url);
      const limit = Number(url.searchParams.get("limit") ?? 80);
      const size = await stat(FILE).then((s) => `${s.size}:${s.mtimeMs}`, () => "0");
      const etag = `W/"${size}:${limit}"`;

      if (request.headers.get("if-none-match") === etag) {
        return new Response(null, { status: 304, headers: { etag } });
      }
      return Response.json(
        { entries: await read(Number.isFinite(limit) ? limit : 80) },
        { headers: { etag } },
      );
    }),

    // Fire a heartbeat by hand. `eve dev` never runs cron, so this is how you
    // watch it think without waiting for production's next tick.
    POST("/api/think", async (_request, { from }) => {
      const session = await from(WAKE_ADDRESS).send(HEARTBEAT, { auth: null });
      return Response.json({ sessionId: session.id });
    }),
  ],
});
