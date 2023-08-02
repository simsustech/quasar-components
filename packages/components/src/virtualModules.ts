export const FlagIcon = (locale: string) => `
  import { computed, ref, watch, h } from 'vue'
  import { useQuasar, QIcon } from 'quasar'
  import { useLang, loadLang } from '${
    new URL(`../src/ui/flags/lang`, import.meta.url).pathname
  }'
  import icon from '${
    new URL(`../src/ui/flags/assets/${locale}.svg`, import.meta.url).pathname
  }'
  export default {
  setup(props, context) {
    const $q = useQuasar()
    const lang = useLang()
    if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
    watch($q.lang, (val) => {
      loadLang($q.lang.isoName)
    })
    
    const country = computed(
      () => lang.value.countries['${locale}']
    )
    // @ts-ignore
    // const language = computed(() => lang.value.languages['${locale}'])
    const language = computed(() => lang.value.languages['${locale}'])
    const variables = ref({
      country,
      language
      // header: lang.value.some.nested.prop
    })
    const functions = ref({
      // submit
    })

    context.expose({
      variables,
      functions
    })

    // return the render function
    return () => h(QIcon, { name: \`img:\${icon}\` })
  }}
`

export const Icon = (icon: string) => `
  import { computed, ref, watch, h } from 'vue'
  import { useQuasar, QIcon } from 'quasar'
  import icon from '${
    new URL(`../src/ui/icons/assets/${icon}.svg`, import.meta.url).pathname
  }'
  import labels from '${
    new URL(`../src/ui/icons/labels.ts`, import.meta.url).pathname
  }'
  export default {
  setup(props, context) {
    const $q = useQuasar()

    const variables = ref(labels['${icon}'])

    const functions = ref({
      // submit
    })

    context.expose({
      variables,
      functions
    })

    // return the render function
    return () => h(QIcon, { name: \`img:\${icon}\` })
  }}
`

// export const FormItem = (field: string) => `
// import { ref, watch, useAttrs, h } from 'vue'
// import { QItem, QItemLabel, QItemSection, useQuasar } from 'quasar'
// import { useLang, loadLang } from '${
//   new URL(`../src/ui/form/lang/index.ts`, import.meta.url).pathname
// }'

// export default {
//   setup(props, context) {
//     const $q = useQuasar()
//     const attrs = useAttrs()

//     const lang = useLang()

//     if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
//     watch($q.lang, (val) => {
//       loadLang($q.lang.isoName)
//     })

//     const variables = ref({})

//     const functions = ref({
//       // submit
//     })

//     context.expose({
//       variables,
//       functions
//     })

//     // return the render function
//     return () =>
//       h(QItem, { attrs }, [
//         h(QItemSection, {}, [
//           h(QItemLabel, { overline: true }, 'field'),
//           h(QItemLabel, {}, 'field')
//         ])
//       ])
//   }
// }
// `
