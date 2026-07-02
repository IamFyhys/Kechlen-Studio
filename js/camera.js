// js/camera.js

class CameraManager {
    constructor() {
        this.video = document.getElementById('input-video');
        this.canvas = document.getElementById('output-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.isRunning = false;
        
        // Stats
        this.lastTime = performance.now();
        this.frames = 0;
        this.fpsCounter = document.getElementById('fps-counter');
        this.resCounter = document.getElementById('res-counter');
        
        // Current applied effect
        this.currentEffect = 'normal';
    }

    async start() {
        try {
            // Request balanced resolution to prevent lag (720p ideal, 1080p max)
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: "user"
                },
                audio: false
            });
            
            this.video.srcObject = this.stream;
            
            // Wait for video to load metadata to get actual resolution
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    
                    this.resCounter.textContent = `${this.video.videoWidth}x${this.video.videoHeight}`;
                    this.isRunning = true;
                    
                    this.renderLoop();
                    resolve(true);
                };
            });
            
        } catch (error) {
            console.error("Camera error: ", error);
            Utils.showToast("Failed to access camera: " + error.message);
            return false;
        }
    }
    
    stop() {
        this.isRunning = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }

    renderLoop() {
        if (!this.isRunning) return;
        
        // Calculate FPS
        const now = performance.now();
        this.frames++;
        if (now - this.lastTime >= 1000) {
            this.fpsCounter.textContent = this.frames;
            this.frames = 0;
            this.lastTime = now;
        }

        // Render through EffectManager
        if (window.EffectManager) {
            window.EffectManager.render(this.video, this.canvas, this.ctx, this.currentEffect);
        } else {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Throttled gesture detection (5x per second max)
        if (window.GestureManager) {
            if (!this.lastGestureTime) this.lastGestureTime = 0;
            if (now - this.lastGestureTime > 200) {
                window.GestureManager.detect(this.video);
                this.lastGestureTime = now;
            }
        }

        requestAnimationFrame(() => this.renderLoop());
    }
    
    setEffect(effectId) {
        this.currentEffect = effectId;
        const effectText = document.getElementById('effect-text');
        if (effectText) {
            effectText.textContent = effectId.charAt(0).toUpperCase() + effectId.slice(1);
        }
        
        const loveOverlay = document.getElementById('love-overlay');
        if (loveOverlay) {
            if (effectId === 'love') {
                loveOverlay.classList.remove('hidden');
            } else {
                loveOverlay.classList.add('hidden');
            }
        }
    }
}

window.Camera = new CameraManager();
