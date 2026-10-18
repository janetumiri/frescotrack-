let productos = [];
let grafico = null;

document.addEventListener('DOMContentLoaded', () => {
    const user = verificarSesion();
    if (!user) return;

    document.getElementById('usuario-nombre').textContent = 'Hola, ' + user.nombre;

    const urlParams = new URLSearchParams(window.location.search);
    const categoriaActual = urlParams.get('cat');

    if (categoriaActual) {
        document.getElementById('titulo-dashboard').textContent = categoriaActual;
        document.getElementById('filtro-categoria').value = categoriaActual;
        document.getElementById('filtro-categoria').style.display = 'none'; // Ocultar filtro, ya estamos en la categoría
    }

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('ft_usuario_actual');
        window.location.href = 'index.html';
    });

    document.getElementById('buscador').addEventListener('input', render);
    document.getElementById('filtro-categoria').addEventListener('change', render);

    document.querySelector('.modal-close').addEventListener('click', cerrarModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') cerrarModal();
    });

    cargar();
});

function cargar() {
    productos = getProductos();
    actualizarStats();
    actualizarAlertas();
    actualizarGrafico();
    render();
}

function actualizarStats() {
    const total = productos.length;
    
    // Las frutas no se vencen, así que no entran en estas cuentas
    const porVencer = productos.filter(p => p.categoria !== 'Frutas y verduras' && estadoProducto(p.vencimiento) === 'por-vencer').length;
    const vencidos = productos.filter(p => p.categoria !== 'Frutas y verduras' && estadoProducto(p.vencimiento) === 'vencido').length;
    
    const frescos = total - porVencer - vencidos;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-por-vencer').textContent = porVencer;
    document.getElementById('stat-vencidos').textContent = vencidos;
    document.getElementById('stat-frescos').textContent = frescos;
}

function actualizarAlertas() {
    const cont = document.getElementById('alertas-container');
    cont.innerHTML = '';

    const criticos = productos.filter(p => {
        if (p.categoria === 'Frutas y verduras') return false;
        const dias = diasParaVencer(p.vencimiento);
        return dias >= 0 && dias <= 7;
    }).sort((a,b) => diasParaVencer(a.vencimiento) - diasParaVencer(b.vencimiento));

    criticos.forEach(p => {
        const dias = diasParaVencer(p.vencimiento);
        const div = document.createElement('div');
        div.className = 'alerta' + (dias <= 3 ? ' peligro' : '');
        const textoDias = dias === 0 ? 'Vence HOY' : `Vence en ${dias} día${dias > 1 ? 's' : ''}`;
        div.innerHTML = `
            <span><strong>${p.nombre}</strong> — ${textoDias}</span>
            <span class="dias">${formatearFecha(p.vencimiento)}</span>
        `;
        cont.appendChild(div);
    });
}

function actualizarGrafico() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaActual = urlParams.get('cat');
    const filtrados = categoriaActual ? productos.filter(p => p.categoria === categoriaActual) : productos;

    const totalGrasas = filtrados.reduce((s, p) => s + (Number(p.grasas) || 0), 0);
    const totalProte = filtrados.reduce((s, p) => s + (Number(p.proteinas) || 0), 0);
    const totalCarb = filtrados.reduce((s, p) => s + (Number(p.carbohidratos) || 0), 0);

    const ctx = document.getElementById('grafico-macros');
    if (grafico) grafico.destroy();

    if (totalGrasas + totalProte + totalCarb === 0) {
        ctx.parentElement.innerHTML = '<p style="text-align:center;color:var(--text-soft);padding-top:100px;">Agregá productos para ver el gráfico</p>';
        return;
    }

    grafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Grasas', 'Proteínas', 'Carbohidratos'],
            datasets: [{
                data: [totalGrasas.toFixed(1), totalProte.toFixed(1), totalCarb.toFixed(1)],
                backgroundColor: ['#D8B48A', '#86A58D', '#8C9EB0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: getComputedStyle(document.body).color } }
            }
        }
    });
}

function render() {
    const grid = document.getElementById('productos-grid');
    const sin = document.getElementById('sin-productos');
    const buscar = document.getElementById('buscador').value.toLowerCase();
    
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaActual = urlParams.get('cat');
    const catFiltro = categoriaActual || document.getElementById('filtro-categoria').value;

    let lista = productos.filter(p => {
        if (buscar && !p.nombre.toLowerCase().includes(buscar) && !(p.marca || '').toLowerCase().includes(buscar)) return false;
        if (catFiltro && p.categoria !== catFiltro) return false;
        return true;
    });

    lista.sort((a,b) => new Date(a.vencimiento || '2100-01-01') - new Date(b.vencimiento || '2100-01-01'));

    grid.innerHTML = '';
    if (lista.length === 0) {
        sin.style.display = 'block';
        return;
    }
    sin.style.display = 'none';

    lista.forEach(p => {
        const esFruta = p.categoria === 'Frutas y verduras';
        let est = 'fresco';
        let dias = 0;
        let badgeTxt = 'Buen estado';
        let fechaTxt = '';

        if (!esFruta) {
            est = estadoProducto(p.vencimiento);
            dias = diasParaVencer(p.vencimiento);
            badgeTxt = est === 'fresco' ? 'Fresco' : est === 'por-vencer' ? 'Por vencer' : 'Vencido';
            fechaTxt = est === 'vencido' ? `Venció hace ${Math.abs(dias)} días` : `Vence en ${dias} días`;
        }

        const card = document.createElement('div');
        card.className = 'producto-card ' + (est === 'por-vencer' ? 'warn' : est === 'vencido' ? 'danger' : '');
        
        card.innerHTML = `
            <div class="prod-header">
                <div>
                    <h3>${p.nombre}</h3>
                    <p class="prod-marca">${p.marca || 'Sin marca'}</p>
                </div>
                ${!esFruta ? `<span class="badge ${est === 'fresco' ? 'ok' : est === 'por-vencer' ? 'warn' : 'danger'}">${badgeTxt}</span>` : ''}
            </div>
            <div class="prod-info">
                <div>Calorías<strong>${p.calorias || 0} kcal</strong></div>
                <div>Grasas<strong>${p.grasas || 0} g</strong></div>
                <div>Proteínas<strong>${p.proteinas || 0} g</strong></div>
                <div>Carbohidratos<strong>${p.carbohidratos || 0} g</strong></div>
            </div>
            <div class="prod-fecha">
                ${esFruta 
                    ? `<span style="width: 100%; color: var(--primary); font-weight: 600;">Cuidado: ${p.cuidados || 'Ninguno'}</span>`
                    : `<span>${formatearFecha(p.vencimiento)}</span><span>${fechaTxt}</span>`
                }
            </div>
        `;
        card.addEventListener('click', () => abrirModal(p));
        grid.appendChild(card);
    });
}

function abrirModal(p) {
    const esFruta = p.categoria === 'Frutas y verduras';
    let est = 'fresco';
    let dias = 0;
    
    if (!esFruta) {
        est = estadoProducto(p.vencimiento);
        dias = diasParaVencer(p.vencimiento);
    }

    document.getElementById('modal-body').innerHTML = `
        ${!esFruta ? `<span class="badge ${est === 'fresco' ? 'ok' : est === 'por-vencer' ? 'warn' : 'danger'}" style="margin-bottom:10px;display:inline-block;">${est === 'fresco' ? 'Fresco' : est === 'por-vencer' ? 'Por vencer' : 'Vencido'}</span>` : ''}
        <h2>${p.nombre}</h2>
        <p class="modal-marca">${p.marca || 'Sin marca'} · ${p.categoria}</p>

        <div class="modal-grid">
            <div><small>Calorías</small><strong>${p.calorias || 0} kcal</strong></div>
            <div><small>Grasas</small><strong>${p.grasas || 0} g</strong></div>
            <div><small>Proteínas</small><strong>${p.proteinas || 0} g</strong></div>
            <div><small>Carbohidratos</small><strong>${p.carbohidratos || 0} g</strong></div>
            <div><small>Azúcar</small><strong>${p.azucar || 0} g</strong></div>
            <div><small>Sodio</small><strong>${p.sodio || 0} mg</strong></div>
            <div><small>Cantidad</small><strong>${p.cantidad || 1} ${p.unidad || 'unidad'}</strong></div>
            ${!esFruta ? `<div><small>Vence</small><strong>${formatearFecha(p.vencimiento)}</strong></div>` : ''}
        </div>

        ${esFruta 
            ? `<div style="background:var(--bg); padding:15px; border-radius:8px; margin-top:15px;"><strong>Consejos de conservación:</strong><br>${p.cuidados || 'No especificados'}</div>`
            : `<p style="margin:15px 0;color:var(--text-soft);font-size:.9rem;">${est === 'vencido' ? `Venció hace ${Math.abs(dias)} días.` : `Vence en ${dias} días.`}</p>`
        }

        ${p.notas ? `<p style="background:var(--bg);padding:12px;border-radius:8px;font-size:.9rem;margin-top:10px;"><strong>Notas:</strong> ${p.notas}</p>` : ''}

        <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn-danger" onclick="eliminarProducto('${p.id}')">Eliminar</button>
            <button class="btn-secondary" onclick="cerrarModal()">Cerrar</button>
        </div>
    `;
    document.getElementById('modal').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('active');
}

function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    productos = productos.filter(p => p.id !== id);
    guardarProductos(productos);
    cerrarModal();
    cargar();
}