// js/gesture.js

class GestureManagerClass {
    constructor() {
        this.hands = null;
        this.isReady = false;
        this.gestureStatusText = document.getElementById('gesture-text');
        this.captureCooldown = false;
        this.isDetecting = false;
        this.isGestureEffectActive = false;
        
        this.initHands();
    }
    
    async initHands() {
        try {
            if (window.Hands) {
                this.hands = new Hands({locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }});
                
                this.hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.7
                });
                
                this.hands.onResults(this.onResults.bind(this));
                
                this.isReady = true;
                console.log("Hands model loaded");
            }
        } catch (e) {
            console.error("Failed to load Hands model", e);
        }
    }
    
    async detect(video) {
        if (this.isReady && this.hands && !this.isDetecting) {
            this.isDetecting = true;
            try {
                await this.hands.send({image: video});
            } catch (e) {
                console.error("Hands detect error", e);
            }
            this.isDetecting = false;
        }
    }
    
    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const gesture = this.recognizeGesture(landmarks);
            
            if (gesture) {
                this.handleGesture(gesture);
            } else {
                this.resetGesture();
            }
        } else {
            this.resetGesture();
        }
    }
    
    resetGesture() {
        if (this.gestureStatusText) this.gestureStatusText.textContent = 'None';
        if (this.isGestureEffectActive) {
            const normalBtn = document.querySelector('.dock-item[data-effect="normal"]');
            if (normalBtn) normalBtn.click();
            this.isGestureEffectActive = false;
        }
    }
    
    recognizeGesture(landmarks) {
        const thumbTip  = landmarks[4];
        const indexTip  = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip   = landmarks[16];
        const pinkyTip  = landmarks[20];
        
        const isIndexFolded  = indexTip.y  > landmarks[6].y;
        const isMiddleFolded = middleTip.y > landmarks[10].y;
        const isRingFolded   = ringTip.y   > landmarks[14].y;
        const isPinkyFolded  = pinkyTip.y  > landmarks[18].y;
        
        // Thumbs Up: thumb tip highest, all fingers folded
        if (thumbTip.y < indexTip.y && thumbTip.y < landmarks[5].y) {
            if (isIndexFolded && isMiddleFolded && isRingFolded && isPinkyFolded) {
                return 'thumbs_up';
            }
        }
        
        // Peace: index + middle extended, ring + pinky folded
        if (!isIndexFolded && !isMiddleFolded) {
            if (isRingFolded && isPinkyFolded) {
                return 'peace';
            }
        }
        
        return null;
    }
    
    handleGesture(gesture) {
        if (gesture === 'thumbs_up') {
            if (this.captureCooldown) return;
            this.captureCooldown = true;
            
            if (this.gestureStatusText) this.gestureStatusText.textContent = 'Capture 👍';
            Utils.showToast("Thumbs up! Capturing...");
            
            setTimeout(() => {
                const captureBtn = document.getElementById('capture-btn');
                if (captureBtn) captureBtn.click();
            }, 1000);
            
            setTimeout(() => { this.captureCooldown = false; }, 3000);
            
        } else if (gesture === 'peace') {
            if (this.gestureStatusText) this.gestureStatusText.textContent = 'Portrait ✌️';
            
            if (!this.isGestureEffectActive) {
                Utils.showToast("Peace sign! Portrait Mode on");
                const portraitBtn = document.querySelector('.dock-item[data-effect="portrait"]');
                if (portraitBtn) {
                    portraitBtn.click();
                    this.isGestureEffectActive = true;
                }
            }
        }
    }
}

window.GestureManager = new GestureManagerClass();
