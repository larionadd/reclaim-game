import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript(() => { if (!sessionStorage.getItem('smoke_initialized')) { localStorage.clear(); sessionStorage.setItem('smoke_initialized', '1') } })
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  await page.getByRole('button', { name: 'Нова гра' }).click()
  await page.locator('.player-name-form button').click()
  await page.locator('.prologue-begin').click()
  await page.locator('.game-shell').waitFor()
  await page.evaluate(async () => {
    const { useGame } = await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)
    useGame.getState().hire('yulia', 'paid')
    useGame.setState(state => ({
      workers: { ...state.workers, yulia: { ...state.workers.yulia, active: true, arrivalDay: undefined } },
      pendingContractNotices: [],
    }))
  })
  await page.locator('.bottom-nav').getByRole('button', { name: 'Люди' }).click()
  const portrait = page.locator('.people-list .portrait-base').first()
  const check = async (day, operations, clothing, expected) => {
    await page.evaluate(async ({ day, operations, clothing }) => {
      const { useGame } = await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)
      useGame.setState(state => ({ day, workers: { ...state.workers, yulia: { ...state.workers.yulia, operations, clothing } } }))
    }, { day, operations, clothing })
    await page.waitForFunction(expected => {
      const image = document.querySelector('.people-list .portrait-base')
      return image?.src.endsWith(expected) && image.complete && image.naturalWidth > 0
    }, expected)
    assert.ok((await portrait.getAttribute('src')).endsWith(expected))
  }
  await check(2, [], 'clothed', 'yulia-initial.jpg')
  await check(8, [], 'clothed', 'yulia-initial.jpg')
  await check(9, [], 'clothed', 'yulia-week.jpg')
  await check(32, [], 'clothed', 'yulia-month.png')
  await check(32, [{ id: 'breast_enlargement', day: 32, outcome: 'success' }], 'clothed', 'yulia-modified.png')
  await check(62, [{ id: 'breast_enlargement', day: 32, outcome: 'success' }], 'clothed', 'yulia-modified-month.png')
  await check(62, [{ id: 'lactation_hormones', day: 60, outcome: 'success' }], 'clothed', 'yulia-modified.png')
  await check(62, [{ id: 'breast_enlargement', day: 60, outcome: 'complication' }], 'clothed', 'yulia-month.png')
  await check(62, [], 'unclothed', 'yulia.jpg')
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
    save.version = 31
    save.state.day = 9
    save.state.workers.yulia.hiredOnDay = 2
    delete save.state.workers.yulia.firstArrivalDay
    localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
  })
  await page.reload()
  const migratedArrivalDay = await page.evaluate(async () => {
    const { useGame } = await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)
    return useGame.getState().workers.yulia.firstArrivalDay
  })
  assert.equal(migratedArrivalDay, 2)
  console.log('Yulia portrait progression and image loading passed')
} finally {
  await browser.close()
}
