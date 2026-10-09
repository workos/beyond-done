import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { dev } from "astro";
import { chromium, expect } from "@playwright/test";
import { collectWorkshopSource } from "./source.js";

const source = await collectWorkshopSource("slides/slides.md");
const slideCount = source.slideCount;
assert.ok(slideCount, "The presentation must contain slides");
const site = process.env.DECK_URL ? undefined : await dev({ server: { host: "127.0.0.1", port: 0 } });
const base = process.env.DECK_URL ?? `http://127.0.0.1:${site!.address.port}/`;
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", error => { if (!error.message.includes("Wake Lock permission")) errors.push(error.message); });
  async function go(slide: number, clicks = 0) {
    await page.goto(new URL(`slides/#/${slide}?clicks=${clicks}`, base).href);
    const root = page.locator(`.slidev-page-${slide}`);
    await expect(root).toBeVisible();
    await expect(root.locator(".slidev-layout")).not.toBeEmpty();
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => a.playState === "running").length)).toBe(0);
    return root;
  }
  await mkdir(".lab-runs/deck-review", { recursive: true });
  const overflow: unknown[] = [];
  for (let slide = 1; slide <= slideCount; slide++) {
    for (const clicks of [0, 99]) {
      const root = await go(slide, clicks);
      const outside = await root.locator(".slidev-layout").evaluate(layout => {
        const bounds = layout.getBoundingClientRect();
        return [...layout.querySelectorAll("h1,h2,p,pre,table,li,img,.command,.ticket,.score-receipt")]
          .filter(element => {
            if (element.closest(".slidev-vclick-hidden")) return false;
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && (rect.bottom > bounds.bottom - 8 || rect.right > bounds.right + 1 || rect.left < bounds.left - 1 || rect.top < bounds.top - 1);
          }).map(element => ({ tag: element.tagName, text: element.textContent?.slice(0, 55) }));
      });
      if (outside.length) overflow.push({ slide, clicks, outside });
    }
    if ([1, 2, 4, 9, 16, 17, 18, 21, 22].includes(slide)) {
      await page.screenshot({ path: `.lab-runs/deck-review/${String(slide).padStart(2, "0")}.png` });
    }
  }
  assert.deepEqual(overflow, [], "Slide content must fit at initial and fully revealed states");
  const intro = await go(2);
  for (const name of ["Nick Nisi", "Zack Proser"]) {
    await expect(intro.getByRole("heading", { name: new RegExp(name.replace(" ", "\\s*")) })).toBeVisible();
  }
  assert.equal(await intro.locator("img").evaluateAll(images => images.every(img => (img as HTMLImageElement).naturalWidth > 0)), true);
  const reveal = await go(4);
  await reveal.getByRole("button", { name: "Reload the page" }).click();
  await expect(reveal.getByText("Nobody here.", { exact: true })).toBeVisible();
  await reveal.getByRole("button", { name: "Reset illustration" }).click();
  await expect(reveal.getByText("ada@example.test", { exact: true })).toBeVisible();
  for (let click = 0; click <= 5; click++) {
    const loop = await go(16, click);
    await expect(loop.locator(".loop-track .current")).toHaveText(new RegExp(["Proposal", "Browser", "Jev", "Repair", "Re-check", "Decision"][click]));
  }
  const loop = page.locator(".slidev-page-16");
  await expect(loop.getByRole("heading", { name: "Now you can call it done." })).toBeVisible();
  await loop.getByRole("checkbox", { name: "Make the worker stubborn" }).check();
  await expect(loop.getByRole("heading", { name: "A human takes it from here." })).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  const cover = await go(1);
  assert.equal(await cover.locator(".stamp").evaluate(e => getComputedStyle(e).animationName), "none");
  const round = await go(18);
  await page.clock.install();
  await round.getByRole("button", { name: "Start 90-second round" }).click();
  await page.clock.fastForward(2100);
  await expect(round.getByRole("timer")).toHaveText("1:28");
  await round.getByRole("button", { name: "Pause timer" }).click();
  await page.clock.fastForward(5000);
  await expect(round.getByRole("timer")).toHaveText("1:28");
  await round.getByRole("button", { name: "Resume timer" }).click();
  await go(19);
  await page.clock.fastForward(5000);
  await go(18);
  await expect(round.getByRole("button", { name: "Resume timer" })).toBeVisible();
  await expect(round.getByRole("timer")).toHaveText("1:28");
  await round.getByRole("button", { name: "Reset timer" }).click();
  await expect(round.getByRole("timer")).toHaveText("1:30");
  await round.getByRole("button", { name: "Start 90-second round" }).click();
  await page.clock.fastForward(91_000);
  await expect(round.getByRole("status")).toHaveText("Pens down. Swap roles.");
  await expect(round.getByRole("timer")).toHaveText("0:00");
  assert.deepEqual(errors, [], "No deck runtime errors");
  console.log(`PASS: ${slideCount} slides × two reveal states; portraits; reload reveal; six loop stages + escalation; timer start/pause/resume/reset/expiry/navigation; reduced motion.`);
  console.log("Visual samples: .lab-runs/deck-review/");
} finally {
  await browser.close();
  await site?.stop();
}
