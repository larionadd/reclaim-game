import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  await page.getByRole('button', { name: 'Нова гра' }).click()
  await page.locator('.player-name-form button').click()
  await page.locator('.prologue-begin').click()
  const store = () => page.evaluate(async () => (await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)).useGame.getState())
  await page.getByRole('button', { name: 'Підприємства' }).last().click()
  assert.ok(await page.getByText('Ферма поки нічого не виробляє.').count())
  assert.equal(await page.locator('.farm-produce-grid article').count(), 0)
  await page.getByRole('button', { name: 'Смартфон' }).last().click()
  await page.locator('.computer-tabs').getByRole('button', { name: /АТБЇБ/ }).click()
  await page.getByRole('tab', { name: 'Худоба та корми' }).click()
  assert.equal(await page.locator('.shop-products article').count(), 6)
  await page.evaluate(async () => {
    const api = (await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)).useGame
    api.setState({ money: 1000 })
    api.getState().purchase({ chicken: 2, pig: 1, cow: 1, grain: 1, pigFeed: 1, cowFeed: 1 })
  })
  let state = await store()
  assert.deepEqual(state.livestock, { chickens: 2, pigs: 1, cattle: 1 })
  assert.deepEqual(state.feedStock, { chickens: 10, pigs: 10, cattle: 10 })
  assert.equal(state.money, 1000 - (2 * 24 + 65 + 160 + 20 + 25 + 40))
  await page.evaluate(async () => {
    const api = (await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)).useGame
    Math.random = () => .5
    for (let i = 0; i < 4; i++) { api.setState({ pendingRequest: null }); api.getState().advance() }
  })
  state = await store()
  assert.equal(state.lastReport.produced, 0)
  assert.deepEqual(state.feedStock, { chickens: 8, pigs: 9, cattle: 9 })
  await page.locator('.daily-report button').click()
  await page.evaluate(async () => {
    const api = (await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)).useGame
    api.getState().hire('diana', 'paid')
  })
  await page.evaluate(async () => {
    const api = (await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)).useGame
    api.setState(s => ({ pendingContractNotices: [], arrivalNotices: [], workers: { ...s.workers, diana: { ...s.workers.diana, active: true, arrivalDay: undefined } } }))
    api.getState().assign('diana', 'production')
    for (let i = 0; i < 4; i++) { api.setState({ pendingRequest: null }); api.getState().advance() }
  })
  state = await store()
  assert.equal(state.lastReport.producedGoods.eggs, 4)
  assert.equal(state.lastReport.producedGoods.milk, 2)
  assert.equal(state.lastReport.producedGoods.cheese, 1)
  assert.equal(state.lastReport.producedGoods.meat, 1)
  assert.deepEqual(errors, [])
  console.log('Livestock shop, feed consumption, worker gate and species production passed')
} finally { await browser.close() }
