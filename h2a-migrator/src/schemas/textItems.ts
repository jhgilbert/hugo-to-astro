import { z } from "zod";

// An item that represents plain text
// in the compiled content
const TextItemSchema = z
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
