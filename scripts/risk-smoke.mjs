import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
for (const [roll, expected] of [[0.02, 'injury'], [0, 'fatality']]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.addInitScript(value => { Math.random = () => value }, roll)
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.locator('.side-nav').first().getByRole('button', { name: 'Розподільник' }).click()
  await page.getByRole('button', { name: /Запропонувати контракт/ }).first().click()
  await page.locator('.side-nav').first().getByRole('button', { name: 'Люди' }).click()
  await page.getByRole('combobox', { name: 'Призначення' }).selectOption('production')
  await page.locator('.side-nav').first().getByRole('button', { name: 'Тваринництво' }).click()
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /Продовжити/ }).click()
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
  if (expected === 'injury') {
    assert.equal(state.workers.alisa.alive, true)
    assert.equal(state.workers.alisa.injuredUntilDay, 3)
    assert.equal(state.assignments.alisa, 'rest')
  } else {
    assert.equal(state.workers.alisa.alive, false)
    assert.equal(state.assignments.alisa, 'rest')
  }
  await page.close()
}
console.log('Injury and fatality branches passed')
await browser.close()
