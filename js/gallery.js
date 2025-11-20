// js/gallery.js
// === GALLERY ===
export function initGallery() {
    const images = document.querySelectorAll(".galleryImage");
    if (images.length === 0) return;

    let clickCount = 0;

    images.forEach(img => {
        img.addEventListener("click", (e) => {
            e.stopPropagation();

            if (img.classList.contains("ghost-active")) return;
            img.classList.add("ghost-active", "active");

            // === GEIST ===
            const ghost = document.createElement("img");
            ghost.src = "assets/gif/91369.gif";
            ghost.className = "ozzy-ghost";
            ghost.style.cssText = `
                position:absolute;width:120px;top:50%;left:50%;
                transform:translate(-50%,-50%) scale(0);
                filter:drop-shadow(0 0 20px #ff0000);z-index:20;
                pointer-events:none;animation:ghostAppear 3s forwards;
            `;
            img.appendChild(ghost);

            // === SOUND + SPRACHE ===
            if (window.soundEnabled) {
                const quotes = ["I am the Prince of Darkness!", "BARK AT THE MOON!", "Crazy... but that's how it goes!"];
                const audio = new Audio("assets/sound/Voicy_Fucking crap It disappears.mp3");
                audio.volume = 0.6;
                audio.play().catch(() => {});

                setTimeout(() => {
                    const say = new SpeechSynthesisUtterance(quotes[Math.floor(Math.random() * quotes.length)]);
                    say.rate = 0.8; say.pitch = 0.7;
                    speechSynthesis.speak(say);
                }, 600);
            }

            // === 5-KLICK-SECRET ===
            clickCount++;
            if (clickCount === 5) {
                import('./secrets.js').then(mod => mod.triggerNoMoreTears());
                clickCount = 0;
            }

            // === ENTFERNEN ===
            setTimeout(() => {
                ghost.remove();
                img.classList.remove("ghost-active", "active");
            }, 3000);

            // === LIGHTBOX NACH GEIST ===
            setTimeout(() => {
                if (!img.classList.contains("ghost-active")) openLightbox(img);
            }, 3200);
        });
    });

    function openLightbox(img) {
        const modal = document.createElement("div");
        modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:10000;cursor:zoom-out;`;
        const full = document.createElement("img");
        full.src = img.dataset.full;
        full.style.cssText = `max-width:90%;max-height:90%;border-radius:16px;box-shadow:0 0 60px #ff0000;`;
        modal.appendChild(full);
        const close = () => { modal.remove(); document.removeEventListener("keydown", esc); };
        const esc = e => e.key === "Escape" && close();
        modal.addEventListener("click", close);
        document.addEventListener("keydown", esc);
        document.body.appendChild(modal);
    }
}