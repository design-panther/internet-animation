"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

/**
 * Renders pre-processed markdown (wikilinks already converted to links by the
 * server). Internal links route via next/link; unresolved wikilinks render as a
 * styled "broken" marker.
 */
export default function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a({ href, children }) {
            const h = href || "";
            if (h.startsWith("#unresolved:")) {
              const target = h.slice("#unresolved:".length);
              return (
                <span className="wikilink-broken" title={`Unresolved link: ${target}`}>
                  {children}
                </span>
              );
            }
            if (h.startsWith("/")) {
              return <Link href={h}>{children}</Link>;
            }
            return (
              <a href={h} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
