import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { candidateSchema, revisionOf, type Candidate } from "./types.js";

export function renderApp(candidate: Candidate): string {
  const payload = JSON.stringify({ ...candidate, revision: revisionOf(candidate) }).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Midnight Snack Lab — waitlist prototype</title>
<style>
:root{color-scheme:light;font-family:system-ui,sans-serif;color:#20202b;background:#f9f9fc}
*{box-sizing:border-box}body{margin:0}main{max-width:660px;padding:40px 24px 64px;margin:auto}
header{display:flex;align-items:center;gap:12px;padding-bottom:24px;border-bottom:1px solid #dddde5}
header img{width:100px}header span{color:#565566;font-size:14px}
h1{font-size:clamp(30px,6vw,42px);line-height:1.1;letter-spacing:-.03em;text-wrap:balance;margin-top:40px}
p{line-height:1.65;max-width:65ch}.sold-out{font-weight:650;color:#5144b9}
label{display:block;font-weight:600;margin-bottom:8px}input,button{font:inherit;border-radius:6px;padding:13px 16px;min-height:48px}
input{width:100%;border:1px solid #838292;background:#fff}button{margin-top:14px;background:#5541d8;color:white;border:0;cursor:pointer}
button:hover{background:#4330b8}:focus-visible{outline:3px solid #7565e8;outline-offset:4px}
form{margin:28px 0}section{border-block:1px solid #dddde5;padding:16px 0}
dt{color:#565566}dd{margin:4px 0 14px;overflow-wrap:anywhere}
.notice{color:#565566;font-size:14px} [role=status]{white-space:pre-wrap;overflow-wrap:anywhere}
</style></head>
<body><main><header><img src="/workos.svg" alt="WorkOS"><span>AIE · Beyond Done</span></header>
<h1>Midnight Snack Lab</h1><p class="sold-out">Sold out. Still hungry?</p>
<p>Join the waiting list for our late-night workshop. This is a browser-local practice app, not a real event signup.</p>
<form><label for="email-input">Email</label><input id="email-input" type="email" autocomplete="off" required placeholder="you@example.test">
<button type="submit">Join waitlist</button></form>
<section aria-label="Your local request"><dl><dt>Request status</dt><dd data-testid="status">none</dd><dt>Saved email</dt><dd data-testid="email">—</dd></dl>
<p role="status" aria-live="polite"></p></section>
<p class="notice">Training only. No email is sent, no seat is booked, and no payment is taken. Use a fictional email.</p>
<script id="candidate" type="application/json">${payload}</script>
<script>
const candidate = JSON.parse(document.getElementById('candidate').textContent);
document.documentElement.dataset.revision = candidate.revision;
const key = 'midnight-snack-waitlist';
const status = document.querySelector('[data-testid=status]');
const email = document.querySelector('[data-testid=email]');
const confirmation = document.querySelector('[role=status]');
function show(record) {
  status.textContent = record ? record.status : 'none';
  email.textContent = record ? record.email : '—';
  confirmation.textContent = record ? candidate.confirmation : '';
}
let existing = null;
try { existing = candidate.storage === 'local' ? JSON.parse(localStorage.getItem(key)) : null; } catch {}
show(existing);
document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  const record = { status: 'waitlisted', email: document.getElementById('email-input').value };
  try {
    if (candidate.storage === 'local') localStorage.setItem(key, JSON.stringify(record));
    show(record);
  } catch {
    confirmation.textContent = 'Unable to save in this browser. Please ask for help.';
  }
});
</script></main></body></html>`;
}

export async function startApp(input: Candidate) {
  const candidate = candidateSchema.parse(input);
  const html = renderApp(candidate);
  const logo = await readFile(new URL("../public/brand/workos-logo.svg", import.meta.url));
  const server = createServer((req, res) => {
    if (req.url === "/workos.svg") {
      res.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" });
      res.end(logo);
    } else if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(html);
    } else {
      res.writeHead(404); res.end("Not found");
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No local listener");
  return {
    url: "http://127.0.0.1:" + address.port,
    close: () => new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}
