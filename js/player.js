// js/player.js
export function initGlobalPlayer() {
    const playerHTML = `
        <div id="globalPlayerUI" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:1000;background:rgba(0,0,0,0.9);padding:12px 20px;border-radius:50px;display:flex;gap:12px;align-items:center;box-shadow:0 0 30px #ff0000;font-family:var(--font-main);">
            <button id="playPauseBtn" class="modern-btn" style="min-width:auto;padding:8px 16px;">Play</button>
            <span style="color:#ff3333;font-weight:bold;">Mama, I'm Coming Home</span>
            <div style="flex:1;height:6px;background:#333;border-radius:3px;overflow:hidden;">
                <div id="progress" style="width:0%;height:100%;background:#ff0000;transition:width 0.1s;"></div>
            </div>
            <span id="time" style="min-width:80px;font-size:0.9em;">0:00 / 0:00</span>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", playerHTML);

    const audio = new Audio("/assets/sound/assets/Complete Songs/CS Ozzy Osbourne - Mama-i-m-coming-home.mp3");
    audio.loop = true;
    const playBtn = document.getElementById("playPauseBtn");
    const progress = document.getElementById("progress");
    const time = document.getElementById("time");

    playBtn.onclick = () => {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = "Pause";
        } else {
            audio.pause();
            playBtn.textContent = "Play";
        }
    };

    audio.ontimeupdate = () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = percent + "%";
        time.textContent = `${format(audio.currentTime)} / ${format(audio.duration)}`;
    };

    function format(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' + s : s}`;
    }
}