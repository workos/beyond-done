import type { Parts } from "./types.js";
export async function loadParts(solution: boolean): Promise<Parts> {
  if (solution) {
    const [observer, questions, policy] = await Promise.all([
      import("./solution/observe.js"), import("./solution/questions.js"), import("./solution/decide.js"),
    ]);
    return { ...observer, ...questions, ...policy };
  }
  const [observer, questions, policy] = await Promise.all([
    import("./exercises/observe.js"), import("./exercises/questions.js"), import("./exercises/decide.js"),
  ]);
  return { ...observer, ...questions, ...policy };
}
