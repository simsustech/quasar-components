import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import { Icon } from './src/virtualModules.js'
import { readFileSync } from 'node:fs'

type ExportEntry = { types?: string; import?: string; src?: string }
const packageExports = (
  JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8')
  ) as {
    exports: Record<string, ExportEntry>
  }
).exports

/**
 * Marks every emitted chunk as UnoCSS-scannable.
 *
 * A consumer's UnoCSS scan skips `.js` by default, so the class names this kit's
 * templates write would have no candidate — the reason a safelist existed. The
 * `@unocss-include` magic comment is the sanctioned way for a package to opt in
 * (see `filter()` in @unocss/vite): the consumer's own extractor then reads the
 * chunks it imports, and a class added to a template appears in the sheet on the
 * next build with nothing to keep in sync.
 *
 * `enforce: 'post'` so the banner survives whatever minifier is configured.
 */
export const unocssIncludePlugin: Plugin = {
  name: 'unocss-include',
  enforce: 'post',
  renderChunk(code) {
    return { code: `/* @unocss-include */\n${code}`, map: null }
  }
}

export const moduleTransformPlugin: Plugin = {
  name: 'module-tranform-plugin',
  enforce: 'pre',
  resolveId: (id) => {
    if (id.includes('.icon')) return id
  },
  load: (id) => {
    if (id.includes('.icon')) {
      const iconId = id.slice(0, -5)
      return Icon(iconId)
    }
  }
}

export default defineConfig(async ({ command, mode }) => ({
  plugins: [
    moduleTransformPlugin,
    unocssIncludePlugin,
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
      // One source of truth: every subpath that has a `src` in `exports` is built. Before this,
      // `./icons` was advertised in package.json while its input here was commented out, so
      // `import ... from '@simsustech/quasar-components/icons'` failed to resolve for every
      // consumer (found via packages/dev). A subpath now cannot exist without being built.
      input: Object.fromEntries(
        Object.entries(packageExports)
          .filter(([, entry]) => Boolean(entry?.src && entry?.import))
          .map(([, entry]) => [
            entry.import.replace('./dist/', '').replace(/\.js$/, ''),
            new URL(entry.src, import.meta.url).pathname
          ])
      ),
      output: {
        // entryFileNames: '[name].js',
        // assetFileNames: '[name].[ext]'
      },
      // `maplibre-gl/dist/maplibre-gl.css` is external because lib mode would
      // otherwise extract the import in `src/ui/location/index.ts` into a
      // shared `dist/style.css`, which nothing exports: keeping the specifier
      // external leaves the import in `dist/location.js`, so the consumer's
      // bundler resolves the sheet from the kit's own dependency.
      external: [
        'vue',
        'vue-router',
        'quasar',
        'maplibre-gl/dist/maplibre-gl.css'
      ]
    }
  }
}))
