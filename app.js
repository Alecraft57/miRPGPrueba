const tg = window.Telegram.WebApp;
const params = new URLSearchParams(window.location.search);
const SERVER_URL = "https://automaker-amuck-gleeful.ngrok-free.dev";

function updateUI(data) {
    if(data.hp !== undefined) {
        document.getElementById('hp-bar').style.width = data.hp + "%";
        document.getElementById('hp-text').innerText = data.hp + "/100";
    }
    if(data.en !== undefined) {
        document.getElementById('en-bar').style.width = data.en + "%";
        document.getElementById('en-text').innerText = data.en + "/100";
    }
    document.getElementById('oro-val').innerText = data.oro || 0;
    document.getElementById('player-name').innerText = tg.initDataUnsafe.user?.first_name || "Explorador";
}

// Carga inicial
updateUI({ hp: params.get('hp'), en: params.get('en'), oro: params.get('oro') });

function toggleModal(id, show) { document.getElementById(id).style.display = show ? 'block' : 'none'; }

async function call(route, body = {}) {
    const res = await fetch(`${SERVER_URL}/${route}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: params.get('user_id'), ...body })
    });
    const d = await res.json();
    if (d.success) { updateUI(d); return d; }
    else { alert(d.msg); return null; }
}

document.getElementById('btn-explorar').onclick = () => call('explorar');

async function comprar(item_id) {
    const d = await call('comprar', { item_id });
    if(d) alert(d.msg);
}

async function abrirMochila() {
    const d = await call('get_inventario');
    const lista = document.getElementById('lista-inv');
    lista.innerHTML = "";
    d.items.forEach(i => {
        lista.innerHTML += `<div class="item">${i.nombre} (x${i.cantidad}) <button onclick="usar('${i.nombre}')">Usar</button></div>`;
    });
    toggleModal('modal-mochila', true);
}

async function usar(nombre_item) {
    const d = await call('usar', { nombre_item });
    if(d) { toggleModal('modal-mochila', false); alert("¡Usado!"); }
}
