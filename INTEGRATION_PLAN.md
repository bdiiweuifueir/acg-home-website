# ACG-Home 功能整合计划方案 (Integration Plan)

本文档详细描述了如何将音乐播放器和 Live2D 看板娘集成到 ACG-Home 项目中，包括技术选型、架构设计、配置结构和详细的实施步骤。

## 1. 技术选型与项目来源

### 1.1 音乐播放器 (Music Player)
*   **核心库**: `APlayer` (MIT License) - 强大的 HTML5 音乐播放器。
*   **中间件**: `MetingJS` (MIT License) - 连接 APlayer 与各大音乐平台（网易云、QQ 音乐等）的中间件。
*   **来源**:
    *   [MoePlayer/APlayer](https://github.com/MoePlayer/APlayer)
    *   [metowolf/MetingJS](https://github.com/metowolf/MetingJS)

### 1.2 Live2D 看板娘 (Live2D Widget)
*   **核心库**: `live2d-widget` (GPL v3.0) - 封装良好的 Live2D 网页挂件。
*   **来源**: [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget)
*   **特点**: 支持自动加载模型、对话气泡、工具栏，且不需要复杂的后端配置（支持 CDN 加载模型）。

---

## 2. 架构设计

### 2.1 目录结构变更
```text
src/
├── plugins/              # 新增插件目录
│   ├── music-player.js   # 音乐播放器初始化逻辑
│   └── live2d-loader.js  # Live2D 加载逻辑
└── index.js              # 在此引入插件
```

### 2.2 配置文件结构 (`config.json`)
我们需要在现有的 `config.json` 中扩展两个新的配置项：`music` 和 `live2d`。

```json
{
  "// ... existing config ...": "",
  "music": {
    "enable": true,
    "auto": "https://music.163.com/#/playlist?id=60198", 
    "server": "netease",
    "type": "playlist",
    "id": "60198",
    "fixed": true,
    "mini": true,
    "autoplay": false,
    "theme": "#2980b9",
    "volume": 0.7
  },
  "live2d": {
    "enable": true,
    "cdnPath": "https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/",
    "model": "akari", 
    "display": {
      "position": "right", 
      "width": 150, 
      "height": 300
    },
    "mobile": {
      "show": false 
    }
  }
}
```

---

## 3. 详细实施步骤

### 阶段一：集成音乐播放器 (Music Player)

1.  **安装依赖**:
    ```bash
    npm install aplayer meting --save
    ```
    *注意*: `meting` 包通常包含 `Meting.min.js`，我们需要在代码中正确引入。

2.  **创建 `src/plugins/music-player.js`**:
    *   引入 `aplayer` 和 `meting`。
    *   导出 `initMusicPlayer(config)` 函数。
    *   根据 `config.music` 动态创建 `<meting-js>` 元素并挂载到 `body`。
    *   处理 APlayer 的 CSS 引入。

3.  **更新 `src/index.js`**:
    *   调用 `initMusicPlayer`。

### 阶段二：集成 Live2D 看板娘 (Live2D Widget)

1.  **安装依赖**:
    由于 `live2d-widget` 通常通过 CDN 加载或直接引入脚本，我们可以选择下载核心脚本到本地或使用 CDN。考虑到稳定性，我们采用 **动态加载远程脚本** 的方式，或者将其核心逻辑封装为本地模块。
    为了避免“垃圾代码”，我们将创建一个干净的加载器。

2.  **创建 `src/plugins/live2d-loader.js`**:
    *   导出 `initLive2D(config)` 函数。
    *   该函数负责：
        *   判断 `config.live2d.enable`。
        *   判断移动端是否显示。
        *   动态加载 `live2d-widget` 的核心 JS 和 CSS。
        *   初始化 Widget。

3.  **更新 `src/index.js`**:
    *   调用 `initLive2D`。

### 阶段三：配置更新与验证

1.  **更新 `config.json`**: 添加默认配置。
2.  **验证**:
    *   启动开发服务器 `npm run dev`。
    *   检查左下角是否有播放器。
    *   检查右下角/左下角是否有看板娘。
    *   检查控制台是否有报错。

---

## 4. 规避“垃圾代码”策略

*   **模块化**: 所有功能封装在 `src/plugins` 下，不污染 `index.js` 主逻辑。
*   **按需加载**: Live2D 资源较大，脚本应使用异步加载，不阻塞首屏。
*   **配置驱动**: 所有硬编码参数（如 API 地址、模型名称）全部提取到 `config.json`。
*   **错误处理**: 网络请求失败或脚本加载失败时，应有 `try-catch` 保护，不影响主站运行。
