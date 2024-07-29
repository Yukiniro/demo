import { defineConfig } from 'dumi';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  outputPath: 'dumi-static',
  themeConfig: {
    name: '组件库',
  },
  base: isProd ? '/dumi-static' : '/',
  publicPath: isProd ? '/dumi-static/' : '/',
});
