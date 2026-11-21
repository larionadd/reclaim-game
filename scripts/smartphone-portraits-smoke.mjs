import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/reclaim-game/')
  assert.equal(await page.locator('.bottom-nav button').count(), 5)
  await page.locator('.quarter-top').click()
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
    save.state.staffCapacity = 2
    save.state.cages = 2
    localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
  })
  await page.reload()
  await page.locator('.bottom-nav').getByRole('button', { name: 'Смартфон' }).click()
  for (const name of ['Софія Гринь', 'Віра Данилюк']) {
    await page.locator('.candidate-row').filter({ hasText: name }).getByRole('button', { name: /Запропонувати контракт/ }).click()
  }
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
    for (const id of ['sofia', 'vira']) {
      save.state.assignments[id] = 'production'
      save.state.workers[id].love = 80
    }
    localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
  })
  await page.reload()
  await page.locator('.quarter-top').click()
  await page.locator('.bottom-nav').getByRole('button', { name: 'Смартфон' }).click()
  for (const [name, id] of [['Софія Гринь', 'sofia'], ['Віра Данилюк', 'vira']]) {
    const portrait = page.locator('.candidate-row').filter({ hasText: name }).locator('.portrait-base')
    assert.match(await portrait.getAttribute('src'), new RegExp(`${id}-dirty-work\\.webp$`))
    assert.equal(await portrait.evaluate(img => img.complete && img.naturalWidth > 0), true)
  }
  await page.locator('.bottom-nav').getByRole('button', { name: 'Тваринництво' }).click()
  await page.getByRole('button', { name: /Продати у смартфоні/ }).click()
  assert.equal(await page.locator('.market-page').count(), 1)
  await page.locator('.bottom-nav').getByRole('button', { name: 'Ветпункт' }).click()
  await page.locator('.bottom-nav').getByRole('button', { name: 'Смартфон' }).click()
  assert.equal(await page.locator('.smartphone-page').count(), 1)
  await page.locator('.bottom-nav').getByRole('button', { name: 'Маєток' }).click()
  await page.getByRole('button', { name: 'Спальня' }).first().click()
  await page.getByRole('button', { name: 'Викликати NPC до спальні' }).click()
  for (const [name, id] of [['Софія Гринь', 'sofia'], ['Віра Данилюк', 'vira']]) {
    const portrait = page.locator('.call-cards button').filter({ hasText: name }).locator('.portrait-base')
    assert.match(await portrait.getAttribute('src'), new RegExp(`${id}-sleepwear\\.webp$`))
    assert.equal(await portrait.evaluate(img => img.complete && img.naturalWidth > 0), true)
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  assert.deepEqual(errors, [])
  console.log('Phone navigation and Sofia/Vira portrait changes passed at mobile width')
} finally {
  await browser.close()
}

