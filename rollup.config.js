import typescript from "rollup-plugin-typescript";
import { uglify } from "rollup-plugin-uglify";

export default [
  {
    input: "src/index.ts",
    output: {
      exports: "named",
      name: "benchee",
      file: "dist/benchee.js",
      format: "umd",
      sourcemap: true
    },
    plugins: [typescript()]
  },
  {
    input: "src/index.ts",
    output: {
      exports: "named",
      name: "benchee",
      file: "dist/benchee.min.js",
      format: "umd"
    },
    plugins: [typescript(), uglify()]
  }
];
