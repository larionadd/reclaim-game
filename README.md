# RECLAIM — Ukrainian reconstruction sandbox prototype

Playable public build: https://larionadd.github.io/reclaim-game/

## Current prototype (November 2026)

The player begins at the manor with one animal farm and one cage. The office PC contains monthly state applications (authored batches on days 1, 31, and 61), the ATBЇB shop with a cart and animal feed, and the Promin marketplace. Workers assigned to the farm produce meat, milk, cheese, and eggs when feed is available. The player chooses each worker's daily food from owned stocks. Listed farm products sell at the end of the day; their proceeds are attributed to the workers who produced them. The quarter-day button advances the four phases, and bedroom sleep completes the day. The sandbox has no final day.

All 15 base traits affect production, injury risk, health, trust, or wellbeing. The vet post is hidden until built and needs a hired medic to operate. There is one farm; other enterprises receive player-chosen names. Their production loops, unlimited monthly candidate generation, medical operations, and story arcs are planned but not playable yet.

The interface supports Ukrainian, Russian, and English; state is saved in local storage with migration from older versions. Run `npm run lint`, `npm run build`, `node scripts/smoke.mjs`, `node scripts/farm-market-smoke.mjs`, `node scripts/vet-traits-smoke.mjs`, `node scripts/manor-smoke.mjs`, `node scripts/worker-profile-smoke.mjs`, and `node scripts/risk-smoke.mjs` to verify the current build.


Local setup: Node.js 20.19+ or 22.12+, then `npm install` and `npm run dev`. See [GDD.md](./GDD.md) and [PORTRAIT_STANDARD.md](./PORTRAIT_STANDARD.md).
