import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default [
  // Single build with inline dynamic imports
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      postcss({
        extract: true,
        minimize: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
    external: ['react', 'react-dom'],
  },
  // Type definitions
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: packageJson.types, format: 'esm' }],
    plugins: [dts()],
  },
];
