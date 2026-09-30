import "server-only";
import { marked } from "marked";

/**
 * Markdown → HTML for admin-authored articles. Raw HTML in the source is escaped,
 * so only Markdown formatting reaches the page.
 */
const renderer = new marked.Renderer();
renderer.html = ({ text }) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
renderer.link = ({ href, title, tokens }) => {
  const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : "#";
  const external = /^https?:/i.test(safe);
  const text = marked.Parser.parseInline(tokens, { renderer });
  return `<a href="${safe}"${title ? ` title="${title}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
};

export function renderMarkdown(src: string): string {
  return marked.parse(src, { renderer, gfm: true, async: false }) as string;
}
