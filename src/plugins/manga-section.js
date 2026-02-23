import { CONSOLE_STYLES, PATH_CONFIG } from "../constants.js";
import "../styles/manga-section.css";

// Module state
let allBooks = [];
let currentFilter = 'all';

export function initMangaSection(config) {
    if (!config || !config.manga || !config.manga.enable) {
        return;
    }

    const cardsContainer = document.querySelector(".primary-container > .left-area > .cards");
    if (!cardsContainer) {
        console.warn("MangaSection: Cards container not found.");
        return;
    }

    // Create Card
    const mangaCard = document.createElement("div");
    mangaCard.className = "card-item";
    mangaCard.id = "manga-section-card";

    mangaCard.innerHTML = `
        <span class="title"><i class="fa-solid fa-book-open"></i>漫画与轻小说</span>
        <div class="content">
            <div id="manga-filter-bar" class="manga-filter-bar"></div>
            <div id="manga-list-container" class="manga-grid">
                <div class="manga-loading">
                    <i class="fa-solid fa-spinner"></i>
                    <span>正在从书架取书中...</span>
                </div>
            </div>
            <div class="daisy-tip">
                <a href="https://github.com/niuhuan/daisy" target="_blank" title="Powered by Daisy">
                    <i class="fa-brands fa-github"></i> Recommended: Daisy Reader
                </a>
            </div>
        </div>
    `;

    // Insert logic: Place after Galgame section
    const galgameCard = document.getElementById("galgame-section-card");
    const animeCard = document.getElementById("anime-list-card");
    
    if (galgameCard && galgameCard.nextSibling) {
        cardsContainer.insertBefore(mangaCard, galgameCard.nextSibling);
    } else if (animeCard && animeCard.nextSibling) {
        cardsContainer.insertBefore(mangaCard, animeCard.nextSibling);
    } else {
        cardsContainer.appendChild(mangaCard);
    }

    // Render Filters
    renderFilterBar(mangaCard);

    // Fetch Data
    const dataPath = config.manga.dataPath || "/assets/data/manga-list.json";
    fetchLocalData(dataPath, mangaCard);

    console.log("%c[Plugin]%c MangaSection Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}

function renderFilterBar(card) {
    const filterBar = card.querySelector("#manga-filter-bar");
    const filters = [
        { key: 'all', label: '全部' },
        { key: 'reading', label: '在看' },
        { key: 'completed', label: '看完' },
        { key: 'planned', label: '想看' }
    ];

    filterBar.innerHTML = '';
    filters.forEach(f => {
        const btn = document.createElement("button");
        btn.className = `manga-filter-btn ${f.key === currentFilter ? 'active' : ''}`;
        btn.innerText = f.label;
        btn.onclick = () => updateFilter(f.key, card);
        filterBar.appendChild(btn);
    });
}

function updateFilter(filter, card) {
    currentFilter = filter;
    
    // Update buttons
    const buttons = card.querySelectorAll(".manga-filter-btn");
    buttons.forEach(btn => {
        if (btn.innerText === getFilterLabel(filter)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Filter Data
    const filteredData = filter === 'all' 
        ? allBooks 
        : allBooks.filter(b => b.status === filter);
    
    renderMangaList(filteredData, card.querySelector("#manga-list-container"));
}

function getFilterLabel(key) {
    const map = {
        'all': '全部',
        'reading': '在看',
        'completed': '看完',
        'planned': '想看'
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
            allBooks = data;
            renderMangaList(allBooks, card.querySelector("#manga-list-container"));
        })
        .catch(err => {
            console.error("MangaSection Error:", err);
            const container = card.querySelector("#manga-list-container");
            if (container) {
                container.innerHTML = `<div class="manga-loading" style="color: #ef4444;"><i class="fa-solid fa-circle-exclamation"></i><span>书架倒塌了...</span></div>`;
            }
        });
}

function renderMangaList(data, container) {
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = `<div class="manga-loading" style="height: 100px;"><span>暂无书籍</span></div>`;
        return;
    }

    container.innerHTML = "";
    // Limit to 9 items
    const displayData = data.slice(0, 9);

    displayData.forEach(book => {
        const item = document.createElement("a");
        item.href = book.link || "javascript:void(0);";
        item.target = "_blank";
        item.className = "manga-item";

        const statusClass = `status-${book.status}`;
        const statusText = getFilterLabel(book.status) || '未知';
        const typeText = book.type === 'novel' ? '轻小说' : '漫画';

        const scoreHtml = book.score > 0 
            ? `<div class="manga-score-badge"><i class="fa-solid fa-star"></i>${book.score}</div>` 
            : '';

        item.innerHTML = `
            <div class="manga-cover-wrapper">
                <img src="${book.cover}" alt="${book.title}" loading="lazy" onerror="this.onerror=null;this.src='${PATH_CONFIG.DEFAULT_COVER}';this.style.objectFit='cover';">
                <div class="manga-status-badge ${statusClass}">${statusText}</div>
                <div class="manga-type-badge">${typeText}</div>
                ${scoreHtml}
            </div>
            <div class="manga-title" title="${book.title}">${book.title}</div>
        `;
        container.appendChild(item);
    });
}
