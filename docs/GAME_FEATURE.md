## 🎮 在线游戏功能

本项目集成了 [WebGAL](https://github.com/OpenWebGAL/WebGAL) 引擎，支持在网页中直接运行视觉小说。

### 如何添加游戏

1.  **准备游戏文件**: 将 WebGAL 导出的游戏文件放入 `public/webgal` 目录。
    *   确保 `public/webgal/index.html` 存在。
    *   将剧本文件放入 `public/webgal/game` 目录。
2.  **配置入口**: 修改 `public/config.json` 中的 `games` 字段：

```json
"games": {
    "enable": true,
    "list": [
        {
            "id": "demo",
            "title": "游戏标题",
            "cover": "/assets/images/cover.jpg",
            "description": "游戏描述",
            "path": "/webgal/index.html"
        }
    ]
}
```

### 目录结构

```text
public/
  ├── webgal/
  │   ├── index.html        # 引擎入口
  │   ├── game/             # 剧本与资源
  │   └── ...
```

### 开发自定义剧本

修改 `public/webgal/game/start.txt` 即可编写剧本。支持背景切换、人物立绘、分支选项等 WebGAL 所有功能。
