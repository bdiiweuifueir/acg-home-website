import { MOBILE_REGEX, DEFAULT_CONFIG } from "./constants.js";
import markdownit from "markdown-it";
import hljs from "highlight.js";
import DOMPurify from "dompurify";
import "highlight.js/styles/atom-one-dark.css";
import { SELECTORS, API_ENDPOINTS, ERROR_TEMPLATES } from "./constants.js";

// Helper to check mobile device
export function isMobile() {
    return MOBILE_REGEX.test(navigator.userAgent);
}

// Deep merge utility
function deepMerge(target, source) {
    if (typeof target !== 'object' || target === null) {
        return source;
    }
    if (typeof source !== 'object' || source === null) {
        return target;
    }

    const output = { ...target };
    Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!(key in target)) {
                Object.assign(output, { [key]: source[key] });
            } else {
                output[key] = deepMerge(target[key], source[key]);
            }
        } else {
            Object.assign(output, { [key]: source[key] });
        }
    });
    return output;
}

// 获取网站配置
export async function getWebsiteConfig() {
    try {
        // 添加时间戳防止缓存
        const configUrl = `${API_ENDPOINTS.CONFIG}?t=${new Date().getTime()}`;
        const response = await fetch(configUrl);
        if (!response.ok) {
            throw new Error(`无法获取网站配置文件: ${response.statusText}`);
        }
        const configData = await response.json();

        // Merge with default config to ensure robustness
        // Source (configData) overrides Target (DEFAULT_CONFIG)
        const finalConfig = deepMerge(DEFAULT_CONFIG, configData);

        return {
            content: finalConfig,
        };
    } catch (error) {
        console.error("无法获取网站配置文件: ", error);
        return {
            content: {
                ...DEFAULT_CONFIG,
                title: "Error Loading Config",
                masterInfo: { ...DEFAULT_CONFIG.masterInfo, name: "Error" },
            },
        };
    }
}

// 初始化 markdown-it 实例
export const md = new markdownit({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + "</code></pre>";
            } catch {
                console.warn(`Highlight.js failed for language: ${lang}`);
            }
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>";
    },
});

// Markdown 渲染器
export async function renderMarkdown() {
    if (!md) {
        console.error("Markdown-it library not loaded.");
        return;
    }

    const markdownElements = document.querySelectorAll(SELECTORS.MARKDOWN_CONTENT);

    if (markdownElements.length === 0) {
        return;
    }

    const promises = Array.from(markdownElements).map(async element => {
        const src = element.getAttribute("src");

        if (src) {
            try {
                const response = await fetch(src);
                if (!response.ok) {
                    throw new Error(`无法获取 Markdown 文件: ${src} (Status: ${response.status})`);
                }
                const markdownContent = await response.text();
                const renderedHTML = md.render(markdownContent);

                const cleanHTML = DOMPurify.sanitize(renderedHTML, {
                    ADD_TAGS: ["iframe", "style", "link", "audio", "video", "source", "track", "embed", "object", "param", "map", "area", "img"],
                    ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder", "scrolling", "src", "width", "height", "style", "class", "id", "name", "autoplay", "controls", "loop", "muted", "preload", "poster", "alt", "loading", "title", "data-*"],
                });

                element.innerHTML = cleanHTML;
            } catch (error) {
                console.error(error);
                element.innerHTML = ERROR_TEMPLATES.MARKDOWN_LOAD_FAIL(src);
            }
        } else {
            element.innerHTML = ERROR_TEMPLATES.MARKDOWN_NO_SRC;
        }
    });

    await Promise.all(promises);
}
