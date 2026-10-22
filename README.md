<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/banner/banner-dark.webp">
  <source media="(prefers-color-scheme: light)" srcset="./docs/banner/banner-light.webp">
  <img alt="zzuli-developers" src="./banner/banner-light.webp">
</picture>

## 快速启动

https://jt.dogxi.me

## 写在前面

> [!NOTE]
> 本项目仅用于个人学习前端开发使用，请勿用于违法用途，任何人使用所造成的直接或间接产生的后果与作者本人无关。

把时间花在对的事情上。**为之则易，不为则难**。

## jtform 4.0 版本 🎉

当前版本为i轻工大 **2026.3.7** 更新的新假条版本。

✅ 支持长图导出（右上角收藏按钮）

✅ 提供本地 Android 版本，见 [Release](https://github.com/dogxii/zzuli-jtform/releases/latest)。

⭕️ 签批流程页面还没有去做。

---

### 项目启动

基础的 **HTML/CSS/JS** 页面，可以直接浏览器打开，也可以使用 live-server 启动。

全局安装：

```bash
npm i live-server -g
```

当前目录启动（index.html为入口）：

```bash
live-server
```

### 项目压缩

安装开发依赖：

```bash
npm i
```

压缩代码：

```bash
npx gulp
```

### iOS 主屏幕模式

在 Safari 打开入口页，通过分享菜单选择“添加到主屏幕”，然后从主屏幕图标启动。若系统提供“作为 Web App 打开”选项，请保持开启。

填写页与结果页共用 `manifest.webmanifest`，通过 `display: standalone` 和 `scope: ./` 保持在同一个独立应用窗口内。部署时需要一并发布 manifest；`npm run build` 会将它复制到 `public/`。相对路径同时适用于域名根目录和子目录部署。

如果更新前已经添加过主屏幕图标，旧图标可能保留原来的应用配置。请移除旧图标，再从 Safari 重新添加。验证时从主屏幕启动，填写并生成结果，返回填写页，再次生成；全程应没有地址栏和 Safari 底部工具栏。

---

### 项目贡献

欢迎大佬贡献完善（溜~）

### MIT 开源

可以任意修改与分发代码，只需要保留原作者署名。

MIT [@Dogxi](https://github.com/dogxii)
