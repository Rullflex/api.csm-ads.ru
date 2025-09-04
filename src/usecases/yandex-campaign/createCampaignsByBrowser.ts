import type { Campaign } from './types.js'
import puppeteer from 'puppeteer'
import { authorize } from './authorize.js'
import { createCampaign } from './createCampaign.js'

const IS_SERVER = process.env.IS_SERVER === 'true'

export async function createCampaignsByBrowser(logins: string[], campaigns: Campaign[]) {
  const browser = await puppeteer.launch({
    headless: IS_SERVER,
    userDataDir: `${process.cwd()}/user_data`,
    ...(IS_SERVER
      ? { executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox'] }
      : {}),
  })

  const page = await browser.newPage()
  const result = await page.goto('https://direct.yandex.ru', { timeout: 60000 })

  if (result?.url().includes('passport.yandex.ru')) {
    await authorize(page)
  }

  const newCampaignLinks = []

  for (const login of logins) {
    for (const campaign of campaigns) {
      const url = await createCampaign(page, login, campaign)
      newCampaignLinks.push(url)
    }
  }

  await browser.close()

  return newCampaignLinks
}
