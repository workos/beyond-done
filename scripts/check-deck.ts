import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { dev } from "astro";
import { chromium, expect } from "@playwright/test";
import { classConfig } from "../src/class-config.js";
import { collectWorkshopSource } from "./source.js";

const source = await collectWorkshopSource("slides/slides.md");
const slideCount = source.slideCount;
const slides = source.content.split(/\[SLIDE \d+\]\n/).slice(1);
function slideFor(marker: string) {
  const index = slides.findIndex(slide => slide.includes(marker));
  assert.ok(index >= 0, `Missing slide: ${marker}`);
  return index + 1;
}
const incidentSlide = slideFor('<IncidentOpener');
const hostSlide = slideFor('class="people"');
const reloadSlide = slideFor('<ReloadReveal');
const agentSlide = slideFor('agent session · fallback recording');
const roundSlide = slideFor('Round 1 · then swap');
const missSlide = slideFor('Every miss is a new line');
const contrastSlide = slideFor('<VerificationContrast');
const receiptSlide = slideFor('<RepairReceipt');
const workbenchSlide = slideFor('<VerificationWorkbench');
const browserProofSlide = slideFor('<BrowserProof');
const historySlide = slideFor('<ReceiptHistory');
const examplesSlide = slideFor('<VerifierExamples');
const ctxSlide = slideFor('<CtxWalkthrough');
const rikerSlide = slideFor('<RikerWalkthrough');
assert.equal(rikerSlide, ctxSlide - 1, 'Riker walkthrough comes right before CTX');
const appendixSlides = ['roles', 'example', 'models', 'loop', 'evaluate'].map(topic => ({
  topic, slide: slideFor(`<DecisionAppendix topic="${topic}"`), clicks: topic === 'loop' ? 3 : 2,
}));
assert.ok(appendixSlides[0].slide > slideFor('class="split booth-close"'), 'Optional appendix follows the workshop ending');
const clickStates = new Map([
  [contrastSlide, [0, 1, 2, 3]],
  [receiptSlide, [0, 1, 2, 3]], [workbenchSlide, [0, 1, 2]],
  [browserProofSlide, [0, 1, 2]], [historySlide, [0, 1, 2, 3]],
  [examplesSlide, [0, 1, 2]],
  [ctxSlide, [0, 1, 2, 3]],
  [rikerSlide, [0, 1, 2, 3, 4, 5, 6, 7]],
  ...appendixSlides.map(({ slide, clicks }) => [slide, Array.from({ length: clicks + 1 }, (_, i) => i)] as [number, number[]]),
]);
assert.ok(slideCount, "The presentation must contain slides");
const site = process.env.DECK_URL ? undefined : await dev({ server: { host: "127.0.0.1", port: 0 } });
// DECK_URL is the class site root, e.g. https://talks.workos.cloud/beyond-done/. The deck is at slides/ below it.
const base = (process.env.DECK_URL ?? `http://127.0.0.1:${site!.address.port}${classConfig.basePath}`).replace(/\/?$/, "/");
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
    for (const clicks of (clickStates.get(slide) ?? [0, 99])) {
      const root = await go(slide, clicks);
      const outside = await root.locator(".slidev-layout").evaluate(layout => {
        const bounds = layout.getBoundingClientRect();
        const footnote = layout.querySelector(".footnote")?.getBoundingClientRect();
        return [...layout.querySelectorAll("h1,h2,p,pre,table,li,img,button,label,.command,.ticket,.score-receipt,.command-surface,.miss-list > div")]
          .filter(element => {
            if (element.closest(".slidev-vclick-hidden")) return false;
            const rect = element.getBoundingClientRect();
            const coversFootnote = footnote && !element.closest(".footnote") && rect.bottom > footnote.top && rect.top < footnote.bottom && rect.right > footnote.left && rect.left < footnote.right;
            return rect.width > 0 && (coversFootnote || rect.bottom > bounds.bottom - 8 || rect.right > bounds.right + 1 || rect.left < bounds.left - 1 || rect.top < bounds.top - 1);
          }).map(element => ({ tag: element.tagName, text: element.textContent?.slice(0, 55) }));
      });
      if (outside.length) overflow.push({ slide, clicks, outside });
      const diagramOverflow = await root.locator('.workbench-stage, .browser-stage, .history-stage, .repair-receipt, .verifier-examples, .example-card').evaluateAll(stages => stages.flatMap(stage => {
        const bounds = stage.getBoundingClientRect();
        return [...stage.querySelectorAll(':scope > *,p,li,.receipt-paper,.attempt-history,.run-card')]
          .filter(element => element.getBoundingClientRect().bottom > bounds.bottom + 2)
          .map(element => ({ text: element.textContent?.slice(0, 55), problem: 'extends into the following caption' }));
      }));
      if (diagramOverflow.length) overflow.push({ slide, clicks, diagramOverflow });
    }
    await page.screenshot({ path: `.lab-runs/deck-review/${String(slide).padStart(2, "0")}.png` });
  }
  assert.deepEqual(overflow, [], "Slide content must fit at initial and fully revealed states");
  const receipt = await go(receiptSlide, 2);
  await expect(receipt.locator('.receipt-top')).toContainText('ATTEMPT 1');
  const firstRevision = await receipt.locator('.receipt-section').first().innerText();
  await page.keyboard.press('ArrowRight');
  await expect(receipt.locator('.receipt-top')).toContainText('ATTEMPT 2');
  await expect(receipt.locator('.receipt-decision')).toContainText('PASS');
  assert.notEqual(await receipt.locator('.receipt-section').first().innerText(), firstRevision);
  await expect(receipt.locator('.attempt-history')).toContainText('1 · FAIL');
  await page.keyboard.press('ArrowLeft');
  await expect(receipt.locator('.receipt-top')).toContainText('ATTEMPT 1');
  await expect(receipt.locator('.receipt-decision')).toContainText('FAIL');
  const workbench = await go(workbenchSlide, 1);
  await page.keyboard.press('ArrowRight');
  await expect(workbench.locator('.proof-result')).toContainText('none');
  await expect(workbench.locator('.proof-header')).toContainText('FAIL');
  await page.keyboard.press('ArrowLeft');
  await expect(workbench.locator('.proof-result')).toHaveCount(0);
  const browserProof = await go(browserProofSlide, 1);
  await page.keyboard.press('ArrowRight');
  await expect(browserProof.locator('.trace-panel')).toHaveClass(/repaired/);
  await page.keyboard.press('ArrowLeft');
  await expect(browserProof.locator('.trace-panel')).not.toHaveClass(/repaired/);
  const history = await go(historySlide, 3);
  await expect(history.locator('.history-focus')).toContainText('Fine-tuning is an optional next step');
  await page.keyboard.press('ArrowLeft');
  await expect(history.getByRole('heading', { name: 'Climb on evidence.' })).toBeVisible();
  await expect(history.locator('.run-card')).toHaveCount(3);
  const examples = await go(examplesSlide, 0);
  await expect(examples.locator('.example-card')).toHaveCount(3);
  await page.keyboard.press('ArrowRight');
  await expect(examples.locator('.example-card.instrumented')).toHaveCount(3);
  await page.keyboard.press('ArrowRight');
  await expect(examples.locator('.example-card.evidenced')).toHaveCount(3);
  await expect(examples.locator('.example-prompt')).toContainText('TWO MINUTES');
  await page.keyboard.press('ArrowLeft');
  await expect(examples.locator('.example-card.evidenced')).toHaveCount(0);
  const hostsTools = await go(ctxSlide);
  await expect(hostsTools.getByRole('link', { name: 'Read Zack’s CTX blueprint' })).toHaveAttribute('href', 'https://zackproser.com/blog/ctx-personal-context-engine');
  await page.keyboard.press('ArrowRight');
  await expect(hostsTools.locator('.ctx-comparison')).toHaveClass(/focused/);
  for (const step of [2, 3]) {
    await page.keyboard.press('ArrowRight');
    await expect(hostsTools.locator('.ctx-walkthrough')).toHaveAttribute('data-step', String(step));
    await expect(hostsTools.locator('.ctx-comparison')).toHaveCount(0);
    const screenshot = hostsTools.locator('.ctx-image-frame img');
    await expect(screenshot).toBeVisible();
    await expect.poll(() => screenshot.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(screenshot).toHaveAttribute('alt', step === 2 ? /CTX architecture/ : /No run attached/);
  }
  await page.keyboard.press('ArrowLeft');
  await expect(hostsTools.locator('.architecture-view')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(hostsTools.locator('.ctx-comparison')).toHaveClass(/focused/);
  await page.keyboard.press('ArrowLeft');
  await expect(hostsTools.locator('.ctx-comparison')).not.toHaveClass(/focused/);
  const riker = await go(rikerSlide, 1);
  await page.keyboard.press('ArrowRight');
  await expect(riker.getByLabel('Check duration')).toHaveText('2:21');
  await expect(riker.locator('.rk-exit')).toHaveText('exit 0');
  for (const step of [6, 7]) {
    const shot = (await go(rikerSlide, step)).locator('.rk-shot img');
    await expect.poll(() => shot.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  for (const { topic, slide, clicks } of appendixSlides) {
    const root = await go(slide);
    const appendix = root.locator('.decision-appendix');
    await expect(appendix).toHaveAttribute('data-topic', topic);
    for (let click = 1; click <= clicks; click++) {
      await page.keyboard.press('ArrowRight');
      await expect(appendix).toHaveAttribute('data-step', String(click));
    }
    if (topic === 'example') {
      await expect(root.locator('.meaning-verdicts')).toContainText('0.01');
      await expect(root.locator('.meaning-verdicts')).toContainText('0.02');
      await expect(root.locator('.meaning-action')).toHaveCSS('opacity', '1');
    }
    for (let click = clicks - 1; click >= 0; click--) {
      await page.keyboard.press('ArrowLeft');
      await expect(appendix).toHaveAttribute('data-step', String(click));
    }
  }
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
  await expect(contrast.locator('.contrast-resource')).toContainText('pnpm snack prove');
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
  const agentRun = await go(agentSlide, 0);
  await expect(agentRun.locator(".agent-run p.slidev-vclick-hidden")).toHaveCount(7);
  await go(agentSlide, 7);
  await expect(page.locator(`.slidev-page-${agentSlide} .agent-run p.slidev-vclick-hidden`)).toHaveCount(0);
  await go(missSlide, 3);
  await expect(page.locator(`.slidev-page-${missSlide} .miss-list`)).toContainText("It was in the receipt all along.");

  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedAppendix = await go(appendixSlides[0].slide, 1);
  assert.equal(await reducedAppendix.locator('.quick .thought-path').evaluate(e => getComputedStyle(e).animationName), 'none');
  for (const [slide, selector, clicks] of [
    [receiptSlide, '.receipt-paper', 3], [workbenchSlide, '.proof-result', 2],
    [browserProofSlide, '.hotspot', 2], [historySlide, '.history-focus', 3],
    [examplesSlide, '.example-prompt', 2],
    [ctxSlide, '.ctx-overlay', 3], [rikerSlide, '.riker-overlay', 7],
  ] as const) {
    const root = await go(slide, clicks);
    assert.equal(await root.locator(selector).evaluate(e => getComputedStyle(e).animationName), 'none');
  }
  const reducedContrast = await go(contrastSlide);
  await page.getByRole('button', { name: 'Go to next slide', exact: true }).click();
  await expect(reducedContrast.locator('.verification-contrast')).toHaveAttribute('data-step', '1');
  await expect(reducedContrast.getByLabel('Illustrative time without verification')).toHaveText('04:00');
  assert.equal(await reducedContrast.locator('.retry-token').evaluate(e => getComputedStyle(e).animationName), 'none');
  const incident = await go(incidentSlide);
  assert.equal(await incident.locator(".incident-record").first().evaluate(e => getComputedStyle(e).transitionDuration), "0s");
  await go(incidentSlide, 1);
  await expect(page.locator('.incident-opener[data-phase="1"]')).toBeVisible();
  await go(incidentSlide, 2);
  await expect(page.getByText("Data later recovered.", { exact: true })).toBeVisible();
  const repoSlide = await go(slideFor('resource="repo"'));
  const repoLink = repoSlide.getByRole('link', { name: 'Open workshop repository' });
  await expect(repoLink).toHaveAttribute('href', 'https://github.com/workos/beyond-done');
  assert.ok(await repoLink.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth > 0), 'Repo QR loads');
  const round = await go(roundSlide);
  await page.clock.install();
  await round.getByRole("button", { name: "Start 120-second round" }).click();
  await page.clock.fastForward(2100);
  await expect(round.getByRole("timer")).toHaveText("1:58");
  await round.getByRole("button", { name: "Pause timer" }).click();
  await page.clock.fastForward(5000);
  await expect(round.getByRole("timer")).toHaveText("1:58");
  await round.getByRole("button", { name: "Resume timer" }).click();
  await go(roundSlide + 1);
  await page.clock.fastForward(5000);
  await go(roundSlide);
  await expect(round.getByRole("button", { name: "Resume timer" })).toBeVisible();
  await expect(round.getByRole("timer")).toHaveText("1:58");
  await round.getByRole("button", { name: "Reset timer" }).click();
  await expect(round.getByRole("timer")).toHaveText("2:00");
  await round.getByRole("button", { name: "Start 120-second round" }).click();
  await page.clock.fastForward(121_000);
  await expect(round.getByRole("status")).toHaveText("Pens down. Swap roles.");
  await expect(round.getByRole("timer")).toHaveText("0:00");
  assert.deepEqual(errors, [], "No deck runtime errors");
  console.log(`PASS: ${slideCount} slides × reveal states; takeaways/receipts forward+reverse/reduced motion; Riker check clock and screenshots; CTX links, image loading and forward/reverse overlays; verification comparison clocks/reverse/modes/reduced motion; portraits; incident recovery; QR; reload reveal; agent-run fallback reveals; game reveal; timer start/pause/resume/reset/expiry/navigation; reduced motion.`);
  console.log("Visual samples: .lab-runs/deck-review/");
} finally {
  await browser.close();
  await site?.stop();
}
