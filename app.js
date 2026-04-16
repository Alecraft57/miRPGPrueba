const tg = window.Telegram.WebApp;
const params = new URLSearchParams(window.location.search);
const SERVER_URL = "https://automaker-amuck-gleeful.ngrok-free.dev"; 

let enemigoActual = null;
let danoRecibidoSesion = 0;

function updateUI(data) {
    // Quitar el "Cargando..." poniendo el nombre del usuario
    const nombre = tg.initDataUnsafe.user?.first_name || "Viajero";
    document.getElementById('player-name').innerText = nombre;

    if(data.hp !== undefined) {
        document.getElementById('hp-bar').style.width = data.hp + "%";
        document.getElementById('hp-text').innerText = data.hp + "/100";
    }
    if(data.en !== undefined) {
        document.getElementById('en-bar').style.width = data.en + "%";
        document.getElementById('en-text').innerText = data.en + "/100";
    }
    if(data.oro !== undefined) document.getElementById('oro-val').innerText = data.oro;
    if(data.lvl !== undefined) document.getElementById('lvl-val').innerText = data.lvl;
    if(data.xp !== undefined) {
        document.getElementById('xp-bar').style.width = data.xp + "%";
        document.getElementById('xp-text').innerText = data.xp + "/100 XP";
    }
    if(data.arma_equipada !== undefined) document.getElementById('arma-val').innerText = data.arma_equipada;
}

// Carga inicial
updateUI({ 
    hp: params.get('hp'), en: params.get('en'), oro: params.get('oro'),
    lvl: params.get('lvl'), xp: params.get('xp'), arma_equipada: params.get('arma')
});

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
    } catch (e) { console.error("Error en API:", e); }
}

// --- BOTONES ---
document.getElementById('btn-explorar').onclick = async () => {
    const d = await call('explorar');
    if (!d || !d.success) return tg.showAlert(d?.msg || "Error");
    
    if (d.tipo === "combate") {
        enemigoActual = { ...d.enemigo, hpMax: d.enemigo.hp };
        danoRecibidoSesion = 0;
        document.getElementById('enemigo-nombre').innerText = enemigoActual.nombre;
        document.getElementById('enemigo-hp-bar').style.width = "100%";
        document.getElementById('combate-log').innerText = "¡Un enemigo aparece!";
        document.getElementById('modal-combate').style.display = 'block';
    } else {
        tg.showAlert(d.msg);
    }
};

document.getElementById('btn-atacar').onclick = async () => {
    const arma = document.getElementById('arma-val').innerText;
    const miDano = arma.includes("Lanza") ? 25 : arma.includes("Espada") ? 15 : 7;
    
    enemigoActual.hp -= miDano;
    document.getElementById('enemigo-hp-bar').style.width = Math.max(0, (enemigoActual.hp/enemigoActual.hpMax)*100) + "%";
    
    if (enemigoActual.hp <= 0) {
        await call('finalizar_combate', { ganado: true, recompensa: {xp: enemigoActual.xp, oro: enemigoActual.oro}, dano_recibido: danoRecibidoSesion });
        cerrarModales();
        tg.showAlert("¡Has derrotado al enemigo!");
    } else {
        const golpe = Math.floor(Math.random() * enemigoActual.atq) + 1;
        danoRecibidoSesion += golpe;
        document.getElementById('combate-log').innerText = `¡El enemigo te quita ${golpe} HP!`;
    }
};

function cerrarModales() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }
document.getElementById('btn-huir').onclick = () => cerrarModales();
document.getElementById('btn-tienda-toggle').onclick = () => document.getElementById('modal-tienda').style.display = 'block';
document.getElementById('btn-mochila-toggle').onclick = () => { document.getElementById('modal-mochila').style.display = 'block'; cargarInventario('mochila'); };

async function cargarInventario(tipo) {
    const d = await call('get_inventario');
    const lista = document.getElementById('lista-inv');
    lista.innerHTML = "";
    d.items.forEach(i => {
        lista.innerHTML += `<div class="item"><span>${i.nombre} (x${i.cantidad})</span> 
            <button onclick="usar('${i.nombre}')">Usar</button></div>`;
    });
}

async function comprar(item_id) { const res = await call('comprar', { item_id }); tg.showAlert(res.msg); }
async function usar(nombre) { await call('usar', { nombre_item: nombre }); cerrarModales(); tg.showAlert("¡Objeto usado!"); }
