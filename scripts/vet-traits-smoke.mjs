import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { productionForWorker, riskForWorker, conditionEffects } from '../src/mechanics/farmProduction.ts'

const plain = { traits: [] }
const skilled = { traits: ['inventive', 'methodical', 'ambitious', 'observant', 'curious', 'leader'] }
assert.deepEqual(productionForWorker(plain, 1), { meat: 1, milk: 2, cheese: 1, eggs: 4 })
assert.deepEqual(productionForWorker(skilled, 2), { meat: 2, milk: 3, cheese: 3, eggs: 6 })
assert.ok(riskForWorker({ traits: ['cautious'] }, false, 1) < riskForWorker(plain, false, 1))
assert.ok(conditionEffects({ traits: ['resilient', 'sociable'] }, true, false, 'rest').health > 0)

const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
assert.equal(await page.locator('.bottom-nav').getByRole('button', { name: 'Ветпункт' }).count(), 0)
await page.locator('.quarter-top').click()
await page.evaluate(() => { const save = JSON.parse(localStorage.getItem('reclaim-save-v1')); save.state.day = 61; save.state.money = 500; save.state.huts = 1; save.state.staffCapacity = 3; localStorage.setItem('reclaim-save-v1', JSON.stringify(save)) })
await page.reload({ waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Кабінет' }).first().click()
await page.getByRole('button', { name: '200 ₴' }).click()
assert.equal(await page.locator('.bottom-nav').getByRole('button', { name: 'Ветпункт' }).count(), 1)
await page.getByRole('button', { name: 'ПК' }).first().click()
await page.locator('.candidate-row').filter({ hasText: 'Нора Сент' }).getByRole('button', { name: /Запропонувати контракт/ }).click()
await page.getByRole('button', { name: 'Кабінет' }).first().click()
await page.getByRole('combobox', { name: 'Призначити ветеринарного лікаря' }).selectOption('nora')
await page.locator('.bottom-nav').getByRole('button', { name: 'Ветпункт' }).click()
assert.equal(await page.getByRole('heading', { name: 'Ветпункт', exact: true }).count(), 1)
assert.ok(await page.getByText('Ветпункт працює').count() >= 1)
assert.deepEqual(errors, [])
console.log('Trait effects, hidden vet post, construction, doctor hiring and appointment passed')
await browser.close()
