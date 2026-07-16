// Shared maths renderer used by the landing demo and the practice page.
// Fields in questions.json may contain LaTeX between delimiters:
//   inline:  $ ... $      display: $$ ... $$
// renderMath() splits a string on those delimiters, renders the maths
// segments with KaTeX, and inserts everything else as plain text nodes —
// so question data is never interpreted as HTML (no innerHTML on it).

// $$...$$ (display) is matched before $...$ (inline). Content can't contain '$'.
const MATH = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;

export function renderMath(text, target) {
  target.textContent = "";
  const str = String(text ?? "");

  // No KaTeX or no maths present: fastest safe path is plain text.
  if (typeof window.katex === "undefined" || !str.includes("$")) {
    target.textContent = str;
    return target;
  }

  let last = 0;
  let m;
  MATH.lastIndex = 0;
  while ((m = MATH.exec(str)) !== null) {
    if (m.index > last) {
      target.appendChild(document.createTextNode(str.slice(last, m.index)));
    }
    const isDisplay = m[1] != null;
    const source = isDisplay ? m[1] : m[2];
    const span = document.createElement("span");
    try {
      window.katex.render(source, span, {
        displayMode: isDisplay,
        throwOnError: false,
      });
    } catch {
      // Malformed LaTeX: fall back to showing the raw source, delimiters and all.
      span.textContent = isDisplay ? `$$${source}$$` : `$${source}$`;
    }
    target.appendChild(span);
    last = MATH.lastIndex;
  }
  if (last < str.length) {
    target.appendChild(document.createTextNode(str.slice(last)));
  }
  return target;
}
