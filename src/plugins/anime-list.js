import { CONSOLE_STYLES, ANIME_STATUS_CONFIG, PATH_CONFIG } from "../constants.js";
import "../styles/anime-list.css";

export function initAnimeList(config) {
    if (!config || !config.animeList || !config.animeList.enable) {
        return;
    }

    const cardsContainer = document.querySelector(".primary-container > .left-area > .cards");
    if (!cardsContainer) {
        console.warn("AnimeList: Cards container not found.");
        return;
    }

    const animeCard = document.createElement("div");
    animeCard.className = "card-item";
    animeCard.id = "anime-list-card";

    animeCard.innerHTML = `
        <span class="title"><i class="fa-solid fa-tv"></i>追番列表</span>
        <div class="content">
            <div id="anime-list-container" class="anime-grid">
                <!-- Skeleton Loader -->
                <div class="skeleton-item"></div>
                <div class="skeleton-item"></div>
                <div class="skeleton-item"></div>
                <div class="skeleton-item"></div>
            </div>
            <div class="more-link">
                <a href="${config.animeList.moreLink || "#"}" target="_blank">查看更多 <i class="fa-solid fa-angle-right"></i></a>
            </div>
        </div>
    `;

    // Insertion Logic
    const recommendCard = document.getElementById("recommend");
    const personalInfoCard = document.getElementById("personal-info");
    
    if (recommendCard && recommendCard.nextSibling) {
        cardsContainer.insertBefore(animeCard, recommendCard.nextSibling);
    } else if (personalInfoCard && personalInfoCard.nextSibling) {
        cardsContainer.insertBefore(animeCard, personalInfoCard.nextSibling);
    } else {
        cardsContainer.appendChild(animeCard);
    }

    const dataPath = config.animeList.dataPath || "/assets/data/anime-list.json";
    
    fetch(dataPath)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            renderAnimeList(data, animeCard.querySelector("#anime-list-container"));
        })
        .catch(err => {
            console.error("AnimeList: Failed to load data", err);
            const container = animeCard.querySelector("#anime-list-container");
            if (container) {
                container.innerHTML = `<div class="error-message">
                    <i class="fa-solid fa-triangle-exclamation"></i> 数据加载失败
                </div>`;
            }
        });

    console.log("%c[Plugin]%c AnimeList Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}

function renderAnimeList(data, container) {
    if (!container) return;
    
    if (!data || !Array.isArray(data)) {
        container.innerHTML = `<div class="error-message" style="grid-column: span 2; text-align: center;">数据格式错误</div>`;
        return;
    }

    if (data.length === 0) {
        container.innerHTML = `<div class="empty-message">暂无追番记录</div>`;
        return;
    }

    container.innerHTML = "";
    // Only show first 4 items
    const displayData = data.slice(0, 4);

    displayData.forEach(anime => {
        // Validation: Ensure minimal required fields exist
        if (!anime || typeof anime !== 'object') return;

        const item = document.createElement("a");
        
        // Escape helper (simple)
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        const link = anime.link || "javascript:void(0);";
        // We set href directly, browser handles URL encoding usually, but for XSS in href:
        // Ideally validate protocol. For now, assume static data is safeish or use sanitizer if strict.
        item.href = link; 
        item.target = "_blank";
        item.className = "anime-item";
        
        // Safe access to status config
        const statusKey = anime.status || "unknown";
        const statusConfig = ANIME_STATUS_CONFIG[statusKey] || ANIME_STATUS_CONFIG.unknown;
        
        // Sanitize values for display
        const cover = anime.cover || PATH_CONFIG.DEFAULT_COVER;
        const title = escapeHtml(anime.title_cn || anime.title || "Unknown Title");
        const progress = escapeHtml(anime.progress || "N/A");
        const score = (anime.score && !isNaN(anime.score)) ? `★${anime.score}` : "";

        item.innerHTML = `
            <img src="${cover}" alt="${title}" class="anime-cover" loading="lazy" onerror="this.onerror=null;this.src='${PATH_CONFIG.DEFAULT_COVER}';this.style.objectFit='cover';">
            <div class="anime-status" style="background-color: ${statusConfig.color}">${statusConfig.text}</div>
            <div class="anime-info">
                <div class="anime-title" title="${title}">${title}</div>
                <div class="anime-meta">
                    <span class="anime-progress">${progress}</span>
                    <span class="anime-score">${score}</span>
                </div>
            </div>
        `;

        container.appendChild(item);
    });
}
