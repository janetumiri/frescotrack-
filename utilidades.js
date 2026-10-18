// ============================================================
// UTILIDADES - FrescoTrack
// ============================================================

/** Devuelve el usuario logueado o null */
function getUsuarioActual() {
    const data = localStorage.getItem('ft_usuario_actual');
    return data ? JSON.parse(data) : null;
}

/** Verifica sesión, redirige si no está logueado */
function verificarSesion() {
    const user = getUsuarioActual();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

/** Obtiene la clave de productos del usuario actual */
function getClaveProductos() {
    const user = getUsuarioActual();
    return user ? `ft_productos_${user.usuario}` : null;
}

/** Devuelve todos los productos del usuario */
function getProductos() {
    const clave = getClaveProductos();
    if (!clave) return [];
    return JSON.parse(localStorage.getItem(clave) || '[]');
}

/** Guarda el array de productos */
function guardarProductos(productos) {
    const clave = getClaveProductos();
    if (clave) localStorage.setItem(clave, JSON.stringify(productos));
}

/** Calcula los días que faltan hasta el vencimiento */
function diasParaVencer(fechaStr) {
    if (!fechaStr) return 9999; 
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fecha = new Date(fechaStr + 'T00:00:00');
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
}

/** Devuelve el estado: fresco | por-vencer | vencido */
function estadoProducto(fechaStr) {
    const dias = diasParaVencer(fechaStr);
    if (dias < 0) return 'vencido';
    if (dias <= 7) return 'por-vencer';
    return 'fresco';
}

/** Formatea fecha legible */
function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const f = new Date(fechaStr + 'T00:00:00');
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Aplica el tema guardado */
function aplicarTema() {
    const tema = localStorage.getItem('ft_tema') || 'light';
    if (tema === 'dark') document.body.classList.add('dark');
    actualizarTextoBotonTema();
}

/** Cambia entre claro y oscuro */
function toggleTema() {
    document.body.classList.toggle('dark');
    const tema = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('ft_tema', tema);
    actualizarTextoBotonTema();
}

/** Actualiza el texto del botón según el MODO ACTUAL */
function actualizarTextoBotonTema() {
    const btn = document.getElementById('toggle-theme');
    if (!btn) return;
    
    // Si el body tiene la clase dark, significa que estamos en modo oscuro
    if (document.body.classList.contains('dark')) {
        btn.textContent = 'Modo Oscuro'; 
    } else {
        btn.textContent = 'Modo Claro';
    }
}

/** Mensaje temporal */
function mostrarMsg(elemento, texto, tipo = 'error') {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = 'msg ' + tipo;
    setTimeout(() => { elemento.textContent = ''; }, 4000);
}

// Aplicar tema al cargar
document.addEventListener('DOMContentLoaded', () => {
    aplicarTema();
    const btn = document.getElementById('toggle-theme');
    if (btn) btn.addEventListener('click', toggleTema);
});