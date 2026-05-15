import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "out");
const files = ["index.html", "styles.css", "script.js"];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await Promise.all(files.map((file) => cp(join(root, file), join(out, file))));
