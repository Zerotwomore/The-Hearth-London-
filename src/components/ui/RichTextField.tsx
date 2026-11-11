"use client";

import { useRef } from "react";
import { useAppState } from "@/lib/context/AppStateContext";

type Tool = "bold" | "italic" | "list" | "link";

interface RichTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
}

/** A textarea with a small toolbar that writes Markdown (see MarkdownText). */
export function RichTextField({ label, value, onChange, maxLength, rows = 8 }: RichTextFieldProps) {
  const { t } = useAppState();
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Replaces the selection with `transform(selected)` and reselects it. */
  function edit(transform: (selected: string) => { text: string; select?: [number, number] }) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const { text, select } = transform(value.slice(start, end));
    const next = value.slice(0, start) + text + value.slice(end);
    if (maxLength && next.length > maxLength) return;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const [from, to] = select ?? [start + text.length, start + text.length];
      el.setSelectionRange(start + from, start + to);
    });
  }

  function run(kind: Tool) {
    if (kind === "bold" || kind === "italic") {
      const mark = kind === "bold" ? "**" : "*";
      const placeholder = t(kind === "bold" ? "boldText" : "italicText");
      edit((selected) => {
        const inner = selected || placeholder;
        return { text: `${mark}${inner}${mark}`, select: [mark.length, mark.length + inner.length] };
      });
    } else if (kind === "list") {
      edit((selected) => {
        const text = (selected || t("listItem"))
          .split("\n")
          .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
          .join("\n");
        return { text, select: [0, text.length] };
      });
    } else {
      edit((selected) => {
        const name = selected || t("linkText");
        const url = "https://";
        const from = name.length + 3;
        return { text: `[${name}](${url})`, select: [from, from + url.length] };
      });
    }
  }

  const tools: { kind: Tool; label: string; title: string; className?: string }[] = [
    { kind: "bold", label: "B", title: t("formatBold"), className: "font-bold" },
    { kind: "italic", label: "I", title: t("formatItalic"), className: "italic" },
    { kind: "list", label: "•", title: t("formatList") },
    { kind: "link", label: "🔗", title: t("formatLink") },
  ];

  return (
    <div className="block">
      <span className="eyebrow text-hearth-charcoal-soft">{label}</span>
      <div className="mt-1.5 overflow-hidden rounded-[1rem] border border-hearth-ink/12 bg-hearth-paper focus-within:border-hearth-ember">
        <div className="flex gap-1 border-b border-hearth-ink/10 px-2 py-1.5">
          {tools.map((tool) => (
            <button
              key={tool.title}
              type="button"
              title={tool.title}
              aria-label={tool.title}
              onClick={() => run(tool.kind)}
              className={`h-8 min-w-8 rounded-md px-2 text-[14px] text-hearth-ink hover:bg-hearth-cream-dark/70 ${tool.className ?? ""}`}
            >
              {tool.label}
            </button>
          ))}
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          rows={rows}
          required
          aria-label={label}
          className="block w-full bg-transparent px-5 py-3 text-[16px] leading-relaxed text-hearth-ink focus:outline-none"
        />
      </div>
      <span className="mt-1 block pl-1 text-[12px] text-hearth-charcoal-soft">
        {t("formattingHint")}
      </span>
    </div>
  );
}
