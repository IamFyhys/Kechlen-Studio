// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const startBtn   = document.getElementById('start-camera-btn');
    const landingPage = document.getElementById('landing-page');
    const cameraView  = document.getElementById('camera-view');
    
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            startBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Starting...';
            lucide.createIcons();
            
            const success = await window.Camera.start();
            
            if (success) {
                gsap.to(landingPage, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        landingPage.classList.remove('active');
                        landingPage.classList.add('hidden');
                        
                        cameraView.classList.remove('hidden');
                        
                        gsap.fromTo(cameraView,
                            { opacity: 0, scale: 0.95 },
                            { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out",
                              onComplete: () => { cameraView.classList.add('active'); }
                            }
                        );
                        
                        gsap.fromTo('.dock-item',
                            { y: 50, opacity: 0 },
                            { y: 0, opacity: 0.6, duration: 0.5, stagger: 0.08,
                              ease: "back.out(1.7)", delay: 0.2 }
                        );
                        
                        gsap.fromTo('.top-bar',
                            { y: -50, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.4 }
                        );
                        
                        // Re-render Lucide icons after camera view is shown
                        lucide.createIcons();
                    }
                });
            } else {
                startBtn.innerHTML = '<i data-lucide="camera"></i> Start Camera';
                lucide.createIcons();
            }
        });
    }
});

// Spin animation for loading state
const spinStyle = document.createElement('style');
spinStyle.innerHTML = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
`;
document.head.appendChild(spinStyle);
