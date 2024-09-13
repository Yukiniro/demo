import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginLess } from "@rsbuild/plugin-less";

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr(), pluginLess()],
  source: {
    entry: {
      main: "./src/index.jsx",
    },
  },
  output: {
    filenameHash: false,
    legalComments: "none",
  },
  performance: {
    chunkSplit: {
      strategy: "single-vendor",
      override: {
        cacheGroups: {
          singleVendor: {
            test: /[\\/]node_modules[\\/]/,
            priority: 0,
            chunks: "all",
            name: "modules-chunk",
            enforce: true,
            reuseExistingChunk: true,
          },
        },
      },
    },
  },
});
