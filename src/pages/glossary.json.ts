import { loadClassGlossary } from "../class-glossary";

export async function GET() {
  return Response.json(await loadClassGlossary());
}
