// index.js
document.addEventListener('DOMContentLoaded', () => {
    const inicioLink = document.querySelector('nav ul li:first-child a');

    inicioLink.addEventListener('click', (event) => {
        event.preventDefault(); // Evita la navegación predeterminada del enlace

        // Redirige al usuario a la página de login.html
        window.location.href = '../login/login.html';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Función para el scroll suave
    const smoothScroll = (targetId, offset = 0) => {
        const targetSection = document.querySelector(targetId); // Selecciona la sección destino

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth', // Desplazamiento suave
                block: 'center'      // Centra la sección en la pantalla
            });
        }
    };

    // Aplica el scroll suave a los enlaces del navbar
    const serviciosLink = document.querySelector('a[href="#servicios"]');
    const productosLink = document.querySelector('a[href="#productos"]');
    const contactoLink = document.querySelector('a[href="#contacto"]');
    const botonInformacion = document.querySelector('.boton-informacion'); // Selecciona el botón por clase

    if (serviciosLink) {
        serviciosLink.addEventListener('click', (event) => {
            event.preventDefault(); // Evita el comportamiento predeterminado del enlace
            smoothScroll('#servicios'); // Desplazamiento suave a Servicios
        });
    }

    if (productosLink) {
        productosLink.addEventListener('click', (event) => {
            event.preventDefault(); // Evita el comportamiento predeterminado del enlace
            smoothScroll('#productos'); // Desplazamiento suave a Productos
        });
    }

    if (contactoLink) {
        contactoLink.addEventListener('click', (event) => {
            event.preventDefault(); // Evita el comportamiento predeterminado del enlace
            smoothScroll('#contacto'); // Desplazamiento suave a Contacto
        });
    }
    
    // Agrega el evento al botón "Información" con un offset específico
    
    if (botonInformacion) {
        botonInformacion.addEventListener('click', () => {
            smoothScroll('#tipos-servicios', 5000); // Desplazamiento suave a Tipos de Servicios con un offset de 100px
        });
    }
});