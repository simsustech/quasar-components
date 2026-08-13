import type { VitrifyConfig, VitrifyConfigAsync } from 'vitrify'
import { QuasarPlugin, type QuasarPluginOptions } from 'vitrify/plugins'
import { getCertificate } from '@vitejs/plugin-basic-ssl'
import QuasarComponentsPlugin from '@simsustech/quasar-components/vite-plugin'

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
