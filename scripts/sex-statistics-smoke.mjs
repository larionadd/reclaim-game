import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  await page.evaluate(async () => {
    const { useGame } = await import('/reclaim-game/src/store/game.ts')
    useGame.getState().hire('alisa')
    const s = useGame.getState()
    useGame.setState({ workers: { ...s.workers, alisa: { ...s.workers.alisa, love: 85, friendship: 70, fear: 5 } } })
    const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
    delete save.state.workers.alisa.sexCounts
    save.version = 17
    localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
  })
  await page.reload()
  const read = () => page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state.workers.alisa.sexCounts)
  assert.deepEqual(await read(), { conventional: 0, oral: 0, anal: 0 })
  await page.locator('.manor-tabs button').filter({ hasText: 'Спальня' }).click()
  await page.getByRole('button', { name: 'Викликати NPC до спальні' }).click()
  await page.locator('.bedroom-call .call-cards button').first().click()
  assert.equal(await page.getByRole('button', { name: 'Оральний секс' }).isEnabled(), true)
  await page.getByRole('button', { name: 'Оральний секс' }).click()
  assert.deepEqual(await read(), { conventional: 0, oral: 1, anal: 0 })
  await page.locator('.event-dialog button').click()
  await page.evaluate(async () => {
    const { useGame } = await import('/reclaim-game/src/store/game.ts')
    useGame.setState({ phase: 'day', actionPhaseUsed: null })
  })
  await page.getByRole('button', { name: 'Анальний секс' }).click()
  assert.deepEqual(await read(), { conventional: 0, oral: 1, anal: 1 })
  console.log('Sex action counters and save migration passed')
} finally {
  await browser.close()
}
