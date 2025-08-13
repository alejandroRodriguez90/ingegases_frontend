 
    window.AlmacenModule = {
        // ===================================
        //         PROPIEDADES
        // ===================================
        almacenesData: null,
        currentAlmacenId: null,
        STORAGE_KEY: 'almacenesData',
    
        // ===================================
        //         INICIALIZACIÓN
        // ===================================
        init: function() {
            // CORRECCIÓN CLAVE: Solo cargamos/creamos datos por defecto si el inventario global está VACÍO.
            if (InventarioCompartido && InventarioCompartido.obtenerProductos().length === 0) {
                console.log("Inventario global vacío. Se procederá a crear datos por defecto desde AlmacenModule.");
                this.cargarDatosLocales(); // Esta es la función que crea los datos por defecto
            } else {
                console.log("📦 Datos ya existen en InventarioCompartido. AlmacenModule no creará datos por defecto.");
                // Si ya hay datos, solo nos aseguramos de que la variable local del módulo los tenga.
                if (!this.almacenesData) {
                    this.cargarDatosLocales();
                }
            }
            
            console.log("✅ AlmacenModule.init() ejecutado. Datos cargados:", JSON.parse(JSON.stringify(this.almacenesData)));
        },
    
        cargarDatosLocales: function() {
            try {
                const datosGuardados = localStorage.getItem(this.STORAGE_KEY);
                if (datosGuardados) {
                    this.almacenesData = JSON.parse(datosGuardados);
                    console.log("📦 Datos de almacenes cargados desde localStorage.");
                } else {
                    console.warn("⚠️ No se encontraron datos de almacén. Creando por defecto.");
                    this.almacenesData = {
                        'BOG001': { id: 'BOG001', nombre: 'Almacén Bogotá', ubicacion: 'Carrera 54 #17A - 69 Bogota, Barrio Puente Aranda.', encargado: 'Santiago Ariza', contacto: 'ingegasesyredes@gmail.com', productos: [] },
                        'CAL001': { id: 'CAL001', nombre: 'Almacen Cali', ubicacion: 'Calle 12 # 68 - 109 Cali, Barrio el Limonar', encargado: 'Carlos Lopez', contacto: 'ingegasesyredes@gmail.com', productos: [] }
                    };
                    this.guardarDatosLocales();
                }
            } catch (error) {
                console.error("❌ Error crítico cargando datos de almacenes:", error);
                this.almacenesData = {};
            }
        },
    
        guardarDatosLocales: function() {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.almacenesData));
            } catch (error) {
                console.error("Error guardando datos de almacenes:", error);
            }
        },
    
        // ===================================
        //         GESTIÓN DE MODALES
        // ===================================
        openAlmacenDetails: function(almacenId) {
            if (this.almacenesData === null) {
                console.warn("⚠️ Datos no listos en el momento del clic. Forzando inicialización ahora...");
                this.init();
            }
            console.log(`🖱️ Clic para abrir el almacén: ${almacenId}.`);
            const almacen = this.almacenesData[almacenId];
            if (!almacen) {
                console.error(`❌ No se encontró ningún almacén con el id "${almacenId}".`);
                return;
            }
            this.currentAlmacenId = almacenId;
            document.getElementById('almacenModalTitle').innerText = almacen.nombre;
            document.getElementById('almacenModalBody').innerHTML = this.renderAlmacenBody(almacen);
            this.openModal('almacenDetailModal');
        },
    
        openProductoModal: function(almacenId) {
            this.currentAlmacenId = almacenId;
            document.getElementById('productoForm').reset();
            document.getElementById('productoModalTitle').innerText = "Agregar Producto";

            // 1. Obtenemos las referencias a todos los elementos del formulario
            const codigoInput = document.getElementById('productoCodigo');
            const descripcionInput = document.getElementById('productoDescripcion');
            const valorInput = document.getElementById('productoValor');
            const datalist = document.getElementById('productoCodigosOptions');

            // 2. Llenamos el datalist con todos los códigos de productos del inventario
            datalist.innerHTML = '';
            InventarioCompartido.obtenerProductos().forEach(p => {
                const option = document.createElement('option');
                option.value = p.codigo;
                option.innerText = p.descripcion; // Ayuda visual en algunos navegadores
                datalist.appendChild(option);
            });

            // 3. Creamos una función reutilizable para formatear el valor
            const formatearValor = (valorNumerico) => {
                if (isNaN(valorNumerico) || valorNumerico === null || valorNumerico === 0) {
                    return '';
                }
                return valorNumerico.toLocaleString('es-CO');
            };

            // 4. Definimos el manejador de autocompletado (¡El corazón de la funcionalidad!)
            const handleAutocomplete = () => {
                const producto = InventarioCompartido.buscarProducto(codigoInput.value);
                if (producto) {
                    // Si el código es válido, rellenamos los otros campos
                    descripcionInput.value = producto.descripcion;
                    // También rellenamos y formateamos el valor unitario que ya tiene el producto
                    valorInput.value = formatearValor(producto.valor);
                } else {
                    // Si el código se borra o no es válido, limpiamos los campos para evitar errores
                    descripcionInput.value = '';
                    valorInput.value = '';
                }
            };

            // 5. Adjuntamos los listeners, asegurándonos de hacerlo solo una vez
            
            // Listener para el campo CÓDIGO (restaura el autocompletado)
            if (!codigoInput._listenerAttached) {
                codigoInput.addEventListener('input', handleAutocomplete);
                codigoInput._listenerAttached = true;
            }

            // Listener para el campo VALOR (mantiene el formato de moneda)
            if (!valorInput._listenerAttached) {
                valorInput.addEventListener('input', (event) => {
                    let valor = event.target.value;
                    // Quita todo lo que no sea un dígito
                    let valorNumerico = parseInt(valor.replace(/\D/g, ''), 10);
                    // Vuelve a aplicar el formato
                    event.target.value = formatearValor(valorNumerico);
                });
                valorInput._listenerAttached = true;
            }

            // 6. Mostramos el modal y ponemos el foco en el campo de código
            this.openModal('productoModal');
            setTimeout(() => codigoInput.focus(), 100);
        },
    
        openModal: function(id) {
            const modal = document.getElementById(id);
            if (modal) modal.classList.add('show');
            document.body.classList.add('alm-modal-open');
        },
    
        closeModal: function(id) {
            const modal = document.getElementById(id);
            if (modal) modal.classList.remove('show');
            document.body.classList.remove('alm-modal-open');
        },
    
        // ===================================
        //         RENDERIZADO DE VISTAS
        // ===================================
        renderAlmacenBody: function(almacen) {
            const tablaHTML = almacen.productos.length > 0 ? this.generarTablaInventario(almacen.productos, almacen.id) : `<div class="alm-empty-state"><div class="alm-empty-icon"><i class="fas fa-box-open"></i></div><h4>No hay productos registrados</h4><p>Agregue productos para comenzar a gestionar el inventario</p><button class="alm-btn alm-btn-primary" onclick="AlmacenModule.openProductoModal('${almacen.id}')"><i class="fas fa-plus"></i> Agregar primer producto</button></div>`;
            return `<div class="alm-modal-section"><div class="alm-info-header"><div class="alm-info-icon"><i class="fas fa-warehouse"></i></div><div><h3 class="alm-section-title">${almacen.nombre}</h3><p class="alm-info-subtitle">${almacen.ubicacion}</p></div></div><div class="alm-info-grid"><div class="alm-info-card"><i class="fas fa-user-tie alm-info-card-icon"></i><h4>Encargado</h4><p>${almacen.encargado}</p></div><div class="alm-info-card"><i class="fas fa-envelope alm-info-card-icon"></i><h4>Contacto</h4><p><a href="mailto:${almacen.contacto}">${almacen.contacto}</a></p></div></div></div><div class="alm-modal-section"><div class="alm-section-header"><h3 class="alm-section-title"><i class="fas fa-boxes"></i> Inventario</h3><button class="alm-btn alm-btn-primary" onclick="AlmacenModule.openProductoModal('${almacen.id}')"><i class="fas fa-plus"></i> Agregar Producto</button></div>${tablaHTML}</div>`;
        },
    
        generarTablaInventario: function(productos, almacenId) {
    
            const filas = productos.map(producto => `
                <tr>
                    <td>${producto.codigo}</td>
                    <td>${producto.descripcion}</td>
                    <td>
                        <div class="alm-quantity-control">
                            <span class="alm-quantity-value">${producto.cantidad}</span>
                        </div>
                    </td>
                    
                    <!-- AHORA: Columna para el valor total calculado -->
                    <td>
                        <strong>
                            ${( (producto.cantidad || 0) * (producto.valor || 0) ).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                        </strong>
                    </td>

                    <td class="alm-actions">
                        <button class="alm-btn alm-btn-sm alm-btn-warning" onclick="AlmacenModule.modificarCantidad('${almacenId}', '${producto.id}', -1)"><i class="fas fa-minus"></i></button>
                        <button class="alm-btn alm-btn-sm alm-btn-success" onclick="AlmacenModule.modificarCantidad('${almacenId}', '${producto.id}', 1)"><i class="fas fa-plus"></i></button>
                        <button class="alm-btn alm-btn-sm alm-btn-danger" onclick="AlmacenModule.deleteProducto('${almacenId}', '${producto.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');

            // Los cálculos para el resumen se mantienen igual y son correctos.
            const totalUnidades = productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
            const valorTotalInventario = productos.reduce((sum, p) => sum + ( (p.cantidad || 0) * (p.valor || 0) ), 0);

            return `
                <div class="alm-table-responsive">
                    <table class="alm-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Valor Total</th>  <!-- CAMBIO: Se eliminó "Valor Unit." -->
                                <th class="alm-actions">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
                <div class="alm-inventory-summary">
                    <div class="alm-summary-item"><span>Tipos de productos:</span> <strong>${productos.length}</strong></div>
                    <div class="alm-summary-item"><span>Total unidades:</span> <strong>${totalUnidades}</strong></div>
                    <div class="alm-summary-item">
                        <span>Valor Total Inventario:</span> 
                        <strong>${valorTotalInventario.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong>
                    </div>
                </div>
            `;
        },
    
        // ===================================
        //         OPERACIONES CRUD
        // ===================================
        saveProducto: function() {
            this.mostrarCarga(true);
            try {
                // --- 1. Recolectar y Validar Datos ---
                const codigo = document.getElementById('productoCodigo').value.trim().toUpperCase();
                const cantidad = parseInt(document.getElementById('productoCantidad').value, 10);
                const valorInput = document.getElementById('productoValor').value || '0';
                const valorNumerico = parseFloat(valorInput.replace(/\./g, ''));

                if (!codigo || !cantidad || cantidad <= 0) {
                    throw new Error("El Código y una Cantidad positiva son requeridos.");
                }
                const productoGlobal = InventarioCompartido.buscarProducto(codigo);
                if (!productoGlobal) {
                    throw new Error(`El código de producto "${codigo}" no es válido.`);
                }

                const almacen = this.almacenesData[this.currentAlmacenId];
                if (!almacen) {
                    throw new Error("No se ha seleccionado un almacén.");
                }
                const ubicacionNombre = almacen.nombre.includes('Bogotá') ? 'Bogotá' : 'Cali';

                // --- 2. Actualizar Servicios de Datos ---
                
                // 2.1: Actualizamos el stock GLOBAL, usando el modo 'reemplazar'
                InventarioCompartido.actualizarProducto(codigo, cantidad, valorNumerico, ubicacionNombre, 'reemplazar');

                // 2.2: Actualizamos el stock por ubicación (Lógica de AlmacenService)
                if (window.AlmacenService) {
                    AlmacenService.actualizarStock(ubicacionNombre, codigo, cantidad, valorNumerico, 'reemplazar');
                }
                
                // --- 3. Actualizar la Vista Local del Modal ---
                const productoEnAlmacen = almacen.productos.find(p => p.codigo === codigo);
                if (productoEnAlmacen) {
                    productoEnAlmacen.cantidad = cantidad; 
                    productoEnAlmacen.valor = valorNumerico;
                } else {
                    almacen.productos.push({
                        id: 'prod_' + Date.now(),
                        codigo: codigo,
                        descripcion: productoGlobal.descripcion,
                        cantidad: cantidad,
                        valor: valorNumerico
                    });
                }
                
                // --- 4. Guardar, Refrescar y Notificar ---
                this.guardarDatosLocales();
                this.closeModal('productoModal');
                this.refreshAlmacenDetails();
                
                this.mostrarNotificacion(
                    'success',
                    'Guardado Exitosamente', 
                    `Stock para <strong>${codigo}</strong> establecido en <strong>${cantidad}</strong>.`
                );

            } catch (error) {
                console.error("❌ Error en saveProducto:", error);
                this.mostrarNotificacion('error', 'Error al Guardar', error.message);
            } finally {
                this.mostrarCarga(false);
            }
        },
       
       modificarCantidad: function(almacenId, productoId, cambio) {
            this.mostrarCarga(true);
            try {
                const almacen = this.almacenesData[almacenId];
                const producto = almacen.productos.find(p => p.id === productoId);
                if (!producto) throw new Error("Producto no encontrado en el almacén.");
                
                if (producto.cantidad + cambio < 0) {
                    this.mostrarNotificacion('warning', 'Operación denegada', 'La cantidad no puede ser negativa.');
                    this.mostrarCarga(false); // No olvides ocultar el loader aquí
                    return;
                }

                const ubicacionNombre = almacen.nombre.includes('Bogotá') ? 'Bogotá' : 'Cali';

                // --- ¡¡¡LA CORRECCIÓN CLAVE!!! ---
                // Ahora informamos al AlmacenService del cambio en cantidad Y valor.
                // Tu service está diseñado para tomar un 'cambio' y el 'valor unitario' de ese cambio.
                if (window.AlmacenService) {
                    AlmacenService.actualizarStock(ubicacionNombre, producto.codigo, cambio, producto.valor);
                } else {
                    console.warn("AlmacenService no está disponible para actualizar el stock por ubicación.");
                }

                // Actualizamos también el inventario global para consistencia general.
                InventarioCompartido.actualizarProducto(producto.codigo, cambio, producto.valor);

                // Actualizamos la cantidad en el estado LOCAL del modal.
                producto.cantidad += cambio;

                if (producto.cantidad === 0) {
                    almacen.productos = almacen.productos.filter(p => p.id !== productoId);
                    this.mostrarNotificacion('info', 'Producto Retirado', `Se retiró "${producto.descripcion}" del almacén.`);
                }

                this.guardarDatosLocales();
                this.refreshAlmacenDetails();
            } catch (error) {
                console.error("❌ Error en modificarCantidad:", error);
                this.mostrarNotificacion('error', 'Error', error.message);
            } finally {
                this.mostrarCarga(false);
            }
        },

        // ¡¡¡VERSIÓN FINAL Y CORREGIDA de deleteProducto!!!
        deleteProducto: function(almacenId, productoId) {
            if (!confirm('¿Seguro que desea eliminar todas las unidades de este producto del almacén?')) return;
            this.mostrarCarga(true);
            try {
                const almacen = this.almacenesData[almacenId];
                const productoIndex = almacen.productos.findIndex(p => p.id === productoId);
                if (productoIndex === -1) throw new Error("Producto no encontrado.");
                
                const productoAEliminar = almacen.productos[productoIndex];
                const cantidadARestar = -productoAEliminar.cantidad; // El cambio es la cantidad total en negativo

                const ubicacionNombre = almacen.nombre.includes('Bogotá') ? 'Bogotá' : 'Cali';

                // --- ¡¡¡LA CORRECCIÓN CLAVE!!! ---
                // Informamos al AlmacenService que estamos quitando TODAS las unidades.
                if (window.AlmacenService) {
                    AlmacenService.actualizarStock(ubicacionNombre, productoAEliminar.codigo, cantidadARestar, productoAEliminar.valor);
                }

                // Informamos al inventario global para que también reste las unidades.
                InventarioCompartido.actualizarProducto(productoAEliminar.codigo, cantidadARestar);
                
                // Eliminamos el producto de la lista local del modal.
                almacen.productos.splice(productoIndex, 1);
                
                this.guardarDatosLocales();
                this.refreshAlmacenDetails();
                this.mostrarNotificacion('success', 'Producto Eliminado', `Se retiraron ${productoAEliminar.cantidad} unidades de "${productoAEliminar.descripcion}".`);
            } catch (error) {
                console.error("❌ Error en deleteProducto:", error);
                this.mostrarNotificacion('error', 'Error', error.message);
            } finally {
                this.mostrarCarga(false);
            }
        },

    
        // ===================================
        //         FUNCIONES UTILITARIAS
        // ===================================
        refreshAlmacenDetails: function() {
            if (this.currentAlmacenId) {
                const almacen = this.almacenesData[this.currentAlmacenId];
                if (almacen) {
                    document.getElementById('almacenModalBody').innerHTML = this.renderAlmacenBody(almacen);
                }
            }
        },
    
        mostrarCarga: function(mostrar) {
            let loader = document.getElementById('globalLoader');
            if (mostrar && !loader) {
                loader = document.createElement('div');
                loader.id = 'globalLoader';
                loader.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;`;
                loader.innerHTML = `<div style="width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #3498db;border-radius:50%;animation:spin 1s linear infinite;"></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`;
                document.body.appendChild(loader);
            }
            if (loader) loader.style.display = mostrar ? 'flex' : 'none';
        },
    
        mostrarNotificacion: function(tipo, titulo, mensaje) {
            const notifAnterior = document.getElementById('almNotificacion');
            if (notifAnterior) notifAnterior.remove();
            const iconos = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
            const notificacion = document.createElement('div');
            notificacion.id = 'almNotificacion';
            const bgColor = { success: '#d4edda', error: '#f8d7da', warning: '#fff3cd', info: '#d1ecf1' };
            const textColor = { success: '#155724', error: '#721c24', warning: '#856404', info: '#0c5460' };
            notificacion.innerHTML = `<div style="position:fixed;bottom:20px;right:20px;padding:15px 20px;background:${bgColor[tipo]||'#d1ecf1'};color:${textColor[tipo]||'#0c5460'};border:1px solid ${bgColor[tipo]||'#bee5eb'};border-radius:5px;box-shadow:0 4px 8px rgba(0,0,0,0.1);z-index:10000;display:flex;align-items:center;gap:10px;"><span style="font-size:1.5em;">${iconos[tipo]||'ℹ️'}</span><div><strong>${titulo}</strong><br>${mensaje}</div></div>`;
            document.body.appendChild(notificacion);
            setTimeout(() => { if (document.getElementById('almNotificacion')) document.getElementById('almNotificacion').remove() }, 5000);
        },
        
        guardarInventario: function() {
            this.mostrarNotificacion('info', 'Guardado', 'Los cambios se guardan automáticamente.');
            this.closeModal('almacenDetailModal');
        },
    
        exportarInventario: function() {
            alert("Función de exportar inventario en desarrollo.");
        }
    };
    