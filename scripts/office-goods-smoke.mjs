import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 820, height: 1180 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  assert.equal(await page.locator('.manor-page>.manor-grid .manor-card').count(), 4)
  const cards = await page.locator('.manor-page>.manor-grid .manor-card').evaluateAll(nodes => nodes.map(n => ({ width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height })))
  assert.ok(cards.every(c => c.width < 210 && c.height < 270), JSON.stringify(cards))
  await page.evaluate(async () => {
    const { useGame } = await import('/reclaim-game/src/store/game.ts')
    useGame.setState({ money: 1000 })
    useGame.getState().purchase({ dogCrate: 1, analPlug: 1 })
  })
  await page.locator('.manor-tabs button').filter({ hasText: 'Кабінет' }).click()
  const row = page.locator('.office-items article').filter({ hasText: 'Собача клітка' })
  assert.match(await row.innerText(), /На складі: 1/)
  await row.getByRole('button', { name: 'Додати' }).click()
  assert.match(await row.innerText(), /У кабінеті: 1/)
  await row.getByRole('button', { name: 'Прибрати' }).click()
  assert.match(await row.innerText(), /На складі: 1/)
  await page.locator('.bottom-nav button').filter({ hasText: 'Смартфон' }).click()
  await page.locator('.computer-tabs button').filter({ hasText: 'АТБЇБ' }).click()
  await page.locator('.shop-categories button').filter({ hasText: 'Для собак' }).click()
  assert.equal(await page.locator('.shop-products .shop-product').count(), 4)
  await page.locator('.shop-categories button').filter({ hasText: 'Товари для дорослих' }).click()
  assert.equal(await page.locator('.shop-products .shop-product').count(), 7)
  assert.equal(await page.locator('.shop-products img').evaluateAll(nodes => nodes.every(n => n.complete && n.naturalWidth > 0)), true)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  assert.deepEqual(errors, [])
  console.log('Tablet cards, office goods purchase and placement passed')
} finally {
  await browser.close()
}
