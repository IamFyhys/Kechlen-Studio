// js/ui.js

class UIManagerClass {
    constructor() {
        this.initTheme();
        this.initEventListeners();
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        setTimeout(() => {
            const themeBtns = document.querySelectorAll('.theme-btn');
            themeBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-theme-val') === savedTheme) {
                    btn.classList.add('active');
                }
            });
            this.generateParticles(savedTheme);
        }, 100);
    }
    
    toggleThemeMenu() {
        const menu = document.getElementById('theme-selector');
        if (menu) menu.classList.toggle('show');
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeBtns = document.querySelectorAll('.theme-btn');
        themeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme-val') === theme) {
                btn.classList.add('active');
            }
        });
        
        document.getElementById('theme-selector').classList.remove('show');
        this.generateParticles(theme);
    }
    
    initEventListeners() {
        // Theme Toggle Menu
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleThemeMenu());
        }
        
        // Theme Selection
        const themeBtns = document.querySelectorAll('.theme-btn');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.getAttribute('data-theme-val');
                this.setTheme(theme);
            });
        });
        
        // Fullscreen Toggle
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.error(`Fullscreen error: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen();
                }
            });
        }
        
        // Gallery Drawer Toggle
        const galleryToggle = document.getElementById('gallery-toggle');
        const historyBtn    = document.getElementById('history-btn'); // History also opens gallery for now
        const closeGallery  = document.getElementById('close-gallery');
        const galleryDrawer = document.getElementById('gallery-drawer');
        
        const toggleGallery = () => galleryDrawer.classList.toggle('open');
        
        if (galleryToggle && galleryDrawer) galleryToggle.addEventListener('click', toggleGallery);
        if (historyBtn && galleryDrawer) historyBtn.addEventListener('click', toggleGallery);
        
        if (closeGallery && galleryDrawer) {
            closeGallery.addEventListener('click', () => {
                galleryDrawer.classList.remove('open');
            });
        }
        
        // Settings Button Placeholder
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                window.UIManager.showSmartWarning("Settings menu coming soon!");
            });
        }
        
        // Dock Item Selection (Effects)
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach(item => {
            item.addEventListener('click', () => {
                dockItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const effect = item.getAttribute('data-effect');
                if (window.Camera) {
                    window.Camera.setEffect(effect);
                }
            });
        });
        
        // Frame Selection with live preview
        const frameBtns = document.querySelectorAll('.frame-btn');
        const liveFrameOverlay = document.getElementById('live-frame-overlay');
        
        frameBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                frameBtns.forEach(i => i.classList.remove('active'));
                btn.classList.add('active');
                const frameName = btn.getAttribute('data-frame');
                window.currentFrame = frameName;
                
                if (liveFrameOverlay) {
                    liveFrameOverlay.className = 'live-frame';
                    if (frameName !== 'none') {
                        liveFrameOverlay.classList.add(frameName);
                    }
                }
            });
        });
    }
    
    generateParticles(theme) {
        const container = document.getElementById('particle-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        let particleCount = 0;
        let type = 'none';
        
        switch (theme) {
            case 'sakura':
                particleCount = 15; type = 'petal'; break;
            case 'rainy':
            case 'neon':
                particleCount = 20; type = 'star'; break;
            case 'cozy':
                particleCount = 10; type = 'bubble'; break;
        }
        
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = `particle ${type}`;
            
            const left     = Math.random() * 100;
            const duration = Math.random() * 5 + 5;
            const delay    = Math.random() * -10;
            
            p.style.left      = `${left}%`;
            p.style.animation = `fall ${duration}s ${delay}s linear infinite`;
            
            if (type === 'petal') {
                p.style.transform = `rotate(${Math.random() * 360}deg)`;
            } else if (type === 'bubble') {
                const size = Math.random() * 20 + 10;
                p.style.width  = `${size}px`;
                p.style.height = `${size}px`;
            }
            
            container.appendChild(p);
        }
        
        if (!document.getElementById('particle-keyframes')) {
            const style = document.createElement('style');
            style.id = 'particle-keyframes';
            style.innerHTML = `
                @keyframes fall {
                    0%   { top: -10%; transform: translateX(0) rotate(0deg); opacity: 0; }
                    10%  { opacity: 0.8; }
                    90%  { opacity: 0.8; }
                    100% { top: 110%; transform: translateX(50px) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showSmartWarning(message) {
        const warningEl = document.getElementById('smart-warning');
        if (warningEl) {
            warningEl.textContent = message;
            warningEl.classList.remove('hidden');
            
            clearTimeout(this.warningTimeout);
            this.warningTimeout = setTimeout(() => {
                warningEl.classList.add('hidden');
            }, 3000);
        }
    }
}

window.UIManager = new UIManagerClass();
