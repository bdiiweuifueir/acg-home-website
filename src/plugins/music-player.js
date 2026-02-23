import "aplayer/dist/APlayer.min.css";
import "../styles/immersive-player.css";
import APlayer from "aplayer";
import "meting/dist/Meting.min.js";
import { CONSOLE_STYLES, Z_INDEX, PATH_CONFIG } from "../constants.js";
import { showToast } from "./toast.js";

// MetingJS relies on window.APlayer
window.APlayer = APlayer;

export function initMusicPlayer(config) {
    if (!config || !config.music || !config.music.enable) {
        return;
    }

    if (document.getElementById("music-player-container")) {
        console.warn("Music Player container already exists. Skipping initialization.");
        return;
    }

    const musicConfig = config.music;
    const container = document.createElement("div");
    container.id = "music-player-container";
    
    // Styles applied directly to ensure visibility and positioning
    Object.assign(container.style, {
        position: "fixed",
        bottom: "0",
        left: "0",
        zIndex: Z_INDEX.MUSIC_PLAYER
    });

    document.body.appendChild(container);

    if (musicConfig.server === 'custom' || musicConfig.server === 'local') {
        initCustomPlayer(musicConfig, container);
    } else {
        initMetingPlayer(musicConfig, container);
    }

    console.log("%c[I]%c Music Player initialized.", CONSOLE_STYLES.INFO, "");
}

function initMetingPlayer(musicConfig, container) {
    const metingElement = document.createElement("meting-js");

    const attributes = {
        server: musicConfig.server,
        type: musicConfig.type,
        id: musicConfig.id,
        auto: musicConfig.auto,
        fixed: musicConfig.fixed,
        mini: musicConfig.mini,
        autoplay: musicConfig.autoplay,
        theme: musicConfig.theme,
        volume: musicConfig.volume,
        loop: musicConfig.loop,
        order: musicConfig.order,
        "list-folded": musicConfig.listFolded,
    };

    Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            metingElement.setAttribute(key, String(value));
        }
    });

    container.appendChild(metingElement);
    
    // Wait for MetingJS to initialize APlayer using MutationObserver
    const observer = new MutationObserver(() => {
        if (metingElement.aplayer) {
            observer.disconnect();
            initImmersivePlayer({ type: 'meting', element: metingElement });
        }
    });
    
    observer.observe(metingElement, { childList: true, subtree: true });
    
    // Timeout fallback (10s)
    setTimeout(() => {
        observer.disconnect();
        if (!metingElement.aplayer) {
            console.warn("MetingJS initialization timed out.");
        }
    }, 10000);
}

async function initCustomPlayer(musicConfig, container) {
    const audioList = musicConfig.audio || [];
    
    // Parallel load LRC files
    const lrcPromises = audioList.map(async (audio) => {
        if (audio.lrc && typeof audio.lrc === 'string' && (audio.lrc.startsWith('/') || audio.lrc.startsWith('http'))) {
            try {
                const response = await fetch(audio.lrc);
                if (response.ok) {
                    audio.lrc = await response.text();
                } else {
                    console.warn(`[Music] Failed to load LRC: ${audio.lrc}`);
                    audio.lrc = "[00:00.00] 歌词加载失败";
                }
            } catch (e) {
                console.error(`[Music] Error loading LRC: ${audio.lrc}`, e);
                audio.lrc = "[00:00.00] 歌词加载错误";
            }
        }
    });

    await Promise.all(lrcPromises);

    const apContainer = document.createElement("div");
    container.appendChild(apContainer);

    const ap = new APlayer({
        container: apContainer,
        fixed: musicConfig.fixed,
        mini: musicConfig.mini,
        autoplay: musicConfig.autoplay,
        theme: musicConfig.theme,
        loop: musicConfig.loop,
        order: musicConfig.order,
        listFolded: musicConfig.listFolded,
        volume: musicConfig.volume,
        lrcType: 1,
        audio: audioList
    });

    ap.on('error', () => {
        // Safe check for ap.list
        if (ap.list && ap.list.audios && ap.list.audios[ap.list.index]) {
            const currentAudio = ap.list.audios[ap.list.index];
            console.error(`[Music] Failed to load audio: ${currentAudio.name}`);
            showToast(`无法播放歌曲: ${currentAudio.name}`, "error");
        }
    });

    initImmersivePlayer({ type: 'custom', instance: ap });
}

function initImmersivePlayer(source) {
    // Create UI Structure
    const immersiveContainer = document.createElement("div");
    immersiveContainer.id = "immersive-player";
    immersiveContainer.style.zIndex = Z_INDEX.IMMERSIVE_PLAYER;
    immersiveContainer.innerHTML = getImmersivePlayerHTML();
    document.body.appendChild(immersiveContainer);

    const toggleBtn = document.createElement("div");
    toggleBtn.id = "immersive-toggle-btn";
    toggleBtn.innerHTML = `<i class="fa-solid fa-expand"></i>`;
    toggleBtn.title = "进入沉浸模式";
    toggleBtn.style.zIndex = Z_INDEX.MUSIC_PLAYER + 1; 
    document.body.appendChild(toggleBtn);

    // Determine APlayer instance
    const ap = source.type === 'custom' ? source.instance : source.element.aplayer;

    if (ap) {
        bindImmersiveEvents(ap, immersiveContainer, toggleBtn);
    } else {
        console.error("APlayer instance not found for Immersive Player.");
    }
}

function getImmersivePlayerHTML() {
    return `
        <div class="immersive-bg"></div>
        <button class="immersive-close"><i class="fa-solid fa-xmark"></i></button>
        <div class="immersive-content">
            <div class="immersive-cover-wrapper">
                <img src="${PATH_CONFIG.DEFAULT_AVATAR}" alt="Cover" class="immersive-cover">
            </div>
            <div class="immersive-info">
                <div class="immersive-title">Loading...</div>
                <div class="immersive-author">Loading...</div>
            </div>
            <div class="immersive-lrc"></div>
            <div class="immersive-progress-container">
                <span class="immersive-time current">00:00</span>
                <div class="immersive-progress-bar">
                    <div class="immersive-progress-fill"></div>
                </div>
                <span class="immersive-time duration">00:00</span>
            </div>
            <div class="immersive-controls">
                <button class="immersive-btn btn-prev"><i class="fa-solid fa-backward-step"></i></button>
                <button class="immersive-btn btn-play"><i class="fa-solid fa-play"></i></button>
                <button class="immersive-btn btn-next"><i class="fa-solid fa-forward-step"></i></button>
            </div>
        </div>
    `;
}

function bindImmersiveEvents(ap, container, toggleBtn) {
    const elements = {
        bg: container.querySelector(".immersive-bg"),
        cover: container.querySelector(".immersive-cover"),
        title: container.querySelector(".immersive-title"),
        author: container.querySelector(".immersive-author"),
        playBtn: container.querySelector(".btn-play"),
        prevBtn: container.querySelector(".btn-prev"),
        nextBtn: container.querySelector(".btn-next"),
        progressFill: container.querySelector(".immersive-progress-fill"),
        progressBar: container.querySelector(".immersive-progress-bar"),
        timeCurrent: container.querySelector(".immersive-time.current"),
        timeDuration: container.querySelector(".immersive-time.duration"),
        lrcContainer: container.querySelector(".immersive-lrc"),
        closeBtn: container.querySelector(".immersive-close")
    };

    toggleBtn.classList.add("visible");

    // Event Listeners
    toggleBtn.onclick = () => {
        container.classList.add("active");
        document.body.classList.add("immersive-active");
        updateUI(ap, elements);
    };
    
    elements.closeBtn.onclick = () => {
        container.classList.remove("active");
        document.body.classList.remove("immersive-active");
    };

    elements.playBtn.onclick = () => ap.toggle();
    elements.prevBtn.onclick = () => ap.skipBack();
    elements.nextBtn.onclick = () => ap.skipForward();

    elements.progressBar.onclick = e => {
        const rect = elements.progressBar.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        if (ap.audio.duration) {
            ap.seek(percentage * ap.audio.duration);
        }
    };

    // APlayer Events
    const updatePlayState = () => {
        elements.playBtn.innerHTML = ap.audio.paused 
            ? '<i class="fa-solid fa-play"></i>' 
            : '<i class="fa-solid fa-pause"></i>';
    };

    ap.on("play", updatePlayState);
    ap.on("pause", updatePlayState);

    ap.on("listswitch", () => {
        elements.lrcContainer.innerHTML = "";
        elements.lrcContainer.dataset.songIndex = "";
        updateUI(ap, elements);
    });

    ap.on("timeupdate", () => {
        updateProgress(ap, elements);
        updateLrc(ap, elements.lrcContainer);
    });

    // Initial check
    setTimeout(() => updateUI(ap, elements), 1000);
}

function updateUI(ap, elements) {
    if (!ap.list.audios || ap.list.audios.length === 0) return;

    const audio = ap.list.audios[ap.list.index];
    if (audio) {
        const coverUrl = audio.cover || PATH_CONFIG.DEFAULT_AVATAR;
        elements.cover.src = coverUrl;
        elements.bg.style.backgroundImage = `url(${coverUrl})`;
        elements.title.innerText = audio.name || "Unknown Title";
        elements.author.innerText = audio.artist || "Unknown Artist";
    }
    
    // Update play button state
    elements.playBtn.innerHTML = ap.audio.paused 
        ? '<i class="fa-solid fa-play"></i>' 
        : '<i class="fa-solid fa-pause"></i>';
}

function updateProgress(ap, elements) {
    const duration = ap.audio.duration || 0;
    const currentTime = ap.audio.currentTime || 0;

    if (duration > 0) {
        const percentage = (currentTime / duration) * 100;
        elements.progressFill.style.width = `${percentage}%`;
    } else {
        elements.progressFill.style.width = "0%";
    }

    elements.timeCurrent.innerText = formatTime(currentTime);
    elements.timeDuration.innerText = formatTime(duration);
}

function updateLrc(ap, lrcContainer) {
    const currentTime = ap.audio.currentTime || 0;

    if (ap.lrc && ap.lrc.parsed && ap.lrc.parsed.length > 0) {
        // Initialize LRC if needed
        const currentIndex = ap.list.index;
        if (lrcContainer.innerHTML === "" || lrcContainer.dataset.songIndex !== String(currentIndex)) {
            lrcContainer.dataset.songIndex = String(currentIndex);
            lrcContainer.innerHTML = ap.lrc.parsed.map((line, index) => 
                `<p class="lrc-line" data-index="${index}">${line[1]}</p>`
            ).join("");
        }

        // Find active line
        let activeIndex = -1;
        for (let i = 0; i < ap.lrc.parsed.length; i++) {
            if (currentTime >= ap.lrc.parsed[i][0] && (!ap.lrc.parsed[i + 1] || currentTime < ap.lrc.parsed[i + 1][0])) {
                activeIndex = i;
                break;
            }
        }

        if (activeIndex !== -1) {
            const activeLine = lrcContainer.querySelector(`.lrc-line[data-index="${activeIndex}"]`);
            if (activeLine && !activeLine.classList.contains("active")) {
                const currentActive = lrcContainer.querySelector(".lrc-line.active");
                if (currentActive) currentActive.classList.remove("active");
                
                activeLine.classList.add("active");

                // Scroll to center
                const containerHeight = lrcContainer.clientHeight;
                const lineHeight = activeLine.clientHeight;
                const scrollOffset = activeLine.offsetTop - containerHeight / 2 + lineHeight / 2;

                lrcContainer.scrollTo({
                    top: Math.max(0, scrollOffset),
                    behavior: "smooth",
                });
            }
        }
    } else {
        if (lrcContainer.innerHTML === "") {
            lrcContainer.innerHTML = '<p class="lrc-line">暂无歌词 / No Lyrics</p>';
        }
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}
