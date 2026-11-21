import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  await page.getByRole('button', { name: 'Підприємства', exact: true }).last().click()
  assert.equal(await page.getByRole('heading', { name: 'Підприємства' }).count(), 1)
  await page.evaluate(async () => {
    const { useGame } = await import('/reclaim-game/src/store/game.ts')
    useGame.setState({ money: 5000, cages: 2, staffCapacity: 2, stocks: { ...useGame.getState().stocks, meat: 5, bread: 100 } })
    const g = useGame.getState()
    g.createEnterprise('droneAssembly', '')
    g.createEnterprise('store', 'Мій магазин')
    g.createEnterprise('trainingCamp', '')
    g.hire('daria')
    g.hire('sofia')
    g.assign('daria', 'droneAssembly')
    g.assign('sofia', 'storeSales')
    g.purchase(Object.fromEntries(['droneFrame', 'droneBattery', 'droneMotors', 'dronePropellers', 'droneController', 'droneCamera', 'droneRadio'].map(x => [x, 1])))
    g.listInStore('meat', 4, 15)
    Math.random = () => .99
    for (let i = 0; i < 4; i++) g.advance()
  })
  const first = await page.evaluate(async () => { const { useGame } = await import('/reclaim-game/src/store/game.ts'); const s = useGame.getState(); return { day: s.day, drones: s.drones, sales: s.totalSales, meat: s.storeListings[0]?.quantity, parts: s.partStock, name: s.enterpriseNames.store } })
  assert.equal(first.day, 2)
  assert.equal(first.drones, 1)
  assert.equal(first.sales, 30)
  assert.equal(first.meat, 2)
  assert.equal(first.name, 'Мій магазин')
  assert.ok(Object.values(first.parts).every(n => n === 0))
  await page.getByRole('button', { name: 'Люди', exact: true }).last().click()
  await page.locator('.people-list button').first().click()
  assert.equal(await page.locator('option[value="maintenance"]').count(), 0)
  assert.equal(await page.locator('option[value="droneAssembly"]').count(), 1)
  assert.equal(await page.locator('option[value="storeSales"]').count(), 1)
  assert.equal(await page.locator('option[value="training"]').count(), 1)
  await page.evaluate(async () => {
    const { useGame } = await import('/reclaim-game/src/store/game.ts')
    const g = useGame.getState()
    g.assign('daria', 'training')
    g.assign('sofia', 'training')
    g.setTraining('daria', 'spar')
    g.setTraining('sofia', 'spar')
    for (let i = 0; i < 4; i++) g.advance()
  })
  const trained = await page.evaluate(async () => { const { useGame } = await import('/reclaim-game/src/store/game.ts'); const s = useGame.getState(); return [s.workers.daria.training.combat, s.workers.sofia.training.combat] })
  assert.deepEqual(trained, [1, 1])
  await page.evaluate(async () => {
    const { useGame } = await import('/reclaim-game/src/store/game.ts')
    const g = useGame.getState()
    g.assign('daria', 'rest')
    g.assign('sofia', 'rest')
    g.setFoodPlan('sofia', 'bread', 0)
    g.setFoodPlan('daria', 'bread', 12)
    window.__beforeWeight = useGame.getState().workers.daria.body.weightKg
    for (let i = 0; i < 4; i++) g.advance()
  })
  const health = await page.evaluate(async () => { const { useGame } = await import('/reclaim-game/src/store/game.ts'); const s = useGame.getState(); return { report: s.lastReport, weight: s.workers.daria.body.weightKg, previousWeight: window.__beforeWeight } })
  const sofia = health.report.workers.find(w => w.id === 'sofia')
  assert.equal(sofia.healthAfter - sofia.healthBefore, -6)
  assert.ok(health.weight > health.previousWeight)
  await page.getByRole('button', { name: 'Смартфон', exact: true }).last().click()
  await page.getByRole('button', { name: 'АТБЇБ' }).click()
  assert.equal(await page.locator('.shop-products .shop-product').count(), 11)
  assert.equal(await page.locator('.shop-products img').count(), 11)
  assert.equal(await page.locator('.shop-products img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
    save.version = 16
    save.state.assignments.daria = 'maintenance'
    delete save.state.partStock
    delete save.state.storeListings
    delete save.state.trainingPlans
    delete save.state.drones
    delete save.state.workers.daria.training
    localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
  })
  await page.reload()
  const migrated = await page.evaluate(async () => { const { useGame } = await import('/reclaim-game/src/store/game.ts'); const s = useGame.getState(); return { assignment: s.assignments.daria, parts: Object.keys(s.partStock).length, training: s.workers.daria.training.speed, name: s.enterpriseNames.store } })
  assert.deepEqual(migrated, { assignment: 'rest', parts: 7, training: 0, name: 'Мій магазин' })
  assert.deepEqual(errors, [])
  console.log('Enterprise production, store, sparring, nutrition, weight, ATBIB images and mobile width passed')
} finally {
  await browser.close()
}
