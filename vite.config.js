import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 1338
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      input: './src/main.tsx',
    }
  }
})
