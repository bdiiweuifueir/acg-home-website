import "../styles/context-menu.css";
import { STORAGE_KEYS, Z_INDEX } from "../constants.js";

export function initContextMenu(config) {
    if (!config || !config.contextMenu || !config.contextMenu.enable) {
        return;
    }

    // 移动端禁用
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        return;
    }

    // 创建菜单 DOM
    const menu = document.createElement("div");
    menu.id = "context-menu";
    menu.style.zIndex = Z_INDEX.CONTEXT_MENU; // Use centralized Z-Index

    // 定义菜单项
    // 这里我们可以根据 config 来动态生成，为了简化演示，先硬编码几个常用功能
    // 但实际点击动作是动态绑定的
    const items = [
        { icon: "fa-solid fa-arrow-rotate-right", text: "刷新页面", action: () => location.reload() },
        { icon: "fa-solid fa-arrow-left", text: "返回上一页", action: () => history.back() },
        { separator: true },
        { icon: "fa-solid fa-house", text: "返回首页", action: () => (location.href = "/") },
        { icon: "fa-solid fa-arrow-up", text: "回到顶部", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
        { separator: true },
        { icon: "fa-solid fa-palette", text: "切换主题", action: () => toggleTheme() },
        { separator: true },
        { icon: "fa-brands fa-github", text: "关于本项目", action: () => window.open("https://github.com/ChengCheng0v0/ACG-Home", "_blank") },
    ];

    // 生成菜单 HTML
    let menuHtml = "";
    items.forEach((item, index) => {
        if (item.separator) {
            menuHtml += `<div class="context-menu-separator"></div>`;
        } else {
            // 给每个 item 一个唯一的 ID，方便绑定事件
            menuHtml += `
                <div class="context-menu-item" id="ctx-item-${index}">
                    <i class="${item.icon}"></i>
                    <span>${item.text}</span>
                </div>
            `;
        }
    });
    menu.innerHTML = menuHtml;
    document.body.appendChild(menu);

    // 绑定点击事件
    items.forEach((item, index) => {
        if (!item.separator) {
            document.getElementById(`ctx-item-${index}`).addEventListener("click", () => {
                item.action();
                hideMenu();
            });
        }
    });

    // 辅助函数：切换主题（模拟点击下一个主题按钮）
    function toggleTheme() {
        // 这里简单粗暴地找到当前选中的下一个主题
        // 实际逻辑可能更复杂，这里仅作为演示
        const themes = window.config?.content?.theme?.colors?.enable;
        if (themes && Array.isArray(themes) && themes.length > 0) {
            const currentTheme = localStorage.getItem(STORAGE_KEYS.THEME_COLOR);
            let nextIndex = themes.indexOf(currentTheme) + 1;
            if (nextIndex >= themes.length) {
                nextIndex = 0;
            }
            const nextTheme = themes[nextIndex];
            if (window.themeManager) {
                window.themeManager.setColor(nextTheme);
            }
        }
    }

    // 显示菜单
    function showMenu(x, y) {
        // 先重置位置以获取尺寸
        menu.style.left = "0px";
        menu.style.top = "0px";
        menu.style.display = "block"; // Ensure it's rendered for measurement
        
        const rect = menu.getBoundingClientRect();
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;

        let posX = x;
        let posY = y;

        // 右侧溢出检测
        if (posX + rect.width > winWidth) {
            posX = winWidth - rect.width - 5;
        }

        // 底部溢出检测
        if (posY + rect.height > winHeight) {
            posY = posY - rect.height;
        }

        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;
        menu.style.display = ""; // Reset inline display style
        menu.classList.add("show");
    }

    // 隐藏菜单
    function hideMenu() {
        menu.classList.remove("show");
    }

    // 监听右键事件
    document.addEventListener("contextmenu", e => {
        e.preventDefault(); // 阻止默认菜单
        showMenu(e.clientX, e.clientY);
    });

    // 点击其他地方隐藏菜单
    document.addEventListener("click", () => {
        hideMenu();
    });

    // 滚动时隐藏菜单
    document.addEventListener("scroll", () => {
        hideMenu();
    });
}
