// Ships the exact dependency versions this release was built and tested with: npm honours an
// npm-shrinkwrap.json inside a package, and never a package-lock.json. Runs as `prepack`, and
// `postpack` removes the file again, so package-lock.json stays the only lockfile in the repo.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SHRINKWRAP = "npm-shrinkwrap.json";

/** The lockfile without what only development needs. */
export function shrinkwrapFrom(lock) {
  const packages = Object.fromEntries(
    Object.entries(lock.packages).filter(([, entry]) => !entry.dev),
  );
  const { devDependencies: _unused, ...root } = packages[""];
  return { ...lock, packages: { ...packages, "": root } };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === "remove") {
    if (existsSync(SHRINKWRAP)) rmSync(SHRINKWRAP);
  } else {
    const lock = JSON.parse(readFileSync("package-lock.json", "utf-8"));
    writeFileSync(SHRINKWRAP, `${JSON.stringify(shrinkwrapFrom(lock), null, 2)}\n`);
  }
}
