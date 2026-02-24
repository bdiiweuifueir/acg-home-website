import { Z_INDEX } from "../constants.js";
import { isMobile } from "../utils.js";

export function initClickEffect(config) {
    if (!config || !config.clickEffect || !config.clickEffect.enable) {
        return;
    }

    // 移动端禁用
    if (isMobile()) {
        return;
    }

    const effectConfig = config.clickEffect;
    
    if (!effectConfig.text || !Array.isArray(effectConfig.text) || effectConfig.text.length === 0) {
        return;
    }

    let textIndex = 0;

    // 点击事件监听
    document.addEventListener("click", e => {
        // 创建元素
        const span = document.createElement("span");

        // 获取当前文字
        const text = effectConfig.text[textIndex];
        textIndex = (textIndex + 1) % effectConfig.text.length;

        // 设置内容
        span.textContent = text;

        // 设置样式
        span.style.zIndex = Z_INDEX.CLICK_EFFECT; // Use centralized Z-Index
        span.style.position = "absolute";
        span.style.fontWeight = "bold";
        span.style.color = effectConfig.colors[Math.floor(Math.random() * effectConfig.colors.length)];
        span.style.left = `${e.pageX}px`;
        span.style.top = `${e.pageY}px`;
        span.style.userSelect = "none";
        span.style.pointerEvents = "none"; // 确保不遮挡点击
        span.style.opacity = "1";
        span.style.transition = "all 1s ease-out";
        span.style.transform = "translate(-50%, -50%)"; // 居中显示

        document.body.appendChild(span);

        // 动画效果
        requestAnimationFrame(() => {
            span.style.top = `${e.pageY - 180}px`; // 向上飘动
            span.style.opacity = "0"; // 渐隐
        });

        // 动画结束后移除元素
        setTimeout(() => {
            span.remove();
        }, 1000);
    });
}
