import { z } from "zod";

/**
 * An item representing a partial encountered
 * in the compiled HTML content.
 */
export const PartialItemSchema = z
  .object({
    type: z.literal("partial"),
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
 * An item representing a partial encountered
 * in the compiled HTML content.
 */
export type PartialItem = z.infer<typeof PartialItemSchema>;
