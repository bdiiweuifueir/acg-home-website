import { CONSOLE_STYLES } from "../constants.js";

export function initTitleTrick(config) {
    if (!config || !config.titleTrick || !config.titleTrick.enable) {
        return;
    }

    const { leaveTitle, returnTitle, leaveDelay = 0, returnDelay = 2000 } = config.titleTrick;
    const originalTitle = document.title;
    let timer = null;

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            // 用户离开
            if (leaveDelay > 0) {
                setTimeout(() => {
                    document.title = leaveTitle || "崩溃了！";
                }, leaveDelay);
            } else {
                document.title = leaveTitle || "崩溃了！";
            }
            if (timer) {
                clearTimeout(timer);
            }
        } else {
            // 用户回来
            document.title = returnTitle || "又好了~";
            timer = setTimeout(() => {
                document.title = originalTitle; // 恢复原标题
            }, returnDelay);
        }
    });

    console.log("%c[I]%c Title Trick initialized.", CONSOLE_STYLES.INFO, "");
}
