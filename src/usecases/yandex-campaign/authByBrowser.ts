import puppeteer from 'puppeteer'
import { authorize } from './authorize.js'

const IS_SERVER = process.env.IS_SERVER === 'true'

export async function authByBrowser(isStAgency = false) {
  console.log(`[${new Date().toLocaleTimeString('ru')}] Запуск браузера...`)
  const browser = await puppeteer.launch({
    headless: IS_SERVER,
    defaultViewport: { width: 1400, height: 800 },
    userDataDir: `${process.cwd()}/puppeteer/tech-dp-direct${isStAgency ? '-st' : ''}-elama-data`,
    ...(IS_SERVER
      ? { executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox'] }
      : {}),
  })

  try {
    console.log(`[${new Date().toLocaleTimeString('ru')}] Открытие страницы...`)
    const page = await browser.newPage()

    const result = await page.goto(`https://direct.yandex.ru/wizard/campaigns`)

    if (result?.url().includes('passport.yandex.ru')) {
      console.log(`[${new Date().toLocaleTimeString('ru')}] Начинаем авторизацию...`)
      await authorize(page)
    } else {
      console.log(`[${new Date().toLocaleTimeString('ru')}] Пользователь уже авторизован`)
    }
  } finally {
    if (IS_SERVER) {
      await browser.close()
    }
  }
}
