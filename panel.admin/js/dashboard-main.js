document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM completamente cargado. Iniciando el director: dashboard-main.js");

    // Inicializa los servicios/datos compartidos que son globales para toda la app.
    InventarioCompartido.init();
    AlmacenModule.init(); 

    // Adjunta la función de carga al objeto 'window' para que los 'onclick' del HTML la puedan llamar.
    window.loadModule = function(moduleName) {
        
        const dynamicContentElement = document.getElementById('dynamicContent');
        if (!dynamicContentElement) {
            console.error("❌ ERROR CRÍTICO: No se pudo encontrar el contenedor #dynamicContent.");
            return;
        }

        console.log(`Solicitando cargar el módulo: ${moduleName}`);
        fetch(`modules/${moduleName}.html`)
            .then(response => {
                if (!response.ok) throw new Error(`Respuesta de red no fue OK para ${moduleName}.html`);
                return response.text();
            })
            .then(html => {
                console.log(`HTML del módulo '${moduleName}' cargado. Inyectando en el DOM...`);
                dynamicContentElement.innerHTML = html;

                console.log(`Llamando al inicializador (.init()) del módulo '${moduleName}'...`);
                // Después de inyectar el HTML, el "Director" decide qué "Músico" debe activarse.
                switch (moduleName) {
                    case 'inventario':
                        if (window.InventarioModule) InventarioModule.init();
                        break;
                    case 'almacen':
                        // Dejamos este vacío intencionalmente por ahora.
                        // Si el módulo de almacén necesita ejecutar algo tras la carga, se añade aquí.
                        break;
                    case 'soporte': 
                        if (window.SoporteModule) SoporteModule.init();
                        break;
                     case 'proyectos': 
                        if (window.ProyectosModule) ProyectosModule.init();
                        break;
                    case 'requisicion':
                        if (window.RequisicionesModule) RequisicionesModule.init();
                        break;
                    case 'proveedores': 
                        if (window.ProveedoresModule) ProveedoresModule.init();
                        break;
                    // Aquí añadirás los casos para 'proyectos', 'requisicion', etc.
                }
            })
            .catch(error => {
                console.error(`Hubo un error al cargar el módulo ${moduleName}:`, error);
                dynamicContentElement.innerHTML = `<p class="error-msg">Error cargando ${moduleName}.</p>`;
            });
    }

    console.log("Dashboard listo. El sistema está a la espera de acciones del usuario.");
});