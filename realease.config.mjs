import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  tagFormat: "v${version}",
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        writerOpts: {
          commitPartial: readFileSync(join(__dirname, ".commit.hbs"), "utf-8"),
        },
      },
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/github",
      {
        successCommentCondition: false,
        failCommentCondition: false,
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
        message:
          "chore(release): Wopee MCP v${nextRelease.version}\n\n${nextRelease.notes}",
      },
    ],
  ],
};
