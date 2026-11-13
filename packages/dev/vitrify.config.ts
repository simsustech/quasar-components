import type { VitrifyConfig, VitrifyConfigAsync } from 'vitrify'
import { QuasarPlugin, type QuasarPluginOptions } from 'vitrify/plugins'
import { getCertificate } from '@vitejs/plugin-basic-ssl'
import { presetIcons, presetWind3 } from 'unocss'
import { quasarComponentsPreset } from '@simsustech/quasar-components-preset'
import QuasarComponentsPlugin from '@simsustech/quasar-components/vite-plugin'

type UnoPresets = NonNullable<
  NonNullable<VitrifyConfig['vitrify']>['unocss']
>['presets']

/**
 * The kit styles itself with utilities, so the app has to run UnoCSS to give
 * them a rule — the same two presets a consumer arrives at: the utility engine,
 * and the kit's preset, which carries the kit's class names as a safelist (its
 * templates are built JS this app's scan never sees) and nothing else. That is
 * why this app imports no stylesheet of the kit's: there is none left, and the
 * one vendor sheet it needs arrives with the `./location` subpath. Vitrify
 * registers `unocss/vite` itself; this is its preset list.
 */
const unocssPresets: UnoPresets = [
  presetWind3(),
  // `i-mdi-*` in the kit's templates and `i-flagpack-*` in this app's demos are
  // classes no utility engine writes: they come from the icon collections
  // installed here, which is the same wiring a consumer needs.
  presetIcons(),
  quasarComponentsPreset()
]

const quasarConf: QuasarPluginOptions = {
  extras: ['material-icons'],
  framework: {
    plugins: ['Dialog']
  }
}

export default async function ({
  mode
}: Parameters<VitrifyConfigAsync>[0]): Promise<VitrifyConfig> {
  const config: VitrifyConfig = {
    plugins: [QuasarComponentsPlugin()],
    vitrify: {
      lang: 'nl',
      unocss: {
        presets: unocssPresets
      },
      plugins: [
        {
          plugin: QuasarPlugin,
          options: quasarConf
        }
      ],
      sass: {
        variables: {
          $primary: '#000000'
        }
      }
    }
  }
  if (mode === 'development') {
    const certificate = await getCertificate(
      'node_modules/.vite/basic-ssl',
      '',
      ['vitrify.test']
    )
    config.server = {
      https: {
        cert: certificate,
        key: certificate
      }
    }
  }
  return config
}
