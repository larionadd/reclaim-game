# Visual QA — 20 November 2026

Sources: `concept-art/desktop-animal-farm.png` (1672×941), `concept-art/tablet-animal-farm.png` (1448×1086), `concept-art/mobile-animal-farm.png` (992×1586).

Implementation: `src/App.tsx`, `src/App.css`, `src/components/FarmDashboard.tsx`, `src/components/LocationScreens.tsx`, and `public/art/`.

Captured live Vite pages with Playwright at desktop 1672×941, tablet 1024×768, and phone 390×844. Captures: `qa-desktop.png`, `qa-tablet.png`, `qa-mobile.png`; full pages in the corresponding `-full.png` files. All three have zero horizontal overflow and no page errors.

Desktop geometry: 226 px sidebar, 60 px top bar, 349 px hero. The four herd cards, four phase controls, four management cards, colors, serif headings, borders, and generated farm art follow the desktop concept. Tablet uses a two-column herd and worker arrangement. Phone uses a compact hero, 2×2 herd cards, four phase controls, one-column management cards, and fixed bottom navigation.

The image concepts contain illustrative characters, animal counts, money values, and labels inconsistent with the approved game data; the live UI uses the actual data and localized text. The mobile concept is a 0.625 aspect illustration, while the test phone is 0.462 aspect, so a single-screen pixel overlay is not a meaningful like-for-like test. The source also shows a completed worker panel within its frame; the live phone page scrolls through the management panels. No numerical pixel-distance measurement has validated the requested maximum 3% deviation.

Functional checks: `npm run build`, `npm run lint`, `node scripts/smoke.mjs`, and `node scripts/risk-smoke.mjs` passed. The smoke tests cover hiring, assignment, payroll, rations, monthly offer on day 31, housing expansion, language switching, injury, and fatality.

Result: **blocked** against the strict 3% visual acceptance criterion. The visual direction and primary screen structure are implemented, but the concept images and actual viewport/data must be normalized to the same layout and content before a 3% measurement can pass honestly.
