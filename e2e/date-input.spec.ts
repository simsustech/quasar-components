import { test, expect } from '@playwright/test'

test.describe('DateInput clear button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form/dateinput', { waitUntil: 'networkidle' })
  })

  test('clear button sets modelValue to null on first click (no ____-__-__ re-emit)', async ({
    page
  }) => {
    const field = page
      .getByTestId('date-input-clearable')
      .locator('.date-input-field')
    const inputs = field.locator('input.q-field__native')
    const clearIcon = field.locator('.q-field__append .cursor-pointer').first()
    const value = page.locator('#date2-value')
    const blurAway = page
      .getByTestId('date-input-plain')
      .locator('input')
      .first()

    await inputs.nth(0).fill('01')
    await inputs.nth(1).fill('12')
    await inputs.nth(2).fill('1999')
    await inputs.nth(2).blur()
    await expect(value).toHaveText('1999-12-01')

    await clearIcon.click() // FIRST clear
    await blurAway.click() // real blur -> lazy-rules validation
    await expect(value).toHaveText('') // modelValue === null, NOT '____-__-__'
    await expect(field).not.toHaveClass(/q-field--error/)

    await clearIcon.click() // SECOND clear (idempotent)
    await blurAway.click()
    await expect(value).toHaveText('')
    await expect(field).not.toHaveClass(/q-field--error/)
  })

  test('required field: first clear shows "Field is required." (null), not the format error', async ({
    page
  }) => {
    const field = page
      .getByTestId('date-input-required')
      .locator('.date-input-field')
    const inputs = field.locator('input.q-field__native')
    await inputs.nth(0).fill('15')
    await inputs.nth(1).fill('03')
    await inputs.nth(2).fill('2024')
    await inputs.nth(2).blur()
    await field.locator('.q-field__append .cursor-pointer').first().click()
    await page.getByTestId('date-input-plain').locator('input').first().click()
    // Quasar renders leave+enter clones of .q-field__messages during the message transition;
    // the entering clone (.last()) holds the current message.
    await expect(field.locator('.q-field__messages').last()).toHaveText(
      'Field is required.'
    )
  })
  test('manually deleting all characters clears modelValue to null (no stale partial)', async ({
    page
  }) => {
    const field = page
      .getByTestId('date-input-clearable')
      .locator('.date-input-field')
    const inputs = field.locator('input.q-field__native')
    const value = page.locator('#date2-value')
    const blurAway = page
      .getByTestId('date-input-plain')
      .locator('input')
      .first()

    await inputs.nth(0).fill('01')
    await inputs.nth(1).fill('12')
    await inputs.nth(2).fill('1999')
    await inputs.nth(2).blur()
    await expect(value).toHaveText('1999-12-01')

    await inputs.nth(0).fill('')
    await inputs.nth(1).fill('')
    await inputs.nth(2).fill('')
    await blurAway.click() // real blur -> lazy-rules validation
    await expect(value).toHaveText('') // modelValue === null, not a stale partial
    await expect(field).not.toHaveClass(/q-field--error/)
  })

  test('required field: manually deleting all characters shows "Field is required."', async ({
    page
  }) => {
    const field = page
      .getByTestId('date-input-required')
      .locator('.date-input-field')
    const inputs = field.locator('input.q-field__native')

    await inputs.nth(0).fill('15')
    await inputs.nth(1).fill('03')
    await inputs.nth(2).fill('2024')
    await inputs.nth(2).blur()

    await inputs.nth(0).fill('')
    await inputs.nth(1).fill('')
    await inputs.nth(2).fill('')
    await page.getByTestId('date-input-plain').locator('input').first().click()
    await expect(field.locator('.q-field__messages').last()).toHaveText(
      'Field is required.'
    )
  })
  test('opening the calendar on a cleared field does not warn about QDate modelValue', async ({
    page
  }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text())
      }
    })
    const field = page
      .getByTestId('date-input-clearable')
      .locator('.date-input-field')
    const inputs = field.locator('input.q-field__native')

    await inputs.nth(0).fill('01')
    await inputs.nth(1).fill('12')
    await inputs.nth(2).fill('1999')
    await inputs.nth(2).blur()
    await field.locator('.q-field__append .cursor-pointer').first().click() // clear
    await page.getByTestId('date-input-plain').locator('input').first().click()

    await field.locator('.q-field__append .cursor-pointer').nth(1).click() // open calendar
    await page.locator('.q-date').waitFor({ state: 'visible', timeout: 10_000 })
    await page.getByRole('button', { name: 'Close' }).click()
    await page.locator('.q-date').waitFor({ state: 'hidden' })

    const vueWarnings = warnings.filter((w) => /Vue warn|Invalid prop/.test(w))
    expect(vueWarnings).toEqual([])
  })
})
