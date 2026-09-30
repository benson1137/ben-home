# ben-home

Ben 的个人主页，部署在 Cloudflare Workers（静态资源）。

线上地址：https://ben-home.wangben1113.workers.dev

## 文件结构

```
public/
  index.html   页面结构与 meta（内联 SVG favicon）
  style.css    样式：响应式布局、明暗主题（prefers-color-scheme）、动画
  main.js      交互：粒子背景（canvas）、打字机标语、滚动渐显、卡片倾斜/光晕
  avatar.jpg   头像（GitHub 头像的本地副本，国内加载更稳定）
wrangler.jsonc Workers 静态资源配置
```

纯 HTML/CSS/原生 JS，无构建步骤、无外部 CDN 依赖，使用系统字体。
动画会在 `prefers-reduced-motion: reduce` 下关闭；标签页隐藏时暂停粒子动画。

## 本地预览

```bash
python3 -m http.server 8787 -d public
```

## 部署

```bash
npx wrangler deploy
```

需要环境变量 `CLOUDFLARE_API_TOKEN`。
