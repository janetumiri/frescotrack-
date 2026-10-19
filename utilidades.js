function getUsuarioActual() {
    const data = localStorage.getItem('ft_usuario_actual');
    return data ? JSON.parse(data) : null;
}

function verificarSesion() {
    const user = getUsuarioActual();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

function getClaveProductos() {
    const user = getUsuarioActual();
    return user ? `ft_productos_${user.usuario}` : null;
}

function getProductos() {
    const clave = getClaveProductos();
    if (!clave) return [];
    return JSON.parse(localStorage.getItem(clave) || '[]');
}

function guardarProductos(productos) {
    const clave = getClaveProductos();
    if (clave) localStorage.setItem(clave, JSON.stringify(productos));
}

function diasParaVencer(fechaStr) {
    if (!fechaStr) return 9999; 
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fecha = new Date(fechaStr + 'T00:00:00');
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
}

function estadoProducto(fechaStr) {
    const dias = diasParaVencer(fechaStr);
    if (dias < 0) return 'vencido';
    if (dias <= 7) return 'por-vencer';
    return 'fresco';
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const f = new Date(fechaStr + 'T00:00:00');
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function aplicarTema() {
    const tema = localStorage.getItem('ft_tema') || 'light';
    if (tema === 'dark') document.body.classList.add('dark');
    actualizarTextoBotonTema();
}

function toggleTema() {
    document.body.classList.toggle('dark');
    const tema = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('ft_tema', tema);
    actualizarTextoBotonTema();
}

function actualizarTextoBotonTema() {
    const btn = document.getElementById('toggle-theme');
    if (!btn) return;
    if (document.body.classList.contains('dark')) {
        btn.textContent = 'Modo Oscuro'; 
    } else {
        btn.textContent = 'Modo Claro';
    }
}

function mostrarMsg(elemento, texto, tipo = 'error') {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = 'msg ' + tipo;
    setTimeout(() => { elemento.textContent = ''; }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    aplicarTema();
    const btn = document.getElementById('toggle-theme');
    if (btn) btn.addEventListener('click', toggleTema);
});
