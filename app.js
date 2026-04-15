const tg = window.Telegram.WebApp;
tg.expand();

const hpBar = document.getElementById('hp-bar');
const enBar = document.getElementById('en-bar');
const hpText = document.getElementById('hp-text');
const enText = document.getElementById('en-text');
const oroVal = document.getElementById('oro-val');
const playerName = document.getElementById('player-name');
const btnCerrar = document.getElementById('btn-cerrar');
const btnExplorar = document.getElementById('btn-explorar-visual');

function updateUI(data) {
    playerName.innerText = data.nombre;
    hpBar.style.width = `${data.hp}%`;
    hpText.innerText = `${data.hp}/100`;
    enBar.style.width = `${data.en}%`;
    enText.innerText = `${data.en}/100`;
    oroVal.innerText = data.oro;
}

// Enviar dato al bot al explorar
btnExplorar.onclick = () => {
    tg.sendData("action_explorar");
};

btnCerrar.onclick = () => tg.close();

const urlParams = new URLSearchParams(window.location.search);
const playerData = {
    nombre: tg.initDataUnsafe.user?.first_name || "Explorador",
    hp: parseInt(urlParams.get('hp')) || 100,
    en: parseInt(urlParams.get('en')) || 50,
    oro: parseInt(urlParams.get('oro')) || 0
};

updateUI(playerData);
