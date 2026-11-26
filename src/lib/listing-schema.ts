import { z } from "zod";

/** What a seller sends when creating or editing a listing. */
export const listingSchema = z.object({
  name: z.string().min(1).max(120),
  categoryId: z.string().min(1).max(40),
  pricePkr: z.number().int().min(1).max(10_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  description: z.string().max(2000).optional(),
  /** true = save as draft; false = submit (goes to admin review when needed) */
  draft: z.boolean().default(false),
  /** A new photo as a data URL; omit to keep the current one */
  imageDataUrl: z.string().max(2_200_000).optional(),
});
