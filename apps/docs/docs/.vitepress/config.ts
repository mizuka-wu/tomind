import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Tomind',
  description: '现代思维导图引擎 — 从 Snowbrush v2 重构而来',
  base: '/tomind/',
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/getting-started' },
          { text: 'API', link: '/api/' },
          { text: 'Demo', link: '/demo/', target: '_blank' },
          { text: 'GitHub', link: 'https://github.com/mizuka-wu/tomind' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: '指南',
              items: [
                { text: '快速开始', link: '/guide/getting-started' },
                { text: '架构设计', link: '/guide/architecture' },
                { text: '扩展系统', link: '/guide/extensions' },
                { text: '布局引擎', link: '/guide/layout' },
              ],
            },
          ],
          '/api/': [
            {
              text: 'API 参考',
              items: [
                { text: '概览', link: '/api/' },
                { text: 'SheetEditor', link: '/api/sheet-editor' },
                { text: 'Extension', link: '/api/extension' },
                { text: 'State', link: '/api/state' },
                { text: 'View', link: '/api/view' },
              ],
            },
          ],
        },
      },
    },
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/mizuka-wu/tomind' },
    ],
    footer: {
      message: 'Released under the MIT License.',
    },
  },
})
