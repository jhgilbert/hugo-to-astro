import { z } from "zod";

/**
 * An item representing a string of plain text encountered
 * in the compiled HTML content.
 */
export const TextItemSchema = z
  .object({
    type: z.literal("text"),
    data: z
      .object({
        nodeName: z.literal("#text"),
        value: z.string(),
      })
      .strict(),
  })
  .strict();

/**
 * An item representing a string of plain text encountered
 * in the compiled HTML content.
 */
export type TextItem = z.infer<typeof TextItemSchema>;
