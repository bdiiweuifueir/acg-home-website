import { CONSOLE_STYLES } from "../constants.js";

export function initTitleTrick(config) {
    if (!config || !config.titleTrick || !config.titleTrick.enable) {
        return;
    }

    const { leaveTitle, returnTitle, leaveDelay = 0, returnDelay = 2000 } = config.titleTrick;
    let originalTitle = document.title;
    let leaveTimer = null;
    let returnTimer = null;

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            // 用户离开
            // Capture current title before changing it, in case it changed via SPA routing
            originalTitle = document.title;
            
            // Clear any pending return timer
            if (returnTimer) clearTimeout(returnTimer);

            leaveTimer = setTimeout(() => {
                document.title = leaveTitle || "崩溃了！";
            }, leaveDelay);
        } else {
            // 用户回来
            // Clear any pending leave timer
            if (leaveTimer) clearTimeout(leaveTimer);

            document.title = returnTitle || "又好了~";
            returnTimer = setTimeout(() => {
                document.title = originalTitle; // 恢复原标题
            }, returnDelay);
        }
    });

    console.log("%c[I]%c Title Trick initialized.", CONSOLE_STYLES.INFO, "");
}
