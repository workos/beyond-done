import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { z } from "zod";
import { classConfig } from "../src/class-config.js";

test("one dev site serves unlinked slides and the chat API, and respects disabled features", { timeout: 90_000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), "class-dev-"));
  try {
    for (const path of ["src", "scripts", "slides", "astro.config.mjs", "tsconfig.json", "package.json"]) {
      await cp(resolve(path), join(directory, path), { recursive: true });
    }
    await symlink(resolve("node_modules"), join(directory, "node_modules"), "dir");
    for (const [enabled, key] of [[true, ""], [true, "test-inference-key"], [false, "test-inference-key"]] as const) {
      await writeFile(join(directory, "class.config.json"), JSON.stringify({
        ...classConfig, slides: { publish: enabled, link: false }, features: { ...classConfig.features, chat: enabled },
      }));
      const child = spawn(process.execPath, ["--input-type=module", "-e", `
        import { dev } from "astro";
        const server = await dev({ server: { host: "127.0.0.1", port: 0 } });
        console.log("TEST_URL=http://127.0.0.1:" + server.address.port);
      `], { cwd: directory, env: { ...process.env, OPENROUTER_API_KEY: key }, stdio: ["ignore", "pipe", "pipe"] });
      const exited = once(child, "exit");
      let output = "";
      child.stderr.on("data", chunk => { output += chunk; });
      try {
        const url = await new Promise<string>((done, reject) => {
          const timer = setTimeout(() => reject(new Error(`Dev server did not start: ${output}`)), 30_000);
          child.once("error", error => { clearTimeout(timer); reject(error); });
          child.once("exit", () => { clearTimeout(timer); reject(new Error(output)); });
          child.stdout.on("data", chunk => {
            output += chunk;
            const match = output.match(/TEST_URL=(http:\/\/127\.0\.0\.1:\d+)/);
            if (match) { clearTimeout(timer); done(match[1]); }
          });
        });
        const home = await (await fetch(`${url}/`)).text();
        assert.match(home, /Preflight — before the hour/);
        assert.match(home, /<dd>1 h<\/dd>/);
        assert.ok(!home.includes('href="/slides/"'));
        const glossary = await (await fetch(`${url}/glossary/`)).text();
        assert.equal(/<button[^>]*class="chat-fab/.test(glossary), false);
        assert.deepEqual(await (await fetch(`${url}/api/chat/status`)).json(), { enabled: enabled && Boolean(key) });
        const slides = await fetch(`${url}/slides/`);
        assert.equal(slides.status, enabled ? 200 : 404);
        if (enabled) {
          assert.match(await slides.text(), /@slidev/);
          const notes = await fetch(`${url}/__slidev/slides/1.json`);
          assert.equal(notes.status, 200, "Presenter notes endpoint");
          const slide = z.object({ note: z.string(), noteHTML: z.string() }).parse(await notes.json());
          assert.match(slide.note, /Teaching expectations:/);
          assert.match(slide.noteHTML, /<li>/);
          for (const path of ["/slides/@vite/client", "/slides/@slidev/setups/main"]) {
            const response = await fetch(`${url}${path}`);
            assert.equal(response.status, 200, path);
            assert.match(response.headers.get("content-type") ?? "", /javascript/);
          }
        }
        const chat = await fetch(`${url}/api/chat`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [] }),
        });
        assert.equal(chat.status, !enabled ? 404 : key ? 400 : 503);
        assert.deepEqual(await chat.json(), { error: !enabled ? "Chat is disabled for this class." : key ? "Send between 1 and 20 messages." : "The workshop assistant is not configured." });
      } finally {
        child.kill("SIGTERM");
        await exited;
      }
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
