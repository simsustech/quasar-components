<template>
  <q-btn
    v-bind="attrs"
    :color="color"
    :loading="loading || loadingInternal"
    type="submit"
    @click="submit"
  >
    <slot>
      {{ label }}
    </slot>
  </q-btn>
</template>

<script lang="ts">
export default {
  name: 'QSubmitButton',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { ref, watch, useAttrs, computed, toRefs } from 'vue'
import { useQuasar, debounce } from 'quasar'
import { useLang, loadLang } from './lang'
export interface Props {
  loading?: boolean
  useForm?: boolean
  type?: 'submit' | 'send' | 'next'
  isNextButton?: boolean
  color?: string
}
const props = withDefaults(defineProps<Props>(), {
  type: 'submit',
  color: 'primary'
})

const { type, isNextButton } = toRefs(props)

const attrs = useAttrs()
const emit = defineEmits<{
  (
    e: 'submit',
    {
      value,
      done
    }: {
      value?: string
      done: () => void
    }
  ): void
}>()
const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

let loadingInternal = ref(false)

const submit = debounce(
  () => {
    if (props.loading === void 0) loadingInternal.value = true
    const p = new Promise((resolve, reject) => {
      emit('submit', { done: () => resolve(true) })
    }).finally(() => {
      if (props.loading === void 0) loadingInternal.value = false
    })
  },
  1000,
  true
)

const label = computed(() => {
  const labels = {
    submit: lang.value.submit,
    send: lang.value.send,
    next: lang.value.next
  }
  return isNextButton.value ? lang.value.next : labels[type.value]
})
</script>
