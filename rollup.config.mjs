import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';

const external = [
  '@atproto/api',
  '@atproto/lexicon',
  '@atproto/xrpc',
  '@atproto/common',
  '@atproto/uri',
];

const plugins = [
  resolve({
    preferBuiltins: true,
    extensions: ['.ts', '.js', '.json'],
  }),
  commonjs(),
  json(),
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: true,
    declaration: false,
  }),
  terser(),
];

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins,
    external,
    watch: {
      include: 'src/**',
      clearScreen: false,
    },
  },
  // CJS build
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins,
    external,
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es',
      },
    ],
    plugins: [dts()],
    external: [/\.json$/],
  },
];
