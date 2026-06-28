export const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    active: false,

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    },

    start() {
        this.active = true;
        this.particles = [];
        this.resize();
        
        const colors = ['#00f2fe', '#ff3b8b', '#fbd38d', '#4facfe', '#ec4899', '#10b981'];

        for (let i = 0; i < 110; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 40,
                size: Math.random() * 7 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: Math.random() * 6 - 3,
                speedY: -(Math.random() * 12 + 9),
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 5 - 2.5,
                opacity: 1,
                gravity: 0.26,
                friction: 0.985
            });
        }

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.loop();
    },

    stop() {
        this.active = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    loop() {
        if (!this.active) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let alive = false;
        this.particles.forEach(p => {
            p.speedY += p.gravity;
            p.speedX *= p.friction;
            p.speedY *= p.friction;
            
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;

            if (p.y > this.canvas.height * 0.75) {
                p.opacity -= 0.018;
            }

            if (p.opacity > 0 && p.y < this.canvas.height + 20) {
                alive = true;
                
                this.ctx.save();
                this.ctx.globalAlpha = p.opacity;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                
                if (Math.random() > 0.5) {
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            }
        });

        if (alive) {
            this.animationId = requestAnimationFrame(() => this.loop());
        } else {
            this.stop();
        }
    }
};
