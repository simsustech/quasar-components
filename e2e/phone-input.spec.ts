import { test, expect, type Page } from '@playwright/test'

const URL = '/form/telephonenumber'

const field = (page: Page, testId: string) =>
  page.getByTestId(testId).locator('.phone-input-field')

/**
 * The text input, not the dial-code select's own input: QSelect renders a
 * control container of its own inside the outer field's `#prepend`, so a
 * descendant selector matches both. The direct-child chain does not.
 */
const phoneInput = (page: Page, testId: string) =>
  page
    .getByTestId(testId)
    .locator('.q-field__control > .q-field__control-container > input')

const blurAway = async (page: Page) => {
  await page.getByTestId('phone-model').click()
}

test.describe('QTelephoneNumber', () => {
  test('the prepend select opens the countries prop, and an empty required field shows no error while it is open', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const required = field(page, 'phone-required')
    const menu = page.locator('.q-menu')

    await required.locator('.phone-dial-select').click()
    await expect(menu).toBeVisible()
    await expect(menu.locator('.q-item')).toHaveText([
      /Netherlands/,
      /Germany/,
      /Belgium/,
      /France/
    ])

    // The prepend-blur trap: opening the dial-code popup must not blur the outer
    // field into a "Field is required." error.
    await expect(required).not.toHaveClass(/q-field--error/)
    // An empty `.q-field__messages` exists whenever the field has rules; only
    // its `[role="alert"]` children mark the error state.
    await expect(
      required.locator('.q-field__messages [role="alert"]')
    ).toHaveCount(0)

    // Positive control: both assertions above are negatives, so on their own
    // they cannot tell "no error because the popup owns focus" apart from a
    // field whose validation never runs. Close the popup, then blur for real.
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await blurAway(page)

    await expect(required).toHaveClass(/q-field--error/)
    await expect(
      required.locator('.q-field__messages [role="alert"]')
    ).toHaveText('Field is required.')
  })

  /*
   * The popup opens with the `countries` prop, but a search reaches every
   * country the metadata knows: a company that serves three countries still
   * gets a German or Spanish number typed into its form.
   */
  test('typing +34 reaches a country the passed list does not carry', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const select = plain.locator('.phone-dial-select')
    const menu = page.locator('.q-menu')

    await select.click()
    await expect(menu.locator('.q-item')).toHaveText([
      /Netherlands/,
      /Germany/,
      /Belgium/,
      /France/
    ])

    await select.locator('input').pressSequentially('+34')
    await expect(menu.locator('.q-item')).toHaveText([/Spain/])
    await menu.locator('.q-item', { hasText: 'Spain' }).click()

    await expect(menu).toBeHidden()
    await expect(plain.locator('.phone-dial-code')).toHaveText('+34')
    await expect(page.getByTestId('phone-model')).toContainText('country: ES')
  })

  test('a dial code without the plus and a country name both narrow the same list', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const select = plain.locator('.phone-dial-select')
    const menu = page.locator('.q-menu')

    await select.click()
    await select.locator('input').pressSequentially('32')
    await expect(menu.locator('.q-item')).toHaveText([/Belgium/])
    await menu.locator('.q-item', { hasText: 'Belgium' }).click()
    await expect(plain.locator('.phone-dial-code')).toHaveText('+32')

    // Closing the popup drops the query, so it reopens on the passed list.
    await select.click()
    await expect(menu.locator('.q-item')).toHaveCount(4)
    await select.locator('input').pressSequentially('spa')
    await expect(menu.locator('.q-item')).toHaveText([/Spain/])
  })

  test('typing replaces the chip instead of stacking on it', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const select = plain.locator('.phone-dial-select')
    await expect(select.locator('.phone-dial-code')).toHaveText('+31')

    await select.click()
    await select.locator('input').pressSequentially('33')

    // An input-enabled select renders the chip and the input at once: the field
    // read `+31 +33` before the chip was made to yield to the query.
    await expect(select.locator('.phone-dial-code')).toHaveCount(0)
    await expect(select.locator('input')).toHaveValue('33')
    await expect(page.locator('.q-menu .q-item')).toHaveText([/France/])
  })

  /*
   * A theme styles `.q-field__native`; a select's search box is
   * `.q-field__input`, which no theme reaches, so it kept the browser's 13.3px
   * Arial while the chip next to it was the field's own font.
   */
  test('the search box reads in the same font as the chip', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const select = plain.locator('.phone-dial-select')
    const font = (locator: ReturnType<typeof select.locator>) =>
      locator.evaluate((el) => {
        const style = getComputedStyle(el)
        return `${style.fontSize} ${style.fontFamily}`
      })

    const chip = await font(select.locator('.phone-dial-code'))
    const search = await font(select.locator('input'))
    expect(search).toBe(chip)

    // Typing must not change it either.
    await select.click()
    await select.locator('input').pressSequentially('33')
    expect(await font(select.locator('input'))).toBe(chip)
  })

  test('the search box does not widen the prepend past the chip', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const select = plain.locator('.phone-dial-select')
    const box = async (locator = select) => (await locator.boundingBox())!.width

    // A bare select input asks for 20 characters: the prepend measured 289px
    // when the search was added, in a field that is 420px wide.
    const idle = await box()
    expect(idle).toBeLessThan(160)

    // The typed part grows with the query, which is how the digits stay
    // visible; the chip it replaces is wider than a short query, so the select
    // itself is not expected to grow here.
    await select.click()
    const input = select.locator('input')
    const empty = await box(input)
    await input.pressSequentially('duitsland')
    expect(await box(input)).toBeGreaterThan(empty)
    expect(await box()).toBeLessThan(200)
  })

  /*
   * A form that offers three countries can still be typed into for any of the
   * 245, so the flags cannot come with the CSS: each one is a URL the browser
   * asks for. What bounds that is the length of the rendered list — a 245-row
   * lazy list fetched 173 images in Chromium and 46 in Firefox, a 12-row one
   * fetched 12 in both — so a query never renders more than the popup shows.
   */
  test('a query renders at most one popup of flags', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const block = field(page, 'phone-flags')
    const select = block.locator('.phone-dial-select')
    const chip = select.locator('.phone-dial-code img.phone-flag')

    // The chip is on screen, so its flag is asked for at once.
    await expect(chip).toHaveAttribute('src', /^data:image\/svg\+xml/)
    await expect(chip).toHaveAttribute('src', /NL/)

    // A list with `icon`s keeps them: the flag URL is the fallback.
    await expect(
      field(page, 'phone-plain').locator('.phone-dial-code img.phone-flag')
    ).toHaveCount(0)

    // `+3` matches 36 countries; the popup renders the first 12 of them.
    await select.click()
    await select.locator('input').pressSequentially('+3')
    await expect(page.locator('.q-menu .q-item')).toHaveCount(12)
    await expect(page.locator('.q-menu .q-item img.phone-flag')).toHaveCount(12)

    // Narrowing to one country leaves one flag.
    await select.locator('input').pressSequentially('4')
    await expect(page.locator('.q-menu .q-item')).toHaveCount(1)
    await expect(page.locator('.q-menu .q-item img.phone-flag')).toHaveAttribute(
      'src',
      /ES/
    )
  })

  test('a query that is not picked does not survive the popup closing', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const select = plain.locator('.phone-dial-select')
    const chip = select.locator('.phone-dial-code')

    await select.click()
    await select.locator('input').pressSequentially('+33')
    await expect(chip).toHaveCount(0)

    // A click elsewhere closes the popup without clearing Quasar's own input,
    // so the chip came back beside the query and the field read `+31 +33`.
    await phoneInput(page, 'phone-required').click()
    await expect(page.locator('.q-menu')).toBeHidden()
    await expect(select.locator('input')).toHaveValue('')
    await expect(chip).toHaveText('+31')

    // Escape is the other way out, and it lands in the same state.
    await select.click()
    await select.locator('input').pressSequentially('+33')
    await page.keyboard.press('Escape')
    await expect(select.locator('input')).toHaveValue('')
    await expect(chip).toHaveText('+31')
  })

  test('choosing Germany closes the menu and the chip reads +49', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    await expect(plain.locator('.phone-dial-code')).toHaveText('+31')

    await plain.locator('.phone-dial-select').click()
    const menu = page.locator('.q-menu')
    await expect(menu).toBeVisible()
    await menu.locator('.q-item', { hasText: 'Germany' }).click()

    await expect(menu).toBeHidden()
    await expect(plain.locator('.phone-dial-code')).toHaveText('+49')
    // The default country is NL, so `DE` in the readout can only come from
    // `update:country` actually firing.
    await expect(page.getByTestId('phone-model')).toContainText('country: DE')
  })

  test('612345678 + blur is valid and emits E.164 with a trunk-free national display', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const input = phoneInput(page, 'phone-plain')
    await input.fill('612345678')
    await blurAway(page)

    await expect(plain).not.toHaveClass(/q-field--error/)
    await expect(page.getByTestId('phone-model')).toContainText('+31612345678')
    // The visible text loses the trunk `0`: the prepend already shows `+31`.
    await expect(input).toHaveValue('6 12345678')
  })

  test('0612345678 + blur drops the leading 0 and emits E.164', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const input = phoneInput(page, 'phone-plain')
    await input.fill('0612345678')
    await blurAway(page)

    await expect(plain).not.toHaveClass(/q-field--error/)
    await expect(input).toHaveValue('6 12345678')
    await expect(page.getByTestId('phone-model')).toContainText('+31612345678')
  })

  test('123 + blur shows exactly one validation message', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    await phoneInput(page, 'phone-plain').fill('123')
    await blurAway(page)

    await expect(plain).toHaveClass(/q-field--error/)
    // `.q-field__messages` is rendered whenever the field has rules, so the
    // count has to target the alerts it holds.
    const alerts = plain.locator('.q-field__messages [role="alert"]')
    await expect(alerts).toHaveCount(1)
    await expect(alerts).toHaveText('Invalid phone number.')
  })

  test('correcting a displayed error clears it without another blur', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const plain = field(page, 'phone-plain')
    const input = phoneInput(page, 'phone-plain')

    await input.fill('123')
    await blurAway(page)
    await expect(plain.locator('.q-field__messages')).toHaveText(
      'Invalid phone number.'
    )

    // lazy-rules re-validates on model change while an error is displayed.
    await input.fill('612345678')
    await expect(plain).not.toHaveClass(/q-field--error/)
    await expect(
      plain.locator('.q-field__messages [role="alert"]')
    ).toHaveCount(0)
  })

  /*
   * Section 6 risk 3: the composite must not grow. The dial-code select is
   * borderless and hidden below the outer field's own frame, so the field keeps
   * the height of the style token instead of adding a second control's worth of
   * padding. The chain starts at the field root, so it picks the outer control
   * and not the select's own control nested in the prepend.
   */
  test('the dial-code prepend does not make the field taller than the plain field', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    const controlHeight = async (testId: string) => {
      const box = await page
        .getByTestId(testId)
        .locator('.phone-input-field > .q-field__inner > .q-field__control')
        .boundingBox()
      if (!box) throw new Error(`${testId} has no field control box`)
      return box.height
    }

    const plain = await controlHeight('phone-plain')
    const required = await controlHeight('phone-required')

    expect(Math.abs(plain - required)).toBeLessThanOrEqual(0.5)
    expect(plain).toBeLessThanOrEqual(56.5)
    expect(required).toBeLessThanOrEqual(56.5)
  })

  /*
   * The defect: the flag, the code and the arrow each sat on a different line —
   * the code in the value band, the arrow centred in the control, the flag on
   * neither — so the prepend looked broken next to the typed number. The value
   * line is read from the outer input's computed box, so this follows the active
   * style instead of pinning today's pixel.
   */
  test('flag, dial code and dropdown arrow share the input value line, empty and filled', async ({
    page
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' })

    type Box = { top: number; height: number; centre: number }
    interface Geometry {
      value: number
      code: Box | null
      flag: Box | null
      arrow: Box | null
    }

    const geometry = async (testId: string): Promise<Geometry> =>
      await page.evaluate((id) => {
        const root = document.querySelector(
          `[data-testid="${id}"] .phone-input-field`
        )
        if (root === null) throw new Error(`${id} has no field`)
        const box = (selector: string) => {
          const element = root.querySelector(selector)
          if (element === null) return null
          const rect = element.getBoundingClientRect()
          return {
            top: rect.top,
            height: rect.height,
            centre: rect.top + rect.height / 2
          }
        }
        const input = root.querySelector(
          ':scope > .q-field__inner > .q-field__control > .q-field__control-container > input'
        )
        if (input === null) throw new Error(`${id} has no input`)
        const style = getComputedStyle(input)
        const rect = input.getBoundingClientRect()
        const padTop = Number.parseFloat(style.paddingTop)
        const padBottom = Number.parseFloat(style.paddingBottom)
        return {
          value: rect.top + padTop + (rect.height - padTop - padBottom) / 2,
          code: box('.phone-dial-code'),
          flag: box('.phone-dial-code .q-icon'),
          arrow: box('.q-select__dropdown-icon')
        }
      }, testId)

    const expectOnValueLine = (state: string, at: Geometry) => {
      expect(at.code, `${state}: dial code is rendered`).not.toBeNull()
      expect(at.flag, `${state}: flag is rendered`).not.toBeNull()
      expect(at.arrow, `${state}: dropdown arrow is rendered`).not.toBeNull()
      expect(
        Math.abs(at.code!.centre - at.value),
        `${state}: code ${at.code!.centre} vs value ${at.value}`
      ).toBeLessThanOrEqual(1.5)
      expect(
        Math.abs(at.flag!.centre - at.value),
        `${state}: flag ${at.flag!.centre} vs value ${at.value}`
      ).toBeLessThanOrEqual(1.5)
      expect(
        Math.abs(at.arrow!.centre - at.value),
        `${state}: arrow ${at.arrow!.centre} vs value ${at.value}`
      ).toBeLessThanOrEqual(1.5)
    }

    // Empty: the label is stacked, so there is no resting label beside the value.
    expectOnValueLine('empty', await geometry('phone-plain'))

    // Focused but still empty, which is when Material moves the label.
    await phoneInput(page, 'phone-plain').focus()
    expectOnValueLine('focused', await geometry('phone-plain'))

    // Filled, still focused, and after the blur that reformats the number.
    await phoneInput(page, 'phone-plain').fill('612345678')
    expectOnValueLine('filled', await geometry('phone-plain'))
    await blurAway(page)
    expectOnValueLine('blurred', await geometry('phone-plain'))

    // The other field shape a consumer may pick: `outlined` is a different
    // control than the standard field above, and the one a form usually wants.
    expectOnValueLine('outlined empty', await geometry('phone-outlined'))
    await phoneInput(page, 'phone-outlined').fill('612345678')
    await blurAway(page)
    expectOnValueLine('outlined filled', await geometry('phone-outlined'))
  })

  test('?value=0612345678 and ?value=+31612345678 both hydrate to 6 12345678 / +31612345678', async ({
    page
  }) => {
    // A literal `+` in a query string decodes to a space, so it has to be encoded.
    for (const stored of ['0612345678', encodeURIComponent('+31612345678')]) {
      await page.goto(`${URL}?value=${stored}`, { waitUntil: 'networkidle' })

      await expect(phoneInput(page, 'phone-plain')).toHaveValue('6 12345678')
      await expect(
        field(page, 'phone-plain').locator('.phone-dial-code')
      ).toHaveText('+31')
      await expect(page.getByTestId('phone-model')).toContainText(
        'model: +31612345678 | country: NL'
      )
      await expect(field(page, 'phone-plain')).not.toHaveClass(/q-field--error/)
    }
  })
})
