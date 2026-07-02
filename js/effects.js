// js/effects.js

class EffectManagerClass {
    constructor() {
        this.segmentation = null;
        this.segmentationMask = null;
        this.isModelLoaded = false;
        
        this.initSelfieSegmentation();
    }
    
    async initSelfieSegmentation() {
        try {
            if (window.SelfieSegmentation) {
                this.segmentation = new SelfieSegmentation({locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
                }});
                
                this.segmentation.setOptions({
                    modelSelection: 1, // 0 for general, 1 for landscape (faster)
                });
                
                this.segmentation.onResults((results) => {
                    this.segmentationMask = results.segmentationMask;
                });
                
                this.isModelLoaded = true;
                console.log("Selfie Segmentation loaded");
            }
        } catch (e) {
            console.error("Failed to load Selfie Segmentation", e);
        }
    }

    render(video, canvas, ctx, effectId) {
        // Default: save state
        ctx.save();
        
        // Mirror logic
        if (effectId !== 'mirror') {
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
        }

        // Apply filters based on effect
        switch (effectId) {
            case 'beauty':
                // Single pass fast beauty effect (slight blur and brightness)
                ctx.filter = 'contrast(1.05) brightness(1.05) saturate(1.1) blur(1px)';
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                break;
                
            case 'vintage':
                ctx.filter = 'sepia(0.6) contrast(1.2) brightness(0.9) saturate(0.8)';
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                break;
                
            case 'golden':
                ctx.filter = 'sepia(0.3) brightness(1.1) saturate(1.4) hue-rotate(-10deg)';
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                break;
                
            case 'bw':
                ctx.filter = 'grayscale(1) contrast(1.2)';
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                break;
                
            case 'portrait':
                if (this.isModelLoaded && this.segmentation) {
                    // Send frame to segmentation
                    this.segmentation.send({image: video});
                    
                    if (this.segmentationMask) {
                        // Draw blurred background
                        ctx.filter = 'blur(10px)';
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        ctx.filter = 'none';
                        
                        // Draw sharp person over it
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.drawImage(this.segmentationMask, 0, 0, canvas.width, canvas.height);
                        
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        
                        // Reset
                        ctx.globalCompositeOperation = 'source-over';
                    } else {
                        // Fallback if mask not ready
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    }
                } else {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
                break;
                
            case 'love':
                ctx.filter = 'saturate(1.2) hue-rotate(-5deg) contrast(1.05)';
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                break;
                
            case 'mirror':
            case 'normal':
            default:
                ctx.filter = 'none';
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                break;
        }

        ctx.restore();
    }
}

window.EffectManager = new EffectManagerClass();
