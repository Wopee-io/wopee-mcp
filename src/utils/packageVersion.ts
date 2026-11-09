import { readFileSync } from "node:fs";

/** The version in package.json, read at runtime from both src/ (tests) and build/ (npm). */
export const packageVersion = (): string =>
  JSON.parse(
    readFileSync(new URL("../../package.json", import.meta.url), "utf-8"),
  ).version;
