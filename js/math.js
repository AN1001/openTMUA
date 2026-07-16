// Shared maths renderer used by the landing demo and the practice page.
// Fields in questions.json may contain LaTeX between delimiters:
//   inline:  $ ... $      display: $$ ... $$
// renderMath() splits a string on those delimiters, renders the maths
// segments with KaTeX, and inserts everything else as plain text nodes —
// so question data is never interpreted as HTML (no innerHTML on it).

// Append a run of plain text, turning "\n" newlines into <br> line breaks —
// otherwise HTML would collapse them to a single space. Everything is inserted
// as text nodes, so question data is still never parsed as HTML.
function appendText(target, text) {
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (i > 0) target.appendChild(document.createElement("br"));
    if (line) target.appendChild(document.createTextNode(line));
  });
}

export function renderMath(text, target) {
  target.textContent = "";
  const str = String(text ?? "");

  // No KaTeX or no maths present: fastest safe path is plain text.
  if (typeof window.katex === "undefined" || !str.includes("$")) {
    appendText(target, str);
    return target;
  }

  // Fresh per call (stateful because of /g's lastIndex): $$...$$ (display) is
  // matched before $...$ (inline). Content can't contain '$'.
  const math = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let last = 0;
  let m;
  while ((m = math.exec(str)) !== null) {
    if (m.index > last) {
      appendText(target, str.slice(last, m.index));
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
    last = math.lastIndex;
  }
  if (last < str.length) {
    appendText(target, str.slice(last));
  }
  return target;
}
