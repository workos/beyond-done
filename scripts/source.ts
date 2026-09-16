import { lstat, readFile, readdir } from "node:fs/promises";
import { basename, extname, relative, resolve } from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".md", ".mdx", ".txt"]);
const IGNORED_DIRECTORIES = new Set([".git", "dist", "node_modules"]);
const MAX_SOURCE_CHARS = 600_000;

export interface CollectedSource {
  inputPath: string;
  files: string[];
  content: string;
  hasReliableSlideNumbers: boolean;
  slideSourcePath: string | null;
  slideCount: number | null;
}

async function collectFiles(path: string): Promise<string[]> {
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) return [];
  if (stat.isFile()) {
    if (!SUPPORTED_EXTENSIONS.has(extname(path).toLowerCase())) {
      throw new Error(`Unsupported source file: ${path}`);
    }
    return [path];
  }
  if (!stat.isDirectory()) throw new Error(`Source is not a file or directory: ${path}`);

  const files: string[] = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || IGNORED_DIRECTORIES.has(entry.name)) continue;
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(child)));
    else if (entry.isFile() && SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase())) files.push(child);
  }
  return files;
}

function annotateSlides(markdown: string): { content: string; count: number } {
  const lines = markdown.split("\n");
  let frontmatterEnd = -1;
  if (lines[0]?.trim() === "---") {
    frontmatterEnd = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  }

  const slides: string[][] = [[]];
  for (let index = 0; index < lines.length; index++) {
    const isSeparator = lines[index].trim() === "---" && index !== 0 && index !== frontmatterEnd;
    if (isSeparator) slides.push([]);
    else slides[slides.length - 1].push(lines[index]);
  }

  return {
    content: slides.map((slide, index) => `[SLIDE ${index + 1}]\n${slide.join("\n").trim()}`).join("\n\n"),
    count: slides.length,
  };
}

export async function collectSource(input: string): Promise<CollectedSource> {
  const inputPath = resolve(input);
  const stat = await lstat(inputPath);
  const files = (await collectFiles(inputPath)).sort();
  if (files.length === 0) throw new Error(`No .md, .mdx, or .txt files found in ${inputPath}`);

  const root = stat.isDirectory() ? inputPath : resolve(inputPath, "..");
  const hasReliableSlideNumbers = files.length === 1 && [".md", ".mdx"].includes(extname(files[0]).toLowerCase());
  const chunks: string[] = [];
  let slideCount: number | null = null;
  let size = 0;

  for (const file of files) {
    const sourcePath = relative(root, file) || file.split("/").pop()!;
    const raw = await readFile(file, "utf8");
    const annotated = hasReliableSlideNumbers ? annotateSlides(raw) : null;
    const body = annotated?.content ?? raw;
    slideCount = annotated?.count ?? slideCount;
    const chunk = `===== SOURCE: ${sourcePath} =====\n${body.trim()}`;
    size += chunk.length;
    if (size > MAX_SOURCE_CHARS) {
      throw new Error(`Workshop source exceeds ${MAX_SOURCE_CHARS.toLocaleString()} characters. Pass a smaller file or directory.`);
    }
    chunks.push(chunk);
  }

  const relativeFiles = files.map((file) => relative(root, file));
  return {
    inputPath,
    files: relativeFiles,
    content: chunks.join("\n\n"),
    hasReliableSlideNumbers,
    slideSourcePath: hasReliableSlideNumbers ? relativeFiles[0] : null,
    slideCount,
  };
}

export async function collectWorkshopSource(primary: string, includes: string[] = []): Promise<CollectedSource> {
  const main = await collectSource(primary);
  if (includes.length === 0) return main;

  const sources = [main, ...(await Promise.all(includes.map(collectSource)))];
  const files: string[] = [];
  const chunks: string[] = [];
  let slideSourcePath = main.slideSourcePath;

  for (const [index, source] of sources.entries()) {
    const prefix = index === 0 ? "" : basename(source.inputPath, extname(source.inputPath));
    const mappings = new Map(source.files.map((file) => [file, prefix ? `${prefix}/${file}` : file]));
    for (const mapped of mappings.values()) {
      if (files.includes(mapped)) throw new Error(`Duplicate source path: ${mapped}`);
      files.push(mapped);
    }
    let content = source.content;
    for (const [original, mapped] of mappings) {
      content = content.replaceAll(`===== SOURCE: ${original} =====`, `===== SOURCE: ${mapped} =====`);
    }
    chunks.push(content);
    if (index === 0 && slideSourcePath) slideSourcePath = mappings.get(slideSourcePath) ?? null;
  }

  const content = chunks.join("\n\n");
  if (content.length > MAX_SOURCE_CHARS) {
    throw new Error(`Workshop source exceeds ${MAX_SOURCE_CHARS.toLocaleString()} characters. Pass fewer materials.`);
  }
  return {
    inputPath: main.inputPath,
    files,
    content,
    hasReliableSlideNumbers: main.hasReliableSlideNumbers,
    slideSourcePath,
    slideCount: main.slideCount,
  };
}
