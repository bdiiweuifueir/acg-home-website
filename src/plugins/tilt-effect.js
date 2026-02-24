import VanillaTilt from "vanilla-tilt";
import { isMobile } from "../utils.js";
import { DEFAULT_CONFIG } from "../constants.js";

export function initTiltEffect(config) {
    // 检查配置是否开启
    if (!config || !config.tilt || config.tilt.enable === false) {
        return;
    }

    // 移动端禁用
    if (isMobile()) {
        return;
    }

    // 默认配置
    const defaultOptions = {
        max: 5, // 最大倾斜角度
        speed: 400, // 过渡速度
        glare: true, // 开启眩光效果
        "max-glare": 0.2, // 最大眩光不透明度
        scale: 1.02, // 缩放比例
    };

    // 合并用户配置
    const options = { ...defaultOptions, ...(config.tilt.options || {}) };

    // 获取需要应用效果的元素选择器
    const selectors = config.tilt.selectors || DEFAULT_CONFIG.tilt.selectors;

    if (!selectors || !Array.isArray(selectors)) {
        return;
    }

    // 绑定效果
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            VanillaTilt.init(Array.from(elements), options);
        }
    });
}
