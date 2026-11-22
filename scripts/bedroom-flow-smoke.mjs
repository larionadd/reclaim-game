import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  await page.evaluate(async () => {
    const { useGame } = await import('/reclaim-game/src/store/game.ts')
    useGame.getState().hire('alisa')
    const s = useGame.getState()
    useGame.setState({ workers: { ...s.workers, alisa: { ...s.workers.alisa, love: 75, friendship: 65, fear: 5 } } })
  })
  await page.reload()
  await page.locator('.manor-tabs button').filter({ hasText: 'Спальня' }).click()
  await page.getByRole('button', { name: 'Викликати NPC до спальні' }).click()
  await page.locator('.bedroom-call .call-cards button').first().click()
  assert.equal(await page.getByRole('button', { name: 'Запитати згоду' }).count(), 0)
  assert.equal(await page.getByText('Потрібна згода NPC саме сьогодні.').count(), 0)
  assert.equal(await page.getByRole('button', { name: 'Ніжна близькість' }).isEnabled(), true)
  await page.getByRole('button', { name: 'Ніжна близькість' }).click()
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
  assert.equal(state.journal.at(-1).action, 'gentleIntimacy')
  assert.equal(state.workers.alisa.love, 77)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  assert.deepEqual(errors, [])
  console.log('Bedroom intimacy without a separate request, adult relationship gate, and mobile width passed')
} finally {
  await browser.close()
}
