/* eslint-disable @typescript-eslint/no-unused-vars -- `node` is dropped so it never reaches the DOM */
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * Renders host-written text with light formatting: **bold**, *italic*,
 * bullet lists and links. Raw HTML is never rendered (react-markdown escapes
 * it) and link URLs are filtered, so it's safe for member-written text.
 * Single line breaks are kept, so plain-text descriptions look as typed.
 */
export function MarkdownText({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <ReactMarkdown
        components={{
          p: ({ node: _node, ...props }) => <p className="whitespace-pre-line" {...props} />,
          ul: ({ node: _node, ...props }) => <ul className="list-disc space-y-1 pl-5" {...props} />,
          ol: ({ node: _node, ...props }) => (
            <ol className="list-decimal space-y-1 pl-5" {...props} />
          ),
          li: ({ node: _node, ...props }) => <li className="whitespace-pre-line" {...props} />,
          a: ({ node: _node, ...props }) => (
            <a
              className="text-hearth-ember underline"
              target="_blank"
              rel="noopener noreferrer nofollow"
              {...props}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
