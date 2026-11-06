import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({tsconfigPath: resolve(import.meta.dirname, 'tsconfig.lib.json')})
  ],
  build: {
    // copyPublicDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'lib/main.ts'),
      formats: ['es']
    },
    rolldownOptions: {
      external: ['react', 'jsx-runtime'],
    }
  }
})
