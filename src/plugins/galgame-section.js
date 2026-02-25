import { CONSOLE_STYLES, PATH_CONFIG } from "../constants.js";
import "../styles/galgame-section.css";

// Module state to hold game data and filter
let allGames = [];
let currentFilter = 'all';
let cardsContainerRef = null;

export function initGalgameSection(config) {
    if (!config || !config.galgame || !config.galgame.enable) {
        return;
    }

    const cardsContainer = document.querySelector(".primary-container > .left-area > .cards");
    if (!cardsContainer) {
        console.warn("GalgameSection: Cards container not found.");
        return;
    }
    cardsContainerRef = cardsContainer;

    // Create Card Container
    const galgameCard = document.createElement("div");
    galgameCard.className = "card-item";
    galgameCard.id = "galgame-section-card";

    // Initial HTML Structure
    galgameCard.innerHTML = `
        <span class="title"><i class="fa-solid fa-gamepad"></i>Galgame 专区</span>
        <div class="content">
            <div id="galgame-filter-bar" class="galgame-filter-bar"></div>
            <div id="galgame-list-container" class="galgame-grid">
                <div class="galgame-loading">
                    <i class="fa-solid fa-spinner"></i>
                    <span>少女祈祷中...</span>
                </div>
            </div>
            ${config.galgame.bangumiId ? `
            <div class="sync-tip">
                <i class="fa-solid fa-rotate"></i> 数据同步自 Bangumi
            </div>` : ""}
        </div>
    `;

    // Insert after Anime List if possible, otherwise append
    const animeCard = document.getElementById("anime-list-card");
    if (animeCard && animeCard.nextSibling) {
        cardsContainer.insertBefore(galgameCard, animeCard.nextSibling);
    } else {
        cardsContainer.appendChild(galgameCard);
    }

    // Render Filter Bar
    renderFilterBar(galgameCard);

    // Determine data source
    if (config.galgame.bangumiId) {
        fetchBangumiData(config.galgame.bangumiId, galgameCard);
    } else {
        fetchLocalData(config.galgame.dataPath || "/assets/data/galgame-list.json", galgameCard);
    }

    console.debug("[Plugin] GalgameSection Loaded");
}

function renderFilterBar(card) {
    const filterBar = card.querySelector("#galgame-filter-bar");
    if (!filterBar) return;

    const filters = [
        { key: 'all', label: '全部' },
        { key: 'playing', label: '在推' },
        { key: 'completed', label: '已推' },
        { key: 'planned', label: '想推' }
    ];

    filterBar.innerHTML = '';
    filters.forEach(f => {
        const btn = document.createElement("button");
        btn.className = `galgame-filter-btn ${f.key === currentFilter ? 'active' : ''}`;
        btn.innerText = f.label;
        btn.onclick = () => updateFilter(f.key, card);
        filterBar.appendChild(btn);
    });
}

function updateFilter(filter, card) {
    currentFilter = filter;
    
    // Update button styles
    const buttons = card.querySelectorAll(".galgame-filter-btn");
    buttons.forEach(btn => {
        if (btn.innerText === getFilterLabel(filter)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Filter data
    const filteredData = filter === 'all' 
        ? allGames 
        : allGames.filter(g => g.status === filter);
    
    renderGalgameList(filteredData, card.querySelector("#galgame-list-container"));
}

function getFilterLabel(key) {
    const map = {
        'all': '全部',
        'playing': '在推',
        'completed': '已推',
        'planned': '想推'
    };
    return map[key];
}

function fetchLocalData(path, card) {
    fetch(path)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            allGames = data;
            renderGalgameList(allGames, card.querySelector("#galgame-list-container"));
        })
        .catch(err => handleError(err, card));
}

function fetchBangumiData(userId, card) {
    // Bangumi API: Get User Collections (Subject Type 4 = Game)
    // limit=12 to allow for filtering
    const apiUrl = `https://api.bgm.tv/v0/users/${userId}/collections?subject_type=4&limit=12`;
    
    fetch(apiUrl)
        .then(res => {
            if (!res.ok) throw new Error(`Bangumi API error: ${res.status}`);
            return res.json();
        })
        .then(data => {
            allGames = data.data.map(item => ({
                title: item.subject.name_cn || item.subject.name,
                cover: item.subject.images.medium || item.subject.images.common,
                link: `https://bgm.tv/subject/${item.subject.id}`,
                status: convertBangumiStatus(item.type),
                score: item.rate || 0,
                date: item.subject.date // Release date
            }));
            renderGalgameList(allGames, card.querySelector("#galgame-list-container"));
        })
        .catch(err => {
            console.warn("GalgameSection: Bangumi fetch failed, falling back to local.", err);
            fetchLocalData("/assets/data/galgame-list.json", card);
        });
}

function convertBangumiStatus(type) {
    // Bangumi Collection Status: 1=想玩, 2=玩过, 3=在玩, 4=搁置, 5=抛弃
    switch (type) {
        case 1: return "planned";
        case 2: return "completed";
        case 3: return "playing";
        case 4: return "dropped";
        case 5: return "dropped";
        default: return "unknown";
    }
}

function renderGalgameList(data, container) {
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = `<div class="galgame-loading" style="height: 100px;"><span>暂无数据</span></div>`;
        return;
    }

    container.innerHTML = "";
    // Show max 9 items to fit grid 3x3 neatly
    const displayData = data.slice(0, 9); 
    
    // Fallback image from constants
    const fallbackImage = PATH_CONFIG.DEFAULT_COVER;

    displayData.forEach(game => {
        const item = document.createElement("a");
        item.href = game.link || "javascript:void(0);";
        item.target = "_blank";
        item.className = "galgame-item";

        const statusClass = `status-${game.status}`;
        const statusText = getStatusText(game.status);

        // Score badge logic
        const scoreHtml = game.score > 0 
            ? `<div class="galgame-score-badge"><i class="fa-solid fa-star"></i>${game.score}</div>` 
            : '';

        item.innerHTML = `
            <div class="galgame-cover-wrapper">
                <img src="${game.cover}" alt="${game.title}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}';this.style.objectFit='cover';">
                <div class="galgame-status-badge ${statusClass}">${statusText}</div>
                ${scoreHtml}
            </div>
            <div class="galgame-title" title="${game.title}">${game.title}</div>
        `;
        container.appendChild(item);
    });
}

function getStatusText(status) {
    const map = {
        'playing': '在推',
        'completed': '已推',
        'planned': '想推',
        'dropped': '抛弃',
        'unknown': '未知'
    };
    return map[status] || '未知';
}

function handleError(err, card) {
    console.error("GalgameSection Error:", err);
    const container = card.querySelector("#galgame-list-container");
    if (container) {
        container.innerHTML = `<div class="galgame-loading" style="color: #ef4444;"><i class="fa-solid fa-circle-exclamation"></i><span>数据加载失败</span></div>`;
    }
}
