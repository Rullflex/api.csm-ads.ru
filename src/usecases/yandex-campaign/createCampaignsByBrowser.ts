import type { Campaign } from './types.js'
import puppeteer from 'puppeteer'
import { createCampaign } from './createCampaign.js'

const IS_SERVER = process.env.IS_SERVER === 'true'

export async function createCampaignsByBrowser(logins: string[], campaigns: Campaign[], isStAgency = false) {
  const browser = await puppeteer.launch({
    headless: IS_SERVER,
    defaultViewport: { width: 1920, height: 1080 },
    userDataDir: `${process.cwd()}/puppeteer/tech-dp-direct${isStAgency ? '-st' : ''}-elama-data`,
    ...(IS_SERVER
      ? { executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox'] }
      : {}),
  })

  const newCampaignLinks = []

  try {
    const page = await browser.newPage()
    page.setDefaultTimeout(60000)

    for (const login of logins) {
      for (const campaign of campaigns) {
        const href = await createCampaign(page, login, campaign)
        newCampaignLinks.push({ name: `${login}-${campaign.name}`, href })
      }
    }
  } finally {
    await browser.close()
  }

  return newCampaignLinks
}
