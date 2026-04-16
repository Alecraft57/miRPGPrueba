const tg = window.Telegram.WebApp;
const params = new URLSearchParams(window.location.search);
const SERVER_URL = "https://automaker-amuck-gleeful.ngrok-free.dev"; // ACTUALIZA ESTO

function updateUI(data) {
    if(data.hp !== undefined) {
        document.getElementById('hp-bar').style.width = data.hp + "%";
        document.getElementById('hp-text').innerText = data.hp + "/100";
    }
    if(data.en !== undefined) {
        document.getElementById('en-bar').style.width = data.en + "%";
        document.getElementById('en-text').innerText = data.en + "/100";
    }
    if(data.oro !== undefined) {
        document.getElementById('oro-val').innerText = data.oro;
    }
    document.getElementById('player-name').innerText = tg.initDataUnsafe.user?.first_name || "Explorador";
}

// Carga inicial
updateUI({ hp: params.get('hp'), en: params.get('en'), oro: params.get('oro') });

// --- GESTIÓN DE MODALES ---
function cerrarModales() {
    document.getElementById('modal-tienda').style.display = 'none';
    document.getElementById('modal-mochila').style.display = 'none';
}

document.getElementById('btn-tienda-toggle').onclick = () => {
    const tienda = document.getElementById('modal-tienda');
    const isVisible = tienda.style.display === 'block';
    cerrarModales();
    tienda.style.display = isVisible ? 'none' : 'block';
};

document.getElementById('btn-mochila-toggle').onclick = async () => {
    const mochila = document.getElementById('modal-mochila');
    const isVisible = mochila.style.display === 'block';
    
    if (isVisible) {
        mochila.style.display = 'none';
    } else {
        cerrarModales();
        mochila.style.display = 'block';
        await cargarInventario();
    }
};

// --- ACCIONES DEL SERVIDOR ---
async function call(route, body = {}) {
    try {
        const res = await fetch(`${SERVER_URL}/${route}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: params.get('user_id'), ...body })
        });
        const d = await res.json();
        if (d.success) updateUI(d);
        return d;
    } catch (e) { console.error("Error:", e); }
}

document.getElementById('btn-explorar').onclick = () => call('explorar');

async function comprar(item_id) {
    const res = await call('comprar', { item_id });
    if (res?.success) {
        // Sonido de monedas o aviso
        console.log("¡Compra exitosa!");
    } else {
        // Efecto visual: el oro parpadea en rojo si no tienes suficiente
        const oroContainer = document.querySelector('.gold-card');
        oroContainer.classList.add('insufficient-gold');
        setTimeout(() => oroContainer.classList.remove('insufficient-gold'), 500);
    }
}

async function cargarInventario() {
    const d = await call('get_inventario');
    const lista = document.getElementById('lista-inv');
    lista.innerHTML = d.items.length ? "" : "<p>Mochila vacía</p>";
    d.items.forEach(i => {
        lista.innerHTML += `
            <div class="item">
                <span>${i.nombre} (x${i.cantidad})</span>
                <button onclick="usar('${i.nombre}')">Usar</button>
            </div>`;
    });
}

async function usar(nombre_item) {
    const res = await call('usar', { nombre_item });
    if (res?.success) {
        cerrarModales();
        alert("¡Has usado " + nombre_item + "!");
    }
}
