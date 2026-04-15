// Conexión con la API de Telegram
const tg = window.Telegram.WebApp;
tg.expand(); // Abre la app a pantalla completa

// Referencias a elementos de la interfaz
const hpBar = document.getElementById('hp-bar');
const enBar = document.getElementById('en-bar');
const hpText = document.getElementById('hp-text');
const enText = document.getElementById('en-text');
const oroVal = document.getElementById('oro-val');
const playerName = document.getElementById('player-name');

// Referencias a botones
const btnExplorar = document.getElementById('btn-explorar-visual');
const btnTienda = document.getElementById('btn-tienda-visual');
const btnMochila = document.getElementById('btn-mochila-visual');
const btnCerrar = document.getElementById('btn-cerrar');

// Función para actualizar los textos y barras
function updateUI(data) {
    playerName.innerText = data.nombre;
    
    // Actualizar Vida
    hpBar.style.width = `${data.hp}%`;
    hpText.innerText = `${data.hp}/100`;
    
    // Actualizar Energía
    enBar.style.width = `${data.en}%`;
    enText.innerText = `${data.en}/100`;
    
    // Actualizar Oro
    oroVal.innerText = data.oro;
}

// --- LOGICA DE BOTONES ---

btnExplorar.onclick = () => {
    tg.sendData("action_explorar");
};

btnTienda.onclick = () => {
    tg.sendData("action_tienda");
};

btnMochila.onclick = () => {
    tg.sendData("action_mochila");
};

btnCerrar.onclick = () => {
    tg.close();
};

// --- INICIO: LEER DATOS DE LA URL ---
const urlParams = new URLSearchParams(window.location.search);
const playerData = {
    nombre: tg.initDataUnsafe.user?.first_name || "Explorador",
    hp: parseInt(urlParams.get('hp')) || 100,
    en: parseInt(urlParams.get('en')) || 50,
    oro: parseInt(urlParams.get('oro')) || 0
};

// Ejecutar la actualización al cargar
updateUI(playerData);
