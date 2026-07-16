# ARCHI Production Review and Implementation Plan

## Current Re-Audit - July 16, 2026

This plan was revalidated against every current source, route, configuration, schema, public asset, and bundled Next.js 16 convention before the second production pass.

### Current Baseline

- `npm run lint`: passes with zero warnings.
- `npm run build`: passes and generates all application routes.
- `npx tsc --noEmit`: passes with zero TypeScript errors.
- TS2339, TS2322, and TS2345: no current diagnostics.
- Runtime-critical finding: `/admin/login` is rendered inside the authenticated admin layout, so an unauthenticated visitor can be redirected back to the same login URL while the layout returns an empty loading/auth state. This is the primary white-screen risk.
- Image finding: live HTTP validation found 8 broken Unsplash URLs across 4 photo IDs. These must be replaced and rechecked before visual work.
- Data finding: 15 images and 3 video records exist. Video records have poster images, duration, resolution, FPS, and codec, but no playable source URL.
- Persistence finding: admin asset, collection, tag, and settings screens either mutate local state or return successful mock responses without durable storage.
- Authentication finding: API token verification is sound after the prior stabilization, but admin page protection still occurs client-side and duplicates checks across the shell.
- Upload finding: the upload form posts metadata only; it does not send the selected file to Supabase or persist a media URL.
- Theme finding: the external store avoids hydration mismatch, but a saved dark theme is not applied to the document before paint.
- Encoding finding: several visible symbols and punctuation are mojibake in source/output, including empty states, separators, copyright text, and README content.
- Dead/duplicate finding: `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`, five default starter SVGs, duplicate ID helpers, and unused dependencies/helpers remain.

### Revised Execution Priority

1. **P0 - Runtime stability:** isolate login from the authenticated admin shell, correct theme initialization, replace and verify all dead media, and preserve clean lint/build/typecheck.
2. **P0 - Honest behavior:** stop mock admin endpoints and settings/tags pages from reporting successful persistence when nothing is saved; add validation and explicit demo-mode responses.
3. **P1 - Identity and shell:** refine the existing ARCHI mark into a consistent film-frame/aperture/certificate system; strengthen header, mobile navigation, search entry point, footer hierarchy, and login motion without redesigning public pages.
4. **P1 - Archive records:** introduce a typed multi-holder fixture contract and render only existing ownership fields on detail pages.
5. **P1 - Editorial content:** expand categories and media coverage, add distinct homepage/editorial rhythms, improve gallery card variants, and rewrite visible copy in concise American English.
6. **P2 - SEO/accessibility/performance:** add sitemap, robots, structured data, Open Graph artwork, skip link, focus management, semantic lists/figures, accurate image priority, and reduced-motion behavior.
7. **P2 - Cleanup and verification:** remove dead duplicates/assets, reconcile docs/environment names, run live media validation, lint, typecheck, build, and route smoke tests.

### Residual Production Requirements

- Apply the checked-in Prisma schema to the target PostgreSQL database and provision the configured Supabase bucket before enabling admin uploads.
- Settings remain environment-managed by design; database-backed runtime settings require a separate configuration contract and deployment ownership decision.
- Fixture video records provide complete poster and technical metadata but no licensed playable source files; real video binaries must be supplied through the authenticated upload flow.
- `npm audit --omit=dev` reports five moderate transitive advisories through current Next.js/Prisma dependencies, with no non-breaking fix currently offered by npm. There are no high or critical advisories. Prisma CLI was moved to `devDependencies` to reduce the production surface.

## Audit Scope and Baseline

- Audited the complete `src`, `prisma`, `public`, and root configuration surface.
- Reviewed the bundled Next.js 16.2 documentation for App Router images, metadata, route handlers, async dynamic route params, and manifest conventions before implementation.
- Baseline `npm run lint`: **failed** with 1 error and 12 warnings.
- Baseline `npm run build`: **failed** during TypeScript validation.
- Baseline `npx tsc --noEmit`: **failed** with 6 TS2339 errors.
- Repository note: `web/` is currently untracked inside a parent repository. Unrelated deleted parent files must not be modified.

## Current Architecture

- Next.js 16.2 App Router with React 19, TypeScript strict mode, Tailwind CSS 4, and server-first pages.
- Public routes: home, explore, images, videos, search, gallery detail, categories, collections, about, copyright, DMCA, license, privacy, and terms.
- Admin routes: dashboard, login, asset list/create, collection list/create, tags, and settings.
- Route handlers expose public asset/search reads and protected admin auth, stats, asset, collection, and tag endpoints.
- Data layer is currently hybrid: public/admin runtime behavior primarily uses `src/lib/mock-data.ts`; Prisma 7 models PostgreSQL entities but is not used by active CRUD routes.
- Supabase clients and storage URL helpers exist, but the upload form does not implement a complete signed/validated persistence flow.
- Authentication uses JWT cookies and environment credentials; there is no root proxy/middleware protecting admin page navigation.
- Shared styling is centralized in `globals.css`, but two competing header/footer component pairs exist.

## Finished Features

- Broad public route coverage and responsive gallery/card foundations.
- Rich Prisma domain schema for assets, taxonomy, tags, rights holders, settings, and activity logs.
- Async Next.js 16 dynamic params are used in dynamic pages and route handlers.
- Mock editorial data includes images/videos, categories, collections, metadata, tags, and ownership basics.
- Admin login form, dashboard shell, list/create forms, and protected JSON endpoints are scaffolded.
- Remote image configuration covers Supabase and Unsplash hosts.
- Basic metadata, legal content, semantic landmarks, focus styles, and dark theme support exist.

## P0: Build, Runtime, and Security Correctness

- [x] Fix five TS2339 errors caused by admin collection handlers reading missing `id`, `coverImage`, and `sortOrder` properties from mock collections.
- [x] Fix the Zod 4 TS2339 error by using `ZodError.issues` rather than removed `errors`.
- [x] Fix the React 19 lint error in `ThemeProvider` without introducing hydration mismatch.
- [x] Remove all 12 lint warnings: unused imports, parameters, catch bindings, destructured IDs, and placeholder arguments.
- [x] Run lint, typecheck, and build repeatedly until all are clean.
- [x] Make Supabase client creation resilient when environment variables are absent; clients are now lazy and configuration-aware.
- [x] Remove insecure production fallback JWT secret and placeholder credential behavior; fail closed with clear configuration handling.
- [x] Consolidate authentication verification so cookie presence is never treated as authentication and page/API behavior agrees.
- [x] Validate asset updates with a strict shared Zod schema and remove the untyped mutation path.
- [x] Replace false-success asset, collection, and tag mutation paths with Prisma persistence or explicit configuration errors.

## P1: Data, Upload, and Domain Integrity

- [ ] Define one asset/collection/category contract shared by mock data, Prisma adapters, pages, and API responses.
- [ ] Wire Prisma-backed CRUD when database configuration exists, with an explicit demo fallback that never pretends writes persisted.
- [x] Complete upload flow: file type/size validation, authenticated server-side storage operation, stable object naming, progress/error states, media metadata, cleanup on failure, and persisted URLs.
- [x] Support multiple public rights holders and role-aware presentation in the fixture contract.
- [x] Render only available ownership fields: Verified Original, Copyright Owner, Authorized Representatives, Archive Custodian, Organization, public contact, website, license, year, IDs, permanent URL, archive date, DMCA status, and archive statement.
- [ ] Ensure every asset supports title, subtitle, description, story, image content, keywords, and tags across schema, forms, APIs, and detail rendering.
- [ ] Replace brittle comma-separated keyword handling with a consistent serializer/parser at the boundary.
- [x] Reconcile category/collection counts with actual assets instead of duplicated hard-coded counters.
- [x] Cover portrait, architecture, landscape, street, urban, documentary, fine art, travel, wildlife, macro, food/culture, drone, and film with distinct fixture media.

## P1: Branding and Global Identity

- [x] Create one original premium ARCHI SVG mark combining lens/aperture, archive, and authorship cues without resembling the excluded brands.
- [x] Build a reusable accessible logo component and use it in public header/footer, login, and admin shell.
- [x] Generate consistent favicon, manifest icon, Open Graph image, and browser metadata from the same identity.
- [x] Remove unused default Next/Vercel public assets and the stale favicon.
- [x] Replace every visible or metadata copyright year `2026` with the requested archive origin year `2015`; keep actual asset-specific years when data explicitly differs.

## P1: Login Redesign

- [x] Redesign only `/admin/login` as a centered editorial authentication card with restrained glass treatment, responsive spacing, premium typography, and subtle motion.
- [x] Add remember-me behavior with an explicit session-duration contract, loading/disabled state, errors announced to assistive technology, and keyboard-safe focus.
- [x] Add a non-deceptive forgot-password placeholder state and preserve secure credential semantics.

## P2: UI and UX Polish

- [x] Consolidate duplicate header/footer implementations and remove dead variants.
- [x] Improve sticky header spacing, scroll separation, current-route state, underline motion, search interaction, mobile dismissal, and reduced-motion behavior.
- [x] Expand footer into clear brand, archive, resources, company/legal, contact/social, newsletter-placeholder, and archive-statement regions.
- [ ] Refine hero, gallery density, asset cards, buttons, forms, dialogs, tables, search, collections, categories, loading, and empty states without changing the established visual identity.
- [ ] Normalize spacing, typography, shadows, radii (8px maximum for cards unless functionally required), borders, and hierarchy.
- [ ] Add subtle hover/reveal/page feedback using CSS or Framer Motion with `prefers-reduced-motion` support and no layout shift.
- [ ] Ensure mobile controls have stable dimensions, adequate touch targets, and no text overflow or overlap.

## P2: Images, Video, and Performance

- [x] Audit every remote media URL and replace dead Unsplash assets; final live HTTP result: 0 broken of 33 URLs.
- [x] Ensure every `Image` using `fill` has accurate `sizes`; add explicit dimensions/aspect ratios elsewhere.
- [ ] Tighten `remotePatterns` to required pathname/query constraints where practical.
- [x] Use Next.js 16 `preload` only for intentional priority cards and keep below-fold media lazy.
- [ ] Add video posters, metadata, keyboard-accessible controls where applicable, and hover behavior that does not autoplay for reduced-motion/data users.
- [ ] Reduce client component scope, duplicated rendering logic, eager media loading, and unnecessary animation JavaScript.

## P2: SEO and Metadata

- [x] Add a canonical metadata base, title template, canonical URLs, Open Graph/Twitter metadata, robots policy, and per-route descriptions.
- [ ] Add dynamic asset/category/collection metadata and appropriate not-found behavior.
- [x] Add sitemap and robots route files plus ImageObject/VideoObject structured data and branded Open Graph artwork.
- [ ] Ensure permanent archive URLs and public IDs are stable and reflected in metadata.
- [x] Correct manifest identity, icon sizing, and theme/background colors.

## P2: Accessibility and Semantic HTML

- [x] Correct root landmark ownership to avoid nested `main` elements.
- [ ] Replace list-like navigation/card wrappers with appropriate `ul`/`li`, `article`, `figure`, `figcaption`, `time`, `aside`, `details`, and `summary` semantics.
- [ ] Remove invalid or misleading nesting such as articles used only as text wrappers inside links.
- [ ] Provide content-specific alt text from `imageContent`, with empty alt only for genuinely decorative media.
- [x] Add skip navigation, upload/login live errors, explicit form labels, mobile navigation names, and icon-button names across modified workflows.
- [ ] Verify color contrast, keyboard order, mobile menu trapping/restoration, and reduced motion.

## P3: Code Quality and Maintainability

- [x] Remove dead duplicate layouts, default starter SVGs, stale favicon, unused helpers/imports, and unused form/motion packages.
- [ ] Consolidate duplicate ID generators, response helpers, asset filtering, label formatting, and card/gallery markup.
- [x] Replace `any`-based update mutation with a schema-derived typed patch.
- [ ] Fix mojibake characters in source strings (`â€¦`, `Â·`, and related encoding artifacts).
- [ ] Separate domain data, demo fixtures, repository adapters, and presentation constants.
- [ ] Add focused tests for validators, auth verification, filters/pagination, API failures, ownership rendering, and critical navigation/login/upload workflows.
- [x] Document required environment variables and fixture/persistent behavior in README and `.env.example`.

## Known UI and UX Problems

- Temporary text/geometric branding is inconsistent across public, login, and admin surfaces.
- Public site uses competing header/footer implementations; navigation state and mobile interaction are incomplete.
- Footer information architecture is too thin for an archive/legal product.
- Admin forms imply persistence despite mock-only route handlers.
- Login lacks remember-me, recovery feedback, robust loading semantics, and a finished brand presentation.
- Gallery/taxonomy pages are visually repetitive and under-populated; some labels/counts link to mismatched destinations.
- Empty/loading/error states are inconsistent or absent.

## Known SEO, Semantic, and Accessibility Problems

- Root metadata is minimal; canonical, OG/Twitter, sitemap, robots, structured data, and dynamic route metadata are incomplete.
- Manifest and favicon do not yet express the final ARCHI identity.
- Some media alt text mirrors titles rather than describing image content.
- Several list/navigation structures misuse `article`/`nav`, and generic wrappers can be replaced with stronger landmarks.
- Mobile navigation/search focus behavior and status announcements need completion.
- Motion does not yet consistently honor reduced-motion preferences.

## Known Performance Problems

- Broad client components and animation imports increase hydration cost.
- Remote media sizing/preload strategy is inconsistent.
- Duplicate layout implementations and repeated filtering/rendering logic increase bundle and maintenance cost.
- Mock data is a single large module imported across routes, preventing clean data ownership and potentially duplicating payload work.

## Completion Gates

- [x] `npm run lint` exits 0 with no warnings.
- [x] `npx tsc --noEmit` exits 0.
- [x] `npm run build` exits 0.
- [x] Home, login, and archive detail received headless Chrome desktop/mobile visual checks; contrast and login-shell defects found during review were fixed.
- [x] Public, dynamic, login, discovery, Open Graph, public API, and protected-auth routes received runtime smoke tests with expected status codes.
- [ ] Final report lists modified files, bugs and TypeScript errors fixed, remaining environment-dependent TODOs, and exact lint/build status.
