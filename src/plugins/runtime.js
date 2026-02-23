import { CONSOLE_STYLES } from "../constants.js";

export function initRuntime(config) {
    if (!config || !config.runtime || !config.runtime.enable) {
        return;
    }

    const runtimeConfig = config.runtime;
    
    // Validate startTime
    const startTime = new Date(runtimeConfig.startTime).getTime();
    if (isNaN(startTime)) {
        console.warn("Invalid runtime startTime format. Runtime plugin disabled.");
        return;
    }

    // 查找页脚的 webmaster-info 元素，插入到它后面
    const footerInfo = document.querySelector(".webmaster-info");
    if (!footerInfo) {
        console.warn("Cannot find footer element to insert runtime info.");
        return;
    }

    // Check if runtime element already exists
    if (document.querySelector(".runtime-info")) {
        return;
    }

    const runtimeElement = document.createElement("div");
    runtimeElement.className = "runtime-info";
    
    // 插入到页脚
    if (footerInfo.parentNode) {
        footerInfo.parentNode.insertBefore(runtimeElement, footerInfo.nextSibling);
    } else {
        console.warn("Footer info parent node missing.");
        return;
    }

    const updateRuntime = () => {
        const now = new Date().getTime();
        const distance = now - startTime;

        if (distance < 0) {
            runtimeElement.innerText = "Future date provided.";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // 使用更简洁的模板，避免在 JS 中硬编码复杂 HTML
        runtimeElement.innerText = `本站已运行 ${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`;
    };

    // 立即更新一次
    updateRuntime();

    // 启动定时器
    const timer = setInterval(updateRuntime, 1000);

    // 页面卸载时清除定时器 (防止 SPA 切换残留，虽然目前是多页应用但养成好习惯)
    window.addEventListener('unload', () => clearInterval(timer));

    console.log("%c[Plugin]%c Runtime counter initialized.", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}
