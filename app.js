const tg = window.Telegram.WebApp;
tg.expand();

const urlParams = new URLSearchParams(window.location.search);
const SERVER_URL = "https://TU_URL_DE_NGROK.ngrok-free.app"; // <-- ASEGÚRATE DE QUE SEA LA DE NGROK ACTUAL

// Elementos visuales
const hpBar = document.getElementById('hp-bar');
const enBar = document.getElementById('en-bar');
const hpText = document.getElementById('hp-text');
const enText = document.getElementById('en-text');
const oroVal = document.getElementById('oro-val');
const playerName = document.getElementById('player-name');

// Botones
const btnExplorar = document.getElementById('btn-explorar-visual');
const btnTienda = document.getElementById('btn-tienda-visual');
const btnMochila = document.getElementById('btn-mochila-visual');

function updateUI(data) {
    playerName.innerText = data.nombre || playerName.innerText;
    hpBar.style.width = `${data.hp}%`;
    hpText.innerText = `${data.hp}/100`;
    enBar.style.width = `${data.en}%`;
    enText.innerText = `${data.en}/100`;
    oroVal.innerText = data.oro;
}

// Lógica para Explorar
btnExplorar.onclick = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/explorar`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: urlParams.get('user_id') })
        });
        const data = await response.json();
        if (data.success) updateUI(data);
        else alert(data.msg);
    } catch (e) { console.error(e); }
};

// Lógica para Tienda (Comprar)
btnTienda.onclick = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/comprar`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: urlParams.get('user_id') })
        });
        const data = await response.json();
        if (data.success) {
            updateUI(data);
            alert("✅ ¡Compraste una ración!");
        } else {
            alert("❌ " + data.msg);
        }
    } catch (e) { alert("Error de conexión"); }
};

// Lógica para Mochila (Usar)
btnMochila.onclick = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/usar`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: urlParams.get('user_id') })
        });
        const data = await response.json();
        if (data.success) {
            updateUI(data);
            alert("🍴 ¡Has recuperado energía!");
        } else {
            alert("🎒 " + data.msg);
        }
    } catch (e) { alert("Error de conexión"); }
};

// Carga inicial de datos
updateUI({
    hp: urlParams.get('hp'),
    en: urlParams.get('en'),
    oro: urlParams.get('oro')
});
