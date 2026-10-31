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
    rollupOptions: {
      output: {
        // Keep the icon packs and animation runtime cacheable and out of the
        // critical path, so a text tweak never busts the whole bundle.
        manualChunks(id: string) {
          if (id.includes('simple-icons')) return 'brand-marks'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('framer-motion') || id.includes('/motion/')) return 'motion'
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react'
          return undefined
        },
      },
    },
  },
})
