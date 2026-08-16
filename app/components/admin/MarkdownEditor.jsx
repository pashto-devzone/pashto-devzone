"use client";

import { useState } from "react";
import { renderMarkdown } from "@/lib/markdown";

const toolbarItems = [
  { label: "Bold", prefix: "**", suffix: "**" },
  { label: "Italic", prefix: "_", suffix: "_" },
  { label: "Heading", prefix: "## ", suffix: "" },
  { label: "Link", prefix: "[", suffix: "](url)" },
  { label: "Code", prefix: "```\n", suffix: "\n```" },
  { label: "Quote", prefix: "> ", suffix: "" },
  { label: "List", prefix: "- ", suffix: "" },
  { label: "Table", prefix: "| A | B |\n|---|---|\n| 1 | 2 |", suffix: "" },
  { label: "Image", prefix: "![alt](", suffix: ")" },
];

export default function MarkdownEditor({ value, onChange }) {
  const [tab, setTab] = useState("write");
  const [previewHtml, setPreviewHtml] = useState("");

  const insertFormat = (prefix, suffix) => {
    const textarea = document.getElementById("md-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newText =
      value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(newText);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "preview") {
      setPreviewHtml(renderMarkdown(value));
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={() => handleTabChange("write")}
          className={`px-4 py-2 text-sm font-medium ${
            tab === "write"
              ? "bg-white border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Markdown
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("preview")}
          className={`px-4 py-2 text-sm font-medium ${
            tab === "preview"
              ? "bg-white border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Toolbar */}
      {tab === "write" && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
          {toolbarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => insertFormat(item.prefix, item.suffix)}
              className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              title={item.label}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {tab === "write" ? (
        <textarea
          id="md-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[200px] p-4 text-sm font-mono focus:outline-none focus:ring-0 resize-y"
          placeholder="Write markdown here..."
        />
      ) : (
        <div
          className="w-full min-h-[200px] p-4 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}
    </div>
  );
}

