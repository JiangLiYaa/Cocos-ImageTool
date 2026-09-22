# cocos-tinify

Cocos Creator 3.8+ 图片压缩扩展，基于 [TinyPNG Tinify API](https://tinypng.com/developers)。

## 功能

- 资源管理器右键 **压缩图片**（单张）
- 资源管理器右键 **压缩文件夹中的图片**（批量）
- 构建面板勾选 **启用图片压缩**，构建完成后自动压缩输出目录图片
- 控制台输出压缩前后体积、压缩率、本月 API 用量

## 安装

1. 扩展位于项目 `extensions/cocos-tinify` 目录
2. 在扩展目录执行：

```bash
npm install
npm run build
```

3. 打开 Cocos Creator → **扩展** → **扩展管理器** → **项目** 标签 → 刷新 → 启用 `cocos-tinify`

## 配置 API Key

1. 菜单 **项目** → **项目设置** → 左侧 **cocos-tinify**
2. 填写 `Tinify API Key`（在 [tinypng.com/developers](https://tinypng.com/developers) 获取）
3. 构建时也可在 **构建发布** 面板底部单独填写 Key（留空则使用项目设置）

## 使用

### 资源管理器

右键图片或文件夹 → `cocos-tinify` → 选择压缩选项。

### 构建后压缩

1. 打开 **构建发布** 面板
2. 展开底部 **cocos-tinify**
3. 勾选 **启用图片压缩**，按需调整正则和最小文件大小
4. 点击 **构建**

## 注意

- 压缩会**覆盖原文件**，建议使用 Git 管理资源
- Tinify 免费额度约每月 500 次，超出需付费
- 需要联网访问 `api.tinify.com`
