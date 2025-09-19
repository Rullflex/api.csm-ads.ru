import type { Page } from 'puppeteer'
import { sleep } from '../../shared/utils/sleep.js'
import { YANDEX_LOGIN, YANDEX_PASSWORD } from './const.js'

// enum PasspPages {
//   LOGIN = 'page\\:add-account',
//   PASSWORD = 'page\\:welcome',
//   CODE = 'page\\:auth-challenge',
//   УГРОЗА_ВЗЛОМА = 'page\\:change-password',
// }

export async function authorize(page: Page) {
  // page\\:add-account
  const loginField = await page.waitForSelector('#passp-field-login')
  await loginField?.type(YANDEX_LOGIN)
  await page.keyboard.press('Enter')

  // TODO иногда просит qr код, тут лучше просто перезапускать а не ждать 5 минут

  // page\\:welcome
  const passwdField = await page.waitForSelector('#passp-field-passwd')
  await passwdField?.type(YANDEX_PASSWORD)
  await page.keyboard.press('Enter')

  // TODO иногда может не запросить доп подтверждение и пройти авторизацию без ввода кодов

  // page\\:auth-challenge

  const toggleChallengeButton = await page.waitForSelector('#passp\\:toggle-challenge', { timeout: 3000 }).catch() // ждем пока не появится поле для ввода кода или не выйдет таймаут

  if (toggleChallengeButton) {
    console.log('Нажимаем на ссылку "Другой способ подтверждения"')
    await sleep(300) // если он находит ссылку то она почему-то не сразу кликабельна а через время
    await toggleChallengeButton.click()
  }

  await sleep(3000)

  // Безопасный вход
  // Нажмите кнопку «Подтвердить», если вы можете принять звонок или сообщение на указанный номер. Это нужно для завершения входа.
  await (await page.waitForSelector('button[data-t="button\\:action"]', { timeout: 5000 }))?.click()

  await sleep(500)
  const smsCodeButton = await page.$('button[data-t="button\\:default\\:retry-to-request-code"]')

  if (smsCodeButton) {
    console.log('Похоже, что звонок не подходит, запрашиваем СМС')
    await sleep(70000) // ждем минуту
    await smsCodeButton.click()
  }

  await page.waitForSelector('#passp-field-phoneCode')

  const code = await getAuthCode()

  for (const digit of code) {
    await page.keyboard.type(digit)
  }

  await Promise.all([
    page.waitForNavigation(),
    page.click('button[data-t="button:action"]'),
    // TODO иногда после предлагает вход по лицу или отпечатку page.click('button[data-t="button:pseudo"]'),
  ])
}

function getAuthCode() {
  return new Promise<string>((resolve) => {
    process.stdout.write('Введите код: ')
    process.stdin.on('data', (data) => {
      const code = data.toString().trim()
      resolve(code)
    })
  })
}

// const toggleButton = await page.waitForSelector('#passp\\:toggle-challenge')
//   if (toggleButton) {
//     const isVisible = await toggleButton.isVisible()
//     const box = await toggleButton.boundingBox()

//     console.log('Состояние кнопки toggle-challenge:')
//     console.log('Видимость:', isVisible)
//     console.log('Положение:', box)

//     // Получим состояние кнопки и проверим перекрывающие элементы
//     const buttonState = await page.evaluate((selector) => {
//       const element = document.querySelector(selector)
//       if (!element)
//         return null

//       const rect = element.getBoundingClientRect()
//       const x = rect.left + rect.width / 2
//       const y = rect.top + rect.height / 2

//       const elementAtPoint = document.elementFromPoint(x, y)

//       return {
//         isEnabled: !element.hasAttribute('disabled'),
//         isHidden: window.getComputedStyle(element).display === 'none',
//         elementAtPoint: elementAtPoint
//           ? {
//               tagName: elementAtPoint.tagName,
//               id: elementAtPoint.id,
//               className: elementAtPoint.className,
//             }
//           : null,
//         isIntercepted: element !== elementAtPoint,
//       }
//     }, '#passp\\:toggle-challenge')

//     console.log('Дополнительное состояние кнопки:', buttonState)

//     if (buttonState?.isIntercepted) {
//       console.log('Внимание: кнопка перекрыта другим элементом!')
//     }

//     await toggleButton.click()
//   } else {
//     console.log('Кнопка toggle-challenge не найдена')
//   }

// Введите последние 6 цифр входящего номера
// звонок а не смс
// <button data-t="button:default:retry-to-request-code" type="button" class="Button2 Button2_size_xxl Button2_view_contrast-default Button2_width_max" autocomplete="off"><span class="Button2-Text"><span aria-hidden="true">Выслать СМС</span>  <span class="phone-confirmation-timer" aria-label="Повторно код можно будет отправить через 00:00:00">00:41</span></span></button>

// <button data-t="button:action" type="submit" class="Button2 Button2_size_xxl Button2_view_contrast-action Button2_width_max Button2_type_submit" autocomplete="off"><span class="Button2-Text">Подтвердить</span></button>
