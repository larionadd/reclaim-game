import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
for (const { roll, outcome } of [{ roll: 0, outcome: 'death' }, { roll: 0.08, outcome: 'disability' }, { roll: 0.9, outcome: 'success' }]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript(value => { Math.random = () => value }, roll)
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Смартфон' }).first().click()
  await page.getByRole('button', { name: /Запропонувати контракт/ }).first().click()
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')))
  save.state.vetBuilt = true; save.state.vetDoctorId = 'nora'; save.state.hired.push('nora')
  save.state.workers.nora = { ...save.state.workers.alisa, active: true, alive: true, operations: [] }
  Object.assign(save.state.workers.alisa, { savings: 400, modificationConsentAtSigning: true, fear: 0 })
  await page.evaluate(value => localStorage.setItem('reclaim-save-v1', JSON.stringify(value)), save)
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Ветпункт' }).first().click()
  const surgery = page.locator('.modification-list article').filter({ hasText: 'Штучна матка для яйцекладки' })
  await surgery.getByRole('button', { name: 'Запропонувати' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Продовжити' }).click()
  await surgery.getByRole('button', { name: 'Провести операцію' }).click()
  const updated = await page.evaluate(() => JSON.parse(localStorage.getItem('reclaim-save-v1')).state)
  assert.equal(updated.workers.alisa.operations.at(-1).outcome, outcome)
  assert.equal(updated.workers.alisa.savings, 80)
  assert.equal(updated.workers.alisa.alive, outcome !== 'death')
  assert.equal(!!updated.workers.alisa.disabled, outcome === 'disability')
  if (outcome === 'success') assert.equal(updated.workers.alisa.medicalEffects.oviposition, true)
  await page.close()
}
console.log('Surgery success, disability and death branches passed')
await browser.close()
