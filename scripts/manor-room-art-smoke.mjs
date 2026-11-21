import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
for (const name of ['Спальня','Кабінет']) {
  await page.getByRole('button', { name }).first().click()
  const img = page.locator('.room-scene')
  assert.equal(await img.count(), 1)
  assert.equal(await img.evaluate(el => el.complete && el.naturalWidth === 1600 && el.naturalHeight === 900), true)
  assert.equal(await img.evaluate(el => Math.round(el.getBoundingClientRect().width) <= innerWidth), true)
  await page.screenshot({ path: `qa-${name === 'Спальня' ? 'bedroom' : 'office'}-mobile.png`, fullPage: true })
}
assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= innerWidth), true)
console.log('Bedroom and office artwork load at mobile width')
await browser.close()
