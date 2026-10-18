document.addEventListener('DOMContentLoaded', () => {
    if (getUsuarioActual()) {
        window.location.href = 'categorias.html';
        return;
    }

    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('form-' + tab.dataset.tab).classList.add('active');
        });
    });

    const formReg = document.getElementById('form-registro');
    formReg.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('reg-nombre').value.trim();
        const usuario = document.getElementById('reg-usuario').value.trim().toLowerCase();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const msg = document.getElementById('reg-msg');

        if (password.length < 4) {
            mostrarMsg(msg, 'La contraseña debe tener al menos 4 caracteres');
            return;
        }

        const usuarios = JSON.parse(localStorage.getItem('ft_usuarios') || '[]');
        if (usuarios.some(u => u.usuario === usuario)) {
            mostrarMsg(msg, 'Ese usuario ya está registrado');
            return;
        }
        if (usuarios.some(u => u.email === email)) {
            mostrarMsg(msg, 'Ese correo ya está registrado');
            return;
        }

        usuarios.push({ nombre, usuario, email, password });
        localStorage.setItem('ft_usuarios', JSON.stringify(usuarios));

        mostrarMsg(msg, 'Cuenta creada con éxito. Ahora iniciá sesión.', 'ok');
        formReg.reset();
        
        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
        }, 1500);
    });

    const formLogin = document.getElementById('form-login');
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuario = document.getElementById('login-usuario').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const msg = document.getElementById('login-msg');

        const usuarios = JSON.parse(localStorage.getItem('ft_usuarios') || '[]');
        const user = usuarios.find(u => u.usuario === usuario && u.password === password);

        if (!user) {
            mostrarMsg(msg, 'Usuario o contraseña incorrectos');
            return;
        }

        localStorage.setItem('ft_usuario_actual', JSON.stringify({
            nombre: user.nombre,
            usuario: user.usuario,
            email: user.email
        }));
        
        window.location.href = 'bienvenida.html'; 
    });
});
