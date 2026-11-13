import { test, expect, type Locator, type Page } from '@playwright/test'

/**
 * `QLocation` as an operator meets it: the address card is the question and the
 * map is the confirmation, the basemap credit is visible without interaction,
 * and a pin move reaches a settled state instead of spinning forever.
 *
 * The dev page mounts the component with its default Photon geocoder and the
 * default OpenFreeMap style, so these assertions cover what a consumer gets
 * without passing a prop.
 *
 * Navigation is `domcontentloaded`, not the suite's usual `networkidle`: a map
 * fetches tiles, glyphs and sprites for as long as it is on screen, so the
 * network never goes idle. The map is ready when its canvas is.
 *
 * Photon may be slow or absent. Every assertion below is therefore about the
 * settled state — no spinner, an outcome on screen — never about which address
 * came back.
 */
const map = (page: Page) => page.getByTestId('location-map')

/**
 * An overlay's text must differ from its own background. Asserting the token
 * would pin today's palette; asserting the pair catches the real failure — a
 * theme where the colour token resolves to the surface.
 */
const expectNotWhiteOnWhite = async (target: Locator) => {
  const pair = await target.evaluate((element) => {
    const style = getComputedStyle(element)
    return { color: style.color, background: style.backgroundColor }
  })
  expect(pair.color, `${pair.color} on ${pair.background}`).not.toBe(
    pair.background
  )
}
const search = (page: Page) => page.getByTestId('location-search')
const expand = (page: Page) => page.getByTestId('location-expand')

/** The map is behind a disclosure now, so every test that wants a canvas opens it. */
const openMap = async (page: Page) => {
  await expand(page).locator('.q-item').first().click()
}
const address = (page: Page) => page.getByTestId('location-address')
const credit = (page: Page) => page.getByTestId('location-attribution')

test.describe('QLocation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/general/locationmap', { waitUntil: 'domcontentloaded' })
    await openMap(page)
    // The component only draws its overlays once MapLibre has a style.
    await map(page)
      .locator('canvas')
      .waitFor({ state: 'visible', timeout: 45_000 })
    // MapLibre has a style once the component drops its own loading overlay.
    await expect(page.locator('.q-location__canvas-placeholder')).toHaveCount(0)
  })

  /*
   * The address is the question and the map is the confirmation, so a form gets
   * the fields first and the basemap only when it is asked for. A map that
   * mounts anyway would cost a tile request per form that never opens it.
   */
  test('keeps the map behind a collapsed disclosure and mounts it on open', async ({
    page
  }) => {
    await page.goto('/general/locationmap', { waitUntil: 'domcontentloaded' })

    await expect(address(page)).toBeVisible()
    await expect(expand(page)).toBeVisible()
    await expect(map(page)).toHaveCount(0)
    await expect(page.locator('.maplibregl-canvas')).toHaveCount(0)

    await openMap(page)
    await expect(map(page).locator('canvas')).toHaveCount(1, {
      timeout: 45_000
    })

    // Collapsing keeps the map: reopening must not fetch the tiles again.
    await openMap(page)
    await expect(map(page).locator('canvas')).toHaveCount(1)
  })

  test('draws the address card above the map', async ({ page }) => {
    const card = await address(page).boundingBox()
    const canvas = await map(page).boundingBox()
    expect(card, 'address card is rendered').not.toBeNull()
    expect(canvas, 'map is rendered').not.toBeNull()
    expect(card!.y + card!.height).toBeLessThanOrEqual(canvas!.y)
  })

  test('shows the basemap credit without hover or click', async ({ page }) => {
    await expect(credit(page)).toBeVisible()
    // Visible text, not a tooltip: the licence needs the credit on screen.
    await expect(credit(page)).toContainText('OpenStreetMap')
    await expect(credit(page)).toContainText('OpenMapTiles')
    await expect(
      credit(page).getByRole('link', { name: /OpenStreetMap/ })
    ).toBeVisible()
    // This page ships the Material Icons font, so an `icon="info_outline"`
    // button would have painted a glyph here and the text assertion alone
    // would pass on the old code. Assert the shape instead: the credit is
    // text, and nothing in it is an icon, a button or a tooltip.
    await expect(
      credit(page).locator('.q-icon, .q-btn, .q-tooltip')
    ).toHaveCount(0)
    // Legible, not merely present: in an MD3 theme `--q-dark` is a surface
    // tone, so a credit coloured with it can be white on white — invisible, and
    // a licence problem rather than a cosmetic one.
    await expectNotWhiteOnWhite(credit(page))
  })

  test('shows the PMTiles credit over a PMTiles archive', async ({ page }) => {
    await page.getByTestId('location-basemap').getByText('PMTiles').click()
    await expect(
      credit(page).getByRole('link', { name: 'Protomaps' })
    ).toBeVisible()
    await expect(
      credit(page).getByRole('link', { name: /OpenStreetMap/ })
    ).toBeVisible()
    // The OpenFreeMap/OpenMapTiles lines belong to the other basemap.
    await expect(credit(page)).not.toContainText('OpenMapTiles')
  })

  /*
   * The defect: right-click -> "What's here?" answered, moved the pin, and left
   * nothing on screen a user could read. The bubble is the answer, so the gate
   * is the text — an empty bubble is the old behaviour wearing a new element.
   */
  test('"Wat is hier?" puts the address on the map, and the close button takes it away', async ({
    page
  }) => {
    const canvas = map(page).locator('canvas')
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    // Not the exact centre: this page mounts with a pin there, and a
    // right-click that lands on the marker never reaches the map's canvas.
    await page.mouse.click(
      box!.x + box!.width * 0.6,
      box!.y + box!.height * 0.6,
      { button: 'right' }
    )

    const menu = page.locator('.q-menu')
    await expect(menu).toBeVisible()
    await menu.getByText(/Wat is hier|What's here/).click()

    const bubble = page.getByTestId('location-bubble')
    await expect(bubble).toBeVisible({ timeout: 20_000 })
    // Photon might be slow, but a bubble with no address in it is the defect.
    const text = (await bubble.innerText()).replace(/×/g, '').trim()
    expect(text.length).toBeGreaterThan(4)
    // Readable, not just present: the same surface-tone token that made the
    // credit invisible made this white on white in the consuming app.
    await expectNotWhiteOnWhite(bubble)

    // Above the pin, not over it: the marker is anchored at its tip.
    const pin = await page.locator('.maplibregl-marker').first().boundingBox()
    const placed = await bubble.boundingBox()
    expect(pin).not.toBeNull()
    expect(placed).not.toBeNull()
    expect(placed!.y + placed!.height).toBeLessThanOrEqual(pin!.y + 1)

    // It follows the pin: a pan moves the marker, and the bubble is projected
    // from it on the next render instead of staying where it was painted.
    await page.mouse.move(box!.x + box!.width * 0.3, box!.y + box!.height * 0.3)
    await page.mouse.down()
    await page.mouse.move(
      box!.x + box!.width * 0.2,
      box!.y + box!.height * 0.38,
      { steps: 10 }
    )
    await page.mouse.up()
    await expect
      .poll(
        async () => {
          const moved = await page
            .locator('.maplibregl-marker')
            .first()
            .boundingBox()
          const now = await bubble.boundingBox()
          if (!moved || !now) return null
          const offBy = Math.abs(
            moved.x + moved.width / 2 - (now.x + now.width / 2)
          )
          const above = now.y + now.height <= moved.y + 1
          return offBy <= 1.5 && above
        },
        { timeout: 10_000 }
      )
      .toBe(true)

    await page.getByTestId('location-bubble-close').click()
    await expect(bubble).toHaveCount(0)
  })

  /*
   * `center` only exists for the no-pin view, so the page has to mount without
   * one to prove it: `?nopin` is null `modelValue` plus the NL service area, and
   * the world view is zoom 1 at [0, 20] — a value no service area can produce.
   */
  test('?nopin lands on the center prop instead of the world view', async ({
    page
  }) => {
    await page.goto('/general/locationmap?nopin', {
      waitUntil: 'domcontentloaded'
    })
    await openMap(page)
    await map(page)
      .locator('canvas')
      .waitFor({ state: 'visible', timeout: 45_000 })

    const view = page.getByTestId('location-view')
    await expect(view).toHaveText(/@ 1[0-9]\./, { timeout: 20_000 })
    const [lng, lat] = (await view.innerText())
      .split('@')[0]
      .split(',')
      .map((part) => Number(part.trim()))
    expect(lng).toBeGreaterThan(2)
    expect(lng).toBeLessThan(8)
    expect(lat).toBeGreaterThan(49)
    expect(lat).toBeLessThan(54)

    // No pin, and the model says so: this is the empty state, not a moved one.
    await expect(page.locator('.maplibregl-marker')).toHaveCount(0)
    await expect(page.getByTestId('location-model')).toHaveText('null')
  })

  /*
   * The card is the input and the map is the confirmation, so entering an
   * address has to move the pin — it used to fill the card and leave the pin
   * where it was (or missing), which made the map a second, disagreeing answer.
   */
  test('a suggestion picked in the card puts the pin there', async ({ page }) => {
    const street = page
      .getByTestId('location-address')
      .locator('.q-location-address__street input')
      .first()
    await street.click()
    await street.fill('Kalverstraat 152 Amsterdam')

    const option = page.locator('.q-menu .q-item').first()
    await option.waitFor({ state: 'visible', timeout: 20_000 })
    await option.click()

    // The model is the contract, not the marker: it carries the coordinates the
    // address could not, and the office navigates to those.
    await expect
      .poll(
        async () => {
          const text = await page.getByTestId('location-model').innerText()
          return /"lng":/.test(text) && /Kalverstraat/.test(text)
        },
        { timeout: 20_000 }
      )
      .toBe(true)
    await expect(page.locator('.maplibregl-marker')).toHaveCount(1)
  })

  /*
   * A picked suggestion has to land in the input, not in a sibling `<span>`.
   * With `use-input` and no `fill-input`, QSelect moved the label out of the
   * field, so the input stayed empty: Ctrl+A, Home/End and editing acted on
   * nothing, and the visible street could not be selected at all. Photon is
   * answered here so the assertion is about the field, not about which address
   * came back.
   */
  test('a picked suggestion stays in the street field and can be selected', async ({
    page
  }) => {
    await page.route('**/photon.komoot.io/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          features: [
            {
              geometry: { coordinates: [5.4, 51.4] },
              properties: {
                osm_id: 1,
                street: 'Dorpsstraat',
                housenumber: '12',
                postcode: '5504',
                city: 'Veldhoven',
                country: 'Nederland',
                countrycode: 'NL'
              }
            }
          ]
        })
      })
    )

    const street = page
      .getByTestId('location-address')
      .locator('.q-location-address__street input')
      .first()
    await street.click()
    await street.fill('Dorpsstraat')

    const option = page.locator('.q-menu .q-item').first()
    await option.waitFor({ state: 'visible', timeout: 20_000 })
    await option.click()

    await expect(street).not.toHaveValue('')
    await street.press('Control+a')
    const selected = await street.evaluate((element) => {
      const input = element as HTMLInputElement
      return {
        value: input.value,
        start: input.selectionStart,
        end: input.selectionEnd
      }
    })
    expect(selected.value).toContain('Dorpsstraat')
    expect(selected.start).toBe(0)
    expect(selected.end).toBe(selected.value.length)
  })

  /*
   * Photon answers `Dorpsstraat 99, 5504 Veldhoven` with the street's centroid
   * first and the house numbers after it, and `found[0]` put the pin on the
   * centroid for every number: editing the number moved nothing. The stub keeps
   * that order on purpose — the second feature is the one carrying the number.
   */
  test('editing the house number moves the pin to that number', async ({
    page
  }) => {
    const street = { lng: 5.396683, lat: 51.403618 }
    await page.route('**/photon.komoot.io/**', (route) => {
      const query = decodeURIComponent(route.request().url())
      const houseNumber = /(\d+)/.exec(query.split('q=')[1] ?? '')?.[1] ?? ''
      const point = {
        lng: street.lng + Number(houseNumber || 0) / 10_000,
        lat: street.lat + Number(houseNumber || 0) / 10_000
      }
      const place = {
        street: 'Dorpsstraat',
        postcode: '5504',
        city: 'Veldhoven',
        country: 'Nederland'
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          features: [
            { geometry: { coordinates: [street.lng, street.lat] }, properties: { ...place } },
            { geometry: { coordinates: [point.lng, point.lat] }, properties: { ...place, housenumber: houseNumber } }
          ]
        })
      })
    })

    const card = page.getByTestId('location-address')
    const number = card.locator('.q-location-address__house-number input').first()
    const streetField = card.locator('.q-location-address__street input').first()
    await streetField.click()
    await streetField.fill('Dorpsstraat')
    const option = page.locator('.q-menu .q-item').first()
    await option.waitFor({ state: 'visible', timeout: 20_000 })
    await option.click()
    await number.fill('99')
    await page.keyboard.press('Tab')

    await expect
      .poll(
        async () => {
          const model = JSON.parse(await page.getByTestId('location-model').innerText())
          return model.lng
        },
        { timeout: 20_000 }
      )
      .toBeCloseTo(street.lng + 99 / 10_000, 5)
  })

  /*
   * The bubble prefers the geocoder's `formatted` line, which is a snapshot of
   * the parts it was built from. Editing the house number kept `formatted`, so
   * the card said 99 while the map still showed the number that was picked.
   */
  test('editing the house number updates the bubble too', async ({ page }) => {
    await page.route('**/photon.komoot.io/**', (route) => {
      const query = decodeURIComponent(route.request().url())
      const houseNumber = /(\d+)/.exec(query.split('q=')[1] ?? '')?.[1] ?? '12'
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          features: [
            {
              geometry: { coordinates: [5.4, 51.4] },
              properties: {
                osm_id: 1,
                street: 'Dorpsstraat',
                housenumber: houseNumber,
                postcode: '5504',
                city: 'Veldhoven',
                country: 'Nederland'
              }
            }
          ]
        })
      })
    })

    const card = page.getByTestId('location-address')
    const street = card.locator('.q-location-address__street input').first()
    await street.click()
    await street.fill('Dorpsstraat 12')
    const option = page.locator('.q-menu .q-item').first()
    await option.waitFor({ state: 'visible', timeout: 20_000 })
    await option.click()

    const bubble = page.getByTestId('location-bubble')
    await expect(bubble).toContainText('Dorpsstraat 12')

    const number = card.locator('.q-location-address__house-number input').first()
    await number.fill('99')
    await page.keyboard.press('Tab')
    await expect(bubble).toContainText('Dorpsstraat 99')
    await expect(bubble).not.toContainText('Dorpsstraat 12')
  })

  test('a hand-typed address is geocoded to a pin', async ({ page }) => {
    const card = page.getByTestId('location-address')
    const field = (label: string) =>
      card.locator('.q-field', { hasText: label }).locator('input').first()

    const street = card.locator('.q-location-address__street input').first()
    await street.click()
    await street.fill('Dorpsstraat')
    await page.keyboard.press('Enter')
    await field('Huisnummer').fill('1')
    await field('Postcode').fill('5504 PB')
    await field('Plaats').fill('Veldhoven')
    await page.keyboard.press('Tab')

    await expect
      .poll(
        async () => {
          const text = await page.getByTestId('location-model').innerText()
          return /"lng":/.test(text)
        },
        { timeout: 20_000 }
      )
      .toBe(true)
    await expect(page.locator('.maplibregl-marker')).toHaveCount(1)
  })

  test('stops the search spinner once the lookup settles', async ({ page }) => {
    // The spinner lives in the search field's append slot; the map's own
    // ready-state spinner is outside it, so this cannot pass by accident.
    const spinner = page.locator('.q-location__search .q-spinner')
    await search(page).click()
    await search(page).fill('Veldhoven')
    // Whether Photon answers or the request fails, the field has to stop
    // loading: a stale spinner is the defect, not the result.
    await expect(spinner).toHaveCount(0, { timeout: 20_000 })
  })

  test('settles after the pin is dragged', async ({ page }) => {
    const canvas = map(page).locator('canvas')
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    // Drop a pin in the middle, then drag it: the reverse geocode is what has
    // to settle.
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
    const marker = page.locator('.maplibregl-marker').first()
    await marker.waitFor({ state: 'visible', timeout: 15_000 })

    const pin = await marker.boundingBox()
    expect(pin).not.toBeNull()
    const x = pin!.x + pin!.width / 2
    const y = pin!.y + pin!.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (let step = 1; step <= 8; step += 1) {
      await page.mouse.move(x + step * 5, y + step * 3)
    }
    await page.mouse.up()

    // The outcome, not the request: the model carries the address the reverse
    // geocode produced, or the page says the lookup failed. A pinned "still
    // loading" state satisfies neither.
    await expect
      .poll(
        async () => {
          const model = await page
            .getByTestId('location-model')
            .textContent()
            .catch(() => null)
          const failed = await page
            .getByTestId('location-error')
            .isVisible()
            .catch(() => false)
          return Boolean(model?.includes('"address"')) || failed
        },
        { timeout: 20_000 }
      )
      .toBe(true)
    // Nothing anywhere in the map is still spinning.
    await expect(page.locator('.q-spinner')).toHaveCount(0)
  })
})
