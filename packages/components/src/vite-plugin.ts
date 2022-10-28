import type { Plugin } from 'vite'

export default async function (): Promise<Plugin> {
  return {
    name: '@simsustech/quasar-components-plugin',
    config(config, { mode }) {
      if (mode === 'development') {
        return {
          resolve: {
            alias: [
              {
                find: '@simsustech/quasar-components/flags',
                replacement: new URL(
                  '../src/ui/flags/index.ts',
                  import.meta.url
                ).pathname
              },
              {
                find: '@simsustech/quasar-components',
                replacement: new URL('../src/ui/index.ts', import.meta.url)
                  .pathname
              }
            ]
          }
        }
      }
      return {}
    }
  }
}
