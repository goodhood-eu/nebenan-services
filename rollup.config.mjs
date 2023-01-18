import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import fs from 'fs';

const PKG_PATH = new URL('./package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(PKG_PATH))

const DEPENDENCIES = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

export default [
  {
    input: ['./src/index.ts'],
    output: [
      {
        file: 'lib/index.js',
        format: 'es',
        exports: 'named',

        sourcemap: true,
      },
      {
        file: 'lib/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
    ],

    external: (id) => DEPENDENCIES.some((depName) => (
      id.startsWith(depName)
    )),

    plugins: [
      commonjs(),
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: { exclude: ["src/**/*.test.ts"] },
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: [
          /node_modules/,
        ]
      }),
      resolve({
        browser: true,
        extensions: ['.js', '.jsx', '.ts', '.tsx', 'json'],
      }),
      json(),
    ],
  },
];
