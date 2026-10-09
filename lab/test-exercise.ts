import { loadParts } from "./load-parts.js";
import { checkBrowser, checkPolicy, checkQuestions } from "./exercise-checks.js";
const name = process.argv[2];
const parts = await loadParts(process.argv.includes("--solution"));
try {
  if (name === "browser") await checkBrowser(parts);
  else if (name === "questions") {
    checkQuestions(parts);
    console.log("Construction only: use --judge live to test question meaning. Fixture scores ignore wording.");
  } else if (name === "policy") checkPolicy(parts);
  else throw new Error("Choose browser, questions, or policy");
  console.log(name + " exercise: PASS");
} catch (error) {
  console.error(name + " exercise: NOT YET — " + (error instanceof Error ? error.message : error));
  console.error("Read the corresponding lesson; compare with lab/solution/ or use --solution without overwriting.");
  process.exitCode = 1;
}
