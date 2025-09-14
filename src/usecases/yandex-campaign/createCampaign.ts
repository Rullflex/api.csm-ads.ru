import type { ElementHandle, Page } from 'puppeteer'
import type { Audience, Campaign, CampaignRecomendations, CampaignTarget, Sitelink } from './types.js'
import { sleep } from '@/shared/utils/sleep.js'

export async function createCampaign(page: Page, login: string, campaign: Campaign) {
  const result = await page.goto(`https://direct.yandex.ru/wizard/campaigns/new?ulogin=${login}`)

  if (result?.url().includes('passport.yandex.ru')) {
    throw new Error('Не авторизован')
    // await authorize(page)
  }

  await setUrl(page, campaign.fullUrl)

  await page.waitForSelector('[data-testid="CampaignFormUc"]', { visible: true, timeout: 60000 })
  await sleep(200)

  await changeTitle(page, campaign.name)

  await setCampaignTitles(page, campaign.titles)

  await setCampaignTexts(page, campaign.texts)

  await setImages(page, campaign.images)

  await setVideos(page, campaign.videos)

  await setSitelinks(page, campaign.sitelinks)

  await page.click('[data-testid="CampaignFormNeuralNetworkBanners.Switcher"]') // Отключает баннеры от нейросети

  await setRegions(page, campaign.regions)

  await setAudience(page, campaign.audience)

  await setCampaignTarget(page, campaign.campaignTarget)

  await setCampaignRecomendations(page, campaign.campaignRecomendations)

  await Promise.all([
    page.waitForNavigation({ timeout: 60000 }),
    page.click('button[data-testid="CampaignFormControls.save.button"]'),
  ])

  await sleep(1000) // Ждем полной прогрузки а то иначе почему-то не дает закрыть страницу, показывает алерт

  return page.url()
}

async function setUrl(page: Page, url: string) {
  await (await page.waitForSelector('[data-testid="CampaignFormUrl.Textinput"]'))?.click()
  await page.keyboard.type(url)
  await page.keyboard.press('Enter')
}

async function changeTitle(page: Page, title: string) {
  if (!title) {
    return
  }

  const editButton = await page.waitForSelector('[data-testid="CampaignHeader.EditName.Button"]', { visible: true })
  await editButton?.click()
  const inputElement = await page.waitForSelector('[data-testid="ModalEditTitle.CampaignName"]')
  await inputElement?.click({ clickCount: 3 })
  await page.keyboard.press('Backspace')
  await inputElement?.type(title)
  await (await page.waitForSelector('[data-testid="AcceptButton"]'))?.click()
  await sleep(200)
}

async function setCampaignTitles(page: Page, titles: string[]) {
  await clearElements(page, '[data-testid^="CampaignTitles"][data-testid$=".clear"][class*="visible"]')

  for (let i = 0; i < titles.length; i++) {
    await (await page.waitForSelector(`[data-testid="CampaignTitles${i}.textarea"]`))?.click()
    await page.keyboard.type(titles[i]).then(() => sleep(100))
  }
}

async function setCampaignTexts(page: Page, texts: string[]) {
  await clearElements(page, '[data-testid^="CampaignTexts"][data-testid$=".clear"][class*="visible"]')

  for (let i = 0; i < texts.length; i++) {
    await (await page.waitForSelector(`[data-testid="CampaignTexts${i}.textarea"]`))?.click()
    await page.keyboard.type(texts[i]).then(() => sleep(100))
  }
}

async function setImages(page: Page, images: string[]) {
  /* Требования: https://yandex.ru/support/direct/efficiency/images#campaign-master */
  const openButton = await page.waitForSelector(`[data-testid="ImageSuggestionsEditor.Open"]`, { visible: true })
  await clearElements(page, '[data-testid^="ImageSuggestionsEditor.CampaignContents.CloseButton"]')

  if (images?.length) {
    await openButton?.click()
    const uploadButton = await page.waitForSelector('[data-testid="ImageSuggestionsEditorModal.UploadZone.openFilePicker"]', { visible: true })

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      uploadButton?.click(),
    ])

    await fileChooser.accept(images)

    const saveButton = await page.waitForSelector('[data-testid="ImageSuggestionsEditorModal.Save"]')
    // Ждём, пока все загрузиться и кнопка станет активной (уберётся disabled)
    await page.waitForFunction(
      btn => !btn.hasAttribute('disabled'),
      {},
      saveButton,
    )
    await saveButton?.click()
    await sleep(500) // Ждем наверняка закрытия модалки
  }
}

async function setVideos(page: Page, videos: string[]) {
  /* Требования: https://yandex.ru/support/direct/ru/efficiency/video */
  const openButton = await page.waitForSelector(`[data-testid="VideoSuggestionsEditor.Open"]`, { visible: true })
  await clearElements(page, '[data-testid^="VideoSuggestionsEditor.CampaignContents.CloseButton"]')

  if (videos?.length) {
    await openButton?.click()
    const uploadButton = await page.waitForSelector('[data-testid="FileUploadButton"]', { visible: true })

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      uploadButton?.click(),
    ])

    await fileChooser.accept(videos)

    const saveButton = await page.waitForSelector('[data-testid="VideoSuggestionsEditor.Save"]')
    // Ждём, пока все загрузиться и кнопка станет активной (уберётся disabled)
    await page.waitForFunction(
      btn => !btn.hasAttribute('disabled'),
      {},
      saveButton,
    )
    await saveButton?.click()
    await sleep(500) // Ждем наверняка закрытия модалки
  }
}

async function setSitelinks(page: Page, sitelinks: Sitelink[]) {
  await clearElements(page, '[data-testid="Sitelink.remove"]')

  for (let i = 0; i < sitelinks.length; i++) {
    await (await page.waitForSelector(`[data-testid="SitelinkRow.href.textarea"]`))?.click()
    await page.keyboard.type(sitelinks[i].href)
    await (await page.waitForSelector(`[data-testid="SitelinkRow.name.textarea"]`))?.click()
    await page.keyboard.type(sitelinks[i].name)
    await (await page.waitForSelector(`[data-testid="SitelinkRow.description.textarea"]`))?.click()
    await page.keyboard.type(sitelinks[i].description)

    await sleep(100)

    if (i !== sitelinks.length - 1) {
      await page.click(`[data-testid="CampaignFormSitelinks.button"]`)
    }

    await sleep(100)
  }
}

async function setRegions(page: Page, regions: string) {
  await (await page.waitForSelector(`[data-testid="GroupRegionsTree.Regions"]`))?.click()
  await page.keyboard.type(regions)
  await page.keyboard.press('Enter')
  await page.click('[data-testid="CampaignFormAuditory"]', { offset: { x: 10, y: 10 } }) // Сбрасываем фокус
  await sleep(200)
}

async function setAudience(page: Page, audience: Audience) {
  await page.click('[data-testid="SettingsModeEditor.Select"]')
  await (await page.waitForSelector(`[data-testid="SettingsModeEditor.Select.ListBox.${audience.type}"]`, { visible: true }))?.click()

  if (audience.type === 'AUTO')
    return

  await (await page.waitForSelector('[data-testid="AgeAndGenderEditor.GenderSelect"]', { visible: true }))?.click()
  await (await page.waitForSelector(`[data-testid="AgeAndGenderEditor.GenderSelect.ListBox.${audience.gender}"]`, { visible: true }))?.click()

  await (await page.waitForSelector('[data-testid="AgeAndGenderEditor.AgeFromSelect"]', { visible: true }))?.click()
  await (await page.waitForSelector(`[data-testid="AgeAndGenderEditor.AgeFromSelect.ListBox.${audience.ageFrom}"]`, { visible: true }))?.click()

  await (await page.waitForSelector('[data-testid="AgeAndGenderEditor.AgeToSelect"]', { visible: true }))?.click()
  await (await page.waitForSelector(`[data-testid="AgeAndGenderEditor.AgeToSelect.ListBox.${audience.ageTo}"]`, { visible: true }))?.click()

  if (audience.negativeKeywords?.length) {
    await (await page.waitForSelector('[data-testid="InterestsAndExceptionsEditor.AddExceptionsButton"]'))?.click()
    await (await page.waitForSelector('[data-testid="ExceptionsEditor.TagGroup"]'))?.click()
    for (const negativeKeyword of audience.negativeKeywords) {
      await page.keyboard.type(negativeKeyword)
      await page.keyboard.press('Enter')
    }
  }

  if (audience.interests?.length) {
    await (await page.waitForSelector('[data-testid="CustomAudienceAndSearchTermsEditor.TagGroup"]'))?.click()
    for (const interest of audience.interests) {
      await page.keyboard.type(interest)
      await page.keyboard.press('Enter')
    }
  }

  await (await page.waitForSelector('[data-testid="DeviceEditor.Select"]', { visible: true }))?.click()
  await page.waitForSelector('[data-testid="DeviceEditor.Select.Popup"]', { visible: true })
  for (const device of ['mobile', 'desktop', 'tablet']) {
    const isDeviceSelected = audience.devices.includes(device as Audience['devices'][0])

    if (!isDeviceSelected) {
      await (await page.waitForSelector(`[data-testid="DeviceEditor.Select.ListBox.${device}"]`, { visible: true }))?.click()
    }
  }
}

async function setCampaignTarget(page: Page, campaignTarget: CampaignTarget) {
  await page.click('[data-testid="CampaignTargetSelect.TargetSelect"]')
  await (await page.waitForSelector(`[data-testid="CampaignTargetSelect.TargetSelect.ListBox.${campaignTarget.type}"]`, { visible: true }))?.click()

  if (campaignTarget.type === 'INVOLVED_CONVERSION') {
    // Счетчики Яндекс Метрики
    const removeButtonSelector = '[data-testid^="MetrikaCountersTagGroup.tag."][data-testid$=".close"]'
    let { length } = await page.$$(removeButtonSelector)
    while (length--) {
      // Толком до конца сам не понимаю зачем надо наводить и ждать, но без этого не удаляются нормально
      await page.hover(removeButtonSelector)
      await sleep(500)
      await page.click(removeButtonSelector)
    }

    await (await page.waitForSelector('[data-testid="MetrikaCountersTagGroup"]'))?.click() // или MetrikaCountersTagGroup.Expander если есть уже теги
    for (const counter of campaignTarget.metrikaCounters) {
      await page.keyboard.type(String(counter))
      await page.keyboard.press('Enter')
    }

    // Целевые действия - TargetActions
    await sleep(2000) // ждем возможной подгрузки значений
    await clearElements(page, '[data-testid^="TargetActions.OTHER."][data-testid$=".CloseButton"]')

    await (await page.waitForSelector('[data-testid="TargetActions.OTHER.AddTargetButton"]'))?.click()
    // const selectSearchInput = await page.waitForSelector('[data-testid="SelectSearchTargetInput"]', { visible: true })

    for (const targetAction of campaignTarget.targetActions) {
      // await selectSearchInput?.type(targetAction.name)
      await (await page.waitForSelector(`[data-testid="AddTargetAction.OTHER.${targetAction.metricaId}"]`))?.click()

      const priceInput = await page.waitForSelector(`[data-testid="TargetActions.OTHER.${targetAction.metricaId}.PriceInput"]`)

      // Тут особый прикол с этим инпутом и возможностью стереть значения. Проблема в том что если первое стирание не происходит =)))
      await sleep(300)
      await clearInput(priceInput!)
      await sleep(300)
      await clearInput(priceInput!)

      // await clearInput(page, `[data-testid="TargetActions.OTHER.${targetAction.metricaId}.PriceInput"]`)
      await priceInput?.type(targetAction.price.toString())
    }

    await page.click('[data-testid="TargetActions"]', { offset: { x: 10, y: 10 } })
    await sleep(300) // Ждем наверняка закрытия селекта
  } else {
    await (await page.waitForSelector('[data-testid="CampaignTargetSelect.StrategySelect"]'))?.click()
    await (await page.waitForSelector(`[data-testid="CampaignTargetSelect.StrategySelect.ListBox.${campaignTarget.priceStrategy}"]`, { visible: true }))?.click()

    if (campaignTarget.priceStrategy === 'AVG_PRICE') {
      await (await page.waitForSelector('[data-testid="CampaignTargetSelect.PriceInput"]'))?.type(campaignTarget.price.toString())
    }
  }

  await (await page.waitForSelector('[data-testid^="BudgetWithSuggest.MultiButton.custom"]'))?.click()
  const weeklyBudgetInput = await page.waitForSelector('[data-testid="BudgetWithSuggest.PriceTextInput"]')
  await clearInput(weeklyBudgetInput!)
  weeklyBudgetInput?.type(campaignTarget.weeklyBudget.toString())
}

async function setCampaignRecomendations(page: Page, campaignRecomendations: CampaignRecomendations) {
  const acceptRecommendationsCheckbox = await page.$(`[data-testid="CampaignRecommendationsEditor.AcceptRecommendations"][data-checked="${!campaignRecomendations.acceptRecommendations}"]`)
  await acceptRecommendationsCheckbox?.hover() // Опять же, сам не понимаю зачем нужно наводить, но без этого не работает
  await sleep(100)
  await acceptRecommendationsCheckbox?.click()

  if (campaignRecomendations.acceptRecommendations) {
    const acceptAdditionalRecommendationsCheckbox = await page.$(`[data-testid="CampaignRecommendationsEditor.AcceptAdditionalRecommendationsCheckbox"][data-checked="${!campaignRecomendations.acceptAdditionalRecommendations}"]`)
    await acceptAdditionalRecommendationsCheckbox?.hover()
    await sleep(100)
    await acceptAdditionalRecommendationsCheckbox?.click()
  }

  const enableAlternativeTextsCheckbox = await page.$(`[data-testid="CampaignRecommendationsEditor.EnableAlternativeTexts"][data-checked="${!campaignRecomendations.enableAlternativeTexts}"]`)
  await enableAlternativeTextsCheckbox?.hover()
  await sleep(100)
  await enableAlternativeTextsCheckbox?.click()
}

async function clearElements(page: Page, selector: string) {
  let clearEl: ElementHandle | null = null

  do {
    clearEl = await page.$(selector)

    if (clearEl) {
      await clearEl.evaluate(el => el.scrollIntoView())
      await clearEl.click()
    }
  } while (clearEl)
}

async function clearInput(element: ElementHandle) {
  await element.evaluate((el) => {
    el.value = ''
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
