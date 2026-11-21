import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/apps': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/run': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
