import { CONSOLE_STYLES, Z_INDEX, STORAGE_KEYS, BACKGROUND_SOURCES, BG_CONFIG } from "../constants.js";
import "../styles/random-background.css";
import { showToast } from "./toast.js";

// Singleton state
let isInitializing = false;
let currentBtn = null;
let currentSourceIndex = 0;
let preloadedResource = null; // Store the next resource URL
let sources = [];
let wallpaperContainer = null;

export function initRandomBackground(config) {
    if (!config || !config.randomBg || !config.randomBg.enable) {
        return;
    }

    // Prevent re-initialization stacking
    if (isInitializing) {
        return;
    }
    isInitializing = true;

    // Cleanup existing button
    const existingBtn = document.getElementById("random-bg-btn");
    if (existingBtn) {
        existingBtn.remove();
    }

    // Load sources
    sources = config.randomBg.sources || BACKGROUND_SOURCES;

    // Create Wallpaper Container (Fixed background)
    createWallpaperContainer();

    // Force body/html transparent to show wallpaper
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";

    // Restore last background from local storage (if valid and recent < 24h)
    const restored = restoreLastBackground();

    // If no background restored (first visit or expired), load one immediately
    if (!restored) {
        fetchNextResource().then(url => {
            applyBackground(url);
            // Save it so it persists on reload
            try {
                localStorage.setItem(STORAGE_KEYS.LAST_BG_URL, url);
                localStorage.setItem(STORAGE_KEYS.LAST_BG_TIME, new Date().getTime());
            } catch (e) {}
        }).catch(err => {
            console.error("[Background] Initial load failed:", err);
        });
    }

    // Create UI
    createButton();

    // Start preloading the next resource immediately
    preloadNextResource();

    console.log("%c[Plugin]%c Random Background Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
    isInitializing = false;
}

function createWallpaperContainer() {
    if (document.getElementById("global-wallpaper-container")) {
        wallpaperContainer = document.getElementById("global-wallpaper-container");
        return;
    }
    wallpaperContainer = document.createElement("div");
    wallpaperContainer.id = "global-wallpaper-container";
    // Insert at the beginning of body to ensure it's behind everything
    document.body.insertBefore(wallpaperContainer, document.body.firstChild);
}

function createButton() {
    // Double check to prevent duplicates
    if (document.getElementById("random-bg-btn")) return;

    const btn = document.createElement("div");
    btn.id = "random-bg-btn";
    btn.title = "切换随机背景";
    // Add a specific class to the icon to avoid global styling issues
    btn.innerHTML = `<i class="fa-solid fa-image"></i>`;
    btn.style.zIndex = Z_INDEX.RANDOM_BG_BTN; // Use centralized Z-Index
    document.body.appendChild(btn);
    currentBtn = btn;

    btn.addEventListener("click", handleClick);
}

async function handleClick() {
    if (!currentBtn || currentBtn.classList.contains("loading")) {
        return;
    }

    // Throttle clicks (simple check)
    currentBtn.classList.add("loading");

    try {
        let resourceUrl;

        // Use preloaded resource if available
        if (preloadedResource) {
            resourceUrl = preloadedResource;
            preloadedResource = null; // Consume it
            console.log("%c[Background]%c Using preloaded resource", CONSOLE_STYLES.TAG_BLUE, CONSOLE_STYLES.INFO);
        } else {
            // Fallback to fetch immediate if no preload (e.g. first click too fast)
            resourceUrl = await fetchNextResource();
        }

        applyBackground(resourceUrl);

        // Save to local storage
        try {
            localStorage.setItem(STORAGE_KEYS.LAST_BG_URL, resourceUrl);
            localStorage.setItem(STORAGE_KEYS.LAST_BG_TIME, new Date().getTime());
        } catch (e) {
            console.warn("LocalStorage access denied:", e);
        }

        // Trigger next preload
        preloadNextResource();
    } catch (error) {
        console.error("[Background] Switch failed:", error);
        showToast("切换背景失败，请稍后重试", "error");
    } finally {
        if (currentBtn) {
            currentBtn.classList.remove("loading");
        }
    }
}

function fetchNextResource(retryCount = 0) {
    return new Promise((resolve, reject) => {
        if (retryCount > BG_CONFIG.MAX_RETRIES) {
            reject(new Error("Max retries exceeded"));
            return;
        }

        // Get next source (round robin)
        const sourceUrl = sources[currentSourceIndex];
        currentSourceIndex = (currentSourceIndex + 1) % sources.length;

        // Determine type
        const isVideo = /\.(mp4|webm)$/i.test(sourceUrl);
        const isStaticImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(sourceUrl);
        
        // Fix: Properly handle query parameters when adding timestamp
        const separator = sourceUrl.includes('?') ? '&' : '?';
        const urlToLoad = (isStaticImage || isVideo) ? sourceUrl : `${sourceUrl}${separator}t=${new Date().getTime()}`;

        if (isVideo) {
            // For video, we resolve immediately, browser will handle buffering
            // We could try to preload via fetch blob, but that might be heavy
            resolve(urlToLoad);
        } else {
            // Preload image
            const img = new Image();
            let timeoutId;

            const cleanup = () => {
                clearTimeout(timeoutId);
                img.onload = null;
                img.onerror = null;
            };

            img.onload = () => {
                cleanup();
                resolve(urlToLoad);
            };

            img.onerror = () => {
                cleanup();
                console.warn(`[Background] Failed to load: ${urlToLoad}, retrying...`);
                // Recursive retry with next source
                fetchNextResource(retryCount + 1)
                    .then(resolve)
                    .catch(reject);
            };

            // Timeout
            timeoutId = setTimeout(() => {
                cleanup();
                console.warn(`[Background] Timeout: ${urlToLoad}, retrying...`);
                img.src = ""; // Cancel request if possible
                fetchNextResource(retryCount + 1)
                    .then(resolve)
                    .catch(reject);
            }, BG_CONFIG.TIMEOUT);

            img.src = urlToLoad;
        }
    });
}

function preloadNextResource() {
    // Silent preload
    fetchNextResource()
        .then(url => {
            preloadedResource = url;
            console.log("%c[Background]%c Next resource preloaded", CONSOLE_STYLES.TAG_BLUE, CONSOLE_STYLES.INFO);
        })
        .catch(err => {
            console.warn("[Background] Preload failed, will fetch on click", err);
        });
}

function applyBackground(url) {
    if (!wallpaperContainer) return;

    const isVideo = /\.(mp4|webm)$/i.test(url);

    // 1. Create a new layer for smooth transition
    const newLayer = document.createElement("div");
    newLayer.className = "wallpaper-layer";

    if (isVideo) {
        newLayer.innerHTML = `
            <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
                <source src="${url}" type="video/mp4">
            </video>
        `;
    } else {
        newLayer.style.backgroundImage = `url('${url}')`;
    }
    
    // Append to container
    wallpaperContainer.appendChild(newLayer);

    // Force reflow
    void newLayer.offsetWidth;

    // Activate transition
    newLayer.classList.add("active");

    // Remove old layers after transition
    setTimeout(() => {
        const layers = wallpaperContainer.querySelectorAll(".wallpaper-layer");
        // Keep only the last one (current one)
        for (let i = 0; i < layers.length - 1; i++) {
            layers[i].remove();
        }
    }, BG_CONFIG.TRANSITION_DURATION); // 1000ms transition

    // 2. Also sync Page Head if needed
    const pageHead = document.querySelector(".page-head");
    if (pageHead) {
        pageHead.style.background = "transparent";
    }

    // Ensure body background doesn't block it
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
}

function restoreLastBackground() {
    try {
        const lastUrl = localStorage.getItem(STORAGE_KEYS.LAST_BG_URL);
        const lastTime = localStorage.getItem(STORAGE_KEYS.LAST_BG_TIME);

        if (lastUrl && lastTime) {
            const now = new Date().getTime();
            const oneDay = 24 * 60 * 60 * 1000;

            // If saved within 24 hours, restore it
            if (now - parseInt(lastTime) < oneDay) {
                applyBackground(lastUrl);
                console.log("%c[Background]%c Restored from session", CONSOLE_STYLES.TAG_BLUE, CONSOLE_STYLES.INFO);
                return true;
            }
        }
    } catch (e) {
        console.warn("LocalStorage access denied during restore:", e);
    }
    return false;
}
