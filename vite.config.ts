import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import ui from '@nuxt/ui/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui({
      colorMode: false,
      ui: {
        colors: {
          primary: 'violet',
          neutral: 'slate',
        },
      },
    }),
  ],

  server: {
    proxy: {
      '/v1': {
        target: 'https://extra-brooke-yeremiadio-46b2183e.koyeb.app',
        changeOrigin: true,
        rewrite(path) {
          return path.replace(/^\/v1/, '')
        },
      },
    },
  },
})
