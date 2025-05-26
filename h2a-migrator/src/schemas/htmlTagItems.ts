import { z } from "zod";

/**
 * Every expected HTML tag that we expect to process
 * from the compiled content.
 */
const HtmlTagNamesSchema = z.enum([
  // the page
  "article",
  // headings
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // text
  "p",
  // lists
  "ul",
  "ol",
  // links
  "a",
]);

// An item that represents an HTML tag
// in the compiled content
export const HtmlTagItemSchema = z
  .object({
    type: z.literal("htmlTag"),
    data: z
      .object({
        nodeName: HtmlTagNamesSchema,
        tagName: HtmlTagNamesSchema,
        attrs: z
          .array(
            z.object({
              name: z.string(),
              value: z.string().optional(),
            })
          )
          .optional(),
      })
      .strict(),
  })
  .strict();
