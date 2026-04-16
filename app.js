const tg = window.Telegram.WebApp;
const params = new URLSearchParams(window.location.search);
const SERVER_URL = "https://automaker-amuck-gleeful.ngrok-free.dev"; 

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
        if (d.success || d.hp !== undefined) updateUI(d);
        return d;
    } catch (e) { console.error(e); }
}

function cerrarModales() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }

// --- BOTONES MENÚ ---
document.getElementById('btn-explorar').onclick = async () => {
    const d = await call('explorar');
    if (d.tipo === "combate") {
        enemigoActual = { ...d.enemigo, hpMax: d.enemigo.hp };
        danoAcumulado = 0;
        document.getElementById('mstruo-nombre').innerText = enemigoActual.nombre;
        document.getElementById('mstruo-hp-bar').style.width = "100%";
        document.getElementById('combate-log').innerText = "¡Enemigo a la vista!";
        document.getElementById('modal-combate').style.display = 'block';
    } else if (d.msg) {
        tg.showAlert(d.msg);
    }
};

document.getElementById('btn-tienda-toggle').onclick = () => { cerrarModales(); document.getElementById('modal-tienda').style.display = 'block'; };
document.getElementById('btn-mochila-toggle').onclick = () => { cerrarModales(); document.getElementById('modal-mochila').style.display = 'block'; cargarInventario('mochila'); };
document.getElementById('btn-equipo-toggle').onclick = () => { cerrarModales(); document.getElementById('modal-equipo').style.display = 'block'; cargarInventario('equipo'); };

// --- COMBATE ---
document.getElementById('btn-atacar').onclick = async () => {
    const arma = document.getElementById('arma-val').innerText;
    let miDano = 0;

    // RANGOS DE DAÑO VARIABLE
    if (arma.includes("Lanza")) miDano = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
    else if (arma.includes("Espada")) miDano = Math.floor(Math.random() * (18 - 12 + 1)) + 12;
    else miDano = Math.floor(Math.random() * (8 - 5 + 1)) + 5;

    enemigoActual.hp -= miDano;
    document.getElementById('mstruo-hp-bar').style.width = Math.max(0, (enemigoActual.hp/enemigoActual.hpMax)*100) + "%";
    
    if (enemigoActual.hp <= 0) {
        document.getElementById('combate-log').innerText = "¡Victoria!";
        await call('finalizar_combate', { ganado: true, recompensa: {xp: enemigoActual.xp, oro: enemigoActual.oro}, dano_recibido: danoAcumulado });
        setTimeout(cerrarModales, 1000);
    } else {
        const dRival = Math.floor(Math.random() * enemigoActual.atq) + 1;
        danoAcumulado += dRival;
        document.getElementById('combate-log').innerText = `Daño: ${miDano}. ¡Recibes ${dRival}!`;
    }
};

// --- INVENTARIO ---
async function cargarInventario(tipo) {
    const d = await call('get_inventario');
    const lista = document.getElementById(tipo === 'mochila' ? 'lista-inv' : 'lista-equipo');
    lista.innerHTML = "";
    if (!d.items || d.items.length === 0) { lista.innerHTML = "<p>Vacío</p>"; return; }

    d.items.forEach(i => {
        const esArma = i.nombre.includes("Espada") || i.nombre.includes("Lanza");
        if ((tipo === 'mochila' && !esArma) || (tipo === 'equipo' && esArma)) {
            lista.innerHTML += `<div class="item"><span>${i.nombre} (x${i.cantidad})</span>
                <button onclick="${esArma ? 'equipar' : 'usar'}('${i.nombre}')">${esArma ? 'Equipar' : 'Usar'}</button></div>`;
        }
    });
}

async function comprar(item_id) { const d = await call('comprar', { item_id }); tg.showAlert(d.msg); }
async function usar(nombre) { await call('usar', { nombre_item: nombre }); cerrarModales(); }
async function equipar(nombre) { await call('equipar_arma', { nombre_arma: nombre }); cerrarModales(); }
