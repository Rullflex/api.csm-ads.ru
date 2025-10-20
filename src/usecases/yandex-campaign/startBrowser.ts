import type { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer'

const IS_SERVER = process.env.IS_SERVER === 'true'

export async function startBrowser(action: (page: Page, browser: Browser) => Promise<void>, login?: string) {
  console.log(`[${new Date().toLocaleTimeString('ru')}] Запуск браузера...`)
  const browser = await puppeteer.launch({
    headless: IS_SERVER,
    defaultViewport: { width: 1400, height: 800 },
    userDataDir: login,
  })

  try {
    console.log(`[${new Date().toLocaleTimeString('ru')}] Открытие страницы...`)
    const page = await browser.newPage()
    await action(page, browser)
  } finally {
    if (IS_SERVER) {
      await browser.close()
    }
  }
}
