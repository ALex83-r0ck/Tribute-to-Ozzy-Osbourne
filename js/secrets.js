// js/secrets.js
// === OZZY FAN PROJEKT – SECRETS ===
export function triggerNoMoreTears() {
    document.body.style.filter = "sepia(1) hue-rotate(180deg) brightness(0.8)";
    const tears = setInterval(() => {
        const tear = document.createElement("div");
        tear.textContent = "tear";
        tear.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-20px;font-size:${15+Math.random()*15}px;color:#00f;animation:fall 3s linear forwards;pointer-events:none;z-index:9999;`;
        document.body.appendChild(tear);
        setTimeout(() => tear.remove(), 3000);
    }, 80);
    setTimeout(() => {
        clearInterval(tears);
        document.body.style.filter = "";
        alert("NO MORE TEARS! Secret gefunden!");
    }, 5000);
}

export function initSecrets() {
    let konami = "";
    const code = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
    document.addEventListener("keydown", e => {
        konami += e.key;
        if (konami.length > code.length) konami = konami.slice(-code.length);
        if (konami.toLowerCase() === code) {
            triggerNoMoreTears();
            konami = "";
        }
    });
}