#!/usr/bin/env node
// Scaffold a component folder inside a feature, following the feature-based architecture convention.
//
// Usage:
//   node scaffold.mjs <feature>               -> src/features/<feature>/<feature>/
//   node scaffold.mjs <feature> <component>   -> src/features/<feature>/<component>/
//   node scaffold.mjs <path/with/slashes> [component]  -> that feature path
//
// Names must be kebab-case. Refuses to overwrite an existing component folder. Prints the created tree.

import { mkdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { resolve, join, basename, relative } from "node:path"

const [featureArg, componentArg] = process.argv.slice(2)
if (!featureArg) {
  console.error("Usage: scaffold.mjs <feature-name | feature-path> [component-name]")
  process.exit(1)
}

const featureDir =
  featureArg.includes("/") || featureArg.includes("\\")
    ? resolve(process.cwd(), featureArg)
    : resolve(process.cwd(), "src", "features", featureArg)

const name = componentArg ?? basename(featureDir)
if (
  !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) ||
  !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(basename(featureDir))
) {
  console.error("Feature and component names must be kebab-case (task-list, not TaskList).")
  process.exit(1)
}

const target = join(featureDir, name)
if (existsSync(target)) {
  console.error(`Refusing to overwrite existing path: ${target}`)
  process.exit(1)
}

const pascal = name.replace(/(^|-)(.)/g, (_, __, c) => c.toUpperCase())

const files = {
  [`${name}.tsx`]: `// ${pascal} — markup and wiring only. No fetching, no useEffect.

export const ${pascal} = () => {
  return null
}
`,
  "types.ts": `// ${name} types — domain models, request/response shapes, prop contracts.

export {}
`,
  "consts.ts": `// ${name} constants — option lists, lookup maps, static config.

export {}
`,
  "api.ts": `// ${name} network layer — pure fetch/axios functions: input -> Promise<output>.
// Consumed by hooks.ts only. Components never import this file directly.

export {}
`,
  "hooks.ts": `// ${name} hooks — state plus handlers, useEffect behaviors, server-state wrappers.

export {}
`,
  "utils.ts": `// ${name} utilities — pure helpers. No React, no hooks.

export {}
`,
}

await mkdir(join(target, "partials"), { recursive: true })

for (const [file, body] of Object.entries(files)) {
  await writeFile(join(target, file), body)
}

console.log(`Created ${relative(process.cwd(), target)}/`)
for (const f of Object.keys(files)) console.log(`  ${f}`)
console.log("  partials/")
