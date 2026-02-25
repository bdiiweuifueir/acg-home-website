## 🎮 在线游戏功能

本项目集成了多种游戏引擎适配器，支持在网页中直接运行视觉小说。

### 支持的引擎

1.  **WebGAL**: 原创 Web 视觉小说引擎。
2.  **Kirikiri (Krkr)**: 用于运行经典的 `.xp3` 格式商业游戏（如《Fate/stay night》、《Nekopara》）。

### 目录结构

```text
public/
  ├── games/
  │   ├── engines/
  │   │   ├── webgal/       # WebGAL 引擎
  │   │   ├── krkr/         # Kirikiri 模拟器 (需自行下载 krkr.js)
  │   │   └── ...
  │   └── resources/        # 游戏资源文件 (data.xp3, arc.nsa 等)
```

### 如何添加游戏

#### 1. WebGAL 游戏
1.  将 WebGAL 导出的游戏文件放入 `public/games/engines/webgal` 目录。
2.  修改 `public/config.json`：
    ```json
    {
        "id": "my_game",
        "title": "我的 WebGAL 游戏",
        "engine": "webgal",
        "path": "/games/engines/webgal/index.html",
        "cover": "..."
    }
    ```

#### 2. Kirikiri (Krkr) 游戏
1.  **准备模拟器**: 下载 [web-kirikiri](https://github.com/zeas2/web-kirikiri) 或类似项目的核心文件 (`krkr.js`, `krkr.wasm` 等)，放入 `public/games/engines/krkr/`。
2.  **准备游戏资源**: 提取游戏的 `data.xp3` 文件，上传到对象存储或放入 `public/games/resources/`（注意 Vercel 文件大小限制）。
3.  **配置入口**:
    ```json
    {
        "id": "nekopara",
        "title": "Nekopara Vol.1",
        "engine": "krkr",
        "path": "/games/engines/krkr/index.html",
        "cover": "...",
        "args": {
            "data": "https://your-cdn.com/nekopara/data.xp3"
        }
    }
    ```
    *   `args.data`: 必须填写 `.xp3` 文件的 URL（推荐使用 CDN 或外部直链，因为大文件不适合放在本项目仓库中）。

### 开发自定义剧本

修改 `public/games/engines/webgal/game/start.txt` 即可编写剧本。支持背景切换、人物立绘、分支选项等 WebGAL 所有功能。
