document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que el formulario se envíe

    // Obtener los valores ingresados por el usuario
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Credenciales válidas

    const validUsers = [
        { username: 'admin', password: '1234', redirect: '../dashboard/admin-dashboard.html' }, // Ruta relativa corregida
        { username: 'user', password: '1234', redirect: '../user/user-dashboard.html' }  // Ruta relativa corregida
    ];



    // Validar las credenciales
    const user = validUsers.find(user => user.username === username && user.password === password);

    // Mostrar mensaje de error o redirigir
    const errorMessage = document.getElementById('error-message');
    if (user) {
        // Redirigir a la página correspondiente
        window.location.href = user.redirect;
    } else {
        // Mostrar mensaje de error
        errorMessage.classList.remove('hidden');
        errorMessage.textContent = 'Usuario o contraseña incorrectos';
    }
});

