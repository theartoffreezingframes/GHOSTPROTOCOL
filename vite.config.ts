import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    // Allow the hosted preview origin (and any tunnel domain) to talk to the dev server.
    allowedHosts: true,
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
  },
})
