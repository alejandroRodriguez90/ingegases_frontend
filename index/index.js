document.addEventListener('DOMContentLoaded', () => {
    // Función mejorada de scroll suave con offsets específicos
    const smoothScroll = (targetId, customOffset = -150) => {
        const targetElement = document.querySelector(targetId);
        
        if (!targetElement) {
            console.error(`Elemento no encontrado: ${targetId}`);
            return;
        }

        const targetPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = targetPosition + window.pageYOffset - customOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    // Configuración de eventos para navegación
    const setupNavigation = () => {
        // Enlace "Quiénes Somos"
        const quienesSomosLink = document.querySelector('a[href="#quienes_somos"]');
        if (quienesSomosLink) {
            quienesSomosLink.addEventListener('click', (e) => {
                e.preventDefault();
                smoothScroll('#quienes_somos', -150);
                setActiveLink(quienesSomosLink);
            });
        }

        // Enlace "Servicios"
        const serviciosLink = document.querySelector('a[href="#servicios"]');
        if (serviciosLink) {
            serviciosLink.addEventListener('click', (e) => {
                e.preventDefault();
                smoothScroll('#servicios', -80);
                setActiveLink(serviciosLink);
            });
        }

        // Enlace "Contacto"
        const contactoLink = document.querySelector('a[href="#contacto"]');
        if (contactoLink) {
            contactoLink.addEventListener('click', (e) => {
                e.preventDefault();
                smoothScroll('#contacto', 100);
                setActiveLink(contactoLink);
            });
        }

        // Botón de Login - Redirige a login.html
        const loginButton = document.querySelector('.boton-login');
        if (loginButton) {
            loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '../login/login.html';
            });
        }
    };

    // Función para establecer el enlace activo
    const setActiveLink = (activeLink) => {
        document.querySelectorAll('.navbar a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    };

    // Observador de intersección para secciones con offsets personalizados
    const setupIntersectionObserver = () => {
        const sectionConfigs = [
            { id: 'quienes_somos', offset: -150 },
            { id: 'servicios', offset: -80 },
            { id: 'contacto', offset: 100 }
        ];

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const correspondingLink = document.querySelector(`.navbar a[href="#${id}"]`);
                    
                    if (correspondingLink) {
                        setActiveLink(correspondingLink);
                    }
                }
            });
        }, { 
            threshold: 0.3,
            rootMargin: '-100px 0px -160px 0px'
        });

        sectionConfigs.forEach(config => {
            const section = document.querySelector(`#${config.id}`);
            if (section) observer.observe(section);
        });
    };

    // Animación de estadísticas
    const animateStats = () => {
        const statsNumbers = document.querySelectorAll('.ingegases-stat-number');
        
        statsNumbers.forEach(number => {
            const target = parseInt(number.getAttribute('data-count'));
            const suffix = number.textContent.includes('+') ? '+' : '';
            const duration = 2000;
            
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    let start = 0;
                    const end = target;
                    const increment = end / (duration / 16);
                    
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            clearInterval(timer);
                            number.textContent = end + suffix;
                            number.classList.add('animated');
                        } else {
                            number.textContent = Math.floor(start) + suffix;
                        }
                    }, 16);
                    
                    observer.unobserve(number);
                }
            }, { threshold: 0.5 });
            
            observer.observe(number);
        });
    };
    
    

    // Inicialización
    setupNavigation();
    setupIntersectionObserver();
    animateStats();
    setupSubmenus();
});


