import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } })
    await page.addInitScript(() => localStorage.clear())
    await page.goto('http://127.0.0.1:5174/reclaim-game/')
    await page.getByRole('button', { name: 'Нова гра' }).click()
    await page.locator('.player-name-form input').fill('Марко')
    await page.locator('.player-name-form button').click()
    await page.locator('.prologue-begin').click()
    await page.locator('.game-shell').waitFor()
    const prepared = await page.evaluate(async () => {
      const { useGame } = await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)
      useGame.getState().hire('daria', 'paid')
      useGame.setState(state => ({
        workers: { ...state.workers, daria: { ...state.workers.daria, active: true, arrivalDay: undefined } },
        pendingContractNotices: [],
        officePlaced: { ...state.officePlaced, dogCrate: 1 },
      }))
      useGame.getState().officeCageAction('daria', 'cage')
      return { caged: useGame.getState().officeCagedNpcId, event: useGame.getState().activeEvent?.action }
    })
    assert.deepEqual(prepared, { caged: 'daria', event: 'officeCage' })
    const dialog = page.locator('.event-dialog')
    await dialog.waitFor()
    assert.equal(await dialog.count(), 1)
    const story = await dialog.locator('p').last().textContent()
    assert.ok(story.includes('Марко підводиться з-за столу'))
    assert.ok(story.includes('Дарія переводить погляд'))
    assert.ok(!story.includes('Alpha') && !story.includes('Чупа'))
    await dialog.getByRole('button').click()
    await page.evaluate(async () => {
      const { useGame } = await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)
      useGame.getState().officeCageAction('daria', 'release')
    })
    await page.locator('.event-dialog').waitFor()
    assert.ok((await page.locator('.event-dialog').textContent()).includes('Марко відмикає собачу клітку'))
    assert.equal(await page.locator('.sidebar-footer').getByText(/кінцевого дня/).count(), 0)
    assert.equal(await page.locator('.game-topbar').getByText(/Відбудова України/).count(), 0)
    assert.equal(await page.locator('.game-sidebar').getByText(/Відбудова України/).count(), 0)
    if (width === 1280) {
      assert.equal(await page.locator('.game-sidebar .side-nav button').count(), 7)
      assert.equal(await page.locator('.game-sidebar .side-nav button').filter({ hasText: 'Кабінет' }).count(), 0)
    }
    await page.close()
  }
  console.log('Navigation and personalized cage popup passed at 390px and 1280px')
} finally {
  await browser.close()
}
