#!/usr/bin/env node
// Validate one or more feature folders against the feature-based architecture convention.
//
// Usage:
//   node validate.mjs                          -> validates every dir under src/features/
//   node validate.mjs src/features/<feature>...  -> validates each given feature folder
//
// Exits 0 if clean, 1 if violations found, 2 if no features to validate.

import { readdir, readFile, stat } from "node:fs/promises"
import { resolve, join, relative, dirname, basename, sep } from "node:path"

const ALLOWED_SIBLING_FILES = new Set(["types.ts", "consts.ts", "api.ts", "hooks.ts", "utils.ts"])
const SHARED_DIRS = ["lib", "shared"]
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const STANDALONE_HOOK = /^use-[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/
const COMPANION_SUFFIXES = [".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".stories.tsx"]

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

// Feature root: shared sibling files plus one like-named folder per component or screen.
async function validateFeature(root) {
  const { files, dirs } = await list(root)

  for (const f of files) {
    if (ALLOWED_SIBLING_FILES.has(f) || STANDALONE_HOOK.test(f)) continue
    violations.push({
      file: join(root, f),
      message: f.endsWith(".tsx")
        ? `component at feature root — move it to ${basename(f, ".tsx")}/${f}`
        : `unexpected root file (allowed: ${[...ALLOWED_SIBLING_FILES].join(", ")}, kebab-case use-*.ts hooks)`,
    })
  }

  for (const d of dirs) {
    if (d === "partials") {
      violations.push({
        file: join(root, d),
        message: "partials/ belongs inside a component folder, not at the feature root",
      })
      continue
    }
    await validateComponentFolder(join(root, d))
  }

  await validateContents(root)
}

// <name>/ holds <name>.tsx, its test/story files, sibling files, and partials/.
async function validateComponentFolder(dir) {
  const name = basename(dir)
  if (!KEBAB.test(name)) {
    violations.push({ file: dir, message: "folder name is not kebab-case" })
  }

  const { files, dirs } = await list(dir)
  if (!files.includes(`${name}.tsx`)) {
    violations.push({
      file: dir,
      message: `missing ${name}.tsx (component folder must match its file)`,
    })
  }

  for (const f of files) {
    if (f === `${name}.tsx` || ALLOWED_SIBLING_FILES.has(f)) continue
    if (COMPANION_SUFFIXES.some((s) => f === `${name}${s}`)) continue
    violations.push({
      file: join(dir, f),
      message: f.endsWith(".tsx")
        ? "second component in a component folder — move it to partials/"
        : `unexpected file (allowed: ${name}.tsx, its test/story, ${[...ALLOWED_SIBLING_FILES].join(", ")})`,
    })
  }

  for (const d of dirs) {
    if (d === "partials") await validatePartials(join(dir, d))
    else await validateComponentFolder(join(dir, d))
  }
}

// partials/ holds flat <part>.tsx files; a partial gets <part>/ only when it needs its own siblings.
async function validatePartials(dir) {
  const { files, dirs } = await list(dir)
  for (const f of files) {
    if (f.endsWith(".tsx") || COMPANION_SUFFIXES.some((s) => f.endsWith(s))) continue
    violations.push({
      file: join(dir, f),
      message:
        "partials/ holds component files only — put shared types/consts/hooks in the parent folder",
    })
  }
  for (const d of dirs) await validateComponentFolder(join(dir, d))
}

async function list(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return {
    files: entries.filter((e) => e.isFile()).map((e) => e.name),
    dirs: entries.filter((e) => e.isDirectory()).map((e) => e.name),
  }
}

async function validateContents(root) {
  const allFiles = await walk(root)
  for (const file of allFiles) {
    if (!/\.(ts|tsx)$/.test(file)) continue
    const content = await readFile(file, "utf8")
    const codeOnly = stripComments(content)
    const name = basename(file)
    const isHookFile = name === "hooks.ts" || STANDALONE_HOOK.test(name)

    for (const { name: pat, re } of HOOK_PATTERNS) {
      if (re.test(codeOnly) && !isHookFile) {
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
