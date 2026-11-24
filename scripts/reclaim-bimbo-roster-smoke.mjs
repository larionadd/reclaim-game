import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  const result = await page.evaluate(async () => {
    const store = (await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)).useGame
    const medical = await import('/reclaim-game/src/mechanics/medicalOperations.ts')
    const roster = (await import('/reclaim-game/src/data/candidates.ts')).candidates.map(person => person.id)
    const chance = Array.from({ length: 11 }, (_, n) => medical.operationSuccessChance(n))
    const migrated = await store.persist.getOptions().migrate({ hired: ['alisa', 'daria'], workers: { alisa: { trust: 30 }, daria: { trust: 40 } }, assignments: { alisa: 'rest', daria: 'rest' }, vetDoctorId: 'alisa', journal: [], pendingContractNotices: ['alisa'], arrivalNotices: [] }, 28)
    store.getState().reset()
    store.setState({ money: 1000, cages: 4, staffCapacity: 4 })
    for (const id of ['daria', 'nicole', 'diana']) store.getState().hire(id)
    store.setState(s => ({ workers: Object.fromEntries(Object.entries(s.workers).map(([id, worker]) => [id, { ...worker, active: true, arrivalDay: undefined }])) }))
    store.getState().buildVet()
    store.getState().appointVet('daria')
    const doctor = store.getState().vetDoctorId
    store.setState(s => ({ workers: { ...s.workers, nicole: { ...s.workers.nicole, savings: 100, modificationDecision: { procedureId: 'support_brace', accepted: true, day: s.day } } } }))
    Math.random = () => .999
    store.getState().performOperation('nicole', 'support_brace')
    const zeroOutcome = store.getState().workers.nicole.operations.at(-1)?.outcome
    store.setState(s => ({ workers: { ...s.workers, daria: { ...s.workers.daria, bimbofication: 10, fear: 78 }, diana: { ...s.workers.diana, savings: 100, modificationDecision: { procedureId: 'support_brace', accepted: true, day: s.day } } } }))
    const locked = store.getState().workers.daria
    store.setState(s => ({ workers: { ...s.workers, daria: { ...s.workers.daria, fear: 45, love: 5 } } }))
    const lockedAgain = store.getState().workers.daria
    store.getState().performOperation('diana', 'support_brace')
    const tenOutcome = store.getState().workers.diana.operations.at(-1)?.outcome
    return { roster, migrated: { hired: migrated.hired, workerIds: Object.keys(migrated.workers), vetDoctorId: migrated.vetDoctorId, loyalty: migrated.workers.daria.loyalty }, chance, doctor, zeroOutcome, locked: { loyalty: locked.loyalty, respect: locked.respect, love: locked.love, fear: locked.fear }, lockedAgain: { love: lockedAgain.love, fear: lockedAgain.fear }, tenOutcome }
  })
  assert.deepEqual(result.roster, ['daria', 'nicole', 'yulia', 'diana'])
  assert.deepEqual(result.migrated, { hired: ['daria'], workerIds: ['daria'], vetDoctorId: null, loyalty: 40 })
  assert.equal(result.chance[0], 1)
  assert.equal(result.chance[5], .5)
  assert.equal(result.chance[10], 0)
  assert.equal(result.doctor, 'daria')
  assert.equal(result.zeroOutcome, 'success')
  assert.deepEqual(result.locked, { loyalty: 100, respect: 100, love: 100, fear: 0 })
  assert.deepEqual(result.lockedAgain, { love: 100, fear: 0 })
  assert.notEqual(result.tenOutcome, 'success')
  assert.deepEqual(errors, [])
  console.log('Four-person roster, any-NPC doctor, operation chances and bimbofication lock passed')
} finally { await browser.close() }
