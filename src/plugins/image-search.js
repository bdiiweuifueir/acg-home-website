import { SELECTORS, CONSOLE_STYLES } from "../constants.js";
import "../styles/image-search.css";
import { showToast } from "./toast.js";

export function initImageSearch(config) {
    // 1. Find or Create Tools Card
    let toolsCard = document.getElementById("tools-card");
    const leftArea = document.querySelector(SELECTORS.LEFT_AREA + " > .cards");
    
    if (!leftArea) return;

    if (!toolsCard) {
        toolsCard = document.createElement("div");
        toolsCard.className = "card-item";
        toolsCard.id = "tools-card";
        toolsCard.innerHTML = `
            <span class="title"><i class="fa-solid fa-toolbox"></i> 实用工具</span>
            <div class="content tools-grid"></div>
        `;
        // Insert at the end
        leftArea.appendChild(toolsCard);
    }

    // 2. Add Search Tool Entry
    const toolsContainer = toolsCard.querySelector(".content");
    const searchEntry = document.createElement("div");
    searchEntry.className = "tool-entry";
    searchEntry.innerHTML = `
        <i class="fa-solid fa-magnifying-glass-chart"></i>
        <span>以图搜图</span>
    `;
    searchEntry.onclick = openSearchModal;
    toolsContainer.appendChild(searchEntry);

    console.debug("[Plugin] ImageSearch Loaded");
}

function openSearchModal() {
    // Create Modal if not exists
    if (!document.getElementById("image-search-modal")) {
        createSearchModal();
    }
    const modal = document.getElementById("image-search-modal");
    requestAnimationFrame(() => modal.classList.add("show"));
}

function createSearchModal() {
    const modal = document.createElement("div");
    modal.id = "image-search-modal";
    modal.className = "image-search-modal";
    
    modal.innerHTML = `
        <div class="search-container">
            <div class="search-header">
                <span class="search-title">以图搜图 (SauceNAO)</span>
                <span class="close-btn"><i class="fa-solid fa-xmark"></i></span>
            </div>
            
            <div class="upload-area" id="search-upload-area">
                <i class="fa-solid fa-cloud-arrow-up upload-icon"></i>
                <div class="upload-text">点击或拖拽图片到此处</div>
                <input type="file" id="search-file-input" accept="image/*" style="display: none">
            </div>

            <div class="preview-container" id="search-preview">
                <img src="" class="preview-image">
                <div class="remove-btn"><i class="fa-solid fa-trash"></i></div>
            </div>

            <button class="search-btn" id="do-search-btn" disabled>
                <i class="fa-solid fa-search"></i> 开始搜索
            </button>

            <div class="results-list" id="search-results"></div>
        </div>
    `;

    document.body.appendChild(modal);

    // Bind Events
    const closeBtn = modal.querySelector(".close-btn");
    const uploadArea = modal.querySelector(".upload-area");
    const fileInput = modal.querySelector("#search-file-input");
    const previewContainer = modal.querySelector("#search-preview");
    const previewImage = modal.querySelector(".preview-image");
    const removeBtn = modal.querySelector(".remove-btn");
    const searchBtn = modal.querySelector("#do-search-btn");
    const resultsList = modal.querySelector("#search-results");

    // Close
    const closeModal = () => {
        modal.classList.remove("show");
        // Clear state
        setTimeout(() => {
            fileInput.value = "";
            previewContainer.style.display = "none";
            uploadArea.style.display = "block";
            searchBtn.disabled = true;
            resultsList.innerHTML = "";
        }, 300);
    };
    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // Upload
    uploadArea.onclick = () => fileInput.click();
    
    uploadArea.ondragover = (e) => {
        e.preventDefault();
        uploadArea.classList.add("dragover");
    };
    
    uploadArea.ondragleave = () => {
        uploadArea.classList.remove("dragover");
    };

    uploadArea.ondrop = (e) => {
        e.preventDefault();
        uploadArea.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    fileInput.onchange = (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    // Remove
    removeBtn.onclick = () => {
        fileInput.value = "";
        previewContainer.style.display = "none";
        uploadArea.style.display = "block";
        searchBtn.disabled = true;
        resultsList.innerHTML = "";
    };

    // Search
    searchBtn.onclick = async () => {
        if (!fileInput.files[0]) return;
        
        const file = fileInput.files[0];
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 搜索中...';
        resultsList.innerHTML = "";

        try {
            const results = await performSearch(file);
            renderResults(results, resultsList);
        } catch (err) {
            console.error(err);
            resultsList.innerHTML = `<div style="color:red; text-align:center;">搜索失败: ${err.message}</div>`;
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fa-solid fa-search"></i> 开始搜索';
        }
    };

    function handleFile(file) {
        if (!file.type.startsWith("image/")) {
            showToast("请上传图片文件", "warning");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadArea.style.display = "none";
            previewContainer.style.display = "block";
            searchBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

async function performSearch(file) {
    const formData = new FormData();
    formData.append("file", file);
    // Use proxy or direct depending on CORS policy (SauceNAO allows CORS usually)
    // api_key is optional for low usage, but better to have. Using public test key or no key.
    // output_type=2 (JSON)
    const url = "https://saucenao.com/search.php?output_type=2&db=999"; 
    
    const response = await fetch(url, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw new Error("搜索过于频繁，请稍后再试");
        }
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
}

function renderResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px;">未找到相似图片</div>`;
        return;
    }

    const html = results.map(res => {
        const similarity = parseFloat(res.header.similarity);
        let simClass = "similarity-low";
        if (similarity > 80) simClass = "similarity-high";
        else if (similarity > 60) simClass = "similarity-medium";

        const title = res.data.title || res.data.eng_name || res.data.jp_name || "Unknown Title";
        const author = res.data.author_name || res.data.member_name || res.data.artist || "";
        const extUrl = res.data.ext_urls ? res.data.ext_urls[0] : "#";
        const thumb = res.header.thumbnail;

        return `
            <a href="${extUrl}" target="_blank" class="result-item">
                <img src="${thumb}" class="result-thumb" loading="lazy">
                <div class="result-info">
                    <div class="result-title">${title}</div>
                    <div class="result-author">${author}</div>
                    <div class="result-similarity ${simClass}">相似度: ${similarity}%</div>
                </div>
                <div style="display:flex; align-items:center;">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </div>
            </a>
        `;
    }).join("");

    container.innerHTML = html;
}
