import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildSystemPrompt } from "../src/openrouter.js";
import { workshopGlossarySchema, type WorkshopGlossary } from "../src/schema.js";

interface ModelPricing {
  prompt: string;
  completion: string;
}

export function estimateChatUsage(input: {
  workshop: WorkshopGlossary;
  budgetUsd: number;
  attendees: number;
  questionsPerAttendee: number;
  buffer: number;
  promptPricePerToken: number;
  completionPricePerToken: number;
}) {
  const systemTokens = Math.ceil(buildSystemPrompt(input.workshop).length / 4);
  const estimatedInputTokens = systemTokens + 2_000;
  const maxOutputTokens = 500;
  const estimatedCostPerAnswer = estimatedInputTokens * input.promptPricePerToken + maxOutputTokens * input.completionPricePerToken;
  const answers = Math.floor(input.budgetUsd / estimatedCostPerAnswer);
  const tokensPerAttendee = (estimatedInputTokens + maxOutputTokens) * input.questionsPerAttendee;
  const costPerAttendee = estimatedCostPerAnswer * input.questionsPerAttendee;
  const calculatedBudget = costPerAttendee * input.attendees * (1 + input.buffer);
  return {
    systemTokens,
    estimatedInputTokens,
    maxOutputTokens,
    estimatedCostPerAnswer,
    answers,
    answersPerAttendee: input.attendees > 0 ? answers / input.attendees : 0,
    tokensPerAttendee,
    costPerAttendee,
    calculatedBudget,
    recommendedBudget: Math.max(15, Math.ceil(calculatedBudget)),
  };
}

function value(args: string[], name: string): string {
  const index = args.indexOf(name);
  if (index < 0 || !args[index + 1]) throw new Error(`Missing ${name}.`);
  return args[index + 1];
}

async function main(args = process.argv.slice(2)): Promise<void> {
  const model = value(args, "--model");
  const glossaryPath = resolve(value(args, "--glossary"));
  const budgetUsd = Number(value(args, "--budget"));
  const attendees = Number(value(args, "--attendees"));
  const questionsPerAttendee = Number(args.includes("--questions") ? value(args, "--questions") : "5");
  const buffer = Number(args.includes("--buffer") ? value(args, "--buffer") : "0.5");
  const format = args.includes("--format") ? value(args, "--format") : "text";
  if (!Number.isFinite(budgetUsd) || budgetUsd <= 0) throw new Error("--budget must be positive.");
  if (!Number.isInteger(attendees) || attendees <= 0) throw new Error("--attendees must be a positive integer.");
  if (!Number.isInteger(questionsPerAttendee) || questionsPerAttendee <= 0) throw new Error("--questions must be a positive integer.");
  if (!Number.isFinite(buffer) || buffer < 0) throw new Error("--buffer must be zero or greater.");

  const workshop = workshopGlossarySchema.parse(JSON.parse(await readFile(glossaryPath, "utf8")));
  const response = await fetch("https://openrouter.ai/api/v1/models");
  if (!response.ok) throw new Error(`Could not load OpenRouter model pricing (${response.status}).`);
  const payload = await response.json() as { data?: Array<{ id?: string; pricing?: ModelPricing }> };
  const selected = payload.data?.find((candidate) => candidate.id === model);
  const promptPrice = Number(selected?.pricing?.prompt);
  const completionPrice = Number(selected?.pricing?.completion);
  if (!Number.isFinite(promptPrice) || !Number.isFinite(completionPrice)) throw new Error(`No pricing found for ${model}.`);

  const estimate = estimateChatUsage({
    workshop,
    budgetUsd,
    attendees,
    questionsPerAttendee,
    buffer,
    promptPricePerToken: promptPrice,
    completionPricePerToken: completionPrice,
  });
  const result = { model, promptPrice, completionPrice, attendees, questionsPerAttendee, buffer, ...estimate };
  if (format === "json") {
    console.log(JSON.stringify(result));
    return;
  }
  console.log(`  Model pricing: $${(promptPrice * 1_000_000).toFixed(2)}/M input, $${(completionPrice * 1_000_000).toFixed(2)}/M output`);
  console.log(`  Estimated tokens per attendee: ${estimate.tokensPerAttendee.toLocaleString()} for ${questionsPerAttendee} questions`);
  console.log(`  Estimated cost per attendee: $${estimate.costPerAttendee.toFixed(4)}`);
  console.log(`  Calculated cap with ${(buffer * 100).toFixed(0)}% buffer: $${estimate.calculatedBudget.toFixed(2)}`);
  console.log(`  Recommended hard cap: $${estimate.recommendedBudget.toFixed(2)}`);
  console.log(`  A $${budgetUsd.toFixed(2)} cap supports about ${estimate.answers} answers, or ${estimate.answersPerAttendee.toFixed(1)} per attendee.`);
  console.log("  This is a conservative estimate, not a billing guarantee.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
