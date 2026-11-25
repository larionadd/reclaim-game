import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  const results = await page.evaluate(async () => {
    const { dianaPortrait } = await import('/reclaim-game/src/mechanics/dianaPortrait.ts')
    const cases = [
      [1, undefined, false, 'cage', [], false, 'diana.jpg'],
      [1, 2, false, 'cage', [], false, 'diana.jpg'],
      [2, 2, true, 'cage', [], true, 'diana-cage.png'],
      [2, 2, true, 'cage', [], false, 'diana.jpg'],
      [8, 1, true, 'hut', [], false, 'diana-week.jpg'],
      [31, 1, true, 'hut', [], false, 'diana-month.jpg'],
      [32, 1, true, 'hut', [{ id: 'breast_enlargement', day: 32, outcome: 'success' }], false, 'diana-modified.png'],
      [62, 1, true, 'hut', [{ id: 'breast_enlargement', day: 32, outcome: 'success' }], false, 'diana-modified-month.png'],
      [62, 1, true, 'hut', [{ id: 'lactation_hormones', day: 60, outcome: 'success' }], false, 'diana-modified.png'],
      [62, 1, true, 'hut', [{ id: 'breast_enlargement', day: 60, outcome: 'complication' }], false, 'diana-month.jpg'],
      [62, 1, true, 'cage', [{ id: 'breast_enlargement', day: 32, outcome: 'success' }], true, 'diana-cage.png'],
    ]
    return Promise.all(cases.map(async ([day, arrival, active, housing, operations, inOwnCage, expected]) => {
      const path = dianaPortrait(day, arrival, active, housing, operations, inOwnCage)
      const image = new Image()
      image.src = `/reclaim-game${path}`
      await image.decode()
      return { actual: path.split('/').at(-1), expected, loaded: image.naturalWidth > 0 }
    }))
  })
  for (const result of results) {
    assert.equal(result.actual, result.expected)
    assert.equal(result.loaded, true)
  }
  console.log('Diana portrait stages and image loading passed')
} finally {
  await browser.close()
}
