// 1. Inicializar la WebApp de Telegram
const tg = window.Telegram.WebApp;
tg.expand();

// 2. Referencias a los elementos de la interfaz (HTML)
const hpBar = document.getElementById('hp-bar');
const enBar = document.getElementById('en-bar');
const hpText = document.getElementById('hp-text');
const enText = document.getElementById('en-text');
const oroVal = document.getElementById('oro-val');
const playerName = document.getElementById('player-name');

const btnExplorar = document.getElementById('btn-explorar-visual');
const btnTienda = document.getElementById('btn-tienda-visual');
const btnMochila = document.getElementById('btn-mochila-visual');
const btnCerrar = document.getElementById('btn-cerrar');

// 3. Configuración del Servidor
// RECUERDA: Si usas Ngrok, pon aquí la URL que te dé Ngrok (ej: https://...ngrok-free.app)
// Si solo pruebas en el navegador de tu PC con el bot abierto ahí, usa 'http://localhost:5000'
const SERVER_URL = " https://automaker-amuck-gleeful.ngrok-free.dev"; 

// 4. Función para actualizar la UI con nuevos datos
function updateUI(data) {
    if (data.nombre) playerName.innerText = data.nombre;
    
    // Actualizar barras y textos
    hpBar.style.width = `${data.hp}%`;
    hpText.innerText = `${data.hp}/100`;
    
    enBar.style.width = `${data.en}%`;
    enText.innerText = `${data.en}/100`;
    
    oroVal.innerText = data.oro;
}

// 5. Lógica del botón Explorar (Petición al servidor)
btnExplorar.onclick = async () => {
    // Obtenemos el user_id de la URL que envió el bot
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');

    if (!userId) {
        alert("Error: No se encontró el ID de usuario.");
        return;
    }

    try {
        // Enviamos la petición POST al servidor Flask
        const response = await fetch(`${SERVER_URL}/explorar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        });

        const result = await response.json();

        if (result.success) {
            // Si el servidor dice que todo OK, actualizamos la pantalla con los nuevos datos
            updateUI({
                hp: result.hp,
                en: result.en,
                oro: result.oro
            });
            console.log(result.msg);
        } else {
            // Si no hay energía, por ejemplo
            tg.showAlert(result.msg);
        }
    } catch (error) {
        console.error("Error conectando al servidor:", error);
        tg.showAlert("No se pudo conectar con el servidor del juego.");
    }
};

// 6. Botones que aún envían datos al chat (Tienda y Mochila)
// Nota: Estos siguen cerrando la app porque llaman a menús de botones de Telegram
btnTienda.onclick = () => {
    tg.sendData("action_tienda");
};

btnMochila.onclick = () => {
    tg.sendData("action_mochila");
};

btnCerrar.onclick = () => {
    tg.close();
};

// 7. Carga inicial de datos desde la URL
const urlParams = new URLSearchParams(window.location.search);
updateUI({
    nombre: tg.initDataUnsafe.user?.first_name || "Explorador",
    hp: parseInt(urlParams.get('hp')) || 100,
    en: parseInt(urlParams.get('en')) || 0,
    oro: parseInt(urlParams.get('oro')) || 0
});
