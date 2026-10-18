document.addEventListener('DOMContentLoaded', () => {
    if (!verificarSesion()) return;

    const hoy = new Date().toISOString().split('T')[0];
    const inputVencimiento = document.getElementById('vencimiento');
    inputVencimiento.min = hoy;

    const categoriaSelect = document.getElementById('categoria');
    const filaVencimiento = document.getElementById('fila-vencimiento');
    const filaCuidados = document.getElementById('fila-cuidados');
    const inputCuidados = document.getElementById('cuidados');

    categoriaSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Frutas y verduras') {
            filaVencimiento.style.display = 'none';
            filaCuidados.style.display = 'flex';
            inputVencimiento.required = false;
            inputCuidados.required = true;
        } else {
            filaVencimiento.style.display = 'grid';
            filaCuidados.style.display = 'none';
            inputVencimiento.required = true;
            inputCuidados.required = false;
        }
    });

    const form = document.getElementById('form-producto');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.getElementById('msg-form');
        const esFruta = categoriaSelect.value === 'Frutas y verduras';

        const producto = {
            id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
            nombre: document.getElementById('nombre').value.trim(),
            marca: document.getElementById('marca').value.trim(),
            categoria: categoriaSelect.value,
            calorias: Number(document.getElementById('calorias').value) || 0,
            grasas: Number(document.getElementById('grasas').value) || 0,
            proteinas: Number(document.getElementById('proteinas').value) || 0,
            carbohidratos: Number(document.getElementById('carbohidratos').value) || 0,
            azucar: Number(document.getElementById('azucar').value) || 0,
            sodio: Number(document.getElementById('sodio').value) || 0,
            vencimiento: esFruta ? null : inputVencimiento.value,
            cuidados: esFruta ? inputCuidados.value.trim() : null,
            cantidad: Number(document.getElementById('cantidad').value) || 1,
            unidad: document.getElementById('unidad').value,
            notas: document.getElementById('notas').value.trim(),
            creado: new Date().toISOString()
        };

        if (!producto.nombre || (!esFruta && !producto.vencimiento)) {
            mostrarMsg(msg, 'Completá los campos obligatorios');
            return;
        }

        const productos = getProductos();
        productos.push(producto);
        guardarProductos(productos);

        mostrarMsg(msg, 'Producto guardado. Redirigiendo...', 'ok');
        
        setTimeout(() => {
            window.location.href = 'panel.html?cat=' + encodeURIComponent(producto.categoria);
        }, 1000);
    });
});
