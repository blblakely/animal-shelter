import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/animal-shelter/' : '/',
  build: { outDir: 'dist', assetsDir: 'assets' },
}));
