import { chromium } from 'playwright-core'
import { resolve } from 'node:path'

const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
for (const [name, width, height] of [['desktop', 1672, 941], ['tablet', 1024, 768], ['mobile', 390, 844]]) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.screenshot({ path: resolve(`qa-${name}.png`) })
  await page.screenshot({ path: resolve(`qa-${name}-full.png`), fullPage: true })
  console.log(name, await page.evaluate(() => ({ viewport: innerWidth, pageWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight })), errors)
  await context.close()
}
await browser.close()
