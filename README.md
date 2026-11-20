# RECLAIM — Ukrainian reconstruction sandbox prototype

Playable public build: https://larionadd.github.io/reclaim-game/

Run with Node.js 20.19+ or 22.12+:

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The setting is Ukraine, twelve years after the war started by Russia. Russia sends citizens to help rebuild Ukraine as reparations; individual contracts are voluntary. The game begins at the player's manor, with a bedroom for sleeping and an office for assets, tasks, construction, enterprises, and the ATBЇB online shop. The first enterprise is an animal farm. Three contracts appear initially; more arrive later. The daily cycle has no final day. Ukrainian, Russian, and English are available; language and game state are saved in browser local storage.

The farm screen is interactive: hiring, housing, assignments, rations, wages, rewards, fines, clinic grants, and daily reports change the saved simulation. One cage is available initially. Cages worsen health and trust; huts provide two places. The office shop sells bread, lard, grain, and vodka for hryvnia. NPC files show backstory, traits, goals, savings, trust, and surgery history. The design and target values are in [GDD.md](./GDD.md). Portrait guidelines are in [PORTRAIT_STANDARD.md](./PORTRAIT_STANDARD.md).

NPC development milestones and the future human-care annex are specified in the GDD and data files. Medical procedures and dialogue arcs are not playable yet.

NPC savings, wages, performance rewards, fines, and direct clinic grants are in live state. Goal and procedure definitions are in `src/data/npcGoals.json` and `src/data/medical/procedures.json`; procurement and surgery remain future gameplay.

NPC records now include editable nicknames, height, weight, chest/waist/hip measurements, earnings generated for the player, money received from the player, days under contract, and a 30-day, 90-day, or lifetime consensual contract term. Measurements change gradually with food and housing; surgery adjustments are modeled in `src/mechanics/workerBody.ts` for future playable procedures. Existing saves migrate to the new schema without losing workers or balances.

Production build: `npm run build`.


Animal-farm visual concepts: [desktop](./concept-art/desktop-animal-farm.png), [tablet](./concept-art/tablet-animal-farm.png), [mobile](./concept-art/mobile-animal-farm.png). These are image-generated art references; the React screen is the working prototype.

Visual QA notes: [design-qa.md](./design-qa.md). Verify with `npm run lint`, `npm run build`, `node scripts/smoke.mjs`, `node scripts/manor-smoke.mjs`, `node scripts/worker-profile-smoke.mjs`, and `node scripts/risk-smoke.mjs`.
