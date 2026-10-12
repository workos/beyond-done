import { chromium } from "@playwright/test";
import { startApp, type Bug } from "./server.js";
import { runProof, type Prove } from "./proof.js";

// Your proof must pass a correct app and fail each broken one it is responsible for.
const cases: { bug?: Bug; expect: "PASS" | "FAIL"; miss: string }[] = [
  { expect: "PASS", miss: "It fails a correct app. Check only what the contract requires, and record facts instead of throwing." },
  { bug: "memory-only", expect: "FAIL", miss: "It passes an app that forgets everything on reload. Reload, then check status and storage()." },
  { bug: "wrong-email", expect: "FAIL", miss: "It passes an app that saves the wrong email. After reload, compare the saved email to the one typed." },
  { bug: "lost-confirmation", expect: "FAIL", miss: "It passes an app whose confirmation vanishes on reload. Compare the confirmation after reload to `promised`." },
];

const solution = process.argv.includes("--solution");
const { prove } = await import(solution ? "./solution/prove.js" : "./exercises/prove.js") as { prove: Prove };
const browser = await chromium.launch();
let failures = 0;
try {
  for (const testCase of cases) {
    const app = await startApp({ app: "solution", bug: testCase.bug });
    try {
      const receipt = await runProof(browser, app.url, prove);
      const label = testCase.bug ?? "correct app";
      if (receipt.verdict === testCase.expect) {
        console.log(`✓ ${label.padEnd(18)} → ${receipt.verdict}`);
      } else {
        failures++;
        console.log(`✗ ${label.padEnd(18)} → ${receipt.verdict}, expected ${testCase.expect}. ${testCase.miss}`);
        if (receipt.error) console.log(`  ${receipt.error}`);
      }
    } finally { await app.close(); }
  }
} finally { await browser.close(); }
console.log(failures ? `prove exercise: NOT YET (${failures} of ${cases.length} cases). Lesson 4 has hints; lab/solution/prove.ts is the reference.` : "prove exercise: PASS");
process.exitCode = failures ? 1 : 0;
