import type { Plugin } from 'vite'
import { promises } from 'fs'
import { Icon, FlagIcon } from './virtualModules.js'
const { readFile } = promises

export default async function ({
  buildFromSrc
}: {
  buildFromSrc?: boolean
} = {}): Promise<Plugin> {
  const pkgJson = JSON.parse(
    await readFile(
      new URL('../package.json', import.meta.url).pathname,
      'utf-8'
    )
  )
  const exports = pkgJson.exports as Record<
    string,
    {
      types: string
      import: string
      src: string
    }
  >[]
  const name = pkgJson.name

  return {
    name: `${name}-plugin`,
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
    },
    config(config, { mode }) {
      if (mode === 'development' || buildFromSrc) {
        const alias = Object.entries(exports)
          .filter(([, val]) => {
            return val.src
          })
          .map(([key, val]) => {
            return {
              find: new RegExp(
                `^${
                  name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + key.slice(1)
                }$`
              ),
              // name: name + key.slice(1),
              replacement: new URL('.' + val.src, import.meta.url).pathname
            }
          })

        return {
          resolve: {
            alias
          }
        }
      }

      return {}
    }
  }
}
