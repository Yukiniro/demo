import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      main: "./src/index.jsx",
    }
  },
  output: {
    filenameHash: false,
    legalComments: 'none',
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
