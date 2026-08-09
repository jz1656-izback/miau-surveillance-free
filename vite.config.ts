import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 5199, strictPort: true, host: true },
  build: {
    target: 'esnext',
    modulePreload: false,
    rollupOptions: {
      external: [/^#wasm-/],
    },
  },
  optimizeDeps: { exclude: ['satellite.js'] },
});
