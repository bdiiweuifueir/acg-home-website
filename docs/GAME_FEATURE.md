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
由于商业游戏体积通常较大（>100MB），**严禁直接放入项目仓库**。请使用对象存储。

**推荐方案：Cloudflare R2（免费/高速）**

1.  **准备模拟器**: 下载 [web-kirikiri](https://github.com/zeas2/web-kirikiri) 核心文件 (`krkr.js`, `krkr.wasm`) 放入 `public/games/engines/krkr/`。
2.  **上传资源**:
    *   注册 Cloudflare R2，创建一个公开桶（Bucket）。
    *   将游戏的 `data.xp3` 上传。
    *   **关键**: 在 R2 的 "Settings" -> "CORS Policy" 中添加允许跨域规则：
        ```json
        [
          {
            "AllowedOrigins": ["https://your-vercel-domain.app", "http://localhost:5173"],
            "AllowedMethods": ["GET"],
            "AllowedHeaders": ["*"]
          }
        ]
        ```
    *   获取文件直链，如 `https://pub-xxx.r2.dev/game.xp3`。
3.  **配置入口**:
    ```json
    {
        "id": "nekopara",
        "title": "Nekopara Vol.1",
        "engine": "krkr",
        "path": "/games/engines/krkr/index.html",
        "cover": "...",
        "args": {
            "data": "https://pub-xxx.r2.dev/game.xp3"
        }
    }
    ```

### 开发自定义剧本

修改 `public/games/engines/webgal/game/start.txt` 即可编写剧本。支持背景切换、人物立绘、分支选项等 WebGAL 所有功能。
