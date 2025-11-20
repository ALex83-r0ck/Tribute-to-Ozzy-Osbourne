// js/offerings.js
// === OZZY'S OFFERINGS – SPENDEN FÜR DEN PRINCE OF DARKNESS ===
let currentAudio = null;
let progressInterval = null;

export function initOfferings() {
    const offerings = [ /* wie vorher */ ];

    const container = document.getElementById("offeringsContainer");
    if (!container) return;

    container.style.cssText = `
        position: absolute;
        bottom: -60px; left: 50%;
        transform: translateX(-50%);
        display: flex; gap: 8px;
        background: rgba(0,0,0,0.8);
        padding: 10px;
        border-radius: 50px;
        box-shadow: 0 0 20px #ff0000;
        flex-wrap: wrap;
        justify-content: center;
        z-index: 100;
    `;

    offerings.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "offering-btn modern-btn";
        btn.innerHTML = `${item.icon} ${item.name}`;
        btn.dataset.sound = item.sound;

        const progress = document.createElement("div");
        progress.className = "progress-bar";
        progress.style.cssText = `position:absolute;bottom:0;left:0;width:0%;height:3px;background:#ff0000;transition:width 0.1s;`;
        btn.appendChild(progress);

        btn.onclick = () => triggerOffering(item, btn, progress);
        container.appendChild(btn);
    });

    function triggerOffering(item, btn, bar) {
        if (!window.soundEnabled) return;

        // Stoppe alten Sound
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
            clearInterval(progressInterval);
            document.querySelectorAll(".progress-bar").forEach(p => p.style.width = "0%");
        }

        // Neuer Sound
        currentAudio = new Audio(item.sound);
        currentAudio.volume = 0.7;
        currentAudio.play().catch(() => {});

        // Ladebalken
        const duration = currentAudio.duration || 10;
        let start = Date.now();
        progressInterval = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000;
            const percent = Math.min((elapsed / duration) * 100, 100);
            bar.style.width = percent + "%";
            if (percent >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => bar.style.width = "0%", 500);
            }
        }, 100);

        // 2. Klick = Stop
        const stopHandler = () => {
            currentAudio.pause();
            clearInterval(progressInterval);
            bar.style.width = "0%";
            btn.removeEventListener("click", stopHandler);
        };
        btn.onclick = stopHandler;

        // Effekt
        item.effect();
    }
    // === EFFEKTE ===
    function beerRain() {
        for (let i = 0; i < 30; i++) {
            const beer = document.createElement("div");
            beer.innerHTML = 'Bier';
            beer.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-50px;font-size:${20+Math.random()*25}px;animation:fallBeer 3s linear forwards;pointer-events:none;z-index:999;color:#ffcc00;text-shadow:0 0 10px #ff6600;`;
            document.body.appendChild(beer);
            setTimeout(() => beer.remove(), 3000);
        }
        flashMessage("PROST, OZZY!");
    }

    function bloodRain() {
        for (let i = 0; i < 40; i++) {
            const drop = document.createElement("div");
            drop.innerHTML = 'Blut';
            drop.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-30px;font-size:${15+Math.random()*20}px;animation:fallBlood 2.5s linear forwards;pointer-events:none;z-index:999;color:#8b0000;text-shadow:0 0 8px #ff0000;`;
            document.body.appendChild(drop);
            setTimeout(() => drop.remove(), 2500);
        }
        flashMessage("NO MORE TEARS...");
    }

    function batSwarm() {
        for (let i = 0; i < 30; i++) {
            const bat = document.createElement("div");
            bat.innerHTML = 'Fledermaus';
            bat.style.cssText = `position:fixed;left:${-10}vw;top:${Math.random()*100}vh;font-size:30px;animation:flyBat 4s linear forwards;pointer-events:none;z-index:999;`;
            document.body.appendChild(bat);
            setTimeout(() => bat.remove(), 4000);
        }
        setTimeout(() => {
            const say = new SpeechSynthesisUtterance("BARK AT THE MOON!");
            say.rate = 1.2; say.pitch = 0.5;
            speechSynthesis.speak(say);
        }, 1000);
    }

    function crazyTrain() {
        document.body.classList.add("train-shake");
        setTimeout(() => document.body.classList.remove("train-shake"), 2000);
        flashMessage("ALL ABOARD! HA HA HA HA!");
    }

    function ironMan() {
        document.body.style.filter = "contrast(1.5) saturate(1.8) grayscale(0.5)";
        setTimeout(() => document.body.style.filter = "", 3000);
        flashMessage("I AM IRON MAN!");
    }

    function headbangPlus() {
        document.body.classList.add("headbang-plus");
        setTimeout(() => document.body.classList.remove("headbang-plus"), 3000);
        flashMessage("HEADBANG WITH THE PRINCE!");
    }

    function flashMessage(text) {
        const msg = document.createElement("div");
        msg.textContent = text;
        msg.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:3em;color:#ff0000;text-shadow:0 0 30px #ff0000;z-index:10000;pointer-events:none;animation:flash 2s forwards;`;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }
}