import { defineConfig } from 'dumi';

export default defineConfig({
  title: '江南烟雨',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: '/head.png',
  outputPath: 'dist',
  resolve: {
    includes: ['src'],
  },
  exportStatic: {},
  mode: 'site',
  navs: [null, { title: 'GitHub', path: 'https://github.com/hzm0321' }],
  // more config: https://d.umijs.org/config
});
