import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'dumi-component-demo',
  themeConfig: {
    name: '组件库',
  },
  apiParser: {},
  resolve: {
    // 配置入口文件路径，API 解析将从这里开始
    entryFile: './src/index.tsx',
  },
});
