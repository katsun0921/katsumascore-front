#!/usr/bin/env node
/**
 * validate-structure.mjs
 *
 * Checks that every component directory inside the target paths has
 * the required trio of files:
 *
 *   ComponentName.tsx          ← component implementation
 *   ComponentName.stories.tsx  ← Storybook stories (with edge cases)
 *   ComponentName.scss         ← component-scoped styles
 *
 * Also scans SCSS files for hardcoded hex colors (should use SCSS variables).
 *
 * Exit codes:
 *   0  — no violations
 *   1  — violations found
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'fs'
import { join, basename, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * Directories to scan for component structure completeness.
 * Each leaf directory (containing a .tsx file) must have all three files.
 */
const COMPONENT_DIRS = [
  'src/components/features',
  'src/components/ui',
  'src/components/layout',
  'src/components/templates',
]

/**
 * Directory name fragments that are NOT component directories.
 * Skip these when walking the tree.
 */
const NON_COMPONENT_DIRS = new Set(['mocks', 'types', 'utils', '__tests__', '__mocks__'])

/**
 * Hex color pattern to flag inside SCSS files.
 * Should use SCSS variables ($scoreBackground, $colorNetflix, etc.) instead.
 */
const HEX_IN_SCSS_RE = /#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** @returns {string[]} Absolute paths of immediate child directories */
function childDirs(dir) {
  try {
    return readdirSync(dir)
      .map((name) => join(dir, name))
      .filter((p) => statSync(p).isDirectory())
  } catch {
    return []
  }
}

/** @returns {string[]} Filenames (not paths) inside a directory */
function filesIn(dir) {
  try {
    return readdirSync(dir).filter((name) => statSync(join(dir, name)).isFile())
  } catch {
    return []
  }
}

/** Relative path from project root — for readable error messages */
function rel(absPath) {
  return absPath.replace(ROOT + '/', '')
}

// ─── Structure check ──────────────────────────────────────────────────────────

/**
 * @typedef {{ path: string; missing: string[] }} StructureError
 */

/**
 * Recursively walk `dir`. For each directory that contains a primary `.tsx`
 * file, verify the full trio exists. Returns all violations found.
 *
 * @param {string} dir
 * @returns {StructureError[]}
 */
function checkDir(dir) {
  const errors = []
  const dirName = basename(dir)

  // Skip non-component directories
  if (NON_COMPONENT_DIRS.has(dirName)) return errors

  const files = filesIn(dir)

  // Find the primary component file: ComponentName.tsx (not .stories.tsx)
  const primaryTsx = files.find(
    (f) => f.endsWith('.tsx') && !f.includes('.stories.')
  )

  if (primaryTsx) {
    const componentName = basename(primaryTsx, '.tsx')
    const missing = []

    const storiesFile = `${componentName}.stories.tsx`
    const scssFile = `${componentName}.scss`

    if (!files.includes(storiesFile)) {
      missing.push(storiesFile)
    }

    if (!files.includes(scssFile)) {
      // Some components use CSS Modules (.module.scss) — accept that too
      const moduleScssFile = `${componentName}.module.scss`
      if (!files.includes(moduleScssFile)) {
        missing.push(scssFile)
      }
    }

    if (missing.length > 0) {
      errors.push({ path: rel(dir), missing })
    }

    // Also check: stories must have MORE than just the default export
    // (edge cases required). We do a lightweight text scan.
    const storiesPath = join(dir, storiesFile)
    if (files.includes(storiesFile)) {
      const storyErrors = checkStoriesEdgeCases(storiesPath, componentName)
      errors.push(...storyErrors)
    }
  }

  // Recurse into subdirectories
  for (const child of childDirs(dir)) {
    errors.push(...checkDir(child))
  }

  return errors
}

/**
 * Warn when a stories file only has a single exported story (likely just Default).
 * Spec: "Stories must include edge cases (not only default)".
 *
 * @param {string} filePath
 * @param {string} componentName
 * @returns {StructureError[]}
 */
function checkStoriesEdgeCases(filePath, componentName) {
  try {
    const src = readFileSync(filePath, 'utf8')
    // Count named exports (each story is a named export)
    const exportMatches = src.match(/^export (const|function) \w+/gm) ?? []
    // The default export is the meta object — subtract it
    const storyCount = exportMatches.filter((e) => !e.includes('default')).length

    if (storyCount < 2) {
      return [
        {
          path: rel(filePath),
          missing: [
            `Only ${storyCount} story exported. Add edge-case stories (empty state, loading, error, long text, etc.).`,
          ],
        },
      ]
    }
  } catch {
    // Unreadable file — skip
  }
  return []
}

// ─── SCSS hex color check ─────────────────────────────────────────────────────

/**
 * @typedef {{ file: string; line: number; color: string }} ScssColorError
 */

/**
 * Scan all .scss files inside `dir` (recursively) for hardcoded hex colors.
 *
 * @param {string} dir  Absolute path to start from
 * @returns {ScssColorError[]}
 */
function checkScssColors(dir) {
  const errors = []

  function walk(d) {
    let entries
    try {
      entries = readdirSync(d)
    } catch {
      return
    }

    for (const name of entries) {
      const p = join(d, name)
      const stat = statSync(p)
      if (stat.isDirectory()) {
        walk(p)
      } else if (name.endsWith('.scss')) {
        const lines = readFileSync(p, 'utf8').split('\n')
        lines.forEach((line, i) => {
          // Skip comment lines
          if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return

          let match
          HEX_IN_SCSS_RE.lastIndex = 0
          while ((match = HEX_IN_SCSS_RE.exec(line)) !== null) {
            errors.push({ file: rel(p), line: i + 1, color: match[0] })
          }
        })
      }
    }
  }

  walk(dir)
  return errors
}

// ─── Output helpers ───────────────────────────────────────────────────────────

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

function printHeader(title) {
  console.log(`\n${BOLD}${CYAN}${title}${RESET}`)
  console.log('─'.repeat(50))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

let totalErrors = 0

// 1. Structure check
printHeader('Component Structure Validation')

let structureErrors = []
for (const relDir of COMPONENT_DIRS) {
  const absDir = join(ROOT, relDir)
  if (!existsSync(absDir)) {
    console.log(`${YELLOW}  ⚠ Directory not found: ${relDir}${RESET}`)
    continue
  }
  structureErrors.push(...checkDir(absDir))
}

if (structureErrors.length === 0) {
  console.log(`${GREEN}  ✓ All component directories are complete${RESET}`)
} else {
  for (const { path, missing } of structureErrors) {
    console.log(`\n  ${RED}✗ ${path}${RESET}`)
    for (const m of missing) {
      console.log(`      ${YELLOW}Missing / issue:${RESET} ${m}`)
    }
  }
  totalErrors += structureErrors.length
}

// 2. SCSS color check
printHeader('SCSS Hardcoded Color Check')

const scssErrors = checkScssColors(join(ROOT, 'src'))

if (scssErrors.length === 0) {
  console.log(`${GREEN}  ✓ No hardcoded hex colors found in SCSS${RESET}`)
} else {
  for (const { file, line, color } of scssErrors) {
    console.log(`  ${RED}✗ ${file}:${line}${RESET}  ${YELLOW}${color}${RESET}  → use a SCSS variable instead`)
  }
  totalErrors += scssErrors.length
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '━'.repeat(50))
if (totalErrors === 0) {
  console.log(`${GREEN}${BOLD}  Structure validation passed (0 errors)${RESET}`)
} else {
  console.log(`${RED}${BOLD}  Structure validation failed: ${totalErrors} error(s)${RESET}`)
}
console.log('━'.repeat(50) + '\n')

process.exit(totalErrors > 0 ? 1 : 0)
