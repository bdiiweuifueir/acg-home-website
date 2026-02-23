import { CONSOLE_STYLES } from "../constants.js";
import "../styles/navigation-section.css";

export function initNavigation(config) {
    if (!config || !config.navigation || !config.navigation.enable) {
        return;
    }

    const cardsContainer = document.querySelector(".primary-container > .left-area > .cards");
    if (!cardsContainer) {
        console.warn("Navigation: Cards container not found.");
        return;
    }

    const navCard = document.createElement("div");
    navCard.className = "card-item";
    navCard.id = "navigation-section-card";

    navCard.innerHTML = `
        <span class="title"><i class="fa-solid fa-compass"></i>二次元导航 (KUN)</span>
        <div class="content">
            <div id="nav-list-container">
                <div class="loading-text" style="text-align: center; padding: 20px; color: #999;">
                    <i class="fa-solid fa-spinner fa-spin"></i> 正在加载异世界传送门...
                </div>
            </div>
        </div>
    `;

    // Insert logic: try to put it after Galgame section, or at the end
    const galgameCard = document.getElementById("galgame-section-card");
    const animeCard = document.getElementById("anime-list-card");
    
    if (galgameCard && galgameCard.nextSibling) {
        cardsContainer.insertBefore(navCard, galgameCard.nextSibling);
    } else if (animeCard && animeCard.nextSibling) {
        cardsContainer.insertBefore(navCard, animeCard.nextSibling);
    } else {
        cardsContainer.appendChild(navCard);
    }

    const dataPath = config.navigation.dataPath || "/assets/data/navigation.json";
    fetch(dataPath)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            renderNavigation(data, navCard.querySelector("#nav-list-container"));
        })
        .catch(err => {
            console.error("Navigation: Failed to load data", err);
            const container = navCard.querySelector("#nav-list-container");
            if (container) {
                container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 10px;">导航数据加载失败</div>`;
            }
        });

    console.log("%c[Plugin]%c Navigation Section Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}

function renderNavigation(data, container) {
    if (!container || !data || !Array.isArray(data)) return;

    container.innerHTML = "";

    data.forEach(category => {
        const catDiv = document.createElement("div");
        catDiv.className = "nav-category";

        // Category Title
        const catTitle = document.createElement("div");
        catTitle.className = "nav-category-title";
        catTitle.innerHTML = `${category.category}`;
        catDiv.appendChild(catTitle);

        // Grid
        const grid = document.createElement("div");
        grid.className = "nav-grid";

        category.items.forEach(item => {
            const link = document.createElement("a");
            link.href = item.link;
            link.target = "_blank";
            link.className = "nav-item";
            link.title = item.desc || item.title;

            // Icon handling: check if it's a URL or FontAwesome class
            let iconHtml = "";
            if (item.icon.startsWith("http") || item.icon.startsWith("/")) {
                iconHtml = `<img src="${item.icon}" alt="${item.title}" onerror="this.src='/assets/images/backgrounds/page-head/old.jpg'">`;
            } else {
                iconHtml = `<i class="${item.icon}"></i>`;
            }

            link.innerHTML = `
                <div class="nav-icon">${iconHtml}</div>
                <div class="nav-title">${item.title}</div>
            `;
            grid.appendChild(link);
        });

        catDiv.appendChild(grid);
        container.appendChild(catDiv);
    });
}
