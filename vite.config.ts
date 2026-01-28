
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        },
        manifest: {
          name: 'Find My Puppy',
          short_name: 'FindPuppy',
          description: 'A fun hide and seek puppy adventure game.',
          theme_color: '#FF69B4',
          background_color: '#FF69B4',
          display: 'standalone',
          icons: [
            {
              src: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        devOptions: {
          enabled: true,
          suppressWarnings: true,
          navigateFallbackAllowlist: [/^\/api/],
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('@capacitor')) {
                return 'vendor-capacitor';
              }
              return 'vendor-others';
            }
          },
        },
      },
    },
    server: {
      host: true,
      allowedHosts: true,
      proxy: {
        // Forward all requests starting with /api to the Express server
        '/api': {
          target: 'http://localhost:5774',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: true,
      allowedHosts: true,
    }
  }
})
