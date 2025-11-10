(function () {
    const { qs, qsa, safeGet } = window.AppUtils;

    class ParticleTrailEngine {
        constructor({ aboutSelector, trailCanvasId, particleCanvasId, numParticles = 80 } = {}) {
            this.aboutSection = qs(aboutSelector);
            this.trailCanvas = safeGet(trailCanvasId);
            this.particleCanvas = safeGet(particleCanvasId);
            if (!this.aboutSection || !this.trailCanvas || !this.particleCanvas) return;

            this.trailCtx = this.trailCanvas.getContext('2d');
            this.pCtx = this.particleCanvas.getContext('2d');
            if (this.trailCtx) {
                this.trailCtx.lineCap = 'round';
                this.trailCtx.lineJoin = 'round';
            }

            this.points = [];
            this.maxPoints = 140;
            this.interpolationStep = 3;
            this.trailWidth = { min: 1.6, max: 12 };

            this.particles = [];
            this.numParticles = numParticles;
            this.mouse = { x: null, y: null, radius: 100 };

            this.animating = false;
            this.animationId = null;

            this.resize = this.resize.bind(this);
            window.addEventListener('resize', this.resize, { passive: true });
            this.resize();

            this._initParticles();
            this._bindMouse();
        }

        _baseTrailColor(theme) {
            const rootStyles = getComputedStyle(document.documentElement);
            const variable = theme === 'dark' ? '--trail-dark' : '--trail-light';
            const value = rootStyles.getPropertyValue(variable);
            const fallback = theme === 'dark'
                ? 'rgba(0,240,255,0.8)'
                : 'rgba(39,205,238,0.8)';
            return value && value.trim().length ? value.trim() : fallback;
        }

        _withAlpha(color, alpha) {
            if (!color) return `rgba(0,212,255,${alpha})`;
            const trimmed = color.trim();
            if (!trimmed) return `rgba(0,212,255,${alpha})`;
            const match = trimmed.match(/rgba?\(([^)]+)\)/i);
            if (!match) return trimmed;
            const parts = match[1].split(',').map((part) => part.trim());
            if (parts.length < 3) return trimmed;

            if (parts.length === 3) {
                return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
            }

            parts[3] = `${alpha}`;
            return `rgba(${parts.join(', ')})`;
        }

        _initParticles() {
            const rand = (min, max) => Math.random() * (max - min) + min;
            this.particles.length = 0;
            for (let i = 0; i < this.numParticles; i++) {
                this.particles.push({
                    x: rand(0, this.width),
                    y: rand(0, this.height),
                    size: rand(0.5, 2.5),
                    speedX: rand(-0.3, 0.3),
                    speedY: rand(-0.3, 0.3),
                    alpha: rand(0.3, 0.9)
                });
            }
        }

        resize() {
            if (!this.aboutSection) return;
            const rect = this.aboutSection.getBoundingClientRect();
            this.width = (this.trailCanvas.width = this.particleCanvas.width = rect.width);
            this.height = (this.trailCanvas.height = this.particleCanvas.height = rect.height);
        }

        _bindMouse() {
            if (!this.aboutSection) return;
            this.aboutSection.addEventListener('mousemove', (e) => {
                const rect = this.aboutSection.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
                this.addPoint(this.mouse.x, this.mouse.y);
            });
            this.aboutSection.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }

        addPoint(x, y) {
            const newPoint = { x, y, alpha: 1 };
            const last = this.points[this.points.length - 1];

            if (last) {
                const dx = x - last.x;
                const dy = y - last.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const segments = Math.min(12, Math.floor(distance / this.interpolationStep));

                for (let i = 1; i <= segments; i++) {
                    const t = i / (segments + 1);
                    this.points.push({
                        x: last.x + dx * t,
                        y: last.y + dy * t,
                        alpha: 1 - (1 - last.alpha) * t
                    });
                }
            }

            this.points.push(newPoint);
            if (this.points.length > this.maxPoints) {
                this.points.splice(0, this.points.length - this.maxPoints);
            }
        }

        drawTrail(currentTheme) {
            if (!this.trailCtx) return;
            this.trailCtx.clearRect(0, 0, this.width, this.height);
            this.trailCtx.globalCompositeOperation = 'lighter';

            if (this.points.length < 2) return;

            const cssVar = this._baseTrailColor(currentTheme);
            const total = this.points.length;

            let prevWidth = this.trailWidth.min;
            let prevAlpha = this.points[0]?.alpha || 1;

            for (let i = 1; i < total; i++) {
                const prev = this.points[i - 1];
                const current = this.points[i];
                const progress = total === 1 ? 1 : i / (total - 1);
                const eased = Math.pow(progress, 0.6);
                const headRatio = Math.max(0, (progress - 0.65) / 0.35);
                const headTaper = 1 - Math.min(0.8, Math.pow(headRatio, 1.3) * 0.8);
                const midDipStrength = 0.18;
                const midDip = 1 - midDipStrength * Math.exp(-Math.pow(progress - 0.45, 2) / 0.06);
                const widthTargetBase = this.trailWidth.min + (this.trailWidth.max - this.trailWidth.min) * eased;
                const widthTarget = Math.max(this.trailWidth.min, widthTargetBase * headTaper * midDip);
                const width = prevWidth + (widthTarget - prevWidth) * 0.58;
                prevWidth = width;

                const alphaBase = 0.55 + eased * 0.45;
                const alphaDip = 1 - (midDipStrength * 0.6) * Math.exp(-Math.pow(progress - 0.5, 2) / 0.05);
                const alphaTarget = Math.max(0.05, Math.min(1, current.alpha * alphaBase * alphaDip));
                const alpha = prevAlpha + (alphaTarget - prevAlpha) * 0.55;
                prevAlpha = alpha;

                const controlX = prev.x + (current.x - prev.x) * 0.5;
                const controlY = prev.y + (current.y - prev.y) * 0.5;

                this.trailCtx.lineWidth = width;
                this.trailCtx.strokeStyle = this._withAlpha(cssVar, alpha);
                this.trailCtx.shadowBlur = 10 + 22 * eased;
                this.trailCtx.shadowColor = this._withAlpha(cssVar, Math.min(0.65, alpha * 0.85));

                this.trailCtx.beginPath();
                this.trailCtx.moveTo(prev.x, prev.y);
                this.trailCtx.quadraticCurveTo(controlX, controlY, current.x, current.y);
                this.trailCtx.stroke();
            }

            this.trailCtx.shadowBlur = 0;
            this.trailCtx.shadowColor = 'transparent';

            for (let i = 0; i < total; i++) {
                const ratio = total === 1 ? 1 : i / (total - 1);
                const fade = 0.018 + (1 - ratio) * 0.035;
                this.points[i].alpha = Math.max(0, this.points[i].alpha - fade);
            }

            this.points = this.points.filter((point) => point.alpha > 0.06);
        }

        drawParticles(currentTheme) {
            if (!this.pCtx) return;
            this.pCtx.clearRect(0, 0, this.width, this.height);
            this.pCtx.globalCompositeOperation = 'lighter';

            const baseColor = this._baseTrailColor(currentTheme);

            this.particles.forEach((p) => {
                if (this.mouse.x != null) {
                    const dx = this.mouse.x - p.x;
                    const dy = this.mouse.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < this.mouse.radius) {
                        const force = (this.mouse.radius - distance) / this.mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        p.x -= Math.cos(angle) * force * 1.2;
                        p.y -= Math.sin(angle) * force * 1.2;
                    }
                }

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;

                const gradient = this.pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                gradient.addColorStop(0, this._withAlpha(baseColor, 0.9));
                gradient.addColorStop(0.4, this._withAlpha(baseColor, 0.6));
                gradient.addColorStop(1, 'rgba(255,255,255,0)');

                this.pCtx.globalAlpha = p.alpha;
                this.pCtx.fillStyle = gradient;
                this.pCtx.beginPath();
                this.pCtx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                this.pCtx.fill();
            });
        }

        start(themeProvider) {
            if (this.animating) return;
            this.animating = true;
            const loop = () => {
                this.drawTrail(themeProvider());
                this.drawParticles(themeProvider());
                this.animationId = requestAnimationFrame(loop);
            };
            loop();
        }

        stop() {
            if (!this.animating) return;
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this.animating = false;
            this.trailCtx.clearRect(0, 0, this.width, this.height);
            this.pCtx.clearRect(0, 0, this.width, this.height);
        }
    }

    window.ParticleTrailEngine = ParticleTrailEngine;
})();
