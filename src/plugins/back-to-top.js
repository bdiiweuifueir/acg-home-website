import { CONSOLE_STYLES, Z_INDEX } from "../constants.js";
import "../styles/back-to-top.css";

export function initBackToTop() {
    if (document.getElementById("back-to-top")) return;

    const btn = document.createElement("div");
    btn.id = "back-to-top";
    btn.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`;
    btn.title = "回到顶部";
    btn.setAttribute("role", "button");
    btn.setAttribute("aria-label", "回到顶部");
    btn.style.zIndex = Z_INDEX.RANDOM_BG_BTN;
    
    document.body.appendChild(btn);

    // Scroll Logic with requestAnimationFrame for performance
    let ticking = false;

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 300) {
                    btn.classList.add("show");
                } else {
                    btn.classList.remove("show");
                }
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    console.log("%c[Plugin]%c BackToTop Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}
