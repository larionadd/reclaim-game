import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'ПК' }).first().click()
await page.getByRole('button', { name: /Запропонувати контракт/ }).first().click()
await page.evaluate(() => { const save = JSON.parse(localStorage.getItem('reclaim-save-v1')); save.state.vetBuilt = true; save.state.vetDoctorId = 'nora'; save.state.hired.push('nora'); save.state.workers.nora = { ...save.state.workers.alisa, active: true, alive: true, operations: [] }; localStorage.setItem('reclaim-save-v1', JSON.stringify(save)) })
await page.reload({ waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Ветпункт' }).first().click()
const cards = page.locator('.procedure-card')
assert.equal(await cards.count(), 18)
const images = page.locator('.procedure-art')
for (let i = 0; i < 18; i++) {
  const img = images.nth(i)
  await img.scrollIntoViewIfNeeded()
  await img.evaluate(el => el.decode())
  assert.equal(await img.evaluate(el => el.naturalWidth === 640 && el.naturalHeight === 360), true)
}
assert.equal(new Set(await images.evaluateAll(els => els.map(el => new URL(el.src).pathname))).size, 18)
assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= innerWidth), true)
await page.screenshot({ path: 'qa-clinic-cards-mobile.png', fullPage: true })
console.log('18 unique clinic illustrations render in responsive cards')
await browser.close()
