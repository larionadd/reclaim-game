import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Смартфон' }).first().click()
await page.getByRole('button', { name: /Промінь/ }).first().click()
for (const good of ['Яйця куро-дів', 'Молоко корово-дів']) {
  const card = page.locator('.market-products article').filter({ hasText: good })
  const img = card.locator('img')
  assert.equal(await img.evaluate(el => el.complete && el.naturalWidth === 800 && el.naturalHeight === 800), true)
  assert.equal(await img.evaluate(el => el.currentSrc.endsWith('.webp')), true)
}
assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= innerWidth), true)
await page.screenshot({ path: 'qa-premium-goods-mobile.png', fullPage: true })
await page.locator('.bottom-nav').getByRole('button', { name: 'Тваринництво' }).click()
assert.equal(await page.locator('.farm-produce-grid img').count(), 6)
assert.equal(await page.locator('.farm-produce-grid img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), true)
await browser.close()
console.log('Premium artwork loads at mobile size')
