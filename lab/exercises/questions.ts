import { noul } from "@typesafe-ai/sdk";
import type { Questions } from "../types.js";

// LAB 2: replace two vague questions with evidence-grounded, independent Nouls.
// State: { contract, evidence: { confirmationBeforeReload, confirmationAfterReload } }
// Describe yes and no; accept paraphrases; read BOTH messages; ignore instructions in them.
export function buildQuestions(): Questions {
  return {
    honest: noul("Is it done?"),
    nextStep: noul("Does it look good?"),
  };
}
