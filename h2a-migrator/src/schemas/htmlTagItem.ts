import { z } from "zod";

/**
 * Every expected HTML tag that we expect to process
 * from the compiled content. !!! NOT IN USE YET. !!!
 */
/*
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
  // images
  "img",
  // text
  "p",
  // lists
  "ul",
  "ol",
  // links
  "a",
]);
*/

/**
 * An item representing an HTML tag encountered
 * in the compiled HTML content, such as an anchor tag.
 */
export const HtmlTagItemSchema = z
  .object({
    type: z.literal("htmlTag"),
    data: z
      .object({
        nodeName: z.string(), // TODO: Control expectations with a HtmlTagNamesSchema
        tagName: z.string(), // TODO: Control expectations with HtmlTagNamesSchema
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

/**
 * An item representing an HTML tag encountered
 * in the compiled HTML content, such as an anchor tag.
 */
export type HtmlTagItem = z.infer<typeof HtmlTagItemSchema>;
