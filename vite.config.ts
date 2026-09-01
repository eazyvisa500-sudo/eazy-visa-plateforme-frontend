import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (/node_modules\/(react|react-dom|react-router-dom)\//.test(id)) return 'react-vendor';
          if (/node_modules\/recharts\//.test(id)) return 'charts';
          if (/node_modules\/lucide-react\//.test(id)) return 'icons';
          if (/node_modules\/@tanstack\/react-query\//.test(id)) return 'query';
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});