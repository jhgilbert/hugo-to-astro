import { z } from "zod";

/**
 * The name of every shortcode we expect to process
 * during the content migration.
 */
/*
const ShortcodeNamesSchema = z.enum(["tabs", "tab", "square"]);
*/

/**
 * An item representing a shortcode encountered
 * in the compiled HTML content, such as a tab.
 */
export const ShortcodeItemSchema = z
  .object({
    type: z.literal("shortcode"),
    data: z
      .object({
        nodeName: z.string(), // TODO: Control expectations with a ShortcodeNamesSchema
        params: z.record(z.string()).nullable(),
        inner: z.string().optional(),
      })
      .strict(),
  })
  .strict();

/**
 * An item representing a shortcode encountered
 * in the compiled HTML content, such as a tab.
 */
export type ShortcodeItem = z.infer<typeof ShortcodeItemSchema>;
