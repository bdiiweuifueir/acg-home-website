import { SELECTORS, ERROR_TEMPLATES, CONSOLE_STYLES } from "../constants.js";
import { md } from "../utils.js";
import hljs from "highlight.js";
import DOMPurify from "dompurify";
import "highlight.js/styles/atom-one-dark.css";

export function initPostLoader(config) {
    // Check if post loader is enabled in config (we can add a new config section or just enable by default)
    // For now, let's assume it's always available if the DOM element exists.
    
    // Create Post List Container
    const contentPage = document.querySelector(".content-page");
    if (!contentPage) return;

    // Check if we are in "Home" mode (default) or "Post" mode
    // We can use hash routing: #post/hello-world.md
    
    window.addEventListener("hashchange", handleHashChange);
    
    // Initial Load
    handleHashChange();
}

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
    } else {
        // Load Post List (Home)
        await loadPostList(container);
    }
}

async function loadPostList(container) {
    container.innerHTML = `<div class="loading">Loading posts...</div>`;
    
    try {
        const response = await fetch("/assets/data/posts.json");
        if (!response.ok) throw new Error("Failed to load posts.json");
        
        const posts = await response.json();
        
        if (!Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = "<p>暂无文章</p>";
            return;
        }

        let html = `<div class="post-list">`;
        posts.forEach(post => {
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
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error("Post List Error:", e);
        // Fallback to original content-page.md if list fails?
        // Or show error.
        container.innerHTML = `<div class="error">无法加载文章列表</div>`;
    }
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

    } catch (e) {
        console.error("Load About Error:", e);
        container.innerHTML = ERROR_TEMPLATES.MARKDOWN_LOAD_FAIL(fullPath);
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

    } catch (e) {
        console.error("Load Post Error:", e);
        container.innerHTML = ERROR_TEMPLATES.MARKDOWN_LOAD_FAIL(fullPath);
    }
}
