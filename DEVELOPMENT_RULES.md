# ACG-Home 开发规范 (Development Rules)

本文件定义了 ACG-Home 项目的开发规范，旨在避免“垃圾代码”、提高代码质量、增强安全性及可维护性。所有贡献者在提交代码前请务必遵守以下规则。

## 1. JavaScript 核心规范

### 1.1 严禁使用同步 XHR
*   **规则**: 禁止使用 `XMLHttpRequest` 的同步模式 (`xhr.open(..., false)`).
*   **理由**: 同步网络请求会阻塞浏览器主线程，导致页面假死，严重影响用户体验。
*   **替代**: 必须使用 `fetch` API 配合 `async/await` 处理异步请求。

### 1.2 变量声明
*   **规则**: 严禁使用 `var`。
*   **理由**: `var` 存在变量提升和作用域污染问题。
*   **替代**:
    *   不可变数据使用 `const`。
    *   可变数据使用 `let`。

### 1.3 模块化开发
*   **规则**: 避免将变量直接挂载到 `window` 全局对象。
*   **理由**: 全局变量容易造成命名冲突和难以追踪的 Bug。
*   **替代**: 使用 ES Modules (`import`/`export`) 进行代码组织。在 HTML 中使用 `<script type="module">`。

### 1.4 错误处理
*   **规则**: 禁止静默失败。
*   **理由**: 使用 `Proxy` 自动初始化对象（如 `autoInitObject`）虽然方便，但可能掩盖配置错误（访问不存在的属性不报错）。
*   **替代**: 明确检查配置项是否存在，对于关键错误（如配置文件加载失败）应在 UI 上给予用户明确提示，而不仅仅是打印到控制台。

## 2. 安全性规范

### 2.1 防范 XSS 攻击
*   **规则**: 谨慎使用 `innerHTML`。
*   **理由**: 直接将未经清洗的数据插入 HTML 可能导致跨站脚本攻击 (XSS)。
*   **替代**:
    *   尽可能使用 `textContent` 或 `innerText`。
    *   如果必须插入 HTML（如 Markdown 渲染结果），必须确保源数据可信，或使用 DOMPurify 等库进行清洗。

### 2.2 依赖管理
*   **规则**: 避免直接依赖特定版本的公共 CDN（如 BootCDN）。
*   **理由**: 公共 CDN 可能不稳定或被投毒。
*   **替代**:
    *   推荐使用 npm 管理依赖，并通过构建工具打包。
    *   或者使用可靠的、带有 SRI (Subresource Integrity) 校验的 CDN 链接。

## 3. 代码风格与质量

### 3.1 注释
*   **规则**: 关键逻辑必须添加注释，但避免“废话注释”。
*   **示例**:
    *   ✅ `// 节流函数：限制事件触发频率`
    *   ❌ `// 定义一个变量`

### 3.2 命名规范
*   **变量/函数**: 小驼峰命名法 (`camelCase`)，如 `loadTheme`。
*   **类名**: 大驼峰命名法 (`PascalCase`)，如 `ThemeManager`。
*   **常量**: 全大写下划线分隔 (`UPPER_SNAKE_CASE`)，如 `MAX_RETRY_COUNT`。

### 3.3 移除调试代码
*   **规则**: 生产环境代码中不应保留过多的 `console.log`，尤其是带有大量 CSS 样式的炫技性日志，除非是必要的版权声明。

## 4. CSS 与 UI 规范

### 4.1 样式隔离
*   **规则**: 避免使用过于通用的类名（如 `.card`），以免与第三方库冲突。
*   **替代**: 使用 BEM 命名法（如 `.profile-card__title`）或 CSS Modules（如果引入构建工具）。

### 4.2 响应式设计
*   **规则**: 优先使用 CSS Media Queries 处理响应式布局，而非 JS 监听 `resize` 事件。
*   **理由**: CSS 引擎处理布局比 JS 更高效且不易出错。

## 5. 提交规范 (Git)

*   **格式**: `type(scope): subject`
*   **示例**:
    *   `feat(theme): add dark mode support`
    *   `fix(loader): resolve synchronous xhr blocking issue`
    *   `refactor(core): switch to es modules`
