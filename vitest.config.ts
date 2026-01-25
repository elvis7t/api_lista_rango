import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    dir: 'src',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.spec.ts'],
          exclude: ['**/*.e2e.spec.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['**/*.e2e.spec.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
