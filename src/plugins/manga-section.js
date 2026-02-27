import { API_ENDPOINTS, SELECTORS, CONSOLE_STYLES } from "../constants.js";
import "../styles/manga-section.css";
import { showToast } from "./toast.js";
import { fetchWithTimeout } from "../utils.js";

export function initMangaSection(config) {
    // 1. Create Entry in Tools Card
    const createEntry = () => {
        let toolsCard = document.getElementById("tools-card");
        if (!toolsCard) {
             // If tools card doesn't exist yet (maybe ImageSearch hasn't run), wait a bit
             // But usually ImageSearch creates it. If not, we create it.
             const leftAreaCards = document.querySelector(SELECTORS.LEFT_AREA_CARDS);
             if (leftAreaCards) {
                toolsCard = document.createElement("div");
                toolsCard.className = "card-item";
                toolsCard.id = "tools-card";
                toolsCard.innerHTML = `
                    <span class="title"><i class="fa-solid fa-toolbox"></i> 实用工具</span>
                    <div class="content tools-grid"></div>
                `;
                leftAreaCards.appendChild(toolsCard);
             } else {
                 return;
             }
        }
        
        const toolsContainer = toolsCard.querySelector(".content");
        if (!toolsContainer || toolsContainer.querySelector(".manga-entry")) return;

        const entry = document.createElement("div");
        entry.className = "tool-entry manga-entry";
        entry.innerHTML = `
            <i class="fa-solid fa-book-journal-whills"></i>
            <span>漫画阅读</span>
        `;
        entry.onclick = openMangaModal;
        toolsContainer.appendChild(entry);
        
        console.debug("[Plugin] MangaSection Loaded");
    };

    // Wait for DOM
    setTimeout(createEntry, 1000);
}

// --- UI Logic ---

let currentMangaId = null;
let currentChapterId = null;

function openMangaModal() {
    if (!document.getElementById("manga-modal")) {
        createMangaModal();
    }
    const modal = document.getElementById("manga-modal");
    requestAnimationFrame(() => modal.classList.add("show"));
}

function createMangaModal() {
    const modal = document.createElement("div");
    modal.id = "manga-modal";
    modal.className = "manga-section-modal";
    
    modal.innerHTML = `
        <div class="manga-container">
            <div class="manga-header">
                <div class="manga-header-title">
                    <i class="fa-solid fa-book-open"></i> MangaDex 漫画阅读
                </div>
                <div class="manga-close-btn"><i class="fa-solid fa-xmark"></i></div>
            </div>

            <!-- View 1: Search -->
            <div class="manga-search-view" id="manga-search-view">
                <div class="manga-search-bar">
                    <input type="text" class="manga-search-input" placeholder="输入漫画名称 (支持中文)..." id="manga-search-input">
                    <button class="manga-search-btn" id="manga-search-btn">
                        <i class="fa-solid fa-search"></i> 搜索
                    </button>
                </div>
                <div class="manga-content" id="manga-search-results">
                    <div class="manga-empty">
                        <i class="fa-solid fa-book-bookmark" style="font-size: 3rem; margin-bottom: 10px; display:block;"></i>
                        请输入关键词开始搜索
                    </div>
                </div>
            </div>

            <!-- View 2: Chapter List -->
            <div class="manga-content chapter-list-view" id="manga-chapter-view">
                <div class="back-btn" id="back-to-search"><i class="fa-solid fa-arrow-left"></i> 返回搜索</div>
                <div class="chapter-header">
                    <img src="" class="chapter-cover" id="manga-detail-cover">
                    <div class="chapter-meta">
                        <h3 class="manga-title" id="manga-detail-title" style="font-size: 1.5rem; margin-bottom: 10px;"></h3>
                        <p id="manga-detail-desc" style="font-size: 0.9rem; color: #666; max-height: 100px; overflow-y: auto;"></p>
                    </div>
                </div>
                <div class="chapter-list" id="chapter-list-container"></div>
            </div>
        </div>

        <!-- Reader Overlay -->
        <div class="reader-view" id="manga-reader-view">
            <div class="reader-header">
                <span id="reader-title">Chapter Title</span>
                <div class="manga-close-btn" id="close-reader" style="color: #fff;"><i class="fa-solid fa-xmark"></i></div>
            </div>
            <div class="reader-content" id="reader-pages"></div>
        </div>
    `;

    document.body.appendChild(modal);

    // Bind Events
    const closeBtn = modal.querySelector(".manga-close-btn");
    const searchInput = modal.querySelector("#manga-search-input");
    const searchBtn = modal.querySelector("#manga-search-btn");
    const backToSearchBtn = modal.querySelector("#back-to-search");
    const closeReaderBtn = modal.querySelector("#close-reader");
    
    closeBtn.onclick = () => modal.classList.remove("show");
    
    // Search
    const doSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        
        const resultsContainer = modal.querySelector("#manga-search-results");
        resultsContainer.innerHTML = `<div class="manga-loading"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>搜索中 (MangaDex API 较慢，请耐心等待)...</p></div>`;
        searchBtn.disabled = true;

        try {
            const data = await fetchMangaSearch(query);
            renderSearchResults(data, resultsContainer);
        } catch (e) {
            resultsContainer.innerHTML = `<div class="manga-empty" style="color: red;">搜索失败: ${e.message}<br><button class="manga-search-btn" onclick="document.getElementById('manga-search-btn').click()" style="margin:10px auto;">重试</button></div>`;
        } finally {
            searchBtn.disabled = false;
        }
    };

    searchBtn.onclick = doSearch;
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') doSearch();
    };

    // Navigation
    backToSearchBtn.onclick = () => {
        document.getElementById("manga-chapter-view").style.display = "none";
        document.getElementById("manga-search-view").style.display = "block";
    };

    closeReaderBtn.onclick = () => {
        document.getElementById("manga-reader-view").style.display = "none";
        document.body.style.overflow = ""; // Restore scroll
    };
}

// --- API Calls ---

async function fetchMangaSearch(query) {
    const url = `${API_ENDPOINTS.MANGADEX_SEARCH}?query=${encodeURIComponent(query)}`;
    // Increase timeout to 15s for slow MangaDex API
    const res = await fetchWithTimeout(url, {}, 15000);
    if (!res.ok) throw new Error("Search API failed");
    const data = await res.json();
    return data.results;
}

async function fetchChapters(mangaId) {
    const url = `${API_ENDPOINTS.MANGADEX_CHAPTERS}?id=${mangaId}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error("Chapter API failed");
    const data = await res.json();
    return data.chapters;
}

async function fetchPages(chapterId) {
    const url = `${API_ENDPOINTS.MANGADEX_PAGES}?id=${chapterId}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error("Pages API failed");
    const data = await res.json();
    return data.pages;
}

// --- Render Logic ---

function renderSearchResults(results, container) {
    if (!results || results.length === 0) {
        container.innerHTML = `<div class="manga-empty">未找到相关漫画</div>`;
        return;
    }

    container.innerHTML = `<div class="manga-grid"></div>`;
    const grid = container.querySelector(".manga-grid");

    results.forEach(manga => {
        const card = document.createElement("div");
        card.className = "manga-card";
        card.innerHTML = `
            <img src="${manga.cover}" class="manga-cover" loading="lazy">
            <div class="manga-info">
                <div class="manga-title" title="${manga.title}">${manga.title}</div>
                <div class="manga-year">${manga.year || "Unknown"}</div>
            </div>
        `;
        card.onclick = () => loadMangaDetails(manga);
        grid.appendChild(card);
    });
}

async function loadMangaDetails(manga) {
    currentMangaId = manga.id;
    
    // Switch View
    document.getElementById("manga-search-view").style.display = "none";
    const chapterView = document.getElementById("manga-chapter-view");
    chapterView.style.display = "flex";
    
    // Set Meta
    document.getElementById("manga-detail-cover").src = manga.cover;
    document.getElementById("manga-detail-title").textContent = manga.title;
    document.getElementById("manga-detail-desc").textContent = manga.desc || "暂无简介";
    
    // Load Chapters
    const listContainer = document.getElementById("chapter-list-container");
    listContainer.innerHTML = `<div class="manga-loading"><i class="fa-solid fa-spinner fa-spin"></i><p>加载章节中...</p></div>`;

    try {
        const chapters = await fetchChapters(manga.id);
        renderChapterList(chapters, listContainer);
    } catch (e) {
        listContainer.innerHTML = `<div class="manga-empty">加载章节失败</div>`;
    }
}

function renderChapterList(chapters, container) {
    if (!chapters || chapters.length === 0) {
        container.innerHTML = `<div class="manga-empty">该漫画暂无章节或无中文资源</div>`;
        return;
    }

    container.innerHTML = "";
    chapters.forEach(ch => {
        const item = document.createElement("div");
        item.className = "chapter-item";
        
        let langLabel = "";
        if (ch.lang === 'zh' || ch.lang === 'zh-hk') langLabel = "中文";
        else if (ch.lang === 'en') langLabel = "ENG";
        else langLabel = ch.lang;

        item.innerHTML = `
            <span>${ch.chapter ? `Ch.${ch.chapter} - ` : ""}${ch.title}</span>
            <div>
                <span style="color:#888; font-size:12px;">${ch.pages}P</span>
                <span class="chapter-lang-tag">${langLabel}</span>
            </div>
        `;
        item.onclick = () => openReader(ch);
        container.appendChild(item);
    });
}

async function openReader(chapter) {
    currentChapterId = chapter.id;
    const readerView = document.getElementById("manga-reader-view");
    const pagesContainer = document.getElementById("reader-pages");
    const title = document.getElementById("reader-title");
    
    readerView.style.display = "flex";
    document.body.style.overflow = "hidden"; // Prevent background scroll
    
    title.textContent = `Loading...`;
    pagesContainer.innerHTML = `<div class="reader-loading"><i class="fa-solid fa-spinner fa-spin fa-3x"></i></div>`;

    try {
        const pages = await fetchPages(chapter.id);
        title.textContent = `${chapter.chapter ? `Ch.${chapter.chapter}` : ""} ${chapter.title}`;
        renderPages(pages, pagesContainer);
    } catch (e) {
        pagesContainer.innerHTML = `<div class="reader-loading">加载图片失败: ${e.message}</div>`;
    }
}

function renderPages(pages, container) {
    container.innerHTML = "";
    pages.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "reader-page";
        img.loading = "lazy";
        container.appendChild(img);
    });
}