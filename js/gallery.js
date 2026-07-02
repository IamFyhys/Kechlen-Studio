// js/gallery.js

class GalleryManagerClass {
    constructor() {
        this.photos = [];
        this.galleryGrid = document.getElementById('gallery-grid');
        this.previewModal = document.getElementById('preview-modal');
        this.previewImg = document.getElementById('preview-img');
        this.currentPreviewUrl = null;
        this.isCapturingStrip = false;
        
        window.currentFrame = 'none'; // Default
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.addEventListener('click', () => {
                if (window.Camera && window.Camera.currentEffect === 'strip') {
                    this.captureStrip();
                } else {
                    this.capture();
                }
            });
        }
        
        const closePreview = document.getElementById('close-preview');
        if (closePreview) {
            closePreview.addEventListener('click', () => {
                this.previewModal.classList.add('hidden');
            });
        }
        
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (this.currentPreviewUrl) {
                    const a = document.createElement('a');
                    a.href = this.currentPreviewUrl;
                    a.download = `kechlen_studio_${Date.now()}.png`;
                    a.click();
                    Utils.showToast("Photo downloaded!");
                }
            });
        }
        
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                if (this.currentPreviewUrl) {
                    try {
                        const response = await fetch(this.currentPreviewUrl);
                        const blob = await response.blob();
                        const file = new File([blob], `kechlen_studio_${Date.now()}.png`, { type: 'image/png' });
                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'Kechlen Studio',
                                files: [file]
                            });
                        } else {
                            Utils.showToast("Sharing not supported on this device.");
                        }
                    } catch (e) {
                        Utils.showToast("Could not share photo.");
                        console.error(e);
                    }
                }
            });
        }
        
        const deleteBtn = document.getElementById('delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.currentPreviewUrl) {
                    this.photos = this.photos.filter(p => p.url !== this.currentPreviewUrl);
                    this.renderGallery();
                    this.previewModal.classList.add('hidden');
                    Utils.showToast("Photo deleted");
                }
            });
        }
    }
    
    async captureStrip() {
        if (this.isCapturingStrip || !window.Camera || !window.Camera.isRunning) return;
        this.isCapturingStrip = true;
        
        const stripOverlay  = document.getElementById('strip-overlay');
        const instructionEl = document.getElementById('strip-instruction');
        const countEl       = document.getElementById('strip-count');
        
        // AI Photoshoot pose sequence
        const poses = [
            { label: 'Smile 😊',       desc: 'Shot 1 of 4' },
            { label: 'Pose Two 👈',   desc: 'Shot 2 of 4' },
            { label: 'Pose Three 👉',  desc: 'Shot 3 of 4' },
            { label: 'Peace= ✌️',       desc: 'Shot 4 of 4' },
        ];
        
        const cWidth  = window.Camera.canvas.width;
        const cHeight = window.Camera.canvas.height;
        
        // --- Build strip canvas ---
        // Each photo slot: 440px wide, proportional height
        const slotW   = 440;
        const slotH   = Math.round((cHeight / cWidth) * slotW);
        const margin  = 20;
        const stripW  = slotW + margin * 2;
        const stripH  = (slotH + margin) * 4 + margin + 70; // 4 photos + logo area
        
        const stripCanvas = document.createElement('canvas');
        stripCanvas.width  = stripW;
        stripCanvas.height = stripH;
        const sCtx = stripCanvas.getContext('2d');
        
        // White background
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, stripW, stripH);
        
        // Light pink side borders (decorative)
        sCtx.fillStyle = '#ffb7c5';
        sCtx.fillRect(0, 0, margin, stripH);
        sCtx.fillRect(stripW - margin, 0, margin, stripH);
        
        const capturedImages = [];
        stripOverlay.classList.remove('hidden');
        
        for (let i = 0; i < 4; i++) {
            // Show pose instruction
            instructionEl.textContent = poses[i].label;
            
            // Countdown 3 → 2 → 1
            for (let c = 3; c > 0; c--) {
                countEl.textContent = c;
                await new Promise(r => setTimeout(r, 900));
            }
            
            // Shutter
            countEl.textContent = '📸';
            await new Promise(r => setTimeout(r, 150));
            this.showFlash();
            
            // Grab current canvas frame
            const snap = document.createElement('canvas');
            snap.width  = cWidth;
            snap.height = cHeight;
            snap.getContext('2d').drawImage(window.Camera.canvas, 0, 0);
            capturedImages.push(snap);
            
            await new Promise(r => setTimeout(r, 700));
        }
        
        stripOverlay.classList.add('hidden');
        
        // --- Composite 4 photos into strip ---
        capturedImages.forEach((img, idx) => {
            const x = margin;
            const y = margin + idx * (slotH + margin);
            sCtx.drawImage(img, x, y, slotW, slotH);
            
            // Thin separator line between shots
            if (idx < 3) {
                sCtx.fillStyle = '#ffb7c5';
                sCtx.fillRect(margin, y + slotH, slotW, 2);
            }
        });
        
        // Logo area
        const logoY = stripH - 60;
        sCtx.fillStyle = '#ffb7c5';
        sCtx.fillRect(0, logoY, stripW, 60);
        sCtx.fillStyle = '#ffffff';
        sCtx.font = 'bold 26px "Poppins", "Segoe UI", sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText('✨ KECHLEN STUDIO ✨', stripW / 2, logoY + 40);
        
        this.saveAndShow(stripCanvas.toDataURL('image/png', 1.0));
        this.isCapturingStrip = false;
    }
    

    capture() {
        if (!window.Camera || !window.Camera.isRunning) return;
        
        const canvas = window.Camera.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        this.showFlash();
        
        // Create an offscreen canvas to apply frame
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        
        if (window.currentFrame === 'none') {
            finalCanvas.width = width;
            finalCanvas.height = height;
            ctx.drawImage(canvas, 0, 0);
        } else {
            this.applyFrame(ctx, finalCanvas, canvas, width, height, window.currentFrame);
        }
        
        this.saveAndShow(finalCanvas.toDataURL('image/png', 1.0));
    }
    
    applyFrame(ctx, finalCanvas, sourceCanvas, w, h, frameType) {
        if (frameType === 'polaroid') {
            const margin = 40;
            const bottomMargin = 150;
            finalCanvas.width = w + (margin * 2);
            finalCanvas.height = h + margin + bottomMargin;
            
            // Draw white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            // Draw image
            ctx.drawImage(sourceCanvas, margin, margin, w, h);
            // Draw text
            ctx.fillStyle = '#333333';
            ctx.font = '40px "Comic Sans MS", cursive, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Sweet Memories', finalCanvas.width / 2, finalCanvas.height - 60);
            
        } else if (frameType === 'kawaii') {
            finalCanvas.width = w + 40;
            finalCanvas.height = h + 40;
            
            // Draw pink background
            ctx.fillStyle = '#ffb7c5';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            // Draw inner white border
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 10, finalCanvas.width - 20, finalCanvas.height - 20);
            // Draw image
            ctx.drawImage(sourceCanvas, 20, 20, w, h);
            
            // Decorate with text
            ctx.fillStyle = '#ff6b81';
            ctx.font = 'bold 50px sans-serif';
            ctx.fillText('✨ K A W A I I ✨', 50, 80);
            
        } else if (frameType === 'film') {
            const marginX = 60;
            const marginY = 20;
            finalCanvas.width = w + (marginX * 2);
            finalCanvas.height = h + (marginY * 2);
            
            // Black background
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            
            // Film holes
            ctx.fillStyle = '#ffffff';
            for (let i = 10; i < finalCanvas.height; i += 40) {
                ctx.fillRect(20, i, 20, 25);
                ctx.fillRect(finalCanvas.width - 40, i, 20, 25);
            }
            
            // Image
            ctx.drawImage(sourceCanvas, marginX, marginY, w, h);
        }
    }
    
    showFlash() {
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'white';
        flash.style.zIndex = '999';
        flash.style.transition = 'opacity 0.4s ease-out';
        
        document.getElementById('camera-view').appendChild(flash);
        void flash.offsetWidth; // reflow
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 400);
    }
    
    saveAndShow(dataUrl) {
        this.photos.unshift({
            id: Date.now(),
            url: dataUrl
        });
        this.renderGallery();
        Utils.showToast("Photo captured!");
        
        // Open preview automatically
        this.openPreview(dataUrl);
    }
    
    renderGallery() {
        if (this.photos.length === 0) {
            this.galleryGrid.innerHTML = '<p class="empty-text">No photos yet.</p>';
            return;
        }
        
        this.galleryGrid.innerHTML = '';
        this.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo.url;
            img.className = 'gallery-item';
            img.addEventListener('click', () => this.openPreview(photo.url));
            this.galleryGrid.appendChild(img);
        });
    }
    
    openPreview(url) {
        this.currentPreviewUrl = url;
        this.previewImg.src = url;
        
        this.generateAIScore();
        
        this.previewModal.classList.remove('hidden');
    }
    
    generateAIScore() {
        // Generate pseudo-random realistic scores (80-100)
        const lightScore = Math.floor(Math.random() * 20) + 80;
        const smileScore = Math.floor(Math.random() * 25) + 75;
        const compScore = Math.floor(Math.random() * 15) + 85;
        
        document.getElementById('score-lighting-val').textContent = lightScore + '%';
        document.getElementById('score-smile-val').textContent = smileScore + '%';
        document.getElementById('score-comp-val').textContent = compScore + '%';
        
        // Reset bars first for animation
        document.getElementById('score-lighting-bar').style.width = '0%';
        document.getElementById('score-smile-bar').style.width = '0%';
        document.getElementById('score-comp-bar').style.width = '0%';
        
        setTimeout(() => {
            document.getElementById('score-lighting-bar').style.width = lightScore + '%';
            document.getElementById('score-smile-bar').style.width = smileScore + '%';
            document.getElementById('score-comp-bar').style.width = compScore + '%';
        }, 100);
    }
}

window.GalleryManager = new GalleryManagerClass();
