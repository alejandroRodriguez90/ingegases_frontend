document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que el formulario se envíe

    // Obtener los valores ingresados por el usuario
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;


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

