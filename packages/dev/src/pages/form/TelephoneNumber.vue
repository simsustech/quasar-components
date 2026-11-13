<template>
  <div class="q-pa-md column q-gutter-y-lg" style="max-width: 420px">
    <div data-testid="phone-plain">
      <q-telephone-number
        v-model="phone"
        v-model:country="country"
        :countries="countries"
      />
    </div>
    <div data-testid="phone-required">
      <q-telephone-number
        v-model="requiredPhone"
        v-model:country="requiredCountry"
        :countries="countries"
        required
      />
    </div>
    <div data-testid="phone-outlined">
      <q-telephone-number
        v-model="outlinedPhone"
        v-model:country="outlinedCountry"
        :countries="countries"
        outlined
      />
    </div>
    <div data-testid="phone-flags">
      <q-telephone-number
        v-model="flagPhone"
        v-model:country="flagCountry"
        :flag-url="flagUrl"
        outlined
      />
    </div>
    <div data-testid="phone-model">
      model: {{ phone }} | country: {{ country }} | required model:
      {{ requiredPhone }} | required country: {{ requiredCountry }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { QTelephoneNumber } from '@simsustech/quasar-components/phone'
import type { PhoneCountry } from '@simsustech/quasar-components/phone'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Reads `?value=` and `?country=` so the stored shapes (`0612345678`,
 * `+31612345678`, `+31 6 12345678`) are all reachable from a URL, which is what
 * the hydration cases in `e2e/phone-input.spec.ts` navigate to.
 */
const route = useRoute()
const query = (key: string) =>
  typeof route.query[key] === 'string' ? (route.query[key] as string) : ''

const phone = ref(query('value'))
const country = ref(query('country') || 'NL')
const requiredPhone = ref(query('requiredValue'))
const requiredCountry = ref(query('requiredCountry') || 'NL')
const outlinedPhone = ref(query('outlinedValue'))
const outlinedCountry = ref(query('outlinedCountry') || 'NL')
const flagPhone = ref(query('flagValue'))
const flagCountry = ref(query('flagCountry') || 'NL')

/**
 * The other pattern: a URL per country, for a list that cannot carry 245 icon
 * classes (or one whose icons are not in the app's collection). A data URI keeps
 * the tests offline; the country code in the `src` is what the e2e asserts on.
 */
const flagUrl = (iso3166: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><title>${iso3166}</title><rect width="3" height="2" fill="#b0b0b0"/></svg>`
  )}`

/** The pattern a consumer uses: an icon class, resolved by UnoCSS from the collection. */
const countries: PhoneCountry[] = [
  { iso3166: 'NL', name: 'Netherlands', icon: 'i-flagpack-nl' },
  { iso3166: 'DE', name: 'Germany', icon: 'i-flagpack-de' },
  { iso3166: 'BE', name: 'Belgium', icon: 'i-flagpack-be' },
  { iso3166: 'FR', name: 'France', icon: 'i-flagpack-fr' }
]
</script>
