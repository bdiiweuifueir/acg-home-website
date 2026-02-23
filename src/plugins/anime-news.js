import { CONSOLE_STYLES } from "../constants.js";
import "../styles/anime-news.css";

export function initAnimeNews(config) {
    if (!config || !config.animeNews || !config.animeNews.enable) {
        return;
    }

    const rightArea = document.querySelector(".primary-container > .right-area");
    if (!rightArea) {
        console.warn("AnimeNews: Right area container not found.");
        return;
    }

    // Create News Container
    const newsContainer = document.createElement("div");
    newsContainer.className = "anime-news-container";
    newsContainer.innerHTML = `
        <div class="news-label"><i class="fa-solid fa-bullhorn"></i> 资讯快报</div>
        <div class="news-list-wrapper">
            <ul class="news-list">
                <li class="news-item">Loading news...</li>
            </ul>
        </div>
    `;

    // Insert at the top of right-area
    if (rightArea.firstChild) {
        rightArea.insertBefore(newsContainer, rightArea.firstChild);
    } else {
        rightArea.appendChild(newsContainer);
    }

    // Fetch Data
    const dataPath = config.animeNews.dataPath || "/assets/data/anime-news.json";
    fetch(dataPath)
        .then(res => res.json())
        .then(data => {
            renderNews(data, newsContainer.querySelector(".news-list"));
        })
        .catch(err => {
            console.error("AnimeNews: Failed to load data", err);
            newsContainer.querySelector(".news-list").innerHTML = `<li class="news-item" style="color:red">Failed to load news.</li>`;
        });

    console.log("%c[Plugin]%c AnimeNews Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}

function renderNews(data, listElement) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        listElement.innerHTML = `<li class="news-item">暂无资讯</li>`;
        return;
    }

    // Build list items
    const html = data
        .map(
            item => `
        <li class="news-item">
            <a href="${item.link || "#"}" target="_blank" title="${item.title}">
                ${item.title}
                ${item.date ? `<span class="news-date">${item.date}</span>` : ""}
            </a>
        </li>
    `
        )
        .join("");

    listElement.innerHTML = html;

    startTicker(listElement, data.length);
}

function startTicker(listElement, count) {
    if (count <= 1) {
        return;
    }

    let currentIndex = 0;
    const itemHeight = 26; // Must match CSS .news-item height

    // Clear any existing interval to prevent duplicates (though unlikely in this context)
    if (listElement._tickerInterval) {
        clearInterval(listElement._tickerInterval);
    }

    listElement._tickerInterval = setInterval(() => {
        currentIndex++;
        if (currentIndex >= count) {
            currentIndex = 0;
        }

        const translateY = -(currentIndex * itemHeight);
        listElement.style.transform = `translateY(${translateY}px)`;
    }, 3000); // Rotate every 3 seconds
}
