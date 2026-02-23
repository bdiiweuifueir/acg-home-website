import "../styles/toast.css";
import { Z_INDEX, BG_CONFIG } from "../constants.js";

/**
 * Shared Toast Notification Logic
 * @param {string} message - Message to display
 * @param {string} type - 'info', 'success', 'error'
 */
export function showToast(message, type = "info") {
    let toast = document.getElementById("shared-toast");
    
    // Create if not exists
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "shared-toast";
        toast.style.zIndex = Z_INDEX.TOAST;
        document.body.appendChild(toast);
        
        // Add basic styles dynamically if css is not loaded (fallback)
        // Ideally styles should be in a shared css file
        toast.classList.add("toast-notification");
    }

    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-check";
    if (type === "error") icon = "fa-triangle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toast.className = "toast-notification"; // reset
    toast.classList.add(type);
    
    // Force reflow
    void toast.offsetWidth;
    
    toast.classList.add("show");

    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
        toast.classList.remove("show");
    }, BG_CONFIG.TOAST_DURATION);
}
