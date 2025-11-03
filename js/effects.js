// ========== js/effects.js ==========

// Beispiel: Einfacher Flammen-Effekt
const flameCanvas = document.getElementById("flameCanvas");
const ctx = flameCanvas?.getContext("2d");

if (flameCanvas) {
    flameCanvas.width = window.innerWidth;
    flameCanvas.height = window.innerHeight;

    const flames = [];

    function createFlame() {
        return {
            x: Math.random() * flameCanvas.width,
            y: flameCanvas.height,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 3 + 2,
        };
    }

    for (let i = 0; i < 50; i++) flames.push(createFlame());

    function drawFlames() {
        ctx.clearRect(0, 0, flameCanvas.width, flameCanvas.height);
        flames.forEach(f => {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 100, 0, 0.5)";
            ctx.fill();
            f.y -= f.speed;
            f.size *= 0.98;
            if (f.size < 0.5) Object.assign(f, createFlame());
        });
        requestAnimationFrame(drawFlames);
    }

    drawFlames();
}
