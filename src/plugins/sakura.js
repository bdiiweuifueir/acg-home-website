import { Z_INDEX, DEFAULT_CONFIG } from "../constants.js";

export class Sakura {
    constructor(config) {
        this.config = {
            colors: DEFAULT_CONFIG.sakura.COLORS,
            delay: 200,
            minSpeed: 1.0,
            maxSpeed: 2.0,
            maxSize: 14,
            minSize: 9,
            maxPetals: Math.min(config?.maxPetals || DEFAULT_CONFIG.sakura.MAX_PETALS, 150), // Cap at 150 for performance
            ...config,
        };

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.petals = [];
        this.requestAnimationFrameId = null;
        this.resizeObserver = null;
    }

    init() {
        this.canvas.id = "sakura-canvas";
        this.canvas.style.position = "fixed";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.canvas.style.pointerEvents = "none";
        this.canvas.style.zIndex = Z_INDEX.SAKURA;
        document.body.appendChild(this.canvas);

        this.handleResize();
        this.start();

        window.addEventListener("resize", () => this.handleResize());
    }

    start() {
        if (!this.requestAnimationFrameId) {
            this.animate();
        }
    }

    stop() {
        if (this.requestAnimationFrameId) {
            cancelAnimationFrame(this.requestAnimationFrameId);
            this.requestAnimationFrameId = null;
        }
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createPetal() {
        if (this.petals.length > this.config.maxPetals) {
            return;
        } 

        const colors = Array.isArray(this.config.colors) && this.config.colors.length > 0 
            ? this.config.colors 
            : DEFAULT_CONFIG.sakura.COLORS;

        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        this.petals.push({
            x: Math.random() * this.canvas.width,
            y: -20,
            size: Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize,
            speed: Math.random() * (this.config.maxSpeed - this.config.minSpeed) + this.config.minSpeed,
            angle: Math.random() * 360,
            spin: Math.random() < 0.5 ? 1 : -1,
            color: randomColor,
        });
    }

    drawPetal(petal) {
        // Validation: Ensure petal and color exist
        if (!petal || !petal.color) return;

        this.ctx.save();
        this.ctx.translate(petal.x, petal.y);
        this.ctx.rotate((petal.angle * Math.PI) / 180);
        this.ctx.beginPath();

        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(petal.size / 2, petal.size / 2, petal.size, petal.size / 2, petal.size, 0);
        this.ctx.bezierCurveTo(petal.size, -petal.size / 2, petal.size / 2, -petal.size / 2, 0, 0);

        try {
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size);
            gradient.addColorStop(0, petal.color.gradientColorStart || "rgba(255, 183, 197, 0.9)");
            gradient.addColorStop(0.6, petal.color.gradientColorEnd || "rgba(255, 197, 208, 0.9)");
            gradient.addColorStop(1, petal.color.gradientColorZero || "rgba(255, 183, 197, 0)");

            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        } catch (e) {
            // Fallback for gradient error
            this.ctx.fillStyle = "rgba(255, 183, 197, 0.8)";
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (Math.random() * 1000 < this.config.delay) {
            this.createPetal();
        }

        for (let i = 0; i < this.petals.length; i++) {
            const petal = this.petals[i];

            petal.y += petal.speed;
            petal.angle += petal.spin;
            petal.x += Math.sin(petal.y / 100) * 0.5;

            this.drawPetal(petal);

            if (petal.y > this.canvas.height + 20) {
                this.petals.splice(i, 1);
                i--;
            }
        }

        this.requestAnimationFrameId = requestAnimationFrame(() => this.animate());
    }
}

export function initSakura(config) {
    // Explicitly check boolean true, as some configs might use "true" string or undefined
    if (config?.sakura?.enable === true || config?.sakura?.enable === "true") {

        const sakura = new Sakura(config.sakura);
        sakura.init();
        return sakura;
    }
}
