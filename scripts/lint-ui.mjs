#!/usr/bin/env node
/**
 * lint-ui.mjs  —  npm run lint:ui
 *
 * Orchestrates the full UI architecture lint pipeline:
 *
 *   [1] ESLint custom rules (component responsibility / styling / variant)
 *   [2] Folder structure validation (trio check + SCSS color scan)
 *
 * Exit codes:
 *   0  — all checks passed
 *   1  — one or more violations found
 */

import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
}

function c(color, text) {
  return `${C[color]}${text}${C.reset}`
}

function box(title) {
  const line = '═'.repeat(title.length + 4)
  console.log(`\n${c('cyan', `╔${line}╗`)}`)
  console.log(c('cyan', `║  ${c('bold', title)}${C.cyan}  ║`))
  console.log(`${c('cyan', `╚${line}╝`)}\n`)
}

function step(n, total, label) {
  console.log(`${c('dim', `[${n}/${total}]`)} ${c('bold', label)}`)
}

function ok(label) {
  console.log(`  ${c('green', '✓')} ${label}`)
}

function fail(label) {
  console.log(`  ${c('red', '✗')} ${label}`)
}

// ─── Run a child process, stream its output ───────────────────────────────────

/**
 * @param {string}   cmd
 * @param {string[]} args
 * @param {string}   cwd
 * @returns {{ exitCode: number }}
 */
function run(cmd, args, cwd = ROOT) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',   // stream stdout/stderr directly to terminal
    shell: process.platform === 'win32',
  })
  return { exitCode: result.status ?? 1 }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

box('UI Architecture Lint')

const TOTAL_STEPS = 2
let failed = 0

// ── Step 1: ESLint (custom rules + standard rules) ────────────────────────────
step(1, TOTAL_STEPS, 'ESLint — component responsibility & styling rules')
console.log(c('dim', '  Targets: src/components/**/*.{tsx,ts}\n'))

const eslintResult = run('npx', [
  'eslint',
  'src/components',
  '--ext', '.tsx,.ts',
  '--max-warnings', '0',   // treat warnings as errors in CI
])

if (eslintResult.exitCode === 0) {
  ok('ESLint passed')
} else {
  fail('ESLint found violations (see output above)')
  failed++
}

console.log()

// ── Step 2: Folder structure validator ───────────────────────────────────────
step(2, TOTAL_STEPS, 'Structure Validator — file trio & SCSS color scan')
console.log(c('dim', '  Targets: src/components/{features,ui,layout,templates}\n'))

const structureResult = run('node', [
  join(__dirname, 'validate-structure.mjs'),
])

if (structureResult.exitCode === 0) {
  ok('Structure validation passed')
} else {
  fail('Structure validation found violations (see output above)')
  failed++
}

// ─── Final summary ────────────────────────────────────────────────────────────

console.log('\n' + '━'.repeat(52))
if (failed === 0) {
  console.log(c('green', c('bold', `  ✓ All ${TOTAL_STEPS} checks passed. Architecture is clean.`)))
} else {
  console.log(c('red', c('bold', `  ✗ ${failed}/${TOTAL_STEPS} check(s) failed. Fix violations before merging.`)))
  console.log(c('dim', '    Run `npm run lint:ui` after each fix to verify.\n'))
}
console.log('━'.repeat(52) + '\n')

process.exit(failed > 0 ? 1 : 0)
