import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import { FlagIcon, Icon } from './src/virtualModules.js'

export const moduleTransformPlugin: Plugin = {
  name: 'module-tranform-plugin',
  enforce: 'pre',
  resolveId: (id) => {
    if (id.includes('.flag')) return id
    else if (id.includes('.icon')) return id
  },
  load: (id) => {
    if (id.includes('.flag')) {
      const locale = id.slice(0, -5)
      console.log(locale)
      const flag = FlagIcon(locale)
      return flag
    } else if (id.includes('.icon')) {
      const iconId = id.slice(0, -5)
      const icon = Icon(iconId)
      return icon
    }
  }
}

export default defineConfig(async ({ command, mode }) => ({
  plugins: [
    moduleTransformPlugin,
    Components({
      resolvers: [QuasarResolver()]
    }),
    vue()
  ],
  build: {
    // minify: false,
    lib: {
      // UMD not supported for code-splitting builds
      fileName: (format, entryName) => {
        return entryName + '.js'
      },
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
        icons: new URL('./src/ui/icons/index.ts', import.meta.url).pathname,
        form: new URL('./src/ui/form/index.ts', import.meta.url).pathname
      },
      output: {
        // entryFileNames: '[name].js',
        // assetFileNames: '[name].[ext]'
      },
      external: ['vue', 'vue-router', 'quasar']
    }
  }
}))
