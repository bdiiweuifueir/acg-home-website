export const STORAGE_KEYS = {
    THEME_COLOR: "theme.color",
    LAST_BG_URL: "bg.last_url",
    LAST_BG_TIME: "bg.last_time",
};

export const SELECTORS = {
    PAGE_HEAD: ".page-head",
    LEFT_AREA: ".primary-container > .left-area",
    LEFT_AREA_CARDS: ".primary-container > .left-area > .cards", // Added specific selector for cards container
    SOCIAL_ICONS: ".social-icons",
    ICP_INFO: ".icp-info",
    WEBMASTER_INFO: ".webmaster-info",
    THEMES_CONTAINER: ".primary-container > .left-area > .cards > .card-item > .content > .settings-item > .themes",
    HITOKOTO_TEXT: "#hitokoto-text",
    GLOBAL_LOADER: "#global-loader-iframe",
    PAGE_TITLE: ".page-head > .title",
    THEME_ATTR: "data-theme-resource",
    THEME_ITEM_ENABLE: ".theme-item.enable",
    THEME_LOADER: "#theme-color-loader-iframe",
    MARKDOWN_CONTENT: ".markdown-content",
};

export const Z_INDEX = {
    LOADER: 200000,
    CLICK_EFFECT: 150000,
    IMMERSIVE_PLAYER: 100000,
    CONTEXT_MENU: 50000,
    TOAST: 40000,
    RANDOM_BG_BTN: 30000,
    SAKURA: 10000,
    MUSIC_PLAYER: 9999,
    LIVE2D: 100,
    NORMAL: 1,
};

export const THEME_CONFIG = {
    AUTO_SWITCH: "!autoSwitch",
    DEFAULT_COLOR: "default",
};

export const API_ENDPOINTS = {
    // Use local serverless proxy if available, fallback to direct
    HITOKOTO: "/api/hitokoto", // Use Vercel Proxy
    MANGADEX_SEARCH: "/api/manga/search",
    MANGADEX_CHAPTERS: "/api/manga/chapters",
    MANGADEX_PAGES: "/api/manga/pages",
    CONFIG: "./config.json",
};

export const BACKGROUND_SOURCES = [
    "/assets/images/backgrounds/page-head/wallhaven-9delkw.jpg",
    "/assets/images/backgrounds/page-head/wallhaven-5we787.jpg",
    "/assets/images/backgrounds/page-head/wallhaven-r7mgow.jpg"
];

export const PATH_CONFIG = {
    THEMES_BASE: "assets/themes/",
    THEME_JSON: "theme.json",
    STYLES_DIR: "styles/",
    SCRIPTS_DIR: "scripts/",
    COLORS_DIR: "colors/",
    DEFAULT_COVER: "/assets/images/backgrounds/page-head/old.jpg",
    DEFAULT_AVATAR: "/assets/images/avatar.png",
};

export const ERROR_TEMPLATES = {
    MARKDOWN_LOAD_FAIL: src => `<div style='color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; padding: 10px; border-radius: 5px;'>
        <strong>Error:</strong> 加载 Markdown 文件失败: ${src}
    </div>`,
    MARKDOWN_NO_SRC: "<span style='color: orange;'>Markdown 文件路径未指定</span>",
};

export const CONSOLE_STYLES = {
    INFO: "background-color: #00896c;",
    ERROR: "background-color: #cb1b45;",
    WARN: "background-color: #e98b2a;",
    TAG_BLUE: "padding: 5px; border-radius: 6px 0 0 6px; background-color: #1e88a8; color: #ffffff;",
    TAG_RED: "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;",
    TAG_GREEN: "padding: 5px; border-radius: 6px 0 0 6px; background-color: #00896c; color: #ffffff;",
    TAG_PURPLE: "padding: 5px; border-radius: 0 6px 6px 0; background-color: #986db2; color: #ffffff;",
    TAG_BLACK: "padding: 5px; border-radius: 6px 0 0 6px; background-color: #010101; color: #ffffff;",
    TAG_ORANGE: "padding: 5px; border-radius: 0 6px 6px 0; background-color: #ff9901; color: #ffffff;",
    FULL_RED: "padding: 5px; border-radius: 6px 6px 6px 6px; background-color: #b5393b; color: #ffffff;",
};

export const BG_CONFIG = {
    TIMEOUT: 8000,
    TRANSITION_DURATION: 1000,
    TOAST_DURATION: 3000,
    MAX_RETRIES: 3,
};

export const MOBILE_REGEX = /Mobi|Android|iPhone/i;

// Comprehensive Default Config Structure
export const DEFAULT_CONFIG = {
    title: "Loading...",
    masterInfo: {
        name: "Master",
        avatar: PATH_CONFIG.DEFAULT_AVATAR,
        website: "#",
        socialLink: { enable: [], link: {}, icon: {} }
    },
    pageHead: {
        typedContent: []
    },
    theme: {
        colors: { enable: [], default: "" },
        displayName: "Theme"
    },
    icp: {
        enable: [],
        info: { code: {}, link: {} }
    },
    animeList: {
        enable: false,
        dataPath: "/assets/data/anime-list.json",
        moreLink: "#"
    },
    music: {
        enable: false
    },
    live2d: {
        enable: false
    },
    sakura: {
        enable: false,
        MAX_PETALS: 50,
        COLORS: [
            {
                gradientColorStart: "rgba(255, 183, 197, 0.9)",
                gradientColorEnd: "rgba(255, 197, 208, 0.9)",
                gradientColorZero: "rgba(255, 183, 197, 0)",
            },
            {
                gradientColorStart: "rgba(255, 183, 197, 0.9)",
                gradientColorEnd: "rgba(240, 192, 218, 0.9)",
                gradientColorZero: "rgba(255, 183, 197, 0)",
            },
            {
                gradientColorStart: "rgba(255, 183, 197, 0.9)",
                gradientColorEnd: "rgba(239, 172, 208, 0.9)",
                gradientColorZero: "rgba(255, 183, 197, 0)",
            },
        ]
    },
    lightbox: {
        enable: false,
        options: {
            background: "rgba(0, 0, 0, 0.8)",
            margin: 24
        }
    },
    tilt: {
        enable: false,
        selectors: [".card-item", ".left-area"],
        options: {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.3
        }
    },
    comment: {
        enable: false
    }
};

export const RUNTIME_TEMPLATE = (d, h, m, s) => `本站已运行 ${d} 天 ${h} 小时 ${m} 分 ${s} 秒`;

export const ANIME_STATUS_CONFIG = {
    watching: { color: "#4CAF50", text: "在看" },
    completed: { color: "#2196F3", text: "看完" },
    planned: { color: "#FF9800", text: "想看" },
    dropped: { color: "#F44336", text: "抛弃" },
    unknown: { color: "rgba(0,0,0,0.6)", text: "未知" }
};
