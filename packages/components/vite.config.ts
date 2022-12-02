import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import { FlagIcon, Icon } from './src/virtualModules.js'
// export const FlagIcon = (locale) => `
//   import { computed, ref, watch, h } from 'vue'
//   import { QuasarLanguageCodes, useQuasar, QIcon } from 'quasar'
//   import { useLang, loadLang } from '${
//     new URL(`./src/ui/flags/lang`, import.meta.url).pathname
//   }'
//   import icon from '${
//     new URL(`./src/ui/flags/assets/${locale}.svg`, import.meta.url).pathname
//   }'
//   export default {
//   setup(props, context) {
//     const $q = useQuasar()
//     const lang = useLang()
//     if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
//     watch($q.lang, (val) => {
//       loadLang($q.lang.isoName)
//     })

//     const country = computed(
//       () => lang.value.countries['${locale}']
//     )
//     // @ts-ignore
//     const language = computed(() => lang.value.languages['${locale}'])
//     const variables = ref({
//       country,
//       language
//       // header: lang.value.some.nested.prop
//     })
//     const functions = ref({
//       // submit
//     })

//     context.expose({
//       variables,
//       functions
//     })

//     // return the render function
//     return () => h(QIcon, { name: \`img:\${icon}\` })
//   }}
// `

// export const Icon = (icon) => `
//   import { computed, ref, watch, h } from 'vue'
//   import { QuasarLanguageCodes, useQuasar, QIcon } from 'quasar'
//   import icon from '${
//     new URL(`./src/ui/icons/assets/${icon}.svg`, import.meta.url).pathname
//   }'
//   import icons from '${
//     new URL(`./src/ui/icons/icons.ts`, import.meta.url).pathname
//   }'
//   export default {
//   setup(props, context) {
//     const $q = useQuasar()

//     const variables = ref(icons['${icon}'])

//     const functions = ref({
//       // submit
//     })

//     context.expose({
//       variables,
//       functions
//     })

//     // return the render function
//     return () => h(QIcon, { name: \`img:\${icon}\` })
//   }}
// `

export default defineConfig(async ({ command, mode }) => ({
  plugins: [
    {
      name: 'module-tranform-plugin',
      enforce: 'pre',
      resolveId: (id) => {
        if (id.includes('.flag')) return id
        else if (id.includes('.icon')) return id
      },
      load: (id) => {
        if (id.includes('.flag')) {
          const locale = id.slice(0, -5)
          const flag = FlagIcon(locale)
          return flag
        } else if (id.includes('.icon')) {
          const iconId = id.slice(0, -5)
          const icon = Icon(iconId)
          return icon
        }
      }
      // resolveId: (source) => {
      //   if (source.includes('FlagIcon.vue')) {
      //     const split = source.split('FlagIcon.vue')
      //     split[0].slice(2)
      //     return { id: './FlagIcon.vue' }
      //   }
      // }
    },
    Components({
      resolvers: [QuasarResolver()]
    }),
    vue()
  ],
  build: {
    // minify: false,
    lib: {
      // UMD not supported for code-splitting builds
      fileName: 'ui',
      formats: ['es'],
      entry: './src/ui/index.ts'
    },
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        authentication: new URL(
          './src/ui/authentication/index.ts',
          import.meta.url
        ).pathname,
        general: new URL('./src/ui/general/index.ts', import.meta.url).pathname,
        flags: new URL('./src/ui/flags/index.ts', import.meta.url).pathname,
        icons: new URL('./src/ui/icons/index.ts', import.meta.url).pathname
      },
      output: {
        entryFileNames: '[name].js'
      },
      external: ['vue', 'vue-router', 'quasar']
    }
  }
}))
