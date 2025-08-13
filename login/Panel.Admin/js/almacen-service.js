// js/almacen-service.js
console.log("Cargando AlmacenService.js...");

window.AlmacenService = (function() {
    const STORAGE_KEY = 'almacenesData';
    let almacenes = {};

    // --- Funciones Privadas ---
    function cargarDatos() {
        try {
            const datosGuardados = localStorage.getItem(STORAGE_KEY);
            if (datosGuardados) {
                almacenes = JSON.parse(datosGuardados);
            } else {
                // Si no hay datos, se inicializa vacío. AlmacenModule se encargará de crear los defaults.
                almacenes = {};
            }
        } catch (error) {
            console.error("Error al cargar datos de AlmacenService:", error);
            almacenes = {};
        }
    }

    function guardarDatos() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(almacenes));
             // Disparamos un evento para que otras partes de la app sepan que el stock por ubicación cambió.
            window.dispatchEvent(new CustomEvent('almacenActualizado'));
        } catch (error) {
            console.error("Error al guardar datos de AlmacenService:", error);
        }
    }

    function obtenerAlmacenPorUbicacion(ubicacionNombre) {
        if (!ubicacionNombre) return null;
        // Busca el almacén cuyo nombre contenga la ubicación (ej: "Almacén Bogotá" contiene "Bogotá")
        const idAlmacen = Object.keys(almacenes).find(key => almacenes[key].nombre.toLowerCase().includes(ubicacionNombre.toLowerCase()));
        return idAlmacen ? almacenes[idAlmacen] : null;
    }

    // --- API Pública del Servicio ---
    const publicApi = {
        init: function() {
            cargarDatos();
        },

        obtenerAlmacenes: function() {
            return almacenes;
        },

        consultarStock: function(ubicacion, codigo) {
            const almacen = obtenerAlmacenPorUbicacion(ubicacion);
            if (almacen && almacen.productos) {
                return almacen.productos.find(p => p.codigo === codigo);
            }
            return null;
        },

        // --- FUNCIÓN MEJORADA Y FINAL ---
        actualizarStock: function(ubicacion, codigo, cantidadCambio, valorUnitario = null, modo = 'sumar') {
            const almacen = obtenerAlmacenPorUbicacion(ubicacion);
            if (!almacen) {
                console.error(`AlmacenService: No se encontró almacén para la ubicación "${ubicacion}"`);
                return;
            }

            let producto = almacen.productos.find(p => p.codigo === codigo);
            const cambioNumerico = parseInt(cantidadCambio, 10);
            
            if (producto) {
                // El producto ya existe en este almacén
                if (modo === 'reemplazar') {
                    producto.cantidad = cambioNumerico;
                } else { // modo 'sumar' (por defecto para sumas y restas)
                    producto.cantidad += cambioNumerico;
                }

                // Solo actualizamos el valor si se nos proporciona uno nuevo y válido.
                if (valorUnitario !== null && !isNaN(parseFloat(valorUnitario))) {
                    producto.valor = parseFloat(valorUnitario);
                }

            } else {
                // El producto es nuevo para este almacén (solo debería ocurrir en modo 'reemplazar')
                const productoGlobal = InventarioCompartido.buscarProducto(codigo);
                if (productoGlobal) {
                    almacen.productos.push({
                        id: 'prod_' + Date.now(),
                        codigo: codigo,
                        descripcion: productoGlobal.descripcion,
                        cantidad: cambioNumerico,
                        valor: valorUnitario || productoGlobal.valor
                    });
                     // Actualizamos la referencia a 'producto' para el log
                    producto = almacen.productos[almacen.productos.length - 1];
                } else {
                    console.error(`AlmacenService: Se intentó agregar un producto nuevo ('${codigo}') que no existe en el inventario global.`);
                    return;
                }
            }

            // Limpiamos productos con cantidad cero o menos
            almacen.productos = almacen.productos.filter(p => p.cantidad > 0);

            guardarDatos();
            console.log(`AlmacenService: Stock actualizado para ${codigo} en ${ubicacion}. Cantidad final: ${producto ? producto.cantidad : 'eliminado'}`);
        }
    };

    // Inicializamos el servicio al momento de definirlo.
    publicApi.init();
    return publicApi;
})();