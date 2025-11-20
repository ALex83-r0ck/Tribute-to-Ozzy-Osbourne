// js/gallery-spirit.js
export function initGallerySpirit() {
    const gallerySection = document.getElementById("gallerySection");
    if (!gallerySection) return;

    const spirit = document.createElement("img");
    spirit.src = "/assets/gif/driving ozzy osbourne.gif";
    spirit.id = "ozzySpirit";
    spirit.style.cssText = `
        position: absolute;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        opacity: 0.7;
        pointer-events: none;
        z-index: 10;
        transition: all 0.1s ease-out;
        filter: drop-shadow(0 0 15px #ff0000);
        display: none;
    `;
    gallerySection.style.position = "relative";
    gallerySection.appendChild(spirit);

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isVisible = false;

    // Nur in Gallery sichtbar
    const showSpirit = () => {
        if (!isVisible && window.innerWidth > 768) {
            spirit.style.display = "block";
            isVisible = true;
            setTimeout(() => spirit.style.opacity = "0.7", 100);
        }
    };

    const hideSpirit = () => {
        spirit.style.opacity = "0";
        setTimeout(() => {
            spirit.style.display = "none";
            isVisible = false;
        }, 500);
    };

    // Maus folgt (nur in Gallery)
    gallerySection.addEventListener("mousemove", (e) => {
        if (!isVisible) showSpirit();
        const rect = gallerySection.getBoundingClientRect();
        targetX = e.clientX - rect.left + 40;
        targetY = e.clientY - rect.top + 40;
    });

    gallerySection.addEventListener("mouseleave", () => {
        setTimeout(hideSpirit, 1000);
    });

    // Klick → weg + Sound
    spirit.addEventListener("click", () => {
        const audio = new Audio("assets/sound/Voicy_Fucking crap It disappears.mp3");
        audio.play().catch(() => {});
        spirit.style.transition = "all 0.5s ease-out";
        spirit.style.transform = "scale(2) rotate(360deg)";
        spirit.style.opacity = "0";
        setTimeout(() => {
            spirit.remove();
        }, 600);
    });

    // Smooth Follow
    function animate() {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        spirit.style.left = currentX + "px";
        spirit.style.top = currentY + "px";
        requestAnimationFrame(animate);
    }
    animate();
}