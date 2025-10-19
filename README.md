![MarkFlow-for-Electron](https://socialify.git.ci/QNquenan/MarkFlow-for-Electron/image?custom_description=%E4%B8%80%E6%AC%BE%E5%9F%BA%E4%BA%8E+Electron+%E5%92%8C+Vue+3+%E7%9A%84%E6%A1%8C%E9%9D%A2%E7%AB%AF%E5%9B%BE%E7%89%87%E6%B0%B4%E5%8D%B0%E5%A4%84%E7%90%86%E5%B7%A5%E5%85%B7&description=1&font=JetBrains+Mono&forks=1&issues=1&language=1&name=1&owner=1&pattern=Brick+Wall&pulls=1&stargazers=1&theme=Light)

<br>

---

<p align="center">
  <img src="./resources/favicon.png" alt="MarkFlow Logo" width="128" height="128">
</p>

<p align="center">
  一款基于 Electron 和 Vue 3 的桌面端图片水印处理工具
</p>

<p align="center">
  <a href="https://github.com/QNquenan/MarkFlow-for-Electron/releases"><img src="https://img.shields.io/github/v/release/QNquenan/MarkFlow-for-Electron?style=flat-square" alt="GitHub release"></a>
  <a href="https://github.com/QNquenan/MarkFlow-for-Electron/stargazers"><img src="https://img.shields.io/github/stars/QNquenan/MarkFlow-for-Electron?style=flat-square" alt="GitHub stars"></a>
  <a href="https://github.com/QNquenan/MarkFlow-for-Electron/blob/main/LICENSE"><img src="https://img.shields.io/github/license/QNquenan/MarkFlow-for-Electron?style=flat-square" alt="GitHub"></a>
</p>

## 简介

MarkFlow 是一款专为设计师、摄影师和内容创作者打造的桌面端图片水印处理工具。它支持批量添加水印、自定义水印位置、自动反色等功能，帮助您快速高效地为图片添加水印保护。

### 主要特性

- 🖼️ **批量处理**: 一次性导入多张图片进行批量处理
- 🎯 **精准定位**: 自定义水印在图片中的位置（X/Y坐标）
- 📏 **缩放控制**: 可调节水印大小比例
- 🎨 **自动反色**: 根据背景明暗自动调整水印颜色，确保水印清晰可见
- 📁 **拖拽导入**: 支持拖拽方式导入图片
- 🌈 **主题切换**: 支持粉色系和蓝色系两种主题
- 🗂️ **工作目录**: 可自定义导出文件夹
- 💾 **配置保存**: 自动保存用户设置，下次使用更便捷

## 技术栈

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 前端构建工具
- [Element Plus Icons](https://element-plus.org/) - 图标库
- [Canvas](https://www.npmjs.com/package/canvas) - Node.js 图像处理
- [piexifjs](https://github.com/hMatoba/piexifjs) - EXIF 元数据处理

## 推荐 IDE 设置

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 项目设置

### 安装依赖

```bash
$ npm install
```

### 开发模式

```bash
$ npm run dev
```

### 构建应用

```bash
# 构建 Windows 版本
$ npm run build:win

# 构建 macOS 版本
$ npm run build:mac

# 构建 Linux 版本
$ npm run build:linux
```

## 使用说明

1. **导入图片**:
   - 点击主界面的"上传"按钮选择图片
   - 或直接将图片拖拽到上传区域

2. **设置水印**:
   - 在"我的水印"页面导入并选择水印图片
   - 可设置水印缩放比例和位置

3. **配置参数**:
   - 调整水印的X/Y轴位置（百分比）
   - 设置水印缩放比例
   - 可开启自动反色功能

4. **执行任务**:
   - 点击"开始任务"按钮处理图片
   - 处理完成的图片将保存到指定的工作目录

## 目录结构

```
.
├── src
│   ├── main          # 主进程代码
│   ├── preload       # 预加载脚本
│   └── renderer      # 渲染进程代码
├── resources         # 资源文件
├── docs              # 文档图片
├── build             # 构建配置
└── package.json      # 项目配置文件
```

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进 MarkFlow。

## 作者

By [Quenan](https://github.com/QNquenan)

## 许可证

[MIT](./LICENSE) © Quenan
