import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
  // browser-friendly UMD build
  {
    input: "src/index.js",
    output: {
      name: "index",
      file: "dist/index.umd.js",
      format: "umd",
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
    ],
    // treeshake: false,
  },
];
