import { useMemo } from "react";
import { marked } from "marked";

// The system prompt deliberately omits emoji from headers so we don't get
// doubled-up icons — this is the single place that adds them, matching the
// original app's markdown.tsx behavior.
function emojiFor(headerText: string): string {
  const t = headerText.toUpperCase();
  if (t.includes("TRIAGE")) return "🔍";
  if (t.includes("CHAMP") || t.includes("ANALYSIS")) return "🌐";
  if (t.includes("FINAL FORECAST")) return "🎯";
  if (t.includes("UNCERTAIN")) return "⚠️";
  if (t.includes("FORECAST ANALYSIS")) return "🔮";
  return "▪️";
}

function preprocess(markdown: string): string {
  return markdown
    .replace(/^##\s+(.+)$/gm, (_match, text) => `## ${emojiFor(text)} ${text}`)
    .replace(/==([^=]+)==/g, (_match, phrase) => `<span class="pill">${phrase}</span>`);
}

export function Markdown({ content }: { content: string }) {
  const html = useMemo(() => {
    const withPills = preprocess(content);
    return marked.parse(withPills, { async: false }) as string;
  }, [content]);

  return (
    <div
      className="prose-forecast"
      // Content is our own generated markdown (from Anthropic, rendered
      // client-side) — there's no user-supplied HTML being injected here.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
