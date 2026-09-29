#!/usr/bin/env node
// Validate one or more feature folders against the feature-based architecture convention.
//
// Usage:
//   node validate.mjs                          -> validates every dir under src/features/
//   node validate.mjs src/app src/features/x   -> validates each given feature folder
//
// Exits 0 if clean, 1 if violations found, 2 if no features to validate.

import { readdir, readFile, stat } from "node:fs/promises"
import { resolve, join, relative, dirname, basename, sep } from "node:path"

const ALLOWED_ROOT_FILES = new Set(["types.ts", "consts.ts", "api.ts", "hooks.ts", "utils.ts"])
const SHARED_DIRS = ["lib", "shared"]

const HOOK_PATTERNS = [
  { name: "useEffect", re: /\buseEffect\s*\(/ },
  { name: "useLayoutEffect", re: /\buseLayoutEffect\s*\(/ },
  { name: "useQuery", re: /\buseQuery\s*\(/ },
  { name: "useMutation", re: /\buseMutation\s*\(/ },
  { name: "useInfiniteQuery", re: /\buseInfiniteQuery\s*\(/ },
  { name: "useSubscription", re: /\buseSubscription\s*\(/ },
  { name: "useSWR", re: /\buseSWR(?:Infinite|Mutation)?\s*\(/ },
]

const NETWORK_PATTERNS = [
  { name: "fetch(", re: /(?<![.\w$])fetch\s*\(/ },
  { name: "axios", re: /(?<![.\w$])axios\b/ },
]

const violations = []

let featurePaths = process.argv.slice(2).map((p) => resolve(p))
if (featurePaths.length === 0) {
  const featuresDir = resolve("src/features")
  if (await exists(featuresDir)) {
    const entries = await readdir(featuresDir, { withFileTypes: true })
    for (const e of entries) {
      if (e.isDirectory()) featurePaths.push(join(featuresDir, e.name))
    }
  }
}

if (featurePaths.length === 0) {
  console.error("No feature paths given and src/features/ does not exist.")
  process.exit(2)
}

for (const featureRoot of featurePaths) {
  if (!(await exists(featureRoot))) {
    violations.push({ file: featureRoot, message: "path does not exist" })
    continue
  }
  await validateFeature(featureRoot)
}

const label = featurePaths.map((p) => relative(process.cwd(), p)).join(", ")
if (violations.length === 0) {
  console.log(`OK feature-based architecture: ${label}`)
  process.exit(0)
}

console.error(`FAIL feature-based architecture: ${violations.length} violation(s)\n`)
for (const v of violations) {
  const rel = relative(process.cwd(), v.file)
  console.error(`  ${rel}: ${v.message}`)
}
process.exit(1)

// -----------------------------------------------------------------------------

async function validateFeature(root) {
  const entries = await readdir(root, { withFileTypes: true })
  const rootFiles = entries.filter((e) => e.isFile()).map((e) => e.name)
  const rootDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)
  const pageFiles = rootFiles.filter((f) => f.endsWith(".tsx"))

  if (pageFiles.length === 0) {
    violations.push({ file: root, message: "no page (.tsx) file at feature root" })
  } else if (pageFiles.length > 1) {
    violations.push({
      file: root,
      message: `multiple .tsx files at root: ${pageFiles.join(", ")} — only one page allowed`,
    })
  }

  for (const f of rootFiles) {
    if (f.endsWith(".tsx")) continue
    if (!ALLOWED_ROOT_FILES.has(f)) {
      violations.push({
        file: join(root, f),
        message: `unexpected root file (allowed: ${[...ALLOWED_ROOT_FILES].join(", ")}, plus one .tsx page)`,
      })
    }
  }

  for (const d of rootDirs) {
    if (d !== "partials") {
      violations.push({
        file: join(root, d),
        message: 'unexpected subdirectory (only "partials/" allowed at feature root)',
      })
    }
  }

  const allFiles = await walk(root)
  for (const file of allFiles) {
    if (!/\.(ts|tsx)$/.test(file)) continue
    const content = await readFile(file, "utf8")
    const codeOnly = stripComments(content)
    const name = basename(file)

    for (const { name: pat, re } of HOOK_PATTERNS) {
      if (re.test(codeOnly) && name !== "hooks.ts") {
        violations.push({ file, message: `${pat} called outside hooks.ts` })
      }
    }

    for (const { name: pat, re } of NETWORK_PATTERNS) {
      if (re.test(codeOnly) && name !== "api.ts") {
        violations.push({ file, message: `${pat} used outside api.ts` })
      }
    }

    const lines = content.split("\n")
    lines.forEach((line, i) => {
      const stripped = line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "")
      if (!/(?::\s*|\bas\s+)any\b/.test(stripped)) return
      const prev = lines[i - 1] || ""
      const escape =
        line.includes("eslint-disable") ||
        line.includes("biome-ignore") ||
        prev.includes("eslint-disable-next-line") ||
        prev.includes("biome-ignore")
      if (!escape) {
        violations.push({ file, message: `inline "any" type at line ${i + 1}` })
      }
    })

    const importRe = /from\s+['"]([^'"]+)['"]/g
    let m
    while ((m = importRe.exec(content)) !== null) {
      const spec = m[1]
      if (!spec.startsWith(".")) continue
      const resolved = resolve(dirname(file), spec)
      if (!relative(root, resolved).startsWith("..")) continue
      if (relative(dirname(root), resolved).startsWith("..")) continue
      const inShared = SHARED_DIRS.some(
        (d) => resolved.includes(`${sep}${d}${sep}`) || resolved.endsWith(`${sep}${d}`),
      )
      if (inShared) continue
      violations.push({
        file,
        message: `sibling-feature import "${spec}" — move shared code out of the features folder (e.g. src/lib/, src/shared/)`,
      })
    }
  }
}

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
}

async function exists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}
