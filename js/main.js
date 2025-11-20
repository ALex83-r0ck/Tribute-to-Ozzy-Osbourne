// js/main.js
// === MAIN ===
// === OZZY FAN PROJEKT – MAIN ENTRY ===
document.addEventListener("DOMContentLoaded", () => {
    console.log("OZZY LEBT – SYSTEM BOOTET...");

    // === INIT MODULES ===
    import('./sound.js').then(mod => mod.initSound());
    import('./gallery.js').then(mod => mod.initGallery());
    import('./gallery-spirit.js').then(mod => mod.initGallerySpirit());
    import('./altar.js').then(mod => mod.initAltar());
    import('./offerings.js').then(mod => mod.initOfferings());
    import('./effects.js');
    import('./player.js').then(mod => mod.initGlobalPlayer());
    import('./secrets.js').then(mod => mod.initSecrets());
    import('./quiz.js').then(mod => mod.initQuiz());
    
    // Theme laden (aus sound.js oder separat)
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        const btn = document.getElementById("themeToggle");
        if (btn) {
            btn.textContent = "Dark Mode";
            btn.setAttribute("aria-pressed", true);
        }
    }

    // Staggered Gallery Animation
    document.querySelectorAll(".galleryImage").forEach((img, i) => {
        img.style.setProperty('--i', i + 1);
    });
});