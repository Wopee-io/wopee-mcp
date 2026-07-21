import { z } from "zod";

export const WopeeFetchTestInventoryInputSchema = z.object({
  analysisIdentifier: z
    .string({
      description:
        "Optional analysis identifier (e.g. A001) to scope the inventory to a single analysis. Omit to include every analysis in the project.",
    })
    .optional(),
});

export type WopeeFetchTestInventoryInput = z.infer<
  typeof WopeeFetchTestInventoryInputSchema
>;
