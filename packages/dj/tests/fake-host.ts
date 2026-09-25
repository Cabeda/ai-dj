// Fake stdio host for backend tests: answers the line-delimited JSON protocol.
// Mode comes from FAKE_MODE: "ok" (default) or "refuse-play".
const mode = process.env.FAKE_MODE ?? "ok";

const decoder = new TextDecoder();
let pending = "";
for await (const chunk of Bun.stdin.stream()) {
  pending += decoder.decode(chunk, { stream: true });
  let nl: number;
  while ((nl = pending.indexOf("\n")) >= 0) {
    const line = pending.slice(0, nl).trim();
    pending = pending.slice(nl + 1);
    if (!line) continue;
    const msg = JSON.parse(line) as { op?: string; path?: string };
    if (msg.op === "boot") {
      process.stdout.write(JSON.stringify({ event: "ready", silent: true }) + "\n");
    } else if (msg.op === "play") {
      if (mode === "refuse-play") {
        process.stdout.write(
          JSON.stringify({ event: "error", message: "samples is not defined" }) + "\n",
        );
      } else {
        process.stdout.write(JSON.stringify({ event: "playing" }) + "\n");
      }
    } else if (msg.op === "capture") {
      process.stdout.write(JSON.stringify({ event: "captured", path: msg.path }) + "\n");
    } else if (msg.op === "shutdown") {
      process.stdout.write(JSON.stringify({ event: "bye" }) + "\n");
      process.exit(0);
    }
  }
}

// module marker so tsc accepts top-level await
export {};
