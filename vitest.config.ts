import { defineConfig, Plugin } from 'vitest/config';
import fs from 'node:fs';
import path from 'node:path';

function inlineAngularTemplates(): Plugin {
  return {
    name: 'inline-angular-templates',
    transform(code: string, id: string) {
      if (!id.endsWith('.ts') || id.includes('node_modules')) {
        return null;
      }
      let transformed = code;
      transformed = transformed.replace(
        /templateUrl:\s*['"](\.[^'"]+)['"]/g,
        (_, relativeUrl) => {
          const filePath = path.resolve(path.dirname(id), relativeUrl);
          const html = fs.readFileSync(filePath, 'utf-8');
          return `template: ${JSON.stringify(html)}`;
        },
      );
      transformed = transformed.replace(
        /styleUrls:\s*\[[^\]]*\]/g,
        'styles: []',
      );
      transformed = transformed.replace(
        /styleUrl:\s*['"][^'"]+['"]/g,
        'styles: []',
      );
      return { code: transformed, map: null };
    },
  };
}

export default defineConfig({
  plugins: [inlineAngularTemplates()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        'src/main.ts',
        'src/app/app.config.ts',
        'src/app/app.routes.ts',
        '**/*.routes.ts',
        '**/*.model.ts',
        '**/*.types.ts',
        '**/*.interface.ts',
        '**/*.dto.ts',
        '**/models/index.ts',
        '**/*.constants.ts',
        'src/environments/**',
      ],
    },
  },
});
