// Inicializamos la WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Elementos del DOM
const hpBar = document.getElementById('hp-bar');
const enBar = document.getElementById('en-bar');
const hpText = document.getElementById('hp-text');
const enText = document.getElementById('en-text');
const oroVal = document.getElementById('oro-val');
const playerName = document.getElementById('player-name');
const btnCerrar = document.getElementById('btn-cerrar');

// Función para actualizar la interfaz con datos reales
function updateUI(data) {
    playerName.innerText = data.nombre || "Jugador";
    
    // Actualizar barras
    hpBar.style.width = `${data.hp}%`;
    hpText.innerText = `${data.hp}/100`;
    
    enBar.style.width = `${data.en}%`;
    enText.innerText = `${data.en}/100`;
    
    oroVal.innerText = data.oro;
}

// Escuchar el botón de cerrar
btnCerrar.onclick = () => tg.close();

// Al cargar, intentamos sacar datos de la URL (lo que mandará Python)
const urlParams = new URLSearchParams(window.location.search);
const playerData = {
    nombre: tg.initDataUnsafe.user?.first_name || "Explorador",
    hp: urlParams.get('hp') || 100,
    en: urlParams.get('en') || 50,
    oro: urlParams.get('oro') || 0
};

updateUI(playerData);