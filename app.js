const tg = window.Telegram.WebApp;
const params = new URLSearchParams(window.location.search);
const SERVER_URL = " https://automaker-amuck-gleeful.ngrok-free.dev";

function updateUI(data) {
    document.getElementById('hp-bar').style.width = (data.hp || 100) + "%";
    document.getElementById('hp-text').innerText = (data.hp || 100) + "/100";
    document.getElementById('en-bar').style.width = (data.en || 0) + "%";
    document.getElementById('en-text').innerText = (data.en || 0) + "/100";
    document.getElementById('oro-val').innerText = data.oro || 0;
    document.getElementById('player-name').innerText = tg.initDataUnsafe.user?.first_name || "Jugador";
}

// Carga inicial inmediata
updateUI({ hp: params.get('hp'), en: params.get('en'), oro: params.get('oro') });

async function call(route) {
    const r = await fetch(`${SERVER_URL}/${route}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: params.get('user_id') })
    });
    const d = await r.json();
    if (d.success) updateUI(d);
    else alert(d.msg);
}

document.getElementById('btn-explorar').onclick = () => call('explorar');
document.getElementById('btn-tienda').onclick = () => call('comprar');
document.getElementById('btn-mochila').onclick = () => call('usar');
