# ACG-Home 重构与优化方案 (Refactoring Scheme)

基于对现有代码的分析，本项目目前主要存在架构老旧、依赖不稳定、同步请求阻塞等问题。为了保证项目的长期可维护性和扩展性，建议分三个阶段进行重构。

## 阶段一：核心代码现代化 (立即执行)
**目标**: 消除“垃圾代码”和明显性能瓶颈，不引入复杂构建工具。

1.  **异步化改造 (High Priority)**
    *   **现状**: `utils.js` 和 `theme-loader.js` 中使用了 `xhr.open(..., false)` 同步请求。
    *   **行动**:
        *   将 `getWebsiteConfig` 和 `ThemeManager.parse` 改写为 `async` 函数。
        *   使用 `fetch` API 替代 `XMLHttpRequest`。
        *   在 `index.html` 中，等待异步初始化完成后再移除 Loading 遮罩。

2.  **移除全局变量污染**
    *   **现状**: 脚本通过 `<script src="...">` 引入，变量直接暴露在 `window` 下。
    *   **行动**:
        *   给 `script` 标签添加 `type="module"`。
        *   使用 `export` 导出功能函数，使用 `import` 引入依赖。
        *   将 `utils.js` 中的通用函数封装为模块。

3.  **Alpine.js 深度集成**
    *   **现状**: 混用 Vanilla JS DOM 操作 (`innerHTML`) 和 Alpine.js。
    *   **行动**:
        *   利用 Alpine.js 的 `x-for` 渲染社交图标、公告列表和主题列表。
        *   移除 `index.js` 中手动拼接 HTML 字符串的代码，提高代码可读性和安全性。

4.  **清理过时语法**
    *   **行动**: 全局替换 `var` 为 `let` 或 `const`。

## 阶段二：工程化构建体系 (推荐)
**目标**: 引入现代前端工程化流程，解决依赖管理和代码压缩问题。

1.  **引入 Vite**
    *   **理由**: 极速的本地开发服务器，开箱即用的构建优化。
    *   **行动**:
        *   `npm init vite` 初始化项目结构。
        *   将 `index.html` 移至根目录（Vite 默认结构）。

2.  **依赖本地化 (npm)**
    *   **现状**: 依赖 BootCDN，受网络环境影响大。
    *   **行动**:
        *   通过 `npm install alpinejs typed.js font-awesome markdown-it` 安装依赖。
        *   在代码中 `import` 引入，不再依赖 HTML 中的 `<script>` 标签。
        *   构建时 Vite 会自动进行 Tree-shaking 和打包。

3.  **样式预处理 (可选)**
    *   **行动**: 引入 Sass 或 PostCSS，支持嵌套语法和自动前缀，简化 CSS 编写。

## 阶段三：组件化与架构升级 (长期规划)
**目标**: 如果功能持续增加，考虑更强的组件复用性。

1.  **主题系统重构**
    *   **现状**: 主题通过 `config.json` 指定路径加载，逻辑复杂且脆弱。
    *   **建议**:
        *   定义标准的“主题接口”。
        *   利用 CSS Variables (`var(--bg-color)`) 定义全局样式契约，主题只需覆盖这些变量即可，无需加载大量额外的 CSS 文件。

2.  **内容源扩展**
    *   **建议**: 抽象数据源层，支持从 GitHub Issues、Notion 或 CMS 获取内容，而不仅仅是本地 Markdown 文件。

---

## 实施路线图建议

建议优先完成 **阶段一**，因为它不需要改变项目的部署方式（仍然是纯静态文件），但能显著提高代码质量和运行效率。
待项目稳定后，如果需要多人协作或引入更多第三方库，再推进 **阶段二**。
