// Shared markdown renderer used by both the admin MarkdownEditor preview
// and the public app page so that previews match website rendering exactly.
//
// Supports: headings (#..######), bold, italic, inline code, fenced code
// blocks, blockquotes, unordered lists, ordered lists, task lists, tables,
// images, links, horizontal rules, and paragraphs.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

// Process inline markdown constructs (bold, italic, links, images, code).
function inline(t) {
  let str = escapeHtml(t);

  // Images (before links)
  str = str.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (m, alt, src) =>
      '<img src="' + src + '" alt="' + alt + '" loading="lazy" class="max-w-full h-auto my-3 rounded-lg shadow-sm" />'
  );

// Links
  str = str.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (m, text, href) =>
      '<a href="' + href + '" class="text-green-700 underline hover:text-green-900" target="_blank" rel="noopener noreferrer">' + text + '</a>'
  );

  // Bold
  str = str.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  str = str.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Italic
  str = str.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  str = str.replace(/(^|[^_])_([^_\s][^_]*)_/g, "$1<em>$2</em>");

  // Inline code
  str = str.replace(
    /`([^`]+)`/g,
    (m, code) =>
      '<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">' +
      code +
      "</code>"
  );

  return str;
}

const HEADING_CLASSES = {
  1: "text-3xl font-bold my-5",
  2: "text-2xl font-bold my-4",
  3: "text-xl font-bold my-3",
  4: "text-lg font-bold my-2",
  5: "text-base font-bold my-2",
  6: "text-sm font-bold my-2",
};

function parseRow(r) {
  return r
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c));
}

function renderTable(rows) {
  const headerCells = parseRow(rows[0]);
  const bodyRows = rows.slice(1).filter((r) => !isSeparatorRow(parseRow(r)));

  const thead =
    "<thead><tr>" +
    headerCells
      .map(
        (c) =>
          '<th class="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">' +
          inline(c) +
          "</th>"
      )
      .join("") +
    "</tr></thead>";

  const tbody =
    "<tbody>" +
    bodyRows
      .map(
        (r) =>
          "<tr>" +
          parseRow(r)
            .map(
              (c) =>
                '<td class="border border-gray-200 px-3 py-2">' +
                inline(c) +
                "</td>"
            )
            .join("") +
          "</tr>"
      )
      .join("") +
    "</tbody>";

  return (
    '<div class="my-4 overflow-x-auto"><table class="w-full text-sm border-collapse">' +
    thead +
    tbody +
    "</table></div>"
  );
}

export function renderMarkdown(md) {
  if (!md) return "";

  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced code block
    if (trimmed.startsWith("```")) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      const code = escapeHtml(buf.join("\n"));
      blocks.push(
        '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto text-sm leading-relaxed"><code>' +
          code +
          "</code></pre>"
      );
      continue;
    }

    // Table
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i]);
        i++;
      }
      blocks.push(renderTable(rows));
      continue;
    }

    // Heading
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      blocks.push(
        "<h" +
          level +
          ' class="' +
          HEADING_CLASSES[level] +
          '">' +
          inline(h[2]) +
          "</h" +
          level +
          ">"
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(?:\s*)(---+|\*\*\*+|___+)(?:\s*)$/.test(line)) {
      blocks.push('<hr class="my-6 border-t-2 border-gray-200" />');
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const q = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        q.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
blocks.push(
        '<blockquote class="border-l-4 border-green-400 bg-green-50/60 px-4 py-3 my-4 italic text-gray-700 rounded-r-lg">' +
          inline(q.join("<br />")) +
          "</blockquote>"
      );
      continue;
    }

    // Unordered list (supports task lists)
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        const item = lines[i].replace(/^\s*[-*+]\s+/, "");
        const task = item.match(/^\[( |x|X)\]\s+(.*)$/);
        if (task) {
          const checked = task[1].toLowerCase() === "x";
          const box =
            '<input type="checkbox" ' +
            (checked ? "checked" : "") +
            ' disabled class="mr-2 pointer-events-none" />';
          items.push(
            '<li class="flex items-start gap-2"><span>' +
              box +
              "</span><span>" +
              inline(task[2]) +
              "</span></li>"
          );
        } else {
items.push(
            '<li class="flex items-start gap-2"><span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0"></span><span>' +
              inline(item) +
              "</span></li>"
          );
        }
        i++;
      }
      blocks.push('<ul class="my-3 space-y-1.5 text-gray-700">' + items.join("") + "</ul>");
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(
          '<li class="my-1">' +
            inline(lines[i].replace(/^\s*\d+\.\s+/, "")) +
            "</li>"
        );
        i++;
      }
      blocks.push('<ol class="my-3 list-decimal pl-6 text-gray-700">' + items.join("") + "</ol>");
      continue;
    }

    // Blank line
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // Paragraph (gather until a block begins)
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*\|.*\|\s*$/.test(lines[i]) &&
      !lines[i].trim().startsWith("```") &&
      !/^(?:\s*)(---+|\*\*\*+|___+)(?:\s*)$/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(
      '<p class="my-3 text-gray-700 leading-relaxed">' +
        inline(para.join(" ")) +
        "</p>"
    );
  }

  return blocks.join("\n");
}
