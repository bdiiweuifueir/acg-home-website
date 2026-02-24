import { CONSOLE_STYLES } from "../constants.js";

export function initComment(config, targetContainer) {
    if (!config || !config.comment || !config.comment.enable) {
        return;
    }

    const commentConfig = config.comment;
    if (commentConfig.provider !== "giscus") {
        return; // Currently only supports Giscus
    }

    const giscusConfig = commentConfig.giscus;
    if (!giscusConfig.repo || !giscusConfig.repoId || !giscusConfig.categoryId) {
        console.warn("[Comment] Giscus configuration missing repoId or categoryId.");
        return;
    }

    // Determine container: use provided target or find default
    const container = targetContainer || document.querySelector(".primary-container > .right-area > .content-page");
    if (!container) {
        console.warn("[Comment] Container not found.");
        return;
    }

    // Check if comment area already exists
    let commentArea = container.querySelector("#comment-area");
    if (commentArea) {
        // If it exists, we might need to clear it or update it.
        // For simplicity in SPA, we can remove old and re-add.
        commentArea.remove();
    }

    // Create comment area
    commentArea = document.createElement("div");
    commentArea.id = "comment-area";
    commentArea.style.marginTop = "2rem";
    commentArea.style.padding = "1rem";
    commentArea.style.background = "var(--card-bg, rgba(255, 255, 255, 0.8))";
    commentArea.style.borderRadius = "12px";
    commentArea.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    commentArea.style.backdropFilter = "blur(10px)";
    
    // Add Giscus script
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", giscusConfig.repo);
    script.setAttribute("data-repo-id", giscusConfig.repoId);
    script.setAttribute("data-category", giscusConfig.category);
    script.setAttribute("data-category-id", giscusConfig.categoryId);
    script.setAttribute("data-mapping", giscusConfig.mapping);
    script.setAttribute("data-reactions-enabled", giscusConfig.reactionsEnabled);
    script.setAttribute("data-emit-metadata", giscusConfig.emitMetadata);
    script.setAttribute("data-input-position", giscusConfig.inputPosition);
    script.setAttribute("data-theme", giscusConfig.theme);
    script.setAttribute("data-lang", giscusConfig.lang);
    script.setAttribute("data-loading", giscusConfig.loading);
    script.crossOrigin = "anonymous";
    script.async = true;

    commentArea.appendChild(script);
    container.appendChild(commentArea);

    console.log("%c[Plugin]%c Comment System (Giscus) Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}
