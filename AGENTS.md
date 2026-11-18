# AGENTS.md

## Project

A personal portfolio built with Astro as a static site, deployed to GitHub Pages at `/portfolio1/`.
Content lives in content collections; there is no server, no database and no client framework.

## Stack & constraints

- Astro 7, static output (SSG). Node runs at build time only, never in the visitor's browser. Why: the site must work as plain HTML files on any static host.
- Plain CSS, no CSS framework (no Tailwind, no Bootstrap). Why: course rule, and tokens + custom properties already cover it.
- JavaScript only in a component's own `<script>`, and only where the page needs interaction. Zero JS by default. Why: islands, progressive enhancement; the content must be readable with JS off.
- No new npm package without asking first. Use `npx` for one-off tools so nothing is added to `package.json`. Why: every package is code I have to understand and defend.
- Commit `package.json` and `package-lock.json`, never `node_modules/` or `dist/`. Why: the lockfile rebuilds the exact tree; `dist/` is built by the workflow.
- Use the current Astro API: `render(entry)` from `astro:content`, `z` from `astro/zod`, loaders from `astro/loaders`. Never `entry.render()`. Why: removed in Astro 6; agents still suggest it from old training data.

## Changelog

One line per rule: the date, the rule, and what went wrong that made me add it. Dates are when I first had to correct it (the PR it happened in), or when I took it from the class slides.

- 2026-11-18 (slide 06): the remaining rules (`render(entry)`). Taken from class before anything went wrong.
