# RECLAIM — Ukrainian reconstruction sandbox prototype

Playable public build: https://larionadd.github.io/reclaim-game/

## Current prototype (November 2026)

The player begins at the manor with one animal farm and one cage. The office PC contains monthly state applications (authored batches on days 1, 31, and 61), the ATBЇB shop with a cart and animal feed, and the Promin marketplace. Workers assigned to the farm produce meat, milk, cheese, and eggs when feed is available. The player chooses each worker's daily food from owned stocks. Listed farm products sell at the end of the day; their proceeds are attributed to the workers who produced them. The quarter-day button advances the four phases, and bedroom sleep completes the day. The sandbox has no final day.

All 15 base traits affect production, injury risk, health, trust, or wellbeing. The vet post is hidden until built and needs a hired medic to operate. There is one farm; other enterprises receive player-chosen names. Their production loops, unlimited monthly candidate generation, medical operations, and story arcs are planned but not playable yet.

The interface supports Ukrainian, Russian, and English; state is saved in local storage with migration from older versions. Run `npm run lint`, `npm run build`, `node scripts/smoke.mjs`, `node scripts/farm-market-smoke.mjs`, `node scripts/vet-traits-smoke.mjs`, `node scripts/manor-smoke.mjs`, `node scripts/worker-profile-smoke.mjs`, and `node scripts/risk-smoke.mjs` to verify the current build.

Workers now receive either wages or food from the player's stores for each shift. The provision type can be changed in the personnel file. The morning report records each worker's health change, provisions received, and reasons such as housing, work, hunger, low pay, or injury. The office lets the player call a worker for rewards, disciplinary actions, or conversation; respect, fear, friendship, and love gate social choices. Intimate scenes remain unavailable while the player directly employs the worker. Housing cards show their full images on phone and desktop. Verify these flows with `node scripts/office-report-smoke.mjs`.


The manor's housing tab is named Settlement. Cage and hut art have new landscape versions with intact bed geometry. Moving a worker into a hut immediately raises trust and respect by 5, friendship by 3, and lowers fear by 2; the daily stay also raises trust and respect. The opposite move harms those relationships. The worker file and office show a new debauchery/openness stat. Adult joke, flirt, and romance talk have visible relationship thresholds. Office interactions and housing moves show a narrative outcome with exact stat changes and are saved to the manor Journal. Verify with `node scripts/journal-interaction-smoke.mjs`.

Local setup: Node.js 20.19+ or 22.12+, then `npm install` and `npm run dev`. See [GDD.md](./GDD.md) and [PORTRAIT_STANDARD.md](./PORTRAIT_STANDARD.md).
