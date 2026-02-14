
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { existsSync, accessSync, constants } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Workaround for .env permission issues
  // Check if .env is readable, if not, point envDir to node_modules (which won't have .env)
  let envDir = process.cwd();
  try {
    if (existsSync('.env')) {
      accessSync('.env', constants.R_OK);
    }
  } catch (error) {
    // If .env has permission issues, point to node_modules directory
    // This prevents Vite from trying to read .env files
    console.warn('Warning: .env file has permission issues, using fallback directory');
    envDir = join(process.cwd(), 'node_modules'); // node_modules won't have .env files
  }

  return {
    envDir: envDir,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // Exclude large asset images from precaching (they're loaded dynamically)
          // These images are 7-11 MB each and don't need to be precached
          globIgnores: ['**/asset/*.png'],
          // Increase limit for other assets if needed (but asset images are excluded)
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB to handle other large files
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
        // Forward all requests starting with /api to the Express server (port can change if 5774 is in use)
        '/api': {
          target: 'http://localhost:' + (process.env.VITE_API_PORT || 5774),
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
