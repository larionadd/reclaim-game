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
    useGame.setState({ workers: { ...s.workers, alisa: { ...s.workers.alisa, love: 81, friendship: 65, fear: 5 } } })
  })
  await page.reload()
  await page.locator('.manor-tabs button').filter({ hasText: 'Кабінет' }).click()
  await page.getByRole('button', { name: 'Викликати NPC' }).click()
  await page.locator('.call-cards button').first().click()
  assert.equal(await page.getByRole('button', { name: 'Запитати згоду' }).count(), 0)
  assert.equal(await page.locator('.interaction-choice small').count(), 0)
  assert.equal(await page.locator('.marker-legend').count(), 0)
  assert.equal(await page.getByRole('button', { name: 'Запропонувати близькість' }).isEnabled(), true)
  await page.getByRole('button', { name: 'Запропонувати близькість' }).click()
  let state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
  assert.equal(state.journal.at(-1).action, 'sex')
  await page.locator('.event-dialog button').click()
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
    Object.assign(save.state.workers.alisa, { love: 20, friendship: 10, fear: 81 })
    localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
  })
  await page.reload()
  await page.locator('.manor-tabs button').filter({ hasText: 'Кабінет' }).click()
  await page.getByRole('button', { name: 'Викликати NPC' }).click()
  await page.locator('.call-cards button').first().click()
  assert.equal(await page.getByRole('button', { name: 'Запропонувати близькість' }).isDisabled(), true)
  state = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
  assert.equal(state.workers.alisa.fear, 81)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  assert.deepEqual(errors, [])
  console.log('Office choices without request step or technical hints; fear does not unlock intimacy')
} finally {
  await browser.close()
}
