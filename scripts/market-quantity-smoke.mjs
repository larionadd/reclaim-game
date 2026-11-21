import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/reclaim-game/')
  await page.getByRole('button', { name: 'Смартфон', exact: true }).click()
  await page.getByRole('button', { name: 'Промінь' }).click()
  assert.equal(await page.locator('.market-products .shop-product').count(), 0)
  assert.equal(await page.locator('.market-empty').count(), 1)
  await page.locator('.quarter-top').first().click()

  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
    save.state.stocks.meat = 2
    save.state.stocks.eggs = 7
    localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
  })
  await page.reload()
  await page.getByRole('button', { name: 'Смартфон', exact: true }).click()
  await page.getByRole('button', { name: 'Промінь' }).click()
  const cards = page.locator('.market-products .shop-product')
  assert.equal(await cards.count(), 2)
  const meat = cards.filter({ has: page.getByRole('heading', { name: 'М’ясо' }) })
  const eggs = cards.filter({ has: page.getByRole('heading', { name: 'Яйця', exact: true }) })
  await meat.locator('.sale-quick-qty').getByRole('button', { name: '5' }).click()
  assert.equal(await meat.getByRole('spinbutton').inputValue(), '2')
  await eggs.locator('.sale-quick-qty').getByRole('button', { name: '1' }).click()
  assert.equal(await eggs.getByRole('spinbutton').inputValue(), '1')
  await eggs.locator('.sale-quick-qty').getByRole('button', { name: 'Макс' }).click()
  assert.equal(await eggs.getByRole('spinbutton').inputValue(), '7')
  await meat.getByRole('button', { name: 'Виставити' }).click()
  assert.equal(await cards.count(), 1)
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
  assert.equal(state.stocks.meat, 0)
  assert.equal(state.listings.at(-1).quantity, 2)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  assert.deepEqual(errors, [])
  console.log('Stock-only market cards, quick quantities, sale, and mobile width passed')
} finally {
  await browser.close()
}
