import { API_ENDPOINTS, SELECTORS, CONSOLE_STYLES } from "../constants.js";
import { showToast } from "./toast.js";

export function initHitokoto(config) {
    // If not enabled, return
    // But Hitokoto is always visible in the card, so we check if the element exists
    const hitokotoElement = document.querySelector(SELECTORS.HITOKOTO_TEXT);
    if (!hitokotoElement) return;

    // Use API endpoint from constants (now points to /api/hitokoto)
    fetchHitokoto(hitokotoElement);

    // Refresh on click
    hitokotoElement.addEventListener("click", (e) => {
        e.preventDefault();
        fetchHitokoto(hitokotoElement);
    });

    console.debug("[Plugin] Hitokoto Loaded");
}

async function fetchHitokoto(element) {
    element.innerText = "Loading...";
    
    // Robust fetch
    const maxRetries = 2;
    let attempts = 0;

    const tryFetch = async () => {
        try {
            // Add timestamp to prevent browser cache on refresh click
            const url = `${API_ENDPOINTS.HITOKOTO}?t=${new Date().getTime()}`;
            const response = await fetchWithTimeout(url, {}, 5000);
            
            if (!response.ok) {
                // If local proxy fails (e.g. 404 on local dev without vercel api), fallback to direct
                if (response.status === 404 && url.includes("/api/")) {
                    console.warn("Local API not found, falling back to direct Hitokoto API");
                    return await fetch("https://v1.hitokoto.cn").then(r => r.json());
                }
                throw new Error("API Error");
            }
            return await response.json();
        } catch (e) {
            throw e;
        }
    };

    while (attempts <= maxRetries) {
        try {
            const data = await tryFetch();
            element.innerText = data.hitokoto || "一言获取失败";
            element.title = `——${data.from_who || "佚名"}「${data.from || "无题"}」`;
            element.href = `https://hitokoto.cn?uuid=${data.uuid}`;
            return;
        } catch (error) {
            attempts++;
            if (attempts > maxRetries) {
                console.error("Hitokoto fetch failed:", error);
                element.innerText = "生命不息，折腾不止。";
                element.title = "——佚名";
                element.href = "#";
            }
        }
    }
}
