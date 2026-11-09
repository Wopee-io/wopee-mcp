import { z } from "zod";

export const WopeeSearchDocsInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "What to look up in the Wopee.io documentation, in plain words or exact names (e.g. 'WOPEE_PROJECT_UUID', 'cypress install plugin', 'self-healing locators').",
    ),
  maxResults: z
    .number()
    .int()
    .min(1)
    .max(10)
    .nullish()
    .describe("Number of sections to return, 1 to 10. Default 5."),
});

export type WopeeSearchDocsInput = z.infer<typeof WopeeSearchDocsInputSchema>;
