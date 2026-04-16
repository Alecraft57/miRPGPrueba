const tg = window.Telegram.WebApp;
const params = new URLSearchParams(window.location.search);
// Mantengo tu URL de ngrok
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
    if(data.oro !== undefined) {
        document.getElementById('oro-val').innerText = data.oro;
    }

    // --- ACTUALIZACIÓN DE XP Y NIVEL ---
    if(data.lvl !== undefined) {
        document.getElementById('lvl-val').innerText = data.lvl;
    }
    if(data.xp !== undefined) {
        document.getElementById('xp-bar').style.width = data.xp + "%";
        document.getElementById('xp-text').innerText = data.xp + "/100 XP";
    }
    
    // --- ACTUALIZACIÓN DE ARMA EQUIPADA ---
    if(data.arma_equipada !== undefined) {
        document.getElementById('arma-val').innerText = data.arma_equipada;
    }
    
    document.getElementById('player-name').innerText = tg.initDataUnsafe.user?.first_name || "Explorador";
}

// Carga inicial con datos de la URL
updateUI({ 
    hp: params.get('hp'), 
    en: params.get('en'), 
    oro: params.get('oro'),
    lvl: params.get('lvl') || 1,
    xp: params.get('xp') || 0,
    arma_equipada: params.get('arma') || 'Puños'
});

// --- GESTIÓN DE MODALES ---
function cerrarModales() {
    document.getElementById('modal-tienda').style.display = 'none';
    document.getElementById('modal-mochila').style.display = 'none';
    const modalEquipo = document.getElementById('modal-equipo');
    if(modalEquipo) modalEquipo.style.display = 'none';
}

// Botón Tienda
document.getElementById('btn-tienda-toggle').onclick = () => {
    const modal = document.getElementById('modal-tienda');
    const isVisible = modal.style.display === 'block';
    cerrarModales();
    if (!isVisible) modal.style.display = 'block';
};

// Botón Mochila
document.getElementById('btn-mochila-toggle').onclick = async () => {
    const modal = document.getElementById('modal-mochila');
    const isVisible = modal.style.display === 'block';
    cerrarModales();
    if (!isVisible) {
        modal.style.display = 'block';
        await cargarInventario('mochila');
    }
};

// Botón Equipo (Nuevo)
const btnEquipo = document.getElementById('btn-equipo-toggle');
if(btnEquipo) {
    btnEquipo.onclick = async () => {
        const modal = document.getElementById('modal-equipo');
        const isVisible = modal.style.display === 'block';
        cerrarModales();
        if (!isVisible) {
            modal.style.display = 'block';
            await cargarInventario('equipo');
        }
    };
}

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
    } catch (e) { 
        console.error("Error:", e); 
    }
}

// Explorar ahora muestra el mensaje de combate/recompensa
document.getElementById('btn-explorar').onclick = async () => {
    const data = await call('explorar');
    if(data && data.msg) {
        tg.showAlert(data.msg); // Usamos la alerta nativa de Telegram
    }
};

async function comprar(item_id) {
    const res = await call('comprar', { item_id });
    if (res?.success) {
        tg.showAlert(res.msg);
    } else {
        const oroContainer = document.querySelector('.gold-card');
        oroContainer.classList.add('insufficient-gold');
        setTimeout(() => oroContainer.classList.remove('insufficient-gold'), 500);
    }
}

async function cargarInventario(tipo) {
    const d = await call('get_inventario');
    // Si tipo es 'mochila' usamos lista-inv, si es 'equipo' usamos lista-equipo
    const listaId = tipo === 'mochila' ? 'lista-inv' : 'lista-equipo';
    const lista = document.getElementById(listaId);
    if(!lista) return;

    lista.innerHTML = "";
    
    if(!d.items || d.items.length === 0) {
        lista.innerHTML = "<p>Vacío</p>";
        return;
    }

    d.items.forEach(i => {
        // Detectamos si es arma por el nombre (puedes mejorar esto en el futuro)
        const esArma = i.nombre.includes("Espada") || i.nombre.includes("Lanza");

        if(tipo === 'mochila' && !esArma) {
            lista.innerHTML += `
                <div class="item">
                    <span>${i.nombre} (x${i.cantidad})</span>
                    <button onclick="usar('${i.nombre}')">Usar</button>
                </div>`;
        } else if(tipo === 'equipo' && esArma) {
            lista.innerHTML += `
                <div class="item">
                    <span>${i.nombre}</span>
                    <button onclick="equipar('${i.nombre}')">Equipar</button>
                </div>`;
        }
    });
}

async function usar(nombre_item) {
    const res = await call('usar', { nombre_item });
    if (res?.success) {
        cerrarModales();
        tg.showScanQrPopup({text: "¡Consumido!"}); // Pequeño feedback
        setTimeout(() => tg.closeScanQrPopup(), 1000);
    }
}

async function equipar(nombre_arma) {
    const res = await call('equipar_arma', { nombre_arma: nombre_arma });
    if (res?.success) {
        cerrarModales();
        tg.showAlert("Has equipado: " + nombre_arma);
    }
}
