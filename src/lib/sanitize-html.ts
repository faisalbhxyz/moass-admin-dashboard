import sanitizeHtml from "sanitize-html";

/**
 * Server-side HTML sanitization for stored content (pages, product descriptions).
 * Matches DOMPurify config in PageForm/ProductForm – safe tags and attributes only.
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html || typeof html !== "string") return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "h1", "h2", "h3",
      "ul", "ol", "li", "a", "span", "div", "blockquote",
    ],
    allowedAttributes: {
      a: ["href", "class", "target", "rel"],
      "*": ["class"],
    },
  });
}
