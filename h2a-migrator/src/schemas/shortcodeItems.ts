import { z } from "zod";

const ShortcodeNamesSchema = z.enum(["tabs", "tab", "square"]);

const ShortcodeItemSchema = z
  .object({
    type: z.literal("shortcode"),
    data: z
      .object({
        nodeName: ShortcodeNamesSchema,
        params: z.record(z.string()).nullable(),
        inner: z.string().optional(),
      })
      .strict(),
  })
  .strict();
