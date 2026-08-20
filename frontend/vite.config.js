import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        galeri: resolve(__dirname, 'galeri.html'),
        drone: resolve(__dirname, 'drone.html'),
        kontak: resolve(__dirname, 'kontak.html'),
        syarat: resolve(__dirname, 'syarat.html'),
        tentangKami: resolve(__dirname, 'tentang-kami.html'),
        kebijakan: resolve(__dirname, 'kebijakan.html'),
        driver: resolve(__dirname, 'driver.html')
      }
    }
  }
});
