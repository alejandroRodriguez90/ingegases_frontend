 
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
            this.cargarDatosLocales();
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
            const codigoInput = document.getElementById('productoCodigo');
            const descripcionInput = document.getElementById('productoDescripcion');
            const valorInput = document.getElementById('productoValor');
            const datalist = document.getElementById('productoCodigosOptions');
            datalist.innerHTML = '';
            InventarioCompartido.obtenerProductos().forEach(p => {
                const option = document.createElement('option');
                option.value = p.codigo;
                datalist.appendChild(option);
            });
            const handleAutocomplete = () => {
                const producto = InventarioCompartido.buscarProducto(codigoInput.value);
                descripcionInput.value = producto ? producto.descripcion : '';
                valorInput.value = producto ? (producto.valor || '') : '';
            };
            if (!codigoInput._listenerAttached) {
                codigoInput.addEventListener('input', handleAutocomplete);
                codigoInput._listenerAttached = true;
            }
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
            const filas = productos.map(producto => `<tr><td>${producto.codigo}</td><td>${producto.descripcion}</td><td><div class="alm-quantity-control"><span class="alm-quantity-value">${producto.cantidad}</span></div></td><td class="alm-actions"><button class="alm-btn alm-btn-sm alm-btn-warning" onclick="AlmacenModule.modificarCantidad('${almacenId}', '${producto.id}', -1)"><i class="fas fa-minus"></i></button><button class="alm-btn alm-btn-sm alm-btn-success" onclick="AlmacenModule.modificarCantidad('${almacenId}', '${producto.id}', 1)"><i class="fas fa-plus"></i></button><button class="alm-btn alm-btn-sm alm-btn-danger" onclick="AlmacenModule.deleteProducto('${almacenId}', '${producto.id}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
            return `<div class="alm-table-responsive"><table class="alm-table"><thead><tr><th>Código</th><th>Descripción</th><th>Cantidad</th><th class="alm-actions">Acciones</th></tr></thead><tbody>${filas}</tbody></table></div><div class="alm-inventory-summary"><div class="alm-summary-item"><span>Tipos de productos:</span> <strong>${productos.length}</strong></div><div class="alm-summary-item"><span>Total unidades:</span> <strong>${productos.reduce((sum, p) => sum + (p.cantidad || 0), 0)}</strong></div></div>`;
        },
    
        // ===================================
        //         OPERACIONES CRUD
        // ===================================
        saveProducto: function() {
            this.mostrarCarga(true);
            try {
                // 1. Recolectar y validar datos (sin cambios)
                const codigo = document.getElementById('productoCodigo').value.trim().toUpperCase();
                const cantidad = parseInt(document.getElementById('productoCantidad').value, 10);
                const valor = parseFloat(document.getElementById('productoValor').value) || 0;

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

                // 2. Guardar en el servicio global (localStorage) - (Esto ya funcionaba)
                AlmacenService.actualizarStock(ubicacionNombre, codigo, cantidad, valor);

                const productoEnAlmacen = almacen.productos.find(p => p.codigo === codigo);

                if (productoEnAlmacen) {
                    // Si el producto ya estaba en la tabla, solo sumamos la cantidad
                    productoEnAlmacen.cantidad += cantidad;
                    productoEnAlmacen.valor = valor; // Y actualizamos su valor
                } else {
                    // Si era nuevo para este almacén, lo añadimos a la lista `almacen.productos`
                    almacen.productos.push({
                        id: 'prod_' + Date.now(), // ID único para las acciones de la tabla (+, -, borrar)
                        codigo: codigo,
                        descripcion: productoGlobal.descripcion,
                        cantidad: cantidad,
                        valor: valor
                    });
                }
                
                // 3. Guardamos el estado completo de los almacenes (con el nuevo producto)
                this.guardarDatosLocales();

                // 4. Cerramos la modal de agregar y refrescamos la de detalles
                this.closeModal('productoModal');
                this.refreshAlmacenDetails(); // Esta función redibuja la tabla
                
                this.mostrarNotificacion('success', 'Stock Actualizado', `${cantidad} unidades de "${codigo}" guardadas para ${ubicacionNombre}.`);

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
                if (producto.cantidad + cambio < 0) throw new Error("La cantidad no puede ser negativa.");
                const exitoGlobal = InventarioCompartido.actualizarProducto(producto.codigo, cambio);
                if (!exitoGlobal) throw new Error("Error actualizando el inventario global.");
                producto.cantidad += cambio;
                if (producto.cantidad === 0) {
                    almacen.productos = almacen.productos.filter(p => p.id !== productoId);
                    this.mostrarNotificacion('info', 'Producto Eliminado', `Se eliminó "${producto.descripcion}" del almacén al llegar a 0 unidades.`);
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
    
        deleteProducto: function(almacenId, productoId) {
            if (!confirm('¿Seguro que desea eliminar todas las unidades de este producto del almacén? Las unidades se devolverán al inventario global.')) return;
            this.mostrarCarga(true);
            try {
                const almacen = this.almacenesData[almacenId];
                const productoIndex = almacen.productos.findIndex(p => p.id === productoId);
                if (productoIndex === -1) throw new Error("Producto no encontrado.");
                const productoAEliminar = almacen.productos[productoIndex];
                const exitoGlobal = InventarioCompartido.actualizarProducto(productoAEliminar.codigo, -productoAEliminar.cantidad);
                if (!exitoGlobal) throw new Error("Error actualizando el inventario global.");
                almacen.productos.splice(productoIndex, 1);
                this.guardarDatosLocales();
                this.refreshAlmacenDetails();
                this.mostrarNotificacion('success', 'Producto Eliminado', `Se devolvieron ${productoAEliminar.cantidad} unidades de "${productoAEliminar.descripcion}" al inventario.`);
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
    