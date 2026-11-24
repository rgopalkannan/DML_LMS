import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/* SWC compiles the NestJS decorators (emitDecoratorMetadata), which esbuild cannot. */
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: { globals: true, environment: 'node', fileParallelism: false }
});
