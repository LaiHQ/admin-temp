

<h1 align="center">
  <a href="" target="_blank">admin模板</a>
</h1>

## 介绍

这是一个后台管理系统模板，基于 Vue3 、 Vite 、TypeScript、Vue Router、 pinia + Ant 、 Axios 、Less 等技术搭建。

## 特点
-  统一编码样式规范，统一ide配置。
-  自动化提交验证，检查git提交规范，代码ESLint检查及代码格式化。
-  版本管理，日志记录。
-  组件，api自动加载。
-  网络请求封装（重试，缓存数据，取消请求...等）
-  数据持久化，数据加密等。
-  基于 token 身份验证
-  打包优化（分析页面，低版本兼容，文件压缩，图片压缩...等）
-  文档说明

## 安装
``` sh
pnpm install
```

## 启动
``` sh
pnpm run dev
```

## 打包
``` sh
// 开发环境
pnpm run build:dev

// 测试环境
pnpm run build:uat

// 预发布
pnpm run build:staging

// 生产环境
pnpm run build:prod
```

## 文档
``` sh
pnpm run docs:dev
```

[dayjs](https://day.js.org/zh-CN/)