import Alpine from "alpinejs";
import Typed from "typed.js";
// FontAwesome CSS import
import "@fortawesome/fontawesome-free/css/all.min.css";
// Global Styles
import "./styles/elements.css";
import "./styles/index.css";
import "./styles/responsive/index.css";
import "./styles/post-list.css"; // Import Post List styles
import "./styles/friends.css"; // Import Friends styles
import "./styles/live2d.css"; // Import Live2D styles

import { getWebsiteConfig, renderMarkdown } from "./utils.js";
import { ThemeManager } from "./theme-loader.js";
import { initMusicPlayer } from "./plugins/music-player.js";
import { initLive2D } from "./plugins/live2d-loader.js";
import { initSakura } from "./plugins/sakura.js";
import { initLightbox, refreshLightbox } from "./plugins/lightbox.js";
import { initClickEffect } from "./plugins/click-effect.js";
import { initTiltEffect } from "./plugins/tilt-effect.js";
import { initRuntime } from "./plugins/runtime.js";
import { initContextMenu } from "./plugins/context-menu.js";
import { initKonami } from "./plugins/konami.js";
import { initTitleTrick } from "./plugins/title-trick.js";
import { initAnimeList } from "./plugins/anime-list.js";
import { initAnimeNews } from "./plugins/anime-news.js";
import { initGalgameSection } from "./plugins/galgame-section.js"; // Import Galgame Plugin
import { initMangaSection } from "./plugins/manga-section.js"; // Import Manga Plugin
import { initNavigation } from "./plugins/navigation.js";
import { initGameLauncher } from "./plugins/game-launcher.js"; // Import Game Launcher
import { initRandomBackground } from "./plugins/random-background.js";
import { initHitokoto } from "./plugins/hitokoto.js";
import { initBackToTop } from "./plugins/back-to-top.js";
import { initGlobalSearch } from "./plugins/global-search.js";
import { initComment } from "./plugins/comment.js"; // Fixed import
import { initPostLoader } from "./plugins/post-loader.js"; // Keep PostLoader
import { initImageSearch } from "./plugins/image-search.js"; // Import Image Search
import { STORAGE_KEYS, SELECTORS, THEME_CONFIG, API_ENDPOINTS, CONSOLE_STYLES } from "./constants.js";

/**
 * 核心初始化函数
 */
async function initApp() {
    // 设置一个全局超时，防止 Loading 动画卡死
    const safetyTimer = setTimeout(() => {
        console.warn("App initialization timed out, forcing loader removal.");
        removeLoader();
    }, 5000);

    try {
        // 1. 获取网站配置
        const config = await getWebsiteConfig();
        window.config = config; // 暴露给 Alpine 和全局环境

        // 2. 初始化核心服务 (主题、Alpine)
        let themeManager = null;
        try {
            themeManager = await initTheme(config);
        } catch (e) {
            console.error("Theme initialization failed:", e);
        }
        
        initAlpine();

        // 3. 启动插件 (音乐播放器、Live2D、樱花、灯箱、点击特效、视差效果、运行时间、右键菜单、彩蛋、动态标题、评论)
        // 注意：灯箱需要在 Markdown 渲染后刷新，这里只做初始化配置
        let lightbox = null;
        try {
            lightbox = initPlugins(config);
        } catch (e) {
            console.error("Plugins initialization failed:", e);
        }

        // 4. 获取 DOM 元素引用
        const elements = getDomElements();

        // 5. 渲染 UI 组件
        try {
            await renderUI(config, themeManager, elements, lightbox);
        } catch (e) {
            console.error("UI rendering failed:", e);
        }
        
        // 6. Init Mobile Menu
        initMobileMenu();

    } catch (error) {
        console.error("Critical initialization failed:", error);
    } finally {
        // 7. 移除 Loading 动画 (无论成功与否都要移除)
        clearTimeout(safetyTimer); // 清除超时定时器
        removeLoader();
    }
}

/**
 * 初始化主题管理器
 */
async function initTheme(config) {
    const themeManager = new ThemeManager(config);
    window.themeManager = themeManager; // 暴露给 HTML 中的 onclick 事件

    // 如果第一次访问，将配色方案设置为默认值
    if (localStorage.getItem(STORAGE_KEYS.THEME_COLOR) === null) {
        if (config.content.theme.colors && config.content.theme.colors.default) {
            await themeManager.setColor(config.content.theme.colors.default);
        }
    } else {
        // 否则正常加载主题
        await themeManager.load();
    }
    return themeManager;
}

/**
 * 初始化 Alpine.js
 */
function initAlpine() {
    window.Alpine = Alpine;
    Alpine.start();
}

/**
 * 初始化插件
 */
function initPlugins(config) {
    let lightboxInstance = null;
    if (config.content) {
        // Helper to safely init plugin
        const safeInit = (name, fn, cfg) => {
            try {
                if (typeof fn !== 'function') {
                     console.warn(`Plugin [${name}] init function is not a function.`);
                     return null;
                }
                return fn(cfg);
            } catch (e) {
                console.error(`Plugin [${name}] failed to load:`, e);
                return null;
            }
        };

        safeInit("MusicPlayer", initMusicPlayer, config.content);
        safeInit("Live2D", initLive2D, config.content);
        safeInit("Sakura", initSakura, config.content);
        safeInit("ClickEffect", initClickEffect, config.content);
        safeInit("TiltEffect", initTiltEffect, config.content);
        safeInit("Runtime", initRuntime, config.content);
        safeInit("ContextMenu", initContextMenu, config.content);
        safeInit("Konami", initKonami, config.content);
        safeInit("TitleTrick", initTitleTrick, config.content);
        safeInit("AnimeList", initAnimeList, config.content);
        safeInit("AnimeNews", initAnimeNews, config.content);
        safeInit("GalgameSection", initGalgameSection, config.content); 
        safeInit("MangaSection", initMangaSection, config.content); 
        
        // Ensure Game Launcher is initialized and handle potential DOM timing issues
        requestAnimationFrame(() => {
            safeInit("GameLauncher", initGameLauncher, config.content);
        });

        safeInit("Navigation", initNavigation, config.content);
        safeInit("RandomBackground", initRandomBackground, config.content);
        
        // Initialize Lightbox first
        lightboxInstance = safeInit("Lightbox", initLightbox, config.content);

        // Then init other plugins that might depend on it
        safeInit("Hitokoto", initHitokoto, config.content);
        safeInit("BackToTop", initBackToTop, config.content);
        safeInit("GlobalSearch", initGlobalSearch, config.content);
        
        // Ensure Image Search is initialized after DOM is ready
        requestAnimationFrame(() => {
            safeInit("ImageSearch", initImageSearch, config.content); 
        });
        
        // PostLoader handles dynamic content and needs to refresh lightbox/comment
        if (typeof initPostLoader === 'function') {
             try {
                 initPostLoader(config.content, lightboxInstance);
             } catch(e) { console.error("PostLoader init failed", e); }
        }
    }
    return lightboxInstance;
}

/**
 * 获取 DOM 元素引用
 */
function getDomElements() {
    return {
        pageHead: document.querySelector(SELECTORS.PAGE_HEAD),
        leftArea: document.querySelector(SELECTORS.LEFT_AREA),
        socialIcons: document.querySelector(SELECTORS.SOCIAL_ICONS),
        icpInfo: document.querySelector(SELECTORS.ICP_INFO),
        webmasterInfo: document.querySelector(SELECTORS.WEBMASTER_INFO),
        themesElement: document.querySelector(SELECTORS.THEMES_CONTAINER),
        hitokoto: document.querySelector(SELECTORS.HITOKOTO_TEXT),
        globalLoader: document.querySelector(SELECTORS.GLOBAL_LOADER),
    };
}

/**
 * 渲染所有 UI 组件
 */
async function renderUI(config, themeManager, elements, lightbox) {
    // 设置网站标题
    if (config.content.title) {
        document.title = config.content.title;
    }

    // 输出控制台欢迎消息
    printWelcomeMessage(config);

    // 渲染 Markdown 内容
    await renderMarkdown();

    // 如果灯箱插件已初始化，刷新它以绑定新渲染的图片
    if (lightbox) {
        refreshLightbox(lightbox);
    }

    // 渲染各个组件
    renderTypedTitle(config);
    renderSocialIcons(config, elements.socialIcons);
    if (themeManager) {
        renderThemeButtons(config, themeManager, elements.themesElement);
    }
    renderFooter(config, elements);
    // Hitokoto is now self-initializing, but we keep this as fallback or external trigger
    if (elements.hitokoto) {
       // initHitokoto already handles fetching, but if we need manual trigger:
       // fetchHitokoto(elements.hitokoto); 
       // For now, let the plugin handle itself to avoid double fetch.
    }
}

/**
 * 输出控制台欢迎消息
 */
function printWelcomeMessage(config) {
    console.log("%c欢迎来到%c" + (config.content.title || "ACG-Home") + "！", CONSOLE_STYLES.TAG_BLUE, CONSOLE_STYLES.TAG_RED);
    console.group("%c打开开发者工具是想干嘛呢？应该是想扒代码吧！项目是开源的哦 (GPL-v3)，你喜欢的话拿去用就是了！%c" + "o(〃'▽'〃)o", CONSOLE_STYLES.TAG_GREEN, CONSOLE_STYLES.TAG_PURPLE);
    console.log("%c注意！此页面内的某些由站长添加的内容可能并不是开源的，直接从本站 CV 代码前最好先问问站长哦~", CONSOLE_STYLES.FULL_RED);
    console.log("%cGitHub.com/%c" + "ChengCheng0v0/ACG-Home", CONSOLE_STYLES.TAG_BLACK, CONSOLE_STYLES.TAG_ORANGE);
    console.groupEnd();
}

/**
 * 渲染页首打字标题
 */
function renderTypedTitle(config) {
    if (config.content.pageHead && config.content.pageHead.typedContent && document.querySelector(SELECTORS.PAGE_TITLE)) {
        try {
            new Typed(SELECTORS.PAGE_TITLE, {
                strings: config.content.pageHead.typedContent,
                startDelay: 300,
                backDelay: 1000,
                typeSpeed: 100,
                backSpeed: 50,
                showCursor: true,
                loop: true,
            });
        } catch (e) {
            console.warn("Typed.js failed to initialize:", e);
        }
    }
}

/**
 * 渲染社交链接图标
 */
function renderSocialIcons(config, container) {
    if (!container) {
        return;
    }

    if (config.content.masterInfo.socialLink && config.content.masterInfo.socialLink.enable) {
        const socialIconLinks = config.content.masterInfo.socialLink.enable
            .map(key => {
                const icon = config.content.masterInfo.socialLink.icon[key];
                const link = config.content.masterInfo.socialLink.link[key];
                if (icon && link) {
                    return `<a href="${link}" target="_blank"><i class="${icon}"></i></a>`;
                }
                return "";
            })
            .filter(Boolean);
        container.innerHTML = socialIconLinks.join("");
    }


}

/**
 * 渲染配色方案设置按钮
 */
function renderThemeButtons(config, themeManager, container) {
    if (!container || !config.content.theme.colors.enable || !themeManager) {
        return;
    }

    const themeButtons = config.content.theme.colors.enable
        .map(key => {
            let displayName;
            let icon;
            let color;
            let background;

            if (key === THEME_CONFIG.AUTO_SWITCH) {
                // console.log("%c[I]%c " + `Website config enabled !autoSwitch`, CONSOLE_STYLES.INFO, ""); // Reduce noise
                displayName = config.content.theme.colors.autoSwitch.displayName;
                icon = config.content.theme.colors.autoSwitch.icon.icon;
                color = config.content.theme.colors.autoSwitch.icon.color;
                background = config.content.theme.colors.autoSwitch.icon.background;
            } else if (themeManager.metaData && themeManager.metaData.colors.list[key]) {
                displayName = themeManager.metaData.colors.list[key].displayName;
                icon = themeManager.metaData.colors.list[key].icon.icon;
                color = themeManager.metaData.colors.list[key].icon.color;
                background = themeManager.metaData.colors.list[key].icon.background;
            }

            if (displayName && icon && color && background) {
                // Use event delegation or safe inline handler (window.themeManager is set)
                return `
                <div class="theme-item" id="theme-item-${key}" style="color: ${color}; background: ${background};" onclick="window.themeManager.setColor('${key}')">
                    <i class="${icon}"></i>
                    <span>${displayName}</span>
                </div>
            `;
            } else {
                console.warn(`Theme button skipped for key: ${key}`); // Warn instead of Error
            }
            return "";
        })
        .filter(Boolean);
    container.innerHTML = themeButtons.join("");

    // 加载配色方案设置的选中效果
    themeManager.loadThemeSelEff();
}

/**
 * 渲染页脚 (ICP & 站长信息)
 */
function renderFooter(config, elements) {
    // ICP 备案信息
    if (elements.icpInfo && config.content.icp && config.content.icp.enable) {
        const icpInfoLinks = config.content.icp.enable
            .map(key => {
                const code = config.content.icp.info.code[key];
                const link = config.content.icp.info.link[key];
                if (code && link) {
                    return `<a class="icp-link" href="${link}" target="_blank">${code}</a>`;
                }
                return "";
            })
            .filter(Boolean);
        elements.icpInfo.innerHTML = icpInfoLinks.join(` <i class="fa-solid fa-shield"></i> `);
    }
}

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
    if (window.innerWidth >= 900) return;

    // Create Toggle Button
    const btn = document.createElement("div");
    btn.className = "mobile-menu-btn";
    btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    document.body.appendChild(btn);

    // Create Overlay
    const overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    document.body.appendChild(overlay);

    const leftArea = document.querySelector(SELECTORS.LEFT_AREA);
    
    // Toggle Logic
    const toggleMenu = () => {
        if (!leftArea) return;
        leftArea.classList.toggle("open");
        overlay.classList.toggle("open");
        
        // Change icon
        const icon = btn.querySelector("i");
        if (leftArea.classList.contains("open")) {
            icon.className = "fa-solid fa-xmark";
        } else {
            icon.className = "fa-solid fa-bars";
        }
    };

    btn.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);
    
    // Close on link click (optional, but good UX)
    if (leftArea) {
        leftArea.addEventListener("click", (e) => {
            if (e.target.tagName === 'A') {
                toggleMenu();
            }
        });
    }
}

/**
 * 移除 Loading 动画
 */
function removeLoader() {
    const minimumLoadingTime = 500;
    const startTime = window.startTime || new Date().getTime(); // 获取 HTML 中定义的 startTime
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    const delay = Math.max(0, minimumLoadingTime - elapsedTime);

    setTimeout(() => {
        const loader = document.querySelector(SELECTORS.GLOBAL_LOADER);
        if (loader) {
            loader.className = "end";
        }
        document.body.style.overflow = "unset";
    }, delay);
}

// 启动应用
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
