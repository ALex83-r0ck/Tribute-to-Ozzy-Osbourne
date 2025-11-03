// ========== js/gallery.js ==========

const galleryImages = document.querySelectorAll(".galleryImage");
let currentIndex = 0;

function showNextImage() {
    galleryImages.forEach((img, i) => {
        img.classList.toggle("active", i === currentIndex);
    });
    currentIndex = (currentIndex + 1) % galleryImages.length;
}

// Automatische Rotation alle 3 Sekunden
if (galleryImages.length > 0) {
    setInterval(showNextImage, 3000);
}

// ========== gallery.js ==========