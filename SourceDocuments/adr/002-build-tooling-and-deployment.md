# ADR-002: Build Tooling — Vite; Deployment — GitHub Pages with GitHub Actions CI/CD

**Status:** Proposed
**Date:** 2026-03-31
**Triggered by:** Q-2 (resolved-questions.md)

---

## Context

The application specification (`SPEC.md`) contains no information about build tooling, hosting
infrastructure, or CI/CD. The entire §07 Deployment View cannot be drafted without these decisions.

What is known from the specification:

- The application is a **pure client-side SPA** with no backend, no server-side rendering, no
  database, and no API. The entire application runs in the browser.
- The specification references a "GitHub‑Link" in the navigation bar (`SPEC.md`, §Navigation),
  indicating the project is intended to live on GitHub. GitHub Pages is the natural pairing for a
  static SPA hosted on GitHub.
- All YAML generation, validation, and export happen client-side (in-browser). There is no runtime
  environment configuration.

**Build tool selection:**

Create React App (CRA) is officially deprecated as of 2023 and is no longer maintained. The React
ecosystem has converged on Vite as the standard build tool for new React+TypeScript projects. Vite
provides:

- Native ES module (ESM) serving in development — no bundling overhead during dev, resulting in
  near-instant HMR (Hot Module Replacement)
- Rollup-based production builds with superior tree-shaking, directly relevant for keeping the MUI
  bundle size within the < 500 KB target (see Q-10)
- First-class TypeScript support without additional configuration
- esbuild-based transpilation (10–100x faster than Babel for large projects)
- Vite's default build target (ES2015+ via esbuild) aligns with the evergreen browser support
  matrix (see Q-6)

Next.js was not chosen because it adds server-side rendering complexity (SSR, API routes, edge
functions) that is entirely unnecessary for a pure SPA with no backend component. Using Next.js
for a static SPA incurs configuration overhead (disabling SSR, configuring static export) with no
benefit.

**Hosting selection:**

GitHub Pages is the simplest static hosting option for a public GitHub repository and is free for
public repos. It supports SPA deployment via a 404.html redirect pattern or `vite-plugin-gh-pages`.
The application has no runtime environment variables (all configuration is hardcoded or derived
client-side), so no environment-specific build variants are needed.

Netlify and Vercel are equally capable alternatives with more features (PR previews, edge
functions, analytics), but they introduce a dependency on an external SaaS platform. For a
developer tool of this nature, GitHub Pages is the most friction-free choice for contributors and
users.

**CI/CD pipeline:**

GitHub Actions is free for public repositories and provides native integration with GitHub Pages
deployment (via the `actions/deploy-pages` action). A minimal pipeline covers the quality gates
needed:

1. `lint` — ESLint with the project's rule set
2. `type-check` — TypeScript compiler (`tsc --noEmit`)
3. `test` — Vitest (the standard test runner for Vite projects; Jest-compatible API)
4. `build` — `vite build`
5. `deploy` — GitHub Pages deployment (triggered on push to `main`)

No environment-specific configuration is needed; the app has no runtime environment variables.

---

## Decision

Use **Vite** as the build tool and development server for this project.

Deploy to **GitHub Pages** as a static site. Use **GitHub Actions** for CI/CD with a pipeline of:
lint → type-check → test → build → deploy.

- The dev server runs with `vite` (or `npm run dev`)
- Production builds are produced with `vite build`
- The CI/CD pipeline runs on every push to `main` and on all pull requests
- Deployment to GitHub Pages is triggered automatically on successful builds from `main`
- No environment-specific configuration files are needed

---

## Consequences

### Positive

- §07 Deployment View can be fully drafted with a concrete deployment topology: Vite build →
  static artifact (`dist/`) → GitHub Pages CDN → end user browser.
- Vite HMR enables a fast development experience; the §08 "Development Experience" crosscutting
  concept can be documented with concrete tooling.
- Automated CI/CD ensures the main branch is always deployable.
- GitHub Pages is zero-cost for a public repository and requires no external account or SaaS
  dependency.
- Vitest (the natural test runner for Vite projects) provides a Jest-compatible API, allowing
  reuse of Jest patterns and libraries (e.g., `@testing-library/react`, `jest-axe` for
  accessibility tests).

### Negative

- **GitHub Pages does not support server-side execution.** If the application ever requires an
  API backend, a proxy server, or server-side rendering, the hosting target must be migrated
  (to Vercel, Netlify, or a container-based host). This is an explicit constraint of the decision.
- GitHub Pages enforces a single deployment URL per repository. PR preview deployments require
  a separate solution (Netlify/Vercel) or a manual workaround.
- GitHub Pages has a soft limit of 1 GB repository size and 100 GB/month bandwidth. These limits
  are unlikely to be reached for a developer tool of this nature.

### Neutral

- Vite's default build output directory is `dist/`. The GitHub Actions workflow must be configured
  to deploy from `dist/`.
- Vitest uses the same configuration as Vite (via `vite.config.ts`), reducing configuration
  duplication.
- The `vite-plugin-gh-pages` or `actions/deploy-pages` GitHub Action handles the GitHub Pages
  deployment mechanics; no custom scripts are needed.

---

## Arc42 Impact

| Section | Impact |
|---------|--------|
| §07 | Entire section can now be drafted: Vite build → `dist/` static artifact → GitHub Pages CDN |
| §08 | Development experience crosscutting concept: Vite HMR, `vite.config.ts` as single config file, Vitest as test runner |
| §02 | Technical constraint: "No backend; static SPA only; GitHub Pages deployment" |

---

## Alternatives Considered

### Alternative A: Create React App (CRA)

- **Description:** The historically dominant scaffolding and build tool for React projects.
- **Rejected because:** CRA was officially deprecated in 2023 and is no longer maintained by the
  React team. Using CRA for a new project in 2026 would immediately incur technical debt and
  security risk from unmaintained dependencies.

### Alternative B: Next.js (with static export)

- **Description:** Use Next.js `output: 'export'` to generate a static site from a Next.js app.
- **Rejected because:** Next.js is designed for SSR/SSG/ISR hybrid applications. Using it for a
  pure client-side SPA requires disabling its SSR features, working around its router conventions,
  and accepting dependency overhead (React Server Components, Next.js runtime) that provides no
  benefit. Vite is the correct tool for a pure SPA.

### Alternative C: Netlify or Vercel as hosting target

- **Description:** Deploy to Netlify or Vercel instead of GitHub Pages.
- **Rejected because:** These platforms are viable but introduce an external SaaS dependency.
  GitHub Pages is simpler, free, and sufficient for a static SPA. This decision can be revisited
  if PR previews or advanced deployment features become necessary.

### Alternative D: Manual deployment (no CI/CD)

- **Description:** Build locally and push the `dist/` directory to the `gh-pages` branch manually.
- **Rejected because:** Manual deployments are error-prone and inconsistent. Automated CI/CD
  ensures tests always pass before deployment and removes the dependency on a specific developer's
  machine.

---

## References

- `SPEC.md`, §Navigation — "Optional: GitHub‑Link" (indicates GitHub hosting intent)
- `SPEC.md` (entire document) — no backend or server component; confirms pure SPA
- `architecture/questions/resolved-questions.md`, Q-2
- [Vite documentation](https://vite.dev)
- [GitHub Pages documentation](https://pages.github.com)
- [GitHub Actions: Deploy to Pages](https://github.com/actions/deploy-pages)
