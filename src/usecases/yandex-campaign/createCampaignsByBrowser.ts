import type { Campaign } from './types.js'
import { createCampaign } from './createCampaign.js'
import { startBrowser } from './startBrowser.js'

export async function createCampaignsByBrowser(logins: string[], campaigns: Campaign[], isStAgency = false) {
  const newCampaignLinks = []

  const login = isStAgency ? 'tech.dp.direct.elama.st' : 'tech.dp.direct.elama'

  await startBrowser(async (page) => {
    page.setDefaultTimeout(10000)

    for (const login of logins) {
      for (const campaign of campaigns) {
        console.log(`[${new Date().toLocaleTimeString('ru')}] Создание кампании...`, login, campaign.name)
        const href = await createCampaign(page, login, campaign)
        console.log(`[${new Date().toLocaleTimeString('ru')}] Создана кампания: ${href}`)
        newCampaignLinks.push({ name: `${login}-${campaign.name}`, href })
      }
    }
  }, login)
}
