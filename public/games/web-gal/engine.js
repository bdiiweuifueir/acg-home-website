// Simple Web Galgame Engine
// Author: Trae AI

class GalEngine {
    constructor(config) {
        this.container = document.querySelector(config.container);
        this.script = [];
        this.currentIndex = 0;
        this.assets = config.assets || {};
        
        // UI Elements
        this.ui = {
            bg: this.createEl('div', 'gal-bg'),
            charaContainer: this.createEl('div', 'gal-chara-container'),
            textBox: this.createEl('div', 'gal-textbox'),
            nameBox: this.createEl('div', 'gal-namebox'),
            contentBox: this.createEl('div', 'gal-content'),
            choiceBox: this.createEl('div', 'gal-choices'),
            nextIcon: this.createEl('div', 'gal-next-icon', '▼')
        };

        // Assemble UI
        this.container.appendChild(this.ui.bg);
        this.container.appendChild(this.ui.charaContainer);
        this.container.appendChild(this.ui.textBox);
        this.ui.textBox.appendChild(this.ui.nameBox);
        this.ui.textBox.appendChild(this.ui.contentBox);
        this.ui.textBox.appendChild(this.ui.nextIcon);
        this.container.appendChild(this.ui.choiceBox);

        // State
        this.isTyping = false;
        this.waitingForClick = false;
        this.currentAudio = null;

        // Bind Events
        this.container.onclick = () => this.handleClick();
    }

    createEl(tag, className, text = '') {
        const el = document.createElement(tag);
        el.className = className;
        el.innerText = text;
        return el;
    }

    async loadScript(url) {
        const res = await fetch(url);
        this.script = await res.json();
        this.runStep();
    }

    handleClick() {
        if (this.isTyping) {
            // Instant finish typing
            this.finishTyping();
        } else if (this.waitingForClick) {
            this.currentIndex++;
            this.runStep();
        }
    }

    async runStep() {
        if (this.currentIndex >= this.script.length) {
            console.log("End of script");
            return;
        }

        const cmd = this.script[this.currentIndex];
        this.waitingForClick = false;
        this.ui.nextIcon.style.opacity = 0;
        this.ui.choiceBox.style.display = 'none';

        switch (cmd.type) {
            case 'bg':
                this.ui.bg.style.backgroundImage = `url(${this.assets.bg}/${cmd.file})`;
                this.currentIndex++;
                this.runStep();
                break;
            case 'bgm':
                this.playBGM(cmd.file);
                this.currentIndex++;
                this.runStep();
                break;
            case 'chara':
                this.updateChara(cmd);
                this.currentIndex++;
                this.runStep();
                break;
            case 'say':
                this.ui.nameBox.innerText = cmd.name || '';
                this.typeText(cmd.text);
                break;
            case 'choice':
                this.showChoices(cmd.options);
                break;
            case 'jump':
                this.currentIndex = this.findLabel(cmd.target);
                this.runStep();
                break;
            default:
                console.warn("Unknown command:", cmd);
                this.currentIndex++;
                this.runStep();
        }
    }

    updateChara(cmd) {
        this.ui.charaContainer.innerHTML = ''; // Clear prev (simple mode)
        if (cmd.file) {
            const img = document.createElement('img');
            img.src = `${this.assets.chara}/${cmd.file}`;
            img.className = 'gal-chara';
            this.ui.charaContainer.appendChild(img);
        }
    }

    typeText(text) {
        this.isTyping = true;
        this.ui.contentBox.innerText = '';
        let i = 0;
        this.typeTimer = setInterval(() => {
            this.ui.contentBox.innerText += text[i];
            i++;
            if (i >= text.length) {
                this.finishTyping();
            }
        }, 50); // Speed
    }

    finishTyping() {
        clearInterval(this.typeTimer);
        const cmd = this.script[this.currentIndex];
        this.ui.contentBox.innerText = cmd.text; // Ensure full text
        this.isTyping = false;
        this.waitingForClick = true;
        this.ui.nextIcon.style.opacity = 1;
    }

    playBGM(file) {
        if (this.currentAudio) this.currentAudio.pause();
        if (!file) return;
        this.currentAudio = new Audio(`${this.assets.bgm}/${file}`);
        this.currentAudio.loop = true;
        this.currentAudio.play().catch(e => console.log("Audio autoplay blocked", e));
    }

    showChoices(options) {
        this.ui.choiceBox.innerHTML = '';
        this.ui.choiceBox.style.display = 'flex';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'gal-choice-btn';
            btn.innerText = opt.text;
            btn.onclick = (e) => {
                e.stopPropagation(); // Prevent container click
                if (opt.jump) {
                    this.currentIndex = this.findLabel(opt.jump);
                } else if (opt.next) {
                    this.currentIndex++;
                }
                this.runStep();
            };
            this.ui.choiceBox.appendChild(btn);
        });
    }

    findLabel(label) {
        return this.script.findIndex(cmd => cmd.label === label);
    }
}

// Auto init
window.onload = () => {
    const game = new GalEngine({
        container: '#game-container',
        assets: {
            bg: 'assets/bg',
            chara: 'assets/chara',
            bgm: 'assets/bgm'
        }
    });
    game.loadScript('script.json');
};