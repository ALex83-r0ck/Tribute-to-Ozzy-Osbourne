// js/altar.js
// === ALTAR ===
export function initAltar() {
    const spendButton = document.getElementById("spendButton");
    const easterEffect = document.getElementById("easterEffect");
    if (!spendButton || !easterEffect) return;

    spendButton.addEventListener("click", () => {
        if (!window.soundEnabled) {
            alert("Ton an für die volle Wirkung! Ozzy liebt Bier-Sounds.");
            return;
        }

        easterEffect.innerHTML = '';

        // === BIER-REGEN ===
        for (let i = 0; i < 25; i++) {
            const beer = document.createElement("div");
            beer.innerHTML = 'Bier';
            beer.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-50px;font-size:${20+Math.random()*30}px;animation:fallBeer 3s linear forwards;pointer-events:none;z-index:999;color:#ffcc00;text-shadow:0 0 10px #ff6600;`;
            document.body.appendChild(beer);
            setTimeout(() => beer.remove(), 3000);
        }

        // === VIDEO FLASH ===
        const video = document.getElementById("altarVideo");
        if (video) {
            video.style.filter = "brightness(2) contrast(1.5)";
            setTimeout(() => video.style.filter = "brightness(0.9) contrast(1.2)", 500);
        }

        // === SOUND ===
        const pour = new Audio("assets/sound/Schrein_beer-pour.mp3");
        pour.play().catch(() => {});

        // === MESSAGE ===
        setTimeout(() => {
            easterEffect.innerHTML = '<p style="color:#ff0000;font-size:2.5em;font-weight:bold;text-shadow:0 0 20px #ff0000;">PROST, OZZY!</p>';
            setTimeout(() => easterEffect.innerHTML = '', 2000);
        }, 1500);
    });
}