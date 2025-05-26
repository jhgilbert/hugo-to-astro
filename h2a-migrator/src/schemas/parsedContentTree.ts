import { z } from "zod";
import { ShortcodeItemSchema } from "./shortcodeItem";
import { HtmlTagItemSchema } from "./htmlTagItem";
import { TextItemSchema } from "./textItem";

export const ContentItemSchema = z.discriminatedUnion("type", [
  ShortcodeItemSchema,
  HtmlTagItemSchema,
  TextItemSchema,
]);

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
