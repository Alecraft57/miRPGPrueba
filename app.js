const tg = window.Telegram.WebApp;
tg.expand();

const urlParams = new URLSearchParams(window.location.search);
// CAMBIA ESTA URL POR LA DE NGROK CADA VEZ QUE LO ABRAS
const SERVER_URL = "https://automaker-amuck-gleeful.ngrok-free.dev"; 

const hpBar = document.getElementById('hp-bar');
const enBar = document.getElementById('en-bar');
const hpText = document.getElementById('hp-text');
const enText = document.getElementById('en-text');
const oroVal = document.getElementById('oro-val');
const playerName = document.getElementById('player-name');

const btnExplorar = document.getElementById('btn-explorar-visual');
const btnTienda = document.getElementById('btn-tienda-visual');
const btnMochila = document.getElementById('btn-mochila-visual');

function updateUI(data) {
    if(data.hp !== undefined) {
        hpBar.style.width = `${data.hp}%`;
        hpText.innerText = `${data.hp}/100`;
    }
    if(data.en !== undefined) {
        enBar.style.width = `${data.en}%`;
        enText.innerText = `${data.en}/100`;
    }
    if(data.oro !== undefined) {
        oroVal.innerText = data.oro;
    }
}

// Función genérica para enviar acciones al servidor
async function enviarAccion(ruta) {
    try {
        const response = await fetch(`${SERVER_URL}/${ruta}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: urlParams.get('user_id') })
        });
        const data = await response.json();
        if (data.success) {
            updateUI(data);
        } else {
            alert(data.msg);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

btnExplorar.onclick = () => enviarAccion('explorar');
btnTienda.onclick = () => enviarAccion('comprar');
btnMochila.onclick = () => enviarAccion('usar');

// Carga inicial desde la URL (para evitar los "null")
updateUI({
    hp: parseInt(urlParams.get('hp')) || 100,
    en: parseInt(urlParams.get('en')) || 50,
    oro: parseInt(urlParams.get('oro')) || 0
});
playerName.innerText = tg.initDataUnsafe.user?.first_name || "Explorador";
