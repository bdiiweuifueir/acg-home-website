import { SELECTORS } from "../constants.js";
import "../styles/game-launcher.css";

/**
 * 游戏启动器插件
 * 负责渲染游戏列表卡片，并处理游戏启动（弹窗/iframe）
 */
export function initGameLauncher(config) {
    if (!config.games || !config.games.enable || !config.games.list || config.games.list.length === 0) {
        return;
    }

    // 1. 找到插入点
    const leftArea = document.querySelector(SELECTORS.LEFT_AREA + " > .cards");
    if (!leftArea) return;

    const gameCard = document.createElement("div");
    gameCard.className = "card-item";
    gameCard.id = "games-card";
    gameCard.innerHTML = `
        <span class="title"><i class="fa-solid fa-gamepad"></i> 在线试玩</span>
        <div class="content" style="display: flex; flex-direction: column; gap: 10px;">
            ${config.games.list.map(game => `
                <div class="game-entry" 
                     data-path="${game.path}" 
                     data-engine="${game.engine || 'webgal'}"
                     data-args='${JSON.stringify(game.args || {})}'
                >
                    <img src="${game.cover}" alt="${game.title}">
                    <div class="game-info-overlay">
                        <div class="game-title">${game.title}</div>
                        <div class="game-desc">${game.description}</div>
                    </div>
                    <div class="play-icon">
                        <i class="fa-solid fa-play"></i>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Insert after "Recommend" or at the end
    const recommendCard = leftArea.querySelector("#recommend");
    if (recommendCard) {
        leftArea.insertBefore(gameCard, recommendCard.nextSibling);
    } else {
        leftArea.appendChild(gameCard);
    }

    // 2. 绑定点击事件
    gameCard.querySelectorAll(".game-entry").forEach(entry => {
        entry.addEventListener("click", () => {
            const path = entry.getAttribute("data-path");
            const engine = entry.getAttribute("data-engine");
            const args = JSON.parse(entry.getAttribute("data-args") || "{}");
            
            // Construct URL with arguments
            let fullPath = path;
            const queryParams = new URLSearchParams();
            
            if (engine === 'krkr' && args.data) {
                queryParams.set('data', args.data);
            }
            // Add more engine-specific logic here

            if (Array.from(queryParams).length > 0) {
                fullPath += '?' + queryParams.toString();
            }

            openGameModal(fullPath);
        });
    });
}

/**
 * 打开游戏模态框
 */
function openGameModal(path) {
    // Create Modal
    const modal = document.createElement("div");
    modal.className = "game-modal";
    
    // Close Button
    const closeBtn = document.createElement("div");
    closeBtn.className = "game-close-btn";
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeBtn.onclick = () => {
        modal.classList.remove("show");
        setTimeout(() => modal.remove(), 300);
    };

    // Iframe Container
    const iframeContainer = document.createElement("div");
    iframeContainer.className = "iframe-container";

    // Loader
    const loader = document.createElement("div");
    loader.className = "game-loader";
    loader.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    // Iframe
    const iframe = document.createElement("iframe");
    iframe.className = "game-iframe";
    iframe.src = path;
    iframe.allow = "autoplay; fullscreen; audio";
    
    // Handle Load Event
    iframe.onload = () => {
        loader.style.display = "none";
    };

    iframeContainer.appendChild(loader);
    iframeContainer.appendChild(iframe);
    modal.appendChild(closeBtn);
    modal.appendChild(iframeContainer);
    document.body.appendChild(modal);

    // Fade in
    requestAnimationFrame(() => {
        modal.classList.add("show");
    });
}
