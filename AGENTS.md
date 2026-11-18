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

## Conventions

### CSS

- Colours, type sizes and spacing come from the custom properties in the tokens file (`src/styles/tokens.css`). No hex, rgb or hsl values anywhere else. Why: one place to change the palette, and dark mode only works if every colour is a token.
- No `px` in CSS. Type and spacing use `rem` and the `clamp()` scale; `vw` only inside `clamp()`, never alone. Why: px ignores the user's font-size setting, and `font-size: 4vw` breaks zoom.
- Mobile first: base styles are for 320px, and media queries use `min-width` only, in `em`. Never `max-width` queries. Why: the smallest screen is the default; em queries respect the user's font size.
- Breakpoints come from the content: widen the window until the layout breaks. Never a device width like 768px. Reuse the existing breakpoints (36em, 46em, 64em) before adding one. Why: device breakpoints don't match where my content actually breaks.
- Fluid sizes before a media query: `min()`, `clamp()`, `max-width` in `ch` or `rem`. But no `repeat(auto-fit, minmax(...))` for card lists: the number of columns is a breakpoint I choose. Why: auto-fit picked its own columns in my lists, and I want to decide where they change.
- Logical properties: `margin-inline`, `padding-block`, `inline-size`, `text-align: start`. Why: they work in every writing direction and are what the class taught.
- No `!important`. Why: it hides a specificity problem instead of fixing it.
- Never `outline: none` without a visible replacement focus style on the same element or its wrapper, and the whole focus ring stays on screen and uncovered, also at 320px. Why: keyboard users lose their place.
- Touch targets at least 2.75rem (44px), made with padding on the link itself. Why: WCAG 2.5.5, and the hit area must be the link.

### Motion and user preferences

- All animation and transitions only inside `@media (prefers-reduced-motion: no-preference)`; GSAP only through `gsap.matchMedia()`. Why: motion is opt-in, so a reduce setting gets a still page without a safety-net override.
- Dark mode through the tokens under `prefers-color-scheme`, never colours hardcoded in a component. Why: one switch, every component follows.
- Sound off by default, and only after the user turns it on. Why: autoplaying sound is hostile and blocked by browsers anyway.

### HTML and accessibility

- Never change the HTML structure per screen size; CSS changes the layout. Why: one DOM keeps keyboard order and screen readers the same everywhere.
- One `h1` per page, headings in order, landmarks (`header`, `nav`, `main`, `footer`). Why: screen reader users navigate by them.
- Every image has `alt`: describe what it tells, not what it shows; decorative images get `alt=""`. No "image of", no file names. Why: alt is not optional (images lesson).
- Never `user-scalable=no` or `maximum-scale` in the viewport meta. Why: blocks zoom, fails WCAG 1.4.4.

### Content

- Content (works, passions, socials) comes from the collections in `src/data/`, checked by the schema in `src/content.config.js`. Never hardcode an entry in a page. Why: the schema fails the build instead of shipping broken data.
- Reuse the existing components (`WorkCard`, `PassionCard`, `BaseLayout`) instead of making a page-only copy. Why: a change in one card must show up everywhere.

### Git

- GitHub Flow: one short-lived branch per piece of work, named `feature/...` or `fix/...`. Nobody commits to `main`. Why: main is always deployable.
- Stage files by name. Never `git add .` or `git add -A`. Why: keeps unrelated and untracked files (like local previews) out of commits.
- One commit = one reviewable idea. Subject in the imperative, about 50 characters, no full stop; the body says why. Why: the history is graded, and a commit must be revertable on its own.
- Never rebase, amend or force-push anything already pushed. Why: rewriting shared history.
- Pull requests use the template's three headings and are merged with a merge commit, not squash.
- Tags are annotated: `git tag -a milestone-N -m "..."`, then pushed by name. Why: `git push` does not push tags.

## Do not

- Do not add features, sections, utility classes or "nice to haves" that weren't asked for. Why: every extra line is one I have to defend.
- Do not write or rewrite visible text (bio, project descriptions, headings) unless I gave the words. Why: it's my portfolio and my voice.
- Do not invent content: no fake projects, dates, links or skills.
- Do not touch `astro.config.mjs`, `package.json` or the workflow unless the task is about them.
- Do not skip the checks below because the task looks small, and do not say a check passed without running it.
- Do not move, rename or commit files the task didn't name.

## Stop and ask

Stop and ask before:

- adding a package, a service or a third-party script
- adding a new breakpoint
- changing visible text I did not give you
- content you don't know (projects, dates, links)
- anything that only works with a server (forms that send email, databases, logins): this is a static site
- deleting a file

## How to verify

A task is done only when all of these pass, and you say which ones you ran:

1. `npm run build` passes with no errors or warnings.
2. `npm run preview` (the built site, not the dev server): the changed pages work under `/portfolio1/`.
3. In the browser at 320px and 1400px, and at 200% zoom: no horizontal scrollbar, nothing overlaps. Console open: no errors.
4. With reduced motion emulated (DevTools > Rendering): nothing moves.
5. Keyboard only: every link and button is reachable and has a visible focus ring.
6. Search the diff: no hex outside the tokens file, no `px` in CSS, no `!important`, no `max-width` media queries, no hardcoded `href="/`.
7. `git diff` read before every commit.

## Changelog

One line per rule: the date, the rule, and what went wrong that made me add it. Dates are when I first had to correct it (the PR it happened in), or when I took it from the class slides.

- 2026-10-20 (PR #3/#4, base layout): no `px`, type and spacing from a `clamp()` scale. The plan used fixed steps and `999px`.
- 2026-10-20 (base layout): no extras. The plan added a skip link, `::selection` styles and utility classes I didn't ask for.
- 2026-10-20 (base layout): don't touch `astro.config.mjs` unless asked. The plan put the fonts there.
- 2026-10-30 (PR #7, works collection): don't invent content. Claude made up titles, summaries, years and stacks.
- 2026-10-31 (PR #9, home content): reuse components. Claude was about to make home-only cards.
- 2026-11-12 (PR #12, responsive layout): no auto-fit for card lists. Auto-fit chose its own columns.
- 2026-11-12 (responsive layout): breakpoints from content, not devices. The header broke at 41em, measured, not guessed.
- 2026-11-14 (PR #13, garden pages): no `!important`, and motion only inside `prefers-reduced-motion: no-preference`. Claude added the class safety net with `!important` on every line.
- 2026-11-14 (garden pages): touch targets 2.75rem with padding. Some links were smaller.
- 2026-11-14 (PR #14, works doors): colours only from the tokens. Claude reused other tokens for the doorway instead of new ones.
- 2026-11-14 (PR #15, passions polaroids): focus ring fully visible. Claude let the first polaroid's ring go past the screen edge.
- 2026-11-14 (passions polaroids): don't write visible text. An unfinished summary would have been filled in by Claude.
- 2026-11-15 (PR #16, sound): sound off by default, never on load. Claude's first press turned sound off instead of on.
- 2026-11-15 (sound): stop and ask before a new breakpoint. The Sound button made the header wrap; I chose 46em out of three options.
- 2026-11-18 (slide 06): the remaining rules (`render(entry)`). Taken from class before anything went wrong.
- 2026-11-18 (slides 01, 09): the remaining rules (viewport meta, mobile first, `min-width` in `em`, logical properties, one `h1`, alt text). Taken from class before anything went wrong.
- 2026-11-18 (slides 02, 04): the remaining rules (GitHub Flow, staging by name, commit messages, annotated tags). Taken from class before anything went wrong.
