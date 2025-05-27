import { z } from "zod";
import { ShortcodeItemSchema } from "./shortcodeItem.js";
import { HtmlTagItemSchema } from "./htmlTagItem.js";
import { TextItemSchema } from "./textItem.js";

/**
 * A chunk of extracted content,
 * such as a shortcode, HTML tag, or snippet of text.
 */
export const ContentItemSchema = z.discriminatedUnion("type", [
  ShortcodeItemSchema,
  HtmlTagItemSchema,
  TextItemSchema,
]);

/**
 * A chunk of extracted content,
 * such as a shortcode, HTML tag, or snippet of text.
 */
export type ContentItem = z.infer<typeof ContentItemSchema>;

/**
 * An intermediary structure between the compiled HTML content
 * and the final Markdoc-compatible AST.
 *
 * It contains content items (shortcodes, HTML tags, text) and
 * their child trees, allowing for a hierarchical representation
 * of the content that is much simpler than the raw HTML.
 */
export interface ParsedContentTree {
  item: ContentItem;
  children: ParsedContentTree[];
}
