import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/viz':              { target: 'http://localhost:8000', changeOrigin: true },
      '/data':             { target: 'http://localhost:8000', changeOrigin: true },
      '/recruiter-upload': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
