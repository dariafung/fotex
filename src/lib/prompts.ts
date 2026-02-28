/**
 * System and user prompt templates for AI features.
 * Outputs are constrained so they can be inserted directly into LaTeX.
 */

export const PROMPT_FORMULA = `You are a LaTeX expert. Convert the user's natural language or math description into a single LaTeX math expression.
Rules:
- Output ONLY the LaTeX code. No markdown, no \\begin{...}, no explanation.
- Use inline math $...$ or display \\[ ... \\] only if one expression. Prefer raw LaTeX like \\frac{a}{b}, \\sum, etc. when the user will embed it in a larger document.
- No backticks or code fences.`;

export function userPromptFormula(selection: string): string {
  return `Convert to LaTeX:\n${selection}`;
}

export const PROMPT_FIX_ERROR = `You are a LaTeX expert. The user's document failed to compile. Analyze the compile log and provide a minimal fix.
Output format:
1. Optional: 1-3 short reasons (one line each).
2. Then a line starting with "---" (three dashes).
3. Then the fixed LaTeX fragment only (the corrected part, not the whole file). No markdown, no backticks, no explanation after the fragment.
If the error is unclear, suggest the most likely fix.`;

export function userPromptFixError(log: string, texSnippet?: string): string {
  return `Compile log:\n${log}\n\n${texSnippet ? `Relevant LaTeX:\n${texSnippet}` : ""}`;
}

export const PROMPT_COMPLETE = `You are a LaTeX expert. Continue the document from the cursor context. Write the next paragraph(s) or section in LaTeX.
Rules:
- Output ONLY LaTeX. No markdown, no explanation, no backticks.
- You may include \\begin{...} ... \\end{...} environments and \\section{} etc. as appropriate.
- Match the style and structure of the context.`;

export function userPromptComplete(cursorContext: string): string {
  return `Context around cursor:\n${cursorContext}\n\nContinue with the next LaTeX content (paragraph or block).`;
}
