import { readFile } from "node:fs/promises";
import { CORE_GLOSSARY_SECTION } from "./core-glossary.js";
import { classConfig, withBase, type ClassConfig } from "./class-config.js";
import { workshopGlossarySchema, type WorkshopGlossary } from "./schema.js";

// The starter works without model access. Generation replaces this with reviewed content.
export function starterGlossary(config: ClassConfig): WorkshopGlossary {
  return {
    schemaVersion: 1,
    slug: config.slug,
    title: config.title,
    subtitle: "The vocabulary behind the lessons.",
    event: config.event,
    credit: config.credit,
    updated: "2026-01-01",
    slidesUrl: "/slides",
    theme: config.theme,
    sections: [CORE_GLOSSARY_SECTION],
    resources: [],
    quiz: [{
      id: "grounding-check",
      question: "How can you make a model’s answer easier to verify?",
      choices: ["Give it trusted source material", "Ask for a longer answer", "Ask it to sound confident", "Remove the context"],
      answerIndex: 0,
      explanation: "Grounding ties an answer to evidence you can check.",
      termIds: ["grounding"],
    }],
  };
}

export function prepareClassGlossary(input: WorkshopGlossary, config: ClassConfig): WorkshopGlossary {
  const workshop = structuredClone(input);
  const oldSlidesUrl = workshop.slidesUrl;
  const linkSlides = config.slides.publish && config.slides.link;
  Object.assign(workshop, {
    slug: config.slug, title: config.title, event: config.event, credit: config.credit,
    theme: config.theme, slidesUrl: linkSlides ? withBase("/slides/#", config.basePath) : "",
  });
  // Reviewed content links class-root-relative ("/materials/…"). Serve those under the base path.
  for (const resource of workshop.resources) resource.url = withBase(resource.url, config.basePath);
  if (!linkSlides) {
    const slideBases = ["/slides", oldSlidesUrl].filter(Boolean).map((url) => new URL(withBase(url, config.basePath), `https://${config.hostname}`));
    workshop.resources = workshop.resources.filter((resource) => {
      if (!resource.url) return false;
      try {
        const url = new URL(resource.url, `https://${config.hostname}`);
        return !slideBases.some((base) => url.origin === base.origin &&
          (url.pathname.replace(/\/$/, "") === base.pathname.replace(/\/$/, "") || url.pathname.startsWith(`${base.pathname.replace(/\/$/, "")}/`)));
      } catch { return false; }
    });
    for (const section of workshop.sections) {
      for (const term of section.terms) {
        term.slide = null;
        term.sourcePath = "class-materials";
      }
    }
    for (const resource of workshop.resources) resource.sourcePath = "class-materials";
  }
  if (!config.features.demos) {
    for (const section of workshop.sections) for (const term of section.terms) term.demo = "none";
  }
  return workshop;
}

export async function loadClassGlossary(): Promise<WorkshopGlossary> {
  let input: WorkshopGlossary;
  try {
    input = workshopGlossarySchema.parse(JSON.parse(await readFile("generated/glossary.json", "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    input = starterGlossary(classConfig);
  }
  return prepareClassGlossary(input, classConfig);
}
