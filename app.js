const tg = window.Telegram.WebApp;
const params = new URLSearchParams(window.location.search);
const SERVER_URL = "https://TU-URL-DE-NGROK.ngrok-free.dev"; 

let enemigoActual = null;
let danoAcumulado = 0;

function updateUI(data) {
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
    
    document.getElementById('player-name').innerText = tg.initDataUnsafe.user?.first_name || "Alejandro";
}

// Carga Inicial
updateUI({ 
    hp: params.get('hp'), en: params.get('en'), oro: params.get('oro'),
    lvl: params.get('lvl') || 1, xp: params.get('xp') || 0, arma_equipada: params.get('arma') || 'Puños'
});

function cerrarModales() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// --- BOTONES DE MENÚ ---
document.getElementById('btn-tienda-toggle').onclick = () => { cerrarModales(); document.getElementById('modal-tienda').style.display = 'block'; };
document.getElementById('btn-mochila-toggle').onclick = () => { cerrarModales(); document.getElementById('modal-mochila').style.display = 'block'; cargarInventario('mochila'); };
document.getElementById('btn-equipo-toggle').onclick = () => { cerrarModales(); document.getElementById('modal-equipo').style.display = 'block'; cargarInventario('equipo'); };

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
    } catch (e) { tg.showAlert("Error de conexión con el servidor"); }
}

// --- EXPLORACIÓN Y COMBATE ---
document.getElementById('btn-explorar').onclick = async () => {
    const d = await call('explorar');
    if (!d.success) return tg.showAlert(d.msg);
    
    if (d.tipo === "combate") {
        iniciarCombate(d.enemigo);
    } else if (d.msg) {
        tg.showAlert(d.msg);
    }
};

function iniciarCombate(enemigo) {
    enemigoActual = { ...enemigo, hpMax: enemigo.hp };
    danoAcumulado = 0;
    document.getElementById('enemigo-nombre').innerText = enemigo.nombre;
    document.getElementById('enemigo-hp-bar').style.width = "100%";
    document.getElementById('combate-log').innerText = "¡Un " + enemigo.nombre + " te ataca!";
    document.getElementById('modal-combate').style.display = 'block';
}

document.getElementById('btn-atacar').onclick = async () => {
    const arma = document.getElementById('arma-val').innerText;
    const miDano = arma.includes("Lanza") ? 25 : arma.includes("Espada") ? 15 : 7;
    
    enemigoActual.hp -= miDano;
    document.getElementById('enemigo-hp-bar').style.width = Math.max(0, (enemigoActual.hp / enemigoActual.hpMax)*100) + "%";
    
    if (enemigoActual.hp <= 0) {
        document.getElementById('combate-log').innerText = "¡Victoria!";
        const res = await call('finalizar_combate', { ganado: true, recompensa: {xp: enemigoActual.xp, oro: enemigoActual.oro}, dano_recibido: danoAcumulado });
        setTimeout(() => cerrarModales(), 1000);
    } else {
        const danoRival = Math.floor(Math.random() * enemigoActual.atq) + 1;
        danoAcumulado += danoRival;
        document.getElementById('combate-log').innerText = `Golpeas por ${miDano}. ¡El enemigo te quita ${danoRival} HP!`;
    }
};

document.getElementById('btn-huir').onclick = () => { cerrarModales(); tg.showAlert("Escapaste..."); };

// --- TIENDA E INVENTARIO ---
async function comprar(item_id) {
    const d = await call('comprar', { item_id });
    tg.showAlert(d.msg);
}

async function cargarInventario(tipo) {
    const d = await call('get_inventario');
    const lista = document.getElementById(tipo === 'mochila' ? 'lista-inv' : 'lista-equipo');
    lista.innerHTML = "";
    d.items.forEach(i => {
        const esArma = i.nombre.includes("Espada") || i.nombre.includes("Lanza");
        if ((tipo === 'mochila' && !esArma) || (tipo === 'equipo' && esArma)) {
            lista.innerHTML += `<div class="item"><span>${i.nombre}</span> 
                <button onclick="${esArma ? 'equipar' : 'usar'}('${i.nombre}')">${esArma ? 'Equipar' : 'Usar'}</button></div>`;
        }
    });
}

async function usar(nombre) { await call('usar', { nombre_item: nombre }); cerrarModales(); tg.showAlert("¡Usado!"); }
async function equipar(nombre) { await call('equipar_arma', { nombre_arma: nombre }); cerrarModales(); tg.showAlert("Equipado: " + nombre); }
