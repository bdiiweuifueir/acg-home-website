import { CONSOLE_STYLES, Z_INDEX } from "../constants.js";
import { isMobile } from "../utils.js";

export function initLive2D(config) {
    if (!config || !config.live2d || !config.live2d.enable) {
        return;
    }

    const live2dConfig = config.live2d;

    // Mobile Check
    if (live2dConfig.mobile && live2dConfig.mobile.show === false) {
        if (isMobile()) {
            console.log("%c[I]%c Live2D disabled on mobile.", CONSOLE_STYLES.INFO, "");
            return;
        }
    }

    // Validate Config
    if (!live2dConfig.scriptPath || !live2dConfig.waifuPath || !live2dConfig.cdnPath) {
        console.warn("%c[W]%c Live2D configuration missing required paths (scriptPath, waifuPath, cdnPath).", CONSOLE_STYLES.WARN, "");
        return;
    }

    // Global settings for live2d-widget
    window.live2d_settings = {
        modelId: 1,
        modelTexturesId: 87,
        ...live2dConfig.settings,
        waifuPath: live2dConfig.waifuPath,
        cdnPath: live2dConfig.cdnPath,
    };

    // Load Script
    loadScript(live2dConfig.scriptPath)
        .then(() => {
            console.log("%c[I]%c Live2D Widget loaded.", CONSOLE_STYLES.INFO, "");
            handlePostLoad();
        })
        .catch((err) => {
            console.error("%c[E]%c Failed to load Live2D Widget:", CONSOLE_STYLES.ERROR, "", err);
        });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
    });
}

function handlePostLoad() {
    // Check if elements already exist (fast path)
    if (document.getElementById("waifu") || document.getElementById("live2dcanvas")) {
        applyStyles();
        return;
    }

    // Use MutationObserver to wait for DOM elements
    // Optimized: Only observe childList, assume widget injects directly into body or container
    const observer = new MutationObserver((mutations) => {
        let found = false;
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && (node.id === "waifu" || node.id === "live2dcanvas")) {
                    applyStyles();
                    found = true;
                }
            }
        }
        
        // If we found the elements, we can disconnect.
        if (found && document.getElementById("waifu")) {
             observer.disconnect();
        }
    });
    
    // Optimized: Removed subtree: true to reduce performance overhead
    // The live2d-widget usually appends to body directly
    observer.observe(document.body, { childList: true, subtree: false });

    // Fallback polling for safety if widget injects deeper
    const pollId = setInterval(() => {
        if (document.getElementById("waifu")) {
            applyStyles();
            observer.disconnect();
            clearInterval(pollId);
        }
    }, 1000);

    // Timeout protection
    setTimeout(() => {
        observer.disconnect();
        clearInterval(pollId);
    }, 10000);
}

function applyStyles() {
    const canvas = document.getElementById("live2dcanvas");
    const tips = document.getElementById("waifu");

    if (canvas) {
        canvas.style.zIndex = Z_INDEX.LIVE2D;
        canvas.style.pointerEvents = "auto";
    }

    if (tips) {
        tips.style.zIndex = Z_INDEX.LIVE2D;
        
        // Dynamic class for Music Player overlap
        const musicPlayer = document.getElementById("music-player-container");
        if (musicPlayer && musicPlayer.offsetHeight > 0) {
            tips.classList.add("with-music-player");
        }
    }
}
