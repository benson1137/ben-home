# ben-home

Ben 的个人主页，部署在 Cloudflare Workers（静态资源）。

线上地址：https://ben-home.wangben1113.workers.dev

## 部署

```bash
npx wrangler deploy
```

需要环境变量 `CLOUDFLARE_API_TOKEN`。页面内容在 `public/index.html`。
