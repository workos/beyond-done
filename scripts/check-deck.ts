import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { dev } from "astro";
import { chromium, expect } from "@playwright/test";
import { collectWorkshopSource } from "./source.js";

const source = await collectWorkshopSource("slides/slides.md");
const slideCount = source.slideCount;
const slides = source.content.split(/\[SLIDE \d+\]\n/).slice(1);
function slideFor(marker: string) {
  const index = slides.findIndex(slide => slide.includes(marker));
  assert.ok(index >= 0, `Missing slide: ${marker}`);
  return index + 1;
}
const hostSlide = slideFor('class="people"');
const reloadSlide = slideFor('<ReloadReveal');
const loopSlide = slideFor('<LoopMachine');
const roundSlide = slideFor('Round 1 · The polite lie');
const evidenceSlide = slideFor('<EvidenceFlow');
const contrastSlide = slideFor('<VerificationContrast');
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
    // A cold Astro + Slidev dev server may still be optimizing its client modules.
    try {
      await expect(root).toBeVisible({ timeout: 15_000 });
    } catch (error) {
      console.error({ url: page.url(), errors, body: (await page.locator("body").innerText()).slice(0, 1500) });
      throw error;
    }
    await expect(root.locator(".slidev-layout")).not.toBeEmpty();
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => a.playState === "running").length)).toBe(0);
    return root;
  }
  await mkdir(".lab-runs/deck-review", { recursive: true });
  const overflow: unknown[] = [];
  for (let slide = 1; slide <= slideCount; slide++) {
    for (const clicks of slide === loopSlide ? [0, 1, 2, 3, 4, 5] : slide === contrastSlide ? [0, 1, 2, 3] : [0, 99]) {
      const root = await go(slide, clicks);
      const outside = await root.locator(".slidev-layout").evaluate(layout => {
        const bounds = layout.getBoundingClientRect();
        const footnote = layout.querySelector(".footnote")?.getBoundingClientRect();
        return [...layout.querySelectorAll("h1,h2,p,pre,table,li,img,button,label,.loop-controls,.command,.ticket,.score-receipt")]
          .filter(element => {
            if (element.closest(".slidev-vclick-hidden")) return false;
            const rect = element.getBoundingClientRect();
            const coversFootnote = footnote && !element.closest(".footnote") && rect.bottom > footnote.top && rect.top < footnote.bottom && rect.right > footnote.left && rect.left < footnote.right;
            return rect.width > 0 && (coversFootnote || rect.bottom > bounds.bottom - 8 || rect.right > bounds.right + 1 || rect.left < bounds.left - 1 || rect.top < bounds.top - 1);
          }).map(element => ({ tag: element.tagName, text: element.textContent?.slice(0, 55) }));
      });
      if (outside.length) overflow.push({ slide, clicks, outside });
    }
    if ([1, 2, 4, 5, 6, 7, 11, 12, 14, 15, 19, 20, 22, 24, 29, 30].includes(slide)) {
      await page.screenshot({ path: `.lab-runs/deck-review/${String(slide).padStart(2, "0")}.png` });
    }
  }
  assert.deepEqual(overflow, [], "Slide content must fit at initial and fully revealed states");
  const contrast = await go(contrastSlide, 3);
  await expect(contrast.getByLabel('Illustrative time without verification')).toHaveText('36:00');
  await expect(contrast.getByLabel('Illustrative time with verification')).toHaveText('08:00');
  await contrast.getByRole('button', { name: 'Slow UI', exact: true }).click();
  await expect(contrast.locator('.verification-contrast')).toHaveAttribute('data-mode', 'performance');
  await expect(contrast.locator('.trace-view')).toHaveClass(/optimized/);
  await page.keyboard.press('ArrowLeft');
  await expect(contrast.locator('.verification-contrast')).toHaveAttribute('data-step', '2');
  await expect(contrast.getByLabel('Illustrative time without verification')).toHaveText('12:00');
  await page.keyboard.press('ArrowLeft');
  await expect(contrast.locator('.trace-view')).not.toHaveClass(/optimized/);
  await page.keyboard.press('ArrowRight');
  await expect(contrast.getByLabel('Illustrative time with verification')).toHaveText('08:00');
  await page.keyboard.press('ArrowRight');
  await expect(contrast.getByLabel('Illustrative time without verification')).toHaveText('36:00');
  await expect(contrast.getByLabel('Illustrative time with verification')).toHaveText('08:00');
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
  await page.screenshot({ path: '.lab-runs/deck-review/verification-performance.png' });
  await contrast.getByRole('button', { name: 'Waitlist', exact: true }).click();
  await expect(contrast.locator('.verification-contrast')).toHaveAttribute('data-step', '3');
  await expect(contrast.locator('.contrast-resource')).toContainText('pnpm lab:check --scenario memory-only --solution');
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
  await page.screenshot({ path: '.lab-runs/deck-review/verification-waitlist.png' });
  const intro = await go(hostSlide);
  for (const name of ["Nick Nisi", "Zack Proser"]) {
    await expect(intro.getByRole("heading", { name: new RegExp(name.replace(" ", "\\s*")) })).toBeVisible();
  }
  assert.equal(await intro.locator("img").evaluateAll(images => images.every(img => (img as HTMLImageElement).naturalWidth > 0)), true);
  const reveal = await go(reloadSlide);
  await reveal.getByRole("button", { name: "Reload the page" }).click();
  await expect(reveal.getByText("Nobody here.", { exact: true })).toBeVisible();
  await reveal.getByRole("button", { name: "Reset illustration" }).click();
  await expect(reveal.getByText("ada@example.test", { exact: true })).toBeVisible();
  for (let click = 0; click <= 5; click++) {
    const loop = await go(loopSlide, click);
    await expect(loop.locator(".loop-track .current")).toHaveText(new RegExp(["Proposal", "Browser", "Judge", "Repair", "Re-check", "Decision"][click]));
  }
  const loop = page.locator(`.slidev-page-${loopSlide}`);
  await expect(loop.getByRole("heading", { name: "Now you can call it done." })).toBeVisible();
  await loop.getByRole("checkbox", { name: "Make the worker stubborn" }).check();
  await expect(loop.getByRole("heading", { name: "A human takes it from here." })).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedContrast = await go(contrastSlide);
  await page.getByRole('button', { name: 'Go to next slide', exact: true }).click();
  await expect(reducedContrast.locator('.verification-contrast')).toHaveAttribute('data-step', '1');
  await expect(reducedContrast.getByLabel('Illustrative time without verification')).toHaveText('04:00');
  assert.equal(await reducedContrast.locator('.retry-token').evaluate(e => getComputedStyle(e).animationName), 'none');
  const cover = await go(1);
  assert.equal(await cover.locator(".incident-record").first().evaluate(e => getComputedStyle(e).transitionDuration), "0s");
  await go(1, 1);
  await expect(page.locator('.incident-opener[data-phase="1"]')).toBeVisible();
  await go(1, 2);
  await expect(page.getByText("Data later recovered.", { exact: true })).toBeVisible();
  await go(evidenceSlide, 2);
  await expect(page.locator('.evidence-flow .proof-failure')).toContainText("Waitlist survives reload");
  const repoSlide = await go(slideFor('resource="repo"'));
  const repoLink = repoSlide.getByRole('link', { name: 'Open workshop repository' });
  await expect(repoLink).toHaveAttribute('href', 'https://github.com/nicknisi/beyond-done');
  assert.ok(await repoLink.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth > 0), 'Repo QR loads');
  const round = await go(roundSlide);
  await page.clock.install();
  await round.getByRole("button", { name: "Start 90-second round" }).click();
  await page.clock.fastForward(2100);
  await expect(round.getByRole("timer")).toHaveText("1:28");
  await round.getByRole("button", { name: "Pause timer" }).click();
  await page.clock.fastForward(5000);
  await expect(round.getByRole("timer")).toHaveText("1:28");
  await round.getByRole("button", { name: "Resume timer" }).click();
  await go(roundSlide + 1);
  await page.clock.fastForward(5000);
  await go(roundSlide);
  await expect(round.getByRole("button", { name: "Resume timer" })).toBeVisible();
  await expect(round.getByRole("timer")).toHaveText("1:28");
  await round.getByRole("button", { name: "Reset timer" }).click();
  await expect(round.getByRole("timer")).toHaveText("1:30");
  await round.getByRole("button", { name: "Start 90-second round" }).click();
  await page.clock.fastForward(91_000);
  await expect(round.getByRole("status")).toHaveText("Pens down. Swap roles.");
  await expect(round.getByRole("timer")).toHaveText("0:00");
  assert.deepEqual(errors, [], "No deck runtime errors");
  console.log(`PASS: ${slideCount} slides × reveal states; verification comparison clocks/reverse/modes/reduced motion; portraits; incident recovery; QR; saved evidence; reload reveal; six loop stages + escalation; timer start/pause/resume/reset/expiry/navigation; reduced motion.`);
  console.log("Visual samples: .lab-runs/deck-review/");
} finally {
  await browser.close();
  await site?.stop();
}
