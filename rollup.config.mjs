import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: ['src/index.ts'],
    output: [
      {
        file: 'lib/index.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'lib/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      babel({ babelHelpers: 'runtime', exclude: /^(.+\/)?node_modules\/.+$/ }),
      typescript({ useTsconfigDeclarationDir: true }),
      commonjs({ extensions: ['.js', '.ts'] }),
    ],
  },
];
