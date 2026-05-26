import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable source maps to drastically reduce memory usage during Vercel builds
    sourcemap: false,
    // Increase warning limit from 500kb to 1600kb for large component portfolios
    chunkSizeWarningLimit: 1600, 
    rollupOptions: {
      output: {
        // Automatically split node_modules into separate independent chunks 
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  }
})
