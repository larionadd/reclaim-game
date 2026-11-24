import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  const result = await page.evaluate(async () => {
    const api = (await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/game.ts')).name)).useGame
    api.getState().reset()
    api.setState({ money: 1000 })
    api.getState().hire('diana')
    api.setState(s => ({ workers: { ...s.workers, diana: { ...s.workers.diana, active: true, arrivalDay: undefined } }, pendingContractNotices: [] }))
    api.getState().purchase({ chicken: 1, grain: 1, dogCrate: 1 })
    api.getState().placeOfficeItem('dogCrate')
    api.getState().assign('diana', 'production')
    Math.random = () => .5
    const nextDay = () => { for (let n = 0; n < 4; n++) { api.setState({ pendingRequest: null }); api.getState().advance() } }
    nextDay()
    const housingOutput = api.getState().lastReport.producedGoods.eggs
    api.getState().dismissReport()
    api.getState().officeCageAction('diana', 'cage')
    const dogCrateLocked = api.getState().officeCagedNpcId === 'diana'
    const assignmentPreserved = api.getState().assignments.diana
    nextDay()
    const dogCrateOutput = api.getState().lastReport.producedGoods.eggs
    const dogCrateStatus = api.getState().lastReport.workers[0].statuses
    api.getState().dismissReport()
    api.getState().officeCageAction('diana', 'release')
    nextDay()
    const afterReleaseOutput = api.getState().lastReport.producedGoods.eggs
    return { housing: api.getState().workers.diana.housing, housingOutput, dogCrateLocked, assignmentPreserved, dogCrateOutput, dogCrateStatus, afterReleaseOutput }
  })
  assert.equal(result.housing, 'cage')
  assert.equal(result.housingOutput, 2)
  assert.equal(result.dogCrateLocked, true)
  assert.equal(result.assignmentPreserved, 'production')
  assert.equal(result.dogCrateOutput, 0)
  assert.ok(result.dogCrateStatus.includes('reportStatusDogCrate'))
  assert.equal(result.afterReleaseOutput, 2)
  assert.deepEqual(errors, [])
  console.log('Housing cage works; manor dog crate blocks work; release resumes assignment')
} finally { await browser.close() }
