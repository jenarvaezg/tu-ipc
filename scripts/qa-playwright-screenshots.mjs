import { chromium, devices } from '@playwright/test'
import { mkdirSync } from 'fs'
import path from 'path'

const CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_URL = process.env.BASE_URL_CAPTURE || 'http://127.0.0.1:4173'
const OUT_DIR = path.resolve('scripts/outputs/screenshots')

mkdirSync(OUT_DIR, { recursive: true })

async function captureDesktop(urlPath, filename) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_EXECUTABLE,
  })

  const context = await browser.newContext({
    viewport: { width: 1600, height: 2800 },
  })
  const page = await context.newPage()
  await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: true })
  await browser.close()
}

async function captureMobile(urlPath, filename) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_EXECUTABLE,
  })

  const context = await browser.newContext({
    ...devices['iPhone 13'],
  })
  const page = await context.newPage()
  await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: true })
  await browser.close()
}

async function main() {
  console.log('Capturando screenshots QA con Playwright...')

  await captureDesktop('/?t=evolucion', 'evolucion-desktop.png')
  await captureDesktop('/?t=rubricas', 'rubricas-desktop.png')
  await captureMobile('/?t=rubricas', 'rubricas-mobile.png')
  await captureDesktop('/?embed=1&t=rubricas', 'rubricas-embed-desktop.png')
  await captureMobile('/?embed=1&t=rubricas', 'rubricas-embed-mobile.png')

  console.log(`Capturas guardadas en ${OUT_DIR}`)
}

main().catch((error) => {
  console.error('Error al generar capturas QA:', error)
  process.exit(1)
})
