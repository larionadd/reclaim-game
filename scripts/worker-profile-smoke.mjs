import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { updateBodyForDay, applyProcedureMeasurements } from '../src/mechanics/workerBody.ts'

const base = { heightCm: 166, weightKg: 56, chestCm: 85, waistCm: 65, hipsCm: 91 }
assert.ok(updateBodyForDay(base, base, 1, 'cage').weightKg < base.weightKg)
assert.ok(updateBodyForDay(base, base, 4, 'hut').weightKg > base.weightKg)
assert.equal(applyProcedureMeasurements(base, { weightKg: 2 }).weightKg, 58)
assert.equal(updateBodyForDay(base, base, 4, 'hut').heightCm, 166)

const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.addInitScript(() => { Math.random = () => .9 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.locator('.bottom-nav').getByRole('button', { name: 'Розподільник' }).click()
await page.getByRole('combobox', { name: 'Строк контракту' }).selectOption('30')
await page.getByRole('button', { name: /Запропонувати контракт/ }).first().click()
await page.locator('.bottom-nav').getByRole('button', { name: 'Люди' }).click()
await page.getByRole('textbox', { name: 'Ім’я для керування' }).fill('Лисичка')
assert.ok(await page.getByRole('heading', { name: 'Лисичка' }).count() >= 1)
assert.ok(await page.getByText('Аліса Морозова').count() >= 1)
await page.getByRole('combobox', { name: 'Призначення' }).selectOption('production')
await page.locator('.bottom-nav').getByRole('button', { name: 'Маєток' }).click()
await page.getByRole('button', { name: 'Спальня' }).first().click()
await page.getByRole('button', { name: 'Спати до ранку' }).click()
let state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
assert.equal(state.workers.alisa.nickname, 'Лисичка')
assert.equal(state.workers.alisa.totalEarnedForPlayer, 16)
assert.equal(state.workers.alisa.totalReceivedFromPlayer, 12)
assert.ok(state.workers.alisa.body.weightKg < 56)
assert.equal(state.workers.alisa.contractEndsDay, 30)
for (let i = 0; i < 29; i++) await page.getByRole('button', { name: 'Спати до ранку' }).click()
state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
assert.equal(state.day, 31)
assert.equal(state.workers.alisa.active, false)
assert.equal(state.assignments.alisa, 'rest')
const received = state.workers.alisa.totalReceivedFromPlayer
await page.getByRole('button', { name: 'Спати до ранку' }).click()
state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
assert.equal(state.workers.alisa.totalReceivedFromPlayer, received)
await page.locator('.bottom-nav').getByRole('button', { name: 'Люди' }).click()
assert.ok(await page.getByText('Контракт завершено').count() >= 1)
await page.evaluate(() => {
  const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
  save.version = 4
  save.state.workers.alisa.nickname = undefined
  save.state.workers.alisa.body = undefined
  save.state.workers.alisa.totalEarnedForPlayer = undefined
  localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
})
await page.reload({ waitUntil: 'networkidle' })
state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
assert.equal(state.day, 32)
assert.equal(state.workers.alisa.body.heightCm, 166)
assert.equal(state.workers.alisa.contractTerm, 'lifetime')
assert.deepEqual(errors, [])
console.log('Nickname, body changes, income record, contract expiry, and saved profile passed')
await browser.close()
