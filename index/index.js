document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    // FUNCIONALIDADES EXISTENTES
    // =============================================

    // 1. Scroll suave mejorado
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

    // 2. Configuración de navegación
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

        // Botón de Login
        const loginButton = document.querySelector('.boton-login');
        if (loginButton) {
            loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '../login/login.html';
            });
        }
    };

    // 3. Establecer enlace activo
    const setActiveLink = (activeLink) => {
        document.querySelectorAll('.navbar a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    };

    // 4. Observador de intersección
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



    

    // =============================================
    // INICIALIZACIÓN DE TODAS LAS FUNCIONALIDADES
    // =============================================
    setupNavigation();
    setupIntersectionObserver();
    animateStats();


    // =============================================
    // CÓDIGO DEL MENÚ RESPONSIVE
    // =============================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarUl = document.querySelector('.navbar ul');
    const hasSubmenus = document.querySelectorAll('.has-submenu');

    if (menuToggle && navbarUl) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navbarUl.classList.toggle('active');

            if (!navbarUl.classList.contains('active')) {
                hasSubmenus.forEach(item => {
                    item.classList.remove('active');
                });
            }
        });

        hasSubmenus.forEach(item => {
            const link = item.querySelector('a');

            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    const clickedOnSubmenuLink = e.target.closest('.submenu a');
                    if (clickedOnSubmenuLink) return;

                    e.preventDefault();
                    e.stopPropagation();

                    hasSubmenus.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                        }
                    });

                    item.classList.toggle('active');
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                hasSubmenus.forEach(item => item.classList.remove('active'));
            }
        });

        document.addEventListener('click', function(e) {
            if (!navbarUl.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navbarUl.classList.remove('active');
                hasSubmenus.forEach(item => item.classList.remove('active'));
            }
        });

        navbarUl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && link.parentElement.classList.contains('has-submenu')) {
                    return;
                } else {
                    setTimeout(() => {
                        menuToggle.classList.remove('active');
                        navbarUl.classList.remove('active');
                        hasSubmenus.forEach(item => item.classList.remove('active'));
                    }, 100);
                }
            });
        });
    }
});