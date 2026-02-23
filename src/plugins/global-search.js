import { CONSOLE_STYLES } from "../constants.js";
import { showToast } from "./toast.js";

export function initGlobalSearch() {
    if (document.getElementById("global-search-container")) return;

    // Create Search Bar
    const searchContainer = document.createElement("div");
    searchContainer.id = "global-search-container";
    searchContainer.innerHTML = `
        <div class="search-input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="global-search-input" placeholder="搜索 导航 / Galgame / 番剧..." />
            <i class="fa-solid fa-xmark clear-icon" id="search-clear-btn" style="display: none;"></i>
        </div>
    `;

    // Style injection (inline for now, or append style tag)
    const style = document.createElement("style");
    style.textContent = `
        #global-search-container {
            margin-bottom: 16px;
            padding: 0 4px;
        }
        .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 8px 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .search-input-wrapper:focus-within {
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.3);
            transform: translateY(-1px);
        }
        #global-search-input {
            border: none;
            background: transparent;
            width: 100%;
            margin-left: 8px;
            font-size: 14px;
            color: #333;
            outline: none;
        }
        .search-icon {
            color: #999;
            font-size: 14px;
        }
        .clear-icon {
            color: #999;
            cursor: pointer;
            padding: 4px;
            transition: color 0.2s;
        }
        .clear-icon:hover {
            color: #ef4444;
        }
        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
            .search-input-wrapper {
                background: rgba(30, 41, 59, 0.6);
                border-color: rgba(255,255,255,0.05);
            }
            .search-input-wrapper:focus-within {
                background: rgba(30, 41, 59, 0.9);
            }
            #global-search-input {
                color: #e2e8f0;
            }
        }
    `;
    document.head.appendChild(style);

    // Insert at top of cards area (Left Area)
    const cardsArea = document.querySelector(".primary-container > .left-area > .cards");
    if (cardsArea) {
        cardsArea.insertBefore(searchContainer, cardsArea.firstChild);
    }

    // Logic
    const input = document.getElementById("global-search-input");
    const clearBtn = document.getElementById("search-clear-btn");

    input.addEventListener("input", (e) => handleSearch(e.target.value));
    
    clearBtn.addEventListener("click", () => {
        input.value = "";
        handleSearch("");
        input.focus();
    });

    console.log("%c[Plugin]%c Global Search Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}

function handleSearch(query) {
    const clearBtn = document.getElementById("search-clear-btn");
    if (query) {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }

    const term = query.toLowerCase().trim();

    // Selectors for searchable items
    // Galgame: .galgame-item (title in .galgame-title)
    // Navigation: .nav-item (title in .nav-title)
    // Anime: .anime-item (title in .anime-title)
    
    const items = [
        ...document.querySelectorAll(".galgame-item"),
        ...document.querySelectorAll(".nav-item"),
        ...document.querySelectorAll(".anime-item")
    ];

    let matchCount = 0;

    items.forEach(item => {
        let text = "";
        // Extract text based on item type
        if (item.classList.contains("galgame-item")) {
            text = item.querySelector(".galgame-title")?.innerText || "";
        } else if (item.classList.contains("nav-item")) {
            text = item.querySelector(".nav-title")?.innerText || "";
        } else if (item.classList.contains("anime-item")) {
            text = item.querySelector(".anime-title")?.innerText || "";
        }

        if (text.toLowerCase().includes(term)) {
            item.style.display = ""; // Reset
            matchCount++;
        } else {
            item.style.display = "none";
        }
    });

    // Handle Category Visibility (for Navigation)
    document.querySelectorAll(".nav-category").forEach(cat => {
        const visibleItems = cat.querySelectorAll(".nav-item:not([style*='display: none'])");
        if (visibleItems.length === 0) {
            cat.style.display = "none";
        } else {
            cat.style.display = "";
        }
    });

    // Handle "No Results" state per card?
    // Maybe simpler: just hide empty containers?
    // For now, let's just log or toast if no matches? No, that's annoying.
}
