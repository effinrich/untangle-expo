#!/usr/bin/env node
// Scaffold a feature folder following the feature-based architecture convention.
//
// Usage:
//   node scaffold.mjs <name>                  -> creates src/features/<name>/
//   node scaffold.mjs <path/with/slashes>     -> creates that exact path
//
// Refuses to overwrite. Prints the created tree.

import { mkdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { resolve, join, basename } from "node:path"

const arg = process.argv[2]
if (!arg) {
  console.error("Usage: scaffold.mjs <feature-name | feature-path>")
  process.exit(1)
}

const target =
  arg.includes("/") || arg.includes("\\")
    ? resolve(process.cwd(), arg)
    : resolve(process.cwd(), "src", "features", arg)

if (existsSync(target)) {
  console.error(`Refusing to overwrite existing path: ${target}`)
  process.exit(1)
}

const name = basename(target)
const pascal = name.replace(/(^|[-_])(.)/g, (_, __, c) => c.toUpperCase())

const files = {
  "index.tsx": `// ${name} — page composition only. State + wiring. No fetching, no useEffect.

export default function ${pascal}Page() {
  return null;
}
`,
  "types.ts": `// ${name} types — domain models, request/response shapes, prop contracts.

export {};
`,
  "api.ts": `// ${name} network layer — pure fetch/axios functions: input -> Promise<output>.
// Consumed by hooks.ts only. Components never import this file directly.

export {};
`,
  "hooks.ts": `// ${name} hooks — useQuery/useMutation wrappers, useEffect behaviors, domain hooks.
// All React-Query / tRPC / SWR usage lives here.

export {};
`,
  "utils.ts": `// ${name} utilities — pure helpers and static config. No React, no hooks.
// Action helpers take dependencies (clients, setters) as parameters.

export {};
`,
}

await mkdir(target, { recursive: true })
await mkdir(join(target, "partials"), { recursive: true })

for (const [file, body] of Object.entries(files)) {
  await writeFile(join(target, file), body)
}

const rel = target.replace(process.cwd() + "/", "").replace(process.cwd() + "\\", "")
console.log(`Created ${rel}/`)
for (const f of Object.keys(files)) console.log(`  ${f}`)
console.log("  partials/")
