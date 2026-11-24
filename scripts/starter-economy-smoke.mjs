import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
try {
  const page = await browser.newPage()
  await page.addInitScript(() => localStorage.clear())
  await page.goto('http://127.0.0.1:5174/reclaim-game/')
  const outcome = await page.evaluate(async () => {
    const { useGame } = await import('/reclaim-game/src/store/game.ts')
    const game = () => useGame.getState()
    const startingMoney = game().money
    game().hire('daria', 'paid')
    game().purchase({ chicken: 1, pig: 1, cow: 1, grain: 1, pigFeed: 1, cowFeed: 1 })
    const afterSetup = game().money
    Math.random = () => .99
    useGame.setState({ pendingContractNotices: [] })
    for (let i = 0; i < 4; i++) game().advance()
    game().dismissReport()
    useGame.setState({ arrivalNotices: [], pendingRequest: null })
    game().assign('daria', 'production')
    for (let i = 0; i < 4; i++) game().advance()
    const goods = game().lastReport.producedGoods
    game().listForSale('eggs', game().stocks.eggs)
    game().listForSale('milk', game().stocks.milk)
    game().listForSale('cheese', game().stocks.cheese)
    game().listForSale('meat', game().stocks.meat)
    game().dismissReport()
    useGame.setState({ pendingRequest: null })
    for (let i = 0; i < 4; i++) game().advance()
    return { startingMoney, afterSetup, goods, sales: game().lastReport.sales, remainingMoney: game().money }
  })
  assert.equal(outcome.startingMoney, 500)
  assert.equal(outcome.afterSetup, 166)
  assert.ok(outcome.goods.eggs > 0 && outcome.goods.milk > 0 && outcome.goods.cheese > 0)
  assert.ok(outcome.sales > 0 && outcome.remainingMoney > 0)
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('reclaim-save-v1'))
    save.version = 30
    save.state.day = 2
    save.state.money = 120
    save.state.totalSales = 0
    localStorage.setItem('reclaim-save-v1', JSON.stringify(save))
  })
  await page.reload()
  const migratedMoney = await page.evaluate(async () => (await import('/reclaim-game/src/store/game.ts')).useGame.getState().money)
  assert.equal(migratedMoney, 500)
  console.log('Starter economy works:', outcome)
} finally {
  await browser.close()
}
