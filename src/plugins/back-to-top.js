import { CONSOLE_STYLES, Z_INDEX } from "../constants.js";

export function initBackToTop() {
    if (document.getElementById("back-to-top")) return;

    const btn = document.createElement("div");
    btn.id = "back-to-top";
    btn.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`;
    btn.title = "回到顶部";
    
    // Inline styles (or move to css)
    Object.assign(btn.style, {
        position: "fixed",
        bottom: "80px", // Above music player?
        right: "20px",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(5px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: Z_INDEX.RANDOM_BG_BTN, // Same level as random bg
        opacity: "0",
        transform: "translateY(20px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        color: "#333",
        pointerEvents: "none" // Disable clicks when hidden
    });

    document.body.appendChild(btn);

    // Scroll Logic
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            btn.style.opacity = "1";
            btn.style.transform = "translateY(0)";
            btn.style.pointerEvents = "auto";
        } else {
            btn.style.opacity = "0";
            btn.style.transform = "translateY(20px)";
            btn.style.pointerEvents = "none";
        }
    };

    window.addEventListener("scroll", toggleVisibility);

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    btn.addEventListener("mouseover", () => {
        btn.style.transform = "translateY(-3px)";
        btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
        btn.style.color = "#3b82f6"; // Primary color
    });

    btn.addEventListener("mouseout", () => {
        btn.style.transform = "translateY(0)";
        btn.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        btn.style.color = "#333";
    });

    console.log("%c[Plugin]%c BackToTop Loaded", CONSOLE_STYLES.TAG_PURPLE, CONSOLE_STYLES.INFO);
}
