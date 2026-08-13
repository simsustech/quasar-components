import { expect, test } from '@playwright/test'

test('dev app boots and serves the dateinput page', async ({ page }) => {
  await page.goto('/form/dateinput', { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle('App')
})
