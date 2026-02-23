import { STORAGE_KEYS, THEME_CONFIG, CONSOLE_STYLES, SELECTORS, PATH_CONFIG } from "./constants.js";

export class ThemeManager {
    constructor(config) {
        this.config = config;
        this.themePath = "";
        this.metaData = null;
        this.minimumColorSwitchTime = 650;
        this.colorSwitchSleepTime = 310;
    }

    // 解析主题
    async parse() {
        // 构建主题目录
        // 使用 new URL() 确保路径正确拼接，避免双重斜杠或路径错误
        // 假设 assets 位于根目录
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/index\.html$/, "/");
        this.themePath = new URL(`${PATH_CONFIG.THEMES_BASE}${this.config.content.theme.theme}`, baseUrl).href;

        console.log("%c[I]%c " + `Theme Path: ${this.themePath}`, CONSOLE_STYLES.INFO, "");

        // 使用 fetch 获取主题的元数据
        try {
            const response = await fetch(`${this.themePath}/${PATH_CONFIG.THEME_JSON}`);
            if (!response.ok) {
                throw new Error(`无法获取主题元数据: ${response.statusText}`);
            }
            this.metaData = await response.json();
        } catch (error) {
            console.error("%c[E]%c " + `获取主题元数据失败: ${error}`, CONSOLE_STYLES.ERROR, "");
            throw new Error("获取主题元数据失败，无法继续执行操作");
        }

        console.log("%c[I]%c " + `主题元数据: ${JSON.stringify(this.metaData)}`, CONSOLE_STYLES.INFO, "");

        // 检查元数据是否合法
        if (this.metaData.id && this.metaData.name && this.metaData.version && this.metaData.files.styles && this.metaData.files.scripts && this.metaData.colors) {
            // 输出欢迎语
            console.group("%c主题解析成功！%c" + `${this.metaData.name} (${this.metaData.id})`, CONSOLE_STYLES.TAG_GREEN, CONSOLE_STYLES.TAG_PURPLE);
            console.log("%cID:%c" + `${this.metaData.id}`, CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.TAG_RED);
            console.log("%cName:%c" + `${this.metaData.name}`, CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.TAG_RED);
            console.log("%cVersion:%c" + `${this.metaData.version}`, CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.TAG_RED);
            console.log("%cRepo:%c" + `${this.metaData.repo}`, CONSOLE_STYLES.TAG_BLACK, CONSOLE_STYLES.TAG_ORANGE);
            console.groupEnd();

            return this.metaData;
        } else {
            console.error("%c[E]%c " + `主题解析失败，元数据存在问题`, CONSOLE_STYLES.ERROR, "");
            throw new Error("主题解析失败，无法继续执行操作");
        }
    }

    // 加载主题
    async load() {
        if (!this.metaData) {
            await this.parse();
        }

        // 移除旧的主题资源
        document.querySelectorAll(`[${SELECTORS.THEME_ATTR}]`).forEach(el => el.remove());

        // 注入基础主题资源
        this.injectResources(this.metaData.files.styles, PATH_CONFIG.STYLES_DIR, "style");
        this.injectResources(this.metaData.files.scripts, PATH_CONFIG.SCRIPTS_DIR, "script");

        let targetColor = localStorage.getItem(STORAGE_KEYS.THEME_COLOR);

        if (targetColor === THEME_CONFIG.AUTO_SWITCH) {
            targetColor = window.matchMedia("(prefers-color-scheme: dark)").matches ? this.config.content.theme.colors.autoSwitch.dark : this.config.content.theme.colors.autoSwitch.light;
        }

        this.metaData.colors.index.forEach(key => {
            if (targetColor === key) {
                const colorConfig = this.metaData.colors.list[key];
                if (colorConfig) {
                    const colorBasePath = `${PATH_CONFIG.COLORS_DIR}${key}/`;
                    if (colorConfig.files.styles) {
                        this.injectResources(colorConfig.files.styles, `${colorBasePath}${PATH_CONFIG.STYLES_DIR}`, "style");
                    }
                    if (colorConfig.files.scripts) {
                        this.injectResources(colorConfig.files.scripts, `${colorBasePath}${PATH_CONFIG.SCRIPTS_DIR}`, "script");
                    }
                }
            }
        });

        console.log("%c[I]%c " + `主题资源已更新`, CONSOLE_STYLES.INFO, "");
    }

    /**
     * 注入资源到 Head
     */
    injectResources(files, basePath, type) {
        if (!files) {
            return;
        }

        files.forEach(file => {
            if (file) {
                let element;
                const url = `${this.themePath}/${basePath}${file}`;

                if (type === "style") {
                    element = document.createElement("link");
                    element.rel = "stylesheet";
                    element.href = url;
                } else if (type === "script") {
                    element = document.createElement("script");
                    element.src = url;
                }

                if (element) {
                    element.setAttribute(SELECTORS.THEME_ATTR, "true");
                    document.head.appendChild(element);
                }
            }
        });
    }

    // processThemeFiles 和 runScripts 不再需要
    // ...

    // 设置配色方案
    async setColor(colorId) {
        if (!this.metaData) {
            await this.parse();
        }

        if (colorId === localStorage.getItem(STORAGE_KEYS.THEME_COLOR)) {
            console.warn("%c[W]%c " + `当前配色方案已是 ${colorId}，与其白白重载一次，不如我现在就中断更改`, CONSOLE_STYLES.WARN, "");
            return;
        }

        // 隐藏滚动条
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`; // 给 body 加一个与滚动条宽度相同的右边距以防止页面抖动
        document.body.style.overflow = "hidden";

        // 开始播放加载动画
        const loader = document.querySelector(SELECTORS.THEME_LOADER);
        if (loader) {
            loader.className = "start";
        } // 播放开始动画

        // 模拟异步延迟
        await new Promise(resolve => setTimeout(resolve, this.colorSwitchSleepTime));

        try {
            // 检查索引中是否存在配色方案
            // 保留关键字 !autoSwitch 可以不需要在索引中存在
            if (this.metaData.colors.index.includes(colorId) || colorId === THEME_CONFIG.AUTO_SWITCH) {
                localStorage.setItem(STORAGE_KEYS.THEME_COLOR, colorId);

                // 重新加载主题
                await this.load();

                console.log("%c[I]%c " + `配色方案已更改为: ${colorId}`, CONSOLE_STYLES.INFO, "");
            } else {
                console.error("%c[E]%c " + `无法将配色方案更改为 ${colorId}，因为未在主题配色方案索引中匹配到传入的值`, CONSOLE_STYLES.ERROR, "");
                throw new Error("配色方案更改失败，未在主题配色方案索引中匹配到传入的值");
            }

            // 加载配色方案设置的选中效果
            this.loadThemeSelEff();
        } catch (error) {
            console.error("%c[E]%c " + `无法将配色方案更改为 ${colorId}: ${error}`, CONSOLE_STYLES.ERROR, "");
        }

        // 结束播放加载动画
        setTimeout(() => {
            if (loader) {
                loader.className = "end";
            } // 播放结束动画
            document.body.style.paddingRight = "unset"; // 恢复 body 的右边距
            document.body.style.overflow = "unset"; // 恢复显示滚动条
        }, this.minimumColorSwitchTime);
    }

    // 加载配色方案设置的选中效果
    loadThemeSelEff() {
        // 如果存在已加载的选中效果则清除它
        if (document.querySelector(SELECTORS.THEME_ITEM_ENABLE)) {
            document.querySelector(SELECTORS.THEME_ITEM_ENABLE).setAttribute("class", "theme-item");
        }

        // 插入新的选中效果类
        const activeItem = document.getElementById(`theme-item-${localStorage.getItem(STORAGE_KEYS.THEME_COLOR)}`);
        if (activeItem) {
            activeItem.setAttribute("class", "theme-item enable");
        }
    }
}
