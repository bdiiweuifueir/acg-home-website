import { API_ENDPOINTS, SELECTORS, CONSOLE_STYLES } from "../constants.js";
import { showToast } from "./toast.js";

export function initHitokoto(config) {
    // Hitokoto usually doesn't need config to enable, but we can check if it exists
    const hitokotoElement = document.querySelector(SELECTORS.HITOKOTO_TEXT);
    if (!hitokotoElement) {
        return;
    }

    fetchHitokoto(hitokotoElement);

    // Bind events
    hitokotoElement.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default link behavior
        copyHitokoto(hitokotoElement);
    });

    // Add refresh button if not exists
    const container = hitokotoElement.parentElement;
    if (container && !container.querySelector(".hitokoto-refresh-btn")) {
        // Add container class for flex layout
        container.classList.add("hitokoto-container");
        hitokotoElement.style.flex = "1";

        const refreshBtn = document.createElement("span");
        refreshBtn.className = "hitokoto-refresh-btn";
        refreshBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i>`;
        refreshBtn.title = "刷新一言";
        refreshBtn.setAttribute("role", "button");
        refreshBtn.setAttribute("aria-label", "刷新一言");
        refreshBtn.setAttribute("tabindex", "0"); // Make it focusable
        
        refreshBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const icon = refreshBtn.querySelector("i");
            if (icon) icon.classList.add("fa-spin");
            
            fetchHitokoto(hitokotoElement).finally(() => {
                // Minimum spin time for better UX
                setTimeout(() => {
                    if (icon) icon.classList.remove("fa-spin");
                }, 500);
            });
        });

        container.appendChild(refreshBtn);
    }

    console.log("%c[Plugin]%c Hitokoto Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}

function fetchHitokoto(element) {
    const apiUrl = API_ENDPOINTS.HITOKOTO || "https://v1.hitokoto.cn/";
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            element.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
            element.innerText = data.hitokoto;
            element.dataset.text = data.hitokoto; // Store for copy
            if (data.from) {
                element.title = `—— ${data.from_who || ""}「${data.from}」`;
            }
        })
        .catch(err => {
            console.error("Hitokoto fetch failed:", err);
            element.innerText = "一言获取失败...";
            showToast("一言获取失败", "error");
        });
}

function copyHitokoto(element) {
    const text = element.innerText;
    if (!text || text === "一言获取失败...") return;

    navigator.clipboard.writeText(text).then(() => {
        showToast("一言已复制到剪贴板", "success");
    }).catch(err => {
        console.error("Copy failed:", err);
        showToast("复制失败", "error");
    });
}
