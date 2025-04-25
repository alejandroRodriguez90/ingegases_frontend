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

/* recuerdame */

document.addEventListener('DOMContentLoaded', function() {
    const rememberCheckbox = document.getElementById('rememberMe');
    const loginForm = document.querySelector('form'); // Asegúrate de que esto seleccione tu formulario de login
  
    // Cargar estado guardado al iniciar la página
    if (localStorage.getItem('rememberMe') === 'true') {
      rememberCheckbox.checked = true;
      // Cargar datos guardados si existen
      const savedData = JSON.parse(localStorage.getItem('loginData'));
      if (savedData) {
        Object.keys(savedData).forEach(key => {
          const input = loginForm.querySelector(`[name="${key}"]`);
          if (input) input.value = savedData[key];
        });
      }
    }
  
    // Manejar el envío del formulario
    loginForm.addEventListener('submit', function(e) {
      if (rememberCheckbox.checked) {
        // Guardar datos del formulario
        const formData = {};
        Array.from(loginForm.elements).forEach(element => {
          if (element.name && element.value) {
            formData[element.name] = element.value;
          }
        });
        localStorage.setItem('loginData', JSON.stringify(formData));
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Eliminar datos guardados
        localStorage.removeItem('loginData');
        localStorage.removeItem('rememberMe');
      }
    });
  });

