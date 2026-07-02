import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import fs from 'fs'

// Custom plugin to copy manifest.json to dist
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle() {
      fs.copyFileSync('manifest.json', 'dist/manifest.json')
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyManifest(),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content.tsx'),
      },
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
})
