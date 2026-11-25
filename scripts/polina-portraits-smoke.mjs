import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  const result = await page.evaluate(async () => {
    const { polinaPortrait } = await import('/reclaim-game/src/mechanics/polinaPortrait.ts')
    const cases = [
      [1, [], 'polina-initial.jpg'],
      [5, [{ id: 'breast_enlargement', day: 5, outcome: 'success' }], 'polina-modified.jpg'],
      [35, [{ id: 'breast_enlargement', day: 5, outcome: 'success' }], 'polina-modified-month.jpg'],
      [65, [{ id: 'breast_enlargement', day: 5, outcome: 'success' }], 'polina-modified-two-months.png'],
      [65, [{ id: 'lactation_hormones', day: 5, outcome: 'success' }], 'polina-modified-two-months.png'],
      [65, [{ id: 'breast_enlargement', day: 5, outcome: 'complication' }], 'polina-initial.jpg'],
    ]
    return Promise.all(cases.map(async ([day, operations, expected]) => {
      const actual = polinaPortrait(day, operations).split('/').at(-1)
      const image = new Image()
      image.src = `/reclaim-game/art/portraits/${actual}`
      await image.decode()
      return { actual, expected, loaded: image.naturalWidth > 0 }
    }))
  })
  for (const item of result) {
    assert.equal(item.actual, item.expected)
    assert.equal(item.loaded, true)
  }
  console.log('Polina portrait stages and image loading passed')
} finally {
  await browser.close()
}
