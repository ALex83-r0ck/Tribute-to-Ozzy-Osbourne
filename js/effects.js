// js/effects.js
// === FLAME-CANVAS ===
const canvas = document.getElementById("flameCanvas");
const ctx = canvas?.getContext("2d");

if (canvas) {
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
    };
    resize();
    window.addEventListener("resize", resize);

    const flames = [];
    for (let i = 0; i < 60; i++) {
        flames.push({
            x: Math.random() * canvas.width,
            y: canvas.height,
            size: Math.random() * 12 + 8,
            speed: Math.random() * 4 + 3
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        flames.forEach(f => {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${100 + Math.random()*50}, 0, 0.6)`;
            ctx.fill();
            f.y -= f.speed;
            f.size *= 0.97;
            if (f.size < 1) {
                f.y = canvas.height;
                f.x = Math.random() * canvas.width;
                f.size = Math.random() * 12 + 8;
            }
        });
        requestAnimationFrame(draw);
    }
    draw();
}