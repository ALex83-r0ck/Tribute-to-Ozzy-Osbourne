// ========== js/concert.js ==========

document.addEventListener("DOMContentLoaded", () => {
    console.log("OZZY EMPIRE SYSTEM ONLINE...");

    // --- STAGE LIGHTS ---
    const lightBtns = document.querySelectorAll(".light-btn");
    lightBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const color = btn.dataset.color;
            document.body.setAttribute("data-theme", color);
            lightBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // --- RESET ---
    document.getElementById("resetApp")?.addEventListener("click", () => {
        if(confirm("Alles zurücksetzen? 🤘")) { localStorage.clear(); location.reload(); }
    });

    // --- CARD FLIP (Tours) ---
    document.querySelectorAll(".legacy-card").forEach(card => {
        // Flip bei Klick auf die Karte (außer Vote-Button)
        card.addEventListener("click", (e) => {
            if (!e.target.closest(".vote-btn") && !e.target.closest(".close-card-btn")) {
                card.classList.toggle("is-flipped");
            }
        });

        // Eigener Schließ-Button auf der Rückseite
        card.querySelector(".close-card-btn")?.addEventListener("click", (e) => {
            e.stopPropagation();
            card.classList.remove("is-flipped");
        });
    });

    // --- VOTING ---
    document.querySelectorAll(".legacy-card").forEach(card => {
        const id = card.dataset.tour;
        const btn = card.querySelector(".vote-btn");
        const countEl = card.querySelector(".vote-count");
        let count = parseInt(localStorage.getItem(`votes_${id}`) || "0");
        countEl.textContent = count;

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            count++;
            countEl.textContent = count;
            localStorage.setItem(`votes_${id}`, count);
            card.classList.add("shake");
            setTimeout(() => card.classList.remove("shake"), 300);
        });
    });

    // --- ALBUM MODAL ---
    const modal = document.getElementById("albumModal");
    const mTitle = document.getElementById("modalTitle");
    const mTracks = document.getElementById("trackList");

    document.querySelectorAll(".album-card").forEach(card => {
        card.addEventListener("click", () => {
            const title = card.querySelector("h3").textContent;
            const tracks = card.dataset.tracks.split(",");
            mTitle.textContent = title;
            mTracks.innerHTML = tracks.map(t => `<li>${t.trim()}</li>`).join("");
            modal.classList.add("ozzy-modal--open");
        });
    });

    // Modal Schließen (Button & Backdrop)
    document.getElementById("modalCloseBtn")?.addEventListener("click", () => {
        modal.classList.remove("ozzy-modal--open");
    });
    document.getElementById("modalCloseBackdrop")?.addEventListener("click", () => {
        modal.classList.remove("ozzy-modal--open");
    });

    // --- CHEER ---
    document.getElementById("cheerBtn")?.addEventListener("click", () => {
        for(let i=0; i<15; i++) {
            const e = document.createElement("div");
            e.className = "cheer-emoji";
            e.textContent = ["🤘", "🔥", "🎸", "⚡"][Math.floor(Math.random()*4)];
            e.style.left = Math.random() * 100 + "vw";
            document.body.appendChild(e);
            setTimeout(() => e.remove(), 2000);
        }
    });
});
