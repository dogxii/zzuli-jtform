# Mobile 打包目录

这个目录专门用于放 `Capacitor` 打包工程，避免污染当前前端项目根目录。

## 推荐结构

```text
mobile/
  app/
```

其中：

1. 根目录继续维护 Web 项目源码
2. `mobile/app` 作为独立的 Capacitor 工程
3. Capacitor 的 `webDir` 指向上层项目的 `public/`

## 当前状态

`mobile/app` 已初始化完成，当前配置为：

1. `appName`: `i假条`
2. `appId`: `me.dogxi.jt`
3. `webDir`: `../../public`

## 日常同步

每次前端改动后：

```bash
npm run build
cd mobile/app
npm run sync
```

## 创建原生工程

```bash
cd mobile/app
npm run add:ios
npm run add:android
```

## 打开原生工程

```bash
cd mobile/app
npm run open:ios
npm run open:android
```

## 说明

1. 根目录仍然只负责 Web 项目
2. `mobile/app` 独立负责 App 打包
3. 还没有创建 `ios/` 和 `android/` 原生工程目录，需要执行 `npm run add:ios` / `npm run add:android`
