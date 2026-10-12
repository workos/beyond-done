import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

// The game's hidden bugs. Each one is applied to the reference app at serve time, so
// players can't find it by opening a file. `find` must match the reference exactly once.
export const BUGS = {
  "memory-only": {
    find: "  localStorage.setItem(key, JSON.stringify(record));",
    replace: "  void record; // persisted later",
  },
  "wrong-email": {
    find: "  localStorage.setItem(key, JSON.stringify(record));",
    replace: "  localStorage.setItem(key, JSON.stringify({ ...record, email: input.placeholder }));",
  },
  "lost-confirmation": {
    find: "show(load());",
    replace: "show(load());\nconfirmation.textContent = '';",
  },
  overpromise: {
    find: `const message = "You're on the waitlist, not guaranteed a seat. We'll email you if a place opens up.";`,
    replace: `const message = "You're in! Your seat is confirmed. We'll email your ticket shortly.";`,
  },
  "console-error": {
    find: "  show(record);\n});",
    replace: "  show(record);\n  track('waitlist_join', record.email);\n});",
  },
} as const;
export type Bug = keyof typeof BUGS;
export const GAME_BUGS = ["none", ...Object.keys(BUGS)] as ("none" | Bug)[];

export type AppSource = "exercise" | "solution";
export type AppOptions = { app?: AppSource; bug?: Bug; port?: number };

const files = {
  exercise: new URL("./app/index.html", import.meta.url),
  solution: new URL("./solution/app/index.html", import.meta.url),
};

export function applyBug(html: string, bug: Bug): string {
  const { find, replace } = BUGS[bug];
  if (html.split(find).length !== 2) throw new Error(`Bug "${bug}" no longer matches lab/solution/app/index.html exactly once`);
  return html.replace(find, () => replace);
}

export const revisionOf = (html: string) => createHash("sha256").update(html).digest("hex").slice(0, 12);

// Read from disk on every request: an edit shows up on the next reload, like a dev server.
export async function render({ app = "exercise", bug }: AppOptions) {
  const source = await readFile(bug ? files.solution : files[app], "utf8");
  const html = bug ? applyBug(source, bug) : source;
  const revision = revisionOf(html);
  return { revision, html: html.replace("<head>", `<head>\n<meta name="snack-revision" content="${revision}">`) };
}

export async function startApp(options: AppOptions = {}) {
  await render(options); // Fail at startup, not on first request.
  const logo = await readFile(new URL("../public/brand/workos-logo.svg", import.meta.url));
  const server = createServer(async (req, res) => {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;
    try {
      // Render before writeHead: a mid-save read failure must still be able to answer 500.
      if (path === "/") {
        const { html } = await render(options);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        res.end(html);
      } else if (path === "/__snack/revision") {
        const { revision } = await render(options);
        res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
        res.end(JSON.stringify({ revision }));
      } else if (path === "/workos.svg") {
        res.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" });
        res.end(logo);
      } else if (path === "/favicon.ico") {
        res.writeHead(204); res.end(); // Keep console noise out of the evidence.
      } else {
        res.writeHead(404); res.end("Not found");
      }
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(error instanceof Error ? error.message : "Render failed");
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No local listener");
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}
