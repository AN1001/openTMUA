// Shared maths renderer used by the landing demo and the practice page.
// Fields in questions.json may contain LaTeX between delimiters:
//   inline:  $ ... $      display: $$ ... $$
// and diagrams, referencing an image file under assets/diagrams/:
//   \diagram{path}              e.g. \diagram{assets/diagrams/q12-triangle.png}
//   \diagram{path}{alt text}    e.g. \diagram{assets/diagrams/q12-triangle.png}{Right triangle with legs 3 and 4}
// renderMath() splits a string on those tokens, renders the maths segments
// with KaTeX and the diagram segments as <img> elements, and inserts
// everything else as plain text nodes — so question data is never
// interpreted as HTML (no innerHTML on it).

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

function appendDiagram(target, src, alt) {
  const img = document.createElement("img");
  img.className = "question-diagram";
  img.src = src;
  img.alt = alt || "";
  img.loading = "lazy";
  target.appendChild(img);
}

export function renderMath(text, target) {
  target.textContent = "";
  const str = String(text ?? "");
  const hasKatex = typeof window.katex !== "undefined";

  // Nothing to parse out: fastest safe path is plain text.
  if ((!hasKatex || !str.includes("$")) && !str.includes("\\diagram{")) {
    appendText(target, str);
    return target;
  }

  // Fresh per call (stateful because of /g's lastIndex): $$...$$ (display) is
  // matched before $...$ (inline); content can't contain '$'. \diagram{path}
  // takes an optional second {alt text} argument.
  const token =
    /\$\$([^$]+)\$\$|\$([^$]+)\$|\\diagram\{([^{}]+)\}(?:\{([^{}]*)\})?/g;
  let last = 0;
  let m;
  while ((m = token.exec(str)) !== null) {
    if (m.index > last) {
      appendText(target, str.slice(last, m.index));
    }
    const [, display, inline, diagramSrc, diagramAlt] = m;
    if (diagramSrc != null) {
      appendDiagram(target, diagramSrc.trim(), diagramAlt);
    } else if (hasKatex) {
      const isDisplay = display != null;
      const source = isDisplay ? display : inline;
      const span = document.createElement("span");
      // KaTeX doesn't line-wrap. A wide display equation would run off the card,
      // so wrap it in a block scroll container (.math-scroll) that clips to the
      // card width and scrolls horizontally. Inline maths is left as an inline
      // span so it flows with the surrounding prose — except environments
      // (e.g. "$\begin{array}…$" used for statement lists), which are
      // block-shaped and can be wide, so they get the scroll container too.
      if (isDisplay || source.includes("\\begin{")) span.className = "math-scroll";
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
    } else {
      // KaTeX unavailable: keep the raw maths source visible rather than dropping it.
      appendText(target, str.slice(m.index, token.lastIndex));
    }
    last = token.lastIndex;
  }
  if (last < str.length) {
    appendText(target, str.slice(last));
  }
  return target;
}
