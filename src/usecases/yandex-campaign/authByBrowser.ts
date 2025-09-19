import { authorize } from './authorize.js'
import { startBrowser } from './startBrowser.js'

export async function authByBrowser({ login, password }: { login: string, password: string }) {
  startBrowser(async (page) => {
    const result = await page.goto(`https://direct.yandex.ru/wizard/campaigns`)

    if (result?.url().includes('passport.yandex.ru')) {
      console.log(`[${new Date().toLocaleTimeString('ru')}] Начинаем авторизацию...`)
      await authorize(page, { login, password })
    } else {
      console.log(`[${new Date().toLocaleTimeString('ru')}] Пользователь уже авторизован`)
    }
  }, login.split('@')[0])
}
