## Goal
Set up the base of the site: design tokens, global styles, one layout, a header with navigation and a footer, and move the home page onto that layout.

## Rejected / modified suggestions
- **Fonts in `astro.config.mjs`.** The plan registered both fonts through Astro's Fonts API, inside the tokens commit. I rejected that because I didn't want the config touched in this branch. The fonts now load from a Google Fonts link in `BaseLayout.astro`.
- **Font weights.** The plan downloaded Bricolage Grotesque 200–800 and JetBrains Mono 100–800. I changed it to variable fonts (`wght@400..800`) with `display=swap` and the system font stack as fallback, which is what the responsive lesson recommends.
- **Units.** The plan used fixed rem steps and `--radius-pill: 999px`. I asked for no px anywhere and a fluid type and spacing scale with `clamp()` (Utopia style, from 320px to 1400px), with `vw` only inside `clamp()`, as in the responsive lesson.
- **Container width.** It proposed `--container: 72rem`. I changed it to 70rem to match my design.
- **Header links.** The plan hardcoded `href="/"`. I asked for every link to be built from `import.meta.env.BASE_URL`, because the site will live at `/portfolio1/` on GitHub Pages and hardcoded links would 404 there.
- **Extras I didn't ask for.** The plan added a skip link, `::selection` styles and extra utility classes. I rejected them: I only wanted what I asked for in this branch. [your reason, in your words]
- **Current-page style.** Claude built the current link as a filled pill with a light blue background. I rejected it and asked for the 2px cobalt underline from my design.
- **`role="list"` on the nav list.** Suggested for Safari/VoiceOver. I said no. [your reason]
- **Padding on `main`.** Claude added `padding-block: var(--space-xl)` on its own. [kept / removed, and why]
- **200% zoom fix.** Claude proposed three ways to stop "VITTORIA" overflowing at a 160px viewport. I rejected all three: 160px is stricter than the requirement, which is no sideways scroll at 320 CSS px (WCAG 1.4.10), and the page passes that.
- **`/code-review` findings.** [which ones you fixed and which you skipped, one line each with your reason]


## How I checked the implementation

- Read `git diff` after each of the five commits before committing them.
- [What I looked at myself in the browser: which width, which DevTools panel, what I saw]
- Playwright on the production build (`npm run build`, served on port 4322):
  - 320px: no horizontal scrollbar, wrapper 288px, body text 16px, h1 39.06px (the clamp minimum), footer 12.8px. Current link has the 2px accent underline and `aria-current="page"`.
  - 1400px: no horizontal scrollbar, wrapper capped at 1120px (70rem), body text 18px, h1 56.84px (the clamp maximum).
  - 160px (a 320px window at 200% zoom): the h1 overflows (177px in a 128px wrapper). Not fixed, see above.
- Accessibility snapshot: banner with a "Primary" navigation and a list with the Home link, one `main` with a single h1, and a `contentinfo` footer.
- Base path: built with base `/` and `/portfolio1` on temporary test pages (removed afterwards). Home resolves to `/` and `/portfolio1/`, and `aria-current` is only set on the current page.
- Fonts: the Google Fonts CSS returns one variable woff2 file per subset (`font-weight: 400 800`), not one file per weight.
- Searched `src` for `px` and `#`: hex colours only in `tokens.css`, px only in comments.
- `npm run build` passes.

