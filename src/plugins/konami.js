import { CONSOLE_STYLES } from "../constants.js";
import { showToast } from "./toast.js";

export function initKonami(config) {
    if (!config || !config.konami || !config.konami.enable) {
        return;
    }

    const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let index = 0;

    document.addEventListener("keydown", e => {
        // 如果按键匹配序列中的当前字符
        if (e.key === sequence[index]) {
            index++;

            // 如果整个序列都匹配成功
            if (index === sequence.length) {
                activateEasterEgg();
                index = 0; // 重置
            }
        } else {
            index = 0; // 如果按错，重置
        }
    });

    function activateEasterEgg() {
        console.log("%c[!]%c KONAMI CODE ACTIVATED!", CONSOLE_STYLES.TAG_RED, CONSOLE_STYLES.TAG_ORANGE);

        // 1. 旋转特效
        document.body.classList.add("barrel-roll");

        // 2. 弹出祝贺 (replaced alert with Toast)
        showToast("恭喜你发现了隐藏彩蛋！🎉", "success");

        // 3. 移除类以便下次还能触发
        setTimeout(() => {
            document.body.classList.remove("barrel-roll");
        }, 2000);
    }
}
