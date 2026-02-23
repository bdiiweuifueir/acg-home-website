import mediumZoom from "medium-zoom";

export function initLightbox(config) {
    // 检查配置是否开启
    if (config && config.lightbox && config.lightbox.enable === false) {
        return;
    }

    // 默认配置
    const defaultOptions = {
        margin: 24,
        background: "rgba(0, 0, 0, 0.8)",
        scrollOffset: 0,
    };

    // 合并用户配置
    const options = { ...defaultOptions, ...(config?.lightbox?.options || {}) };

    // 初始化 medium-zoom
    // 注意：这里我们返回 zoom 实例，以便后续动态添加图片
    const zoom = mediumZoom(options);

    return zoom;
}

/**
 * 刷新灯箱，为新添加的图片绑定事件
 * @param {Object} zoomInstance medium-zoom 实例
 * @param {String} selector 图片选择器
 */
export function refreshLightbox(zoomInstance, selector = ".markdown-content img") {
    if (!zoomInstance) {
        return;
    }

    // 获取所有匹配的图片
    const images = document.querySelectorAll(selector);

    // 将图片添加到 zoom 实例中
    zoomInstance.attach(images);
}
