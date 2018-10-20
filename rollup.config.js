
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import { uglify } from 'rollup-plugin-uglify';

export default [
  {
    input: 'src/index.ts',
    output: {
      exports: 'named',
      name: 'benchee',
      file: 'dist/benchee.js',
      format: 'umd',
      globals: ['performance'],
      sourcemap: true
    },
    plugins: [
      typescript(),
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      commonjs(),
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      exports: 'named',
      name: 'benchee',
      file: 'dist/benchee.min.js',
      format: 'umd'
    },
    plugins: [
      typescript(),
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      commonjs(),
      uglify(),
    ]
  }
];
