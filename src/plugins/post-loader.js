import { SELECTORS, ERROR_TEMPLATES, CONSOLE_STYLES } from "../constants.js";
import { md } from "../utils.js";
import hljs from "highlight.js";
import DOMPurify from "dompurify";
import "highlight.js/styles/atom-one-dark.css";
import { refreshLightbox } from "./lightbox.js";
import { initComment } from "./comment.js";

// Global instance to hold lightbox reference
let lightboxInstance = null;

export function initPostLoader(config, lightbox) {
    // Store lightbox instance
    if (lightbox) {
        lightboxInstance = lightbox;
    }

    // Check if post loader is enabled in config (we can add a new config section or just enable by default)
    // For now, let's assume it's always available if the DOM element exists.
    
    // Create Post List Container
    const contentPage = document.querySelector(".content-page");
    if (!contentPage) return;

    // Check if we are in "Home" mode (default) or "Post" mode
    // We can use hash routing: #post/hello-world.md
    
    window.addEventListener("hashchange", handleHashChange);
    
    // Expose pagination function to global scope for onclick events
    window.changePage = (page) => {
        const container = document.querySelector(".content-page .markdown-content");
        if (container) {
            loadPostList(container, page);
        }
    };

    // Initial Load
    handleHashChange();
}

// Pagination state
const PAGE_SIZE = 5;

async function handleHashChange() {
    const hash = window.location.hash;
    const contentPage = document.querySelector(".content-page");
    const container = contentPage.querySelector(".markdown-content");
    
    if (!container) return;

    if (hash.startsWith("#post/")) {
        // Load specific post
        const postPath = hash.replace("#post/", "");
        await loadPost(postPath, container);
    } else if (hash.startsWith("#about")) {
        // Load About Page
        await loadAbout(container);
    } else if (hash.startsWith("#friends")) {
        // Load Friends Page
        await loadFriends(container);
    } else if (hash === "" || hash === "#" || hash.startsWith("#page")) {
        // Load Post List (Home) - Default
        await loadPostList(container);
    } else {
        // Unknown hash - Fallback to Home or 404
        console.warn(`Unknown hash: ${hash}, redirecting to home.`);
        await loadPostList(container);
    }
}

async function loadPostList(container, page = 1) {
    container.innerHTML = `<div class="loading">Loading posts...</div>`;
    
    try {
        const response = await fetch("/assets/data/posts.json");
        if (!response.ok) throw new Error("Failed to load posts.json");
        
        const allPosts = await response.json();
        
        if (!Array.isArray(allPosts) || allPosts.length === 0) {
            container.innerHTML = "<p>暂无文章</p>";
            return;
        }

        // Pagination Logic
        const totalPosts = allPosts.length;
        const totalPages = Math.ceil(totalPosts / PAGE_SIZE);
        
        // Ensure page is within bounds
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        const startIndex = (page - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const currentPosts = allPosts.slice(startIndex, endIndex);

        let html = `<div class="post-list">`;
        currentPosts.forEach(post => {
            html += `
                <div class="post-item">
                    <h2 class="post-title"><a href="#post/${post.path}">${post.title}</a></h2>
                    <div class="post-meta">
                        <span class="post-date"><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                        ${post.tags ? `<span class="post-tags"><i class="fa-solid fa-tags"></i> ${post.tags.join(", ")}</span>` : ""}
                    </div>
                    <div class="post-summary">${post.summary || ""}</div>
                    <a href="#post/${post.path}" class="read-more">阅读全文 <i class="fa-solid fa-angle-right"></i></a>
                </div>
                <hr class="post-divider">
            `;
        });
        html += `</div>`;
        
        // Add Pagination Controls
        if (totalPages > 1) {
            html += renderPagination(page, totalPages);
        }
        
        container.innerHTML = html;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (e) {
        console.error("Post List Error:", e);
        // Fallback to original content-page.md if list fails?
        // Or show error.
        container.innerHTML = `<div class="error">无法加载文章列表</div>`;
    }
}

function renderPagination(currentPage, totalPages) {
    let html = `<div class="pagination">`;
    
    // Prev Button
    if (currentPage > 1) {
        html += `<button class="page-btn prev" onclick="window.changePage(${currentPage - 1})"><i class="fa-solid fa-angle-left"></i> 上一页</button>`;
    } else {
        html += `<button class="page-btn prev disabled" disabled><i class="fa-solid fa-angle-left"></i> 上一页</button>`;
    }

    // Page Numbers (Simple version: show all or simplified range)
    // For now, let's show current / total
    html += `<span class="page-info">${currentPage} / ${totalPages}</span>`;

    // Next Button
    if (currentPage < totalPages) {
        html += `<button class="page-btn next" onclick="window.changePage(${currentPage + 1})">下一页 <i class="fa-solid fa-angle-right"></i></button>`;
    } else {
        html += `<button class="page-btn next disabled" disabled>下一页 <i class="fa-solid fa-angle-right"></i></button>`;
    }
    
    html += `</div>`;
    return html;
}

async function loadAbout(container) {
    container.innerHTML = `<div class="loading">Loading...</div>`;
    const fullPath = "/assets/markdown/content-page.md";
    try {
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`About page not found: ${fullPath}`);
        
        const markdown = await response.text();
        const rendered = md.render(markdown);
        const sanitized = DOMPurify.sanitize(rendered, {
            ADD_TAGS: ["iframe", "style", "link", "audio", "video", "source", "track", "embed", "object", "param", "map", "area", "img"],
            ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder", "scrolling", "src", "width", "height", "style", "class", "id", "name", "autoplay", "controls", "loop", "muted", "preload", "poster", "alt", "loading", "title", "data-*"],
        });

        // Add "Back" button
        const backBtn = `<div class="post-nav"><a href="#" class="back-btn"><i class="fa-solid fa-arrow-left"></i> 返回列表</a></div>`;
        
        container.innerHTML = backBtn + sanitized;
        
        // Re-highlight code blocks
        container.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Refresh Lightbox
        if (lightboxInstance) {
            refreshLightbox(lightboxInstance);
        }

        // Initialize Comment System (if enabled)
        // Note: loadAbout is for static page, maybe we want comments there too?
        if (window.config && window.config.comment && window.config.comment.enable) {
             initComment(window.config, container);
        }

    } catch (e) {
        console.error("Load About Error:", e);
        container.innerHTML = ERROR_TEMPLATES.MARKDOWN_LOAD_FAIL(fullPath);
    }
}

async function loadFriends(container) {
    container.innerHTML = `<div class="loading">Loading friends...</div>`;
    
    const backBtn = `<div class="post-nav"><a href="#" class="back-btn"><i class="fa-solid fa-arrow-left"></i> 返回列表</a></div>`;
    
    try {
        const response = await fetch("/assets/data/friends.json");
        if (!response.ok) throw new Error("Failed to load friends.json");
        
        const friends = await response.json();
        
        if (!Array.isArray(friends) || friends.length === 0) {
            container.innerHTML = backBtn + "<p>暂无友情链接</p>";
            return;
        }

        let html = backBtn + `<div class="friends-container">`;
        friends.forEach(friend => {
            html += `
                <a href="${friend.link}" target="_blank" class="friend-card">
                    <img src="${friend.avatar}" alt="${friend.name}" class="friend-avatar" onerror="this.src='/assets/images/avatar.png'">
                    <div class="friend-info">
                        <div class="friend-name">${friend.name}</div>
                        <div class="friend-desc">${friend.description}</div>
                    </div>
                </a>
            `;
        });
        html += `</div>`;
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error("Friends Load Error:", e);
        container.innerHTML = backBtn + `<div class="error">无法加载友情链接</div>`;
    }
}

async function loadPost(path, container) {
    container.innerHTML = `<div class="loading">Loading...</div>`;
    
    // Security check: path should not contain ..
    if (path.includes("..")) {
        container.innerHTML = "Invalid path";
        return;
    }

    const fullPath = `/assets/markdown/posts/${path}`;
    
    try {
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`Post not found: ${fullPath}`);
        
        const markdown = await response.text();
        const rendered = md.render(markdown);
        const sanitized = DOMPurify.sanitize(rendered, {
            ADD_TAGS: ["iframe", "style", "link", "audio", "video", "source", "track", "embed", "object", "param", "map", "area", "img"],
            ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder", "scrolling", "src", "width", "height", "style", "class", "id", "name", "autoplay", "controls", "loop", "muted", "preload", "poster", "alt", "loading", "title", "data-*"],
        });

        // Add "Back" button
        const backBtn = `<div class="post-nav"><a href="#" class="back-btn"><i class="fa-solid fa-arrow-left"></i> 返回列表</a></div>`;
        
        container.innerHTML = backBtn + sanitized;
        
        // Re-highlight code blocks
        container.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Refresh Lightbox
        if (lightboxInstance) {
            refreshLightbox(lightboxInstance);
        }

        // Initialize Comment System
        if (window.config && window.config.comment && window.config.comment.enable) {
             initComment(window.config, container);
        }

    } catch (e) {
        console.error("Load Post Error:", e);
        container.innerHTML = ERROR_TEMPLATES.MARKDOWN_LOAD_FAIL(fullPath);
    }
}
