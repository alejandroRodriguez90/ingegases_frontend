// js/proveedores-module.js

window.ProveedoresModule = (function() {

    // --- DATOS PRIVADOS DEL MÓDULO ---
    // El array de proveedores y el ID de edición.
    let proveedoresData = [];
    let editingProviderId = null;

    // --- INTERFAZ PÚBLICA DEL MÓDULO ---
    return {

        /**
         * Función de inicialización, llamada por el dashboard.
         * Prepara el módulo para su uso, reseteando los datos.
         */
        init: function() {
            console.log("✅ Módulo de Proveedores listo para usar.");
            this.editingProviderId = null;
            
            // CORRECCIÓN: Los datos de proveedores ahora empiezan como un array vacío.
            // Se poblarán a medida que el usuario los registre.
            proveedoresData = [];
        },

        /**
         * Muestra la vista de detalle (formulario o directorio).
         */
        showDetailScreen: function() {
            document.querySelector('.proveedores-main-screen').style.display = 'none';
            document.querySelector('.proveedores-detail-screen').style.display = 'block';
        },
        
        /**
         * Carga el formulario para registrar o editar un proveedor.
         */
        loadRegistrarProveedor: function(providerId = null) {
            this.showDetailScreen();
            this.editingProviderId = providerId;
            
            let proveedor = {};
            let titulo = "Registrar Nuevo Proveedor";
            let botonTexto = "Guardar Proveedor";

            if (providerId) {
                proveedor = proveedoresData.find(p => p.id === providerId) || {};
                titulo = "Editar Proveedor";
                botonTexto = "Actualizar Cambios";
            }

            document.getElementById('proveedoresContent').innerHTML = `
                <form class="form-proveedor" id="formProveedor">
                    <h3>${titulo}</h3>
                    <div class="form-row"><div class="form-group"><label for="provNombre">Nombre o Razón Social</label><input type="text" id="provNombre" value="${proveedor.nombre || ''}" required></div><div class="form-group"><label for="provNit">NIT o Cédula</label><input type="text" id="provNit" value="${proveedor.nit || ''}" required></div></div>
                    <div class="form-row"><div class="form-group"><label for="provDireccion">Dirección</label><input type="text" id="provDireccion" value="${proveedor.direccion || ''}"></div><div class="form-group"><label for="provCiudad">Ciudad</label><input type="text" id="provCiudad" value="${proveedor.ciudad || ''}"></div></div>
                    <div class="form-row"><div class="form-group"><label for="provTelefono">Teléfono</label><input type="text" id="provTelefono" value="${proveedor.telefono || ''}"></div><div class="form-group"><label for="provEmail">Email</label><input type="email" id="provEmail" value="${proveedor.email || ''}"></div></div>
                    
                    <!-- ===== ESTE ES EL BLOQUE CORREGIDO ===== -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="provContacto">Nombre de Contacto</label>
                            <input type="text" id="provContacto" value="${proveedor.contacto || ''}">
                        </div>
                        <div class="form-group">
                            <label for="provCategoria">Categoría</label>
                            <select id="provCategoria">
                                <option value="">Seleccione...</option>
                                <option value="Tubería" ${proveedor.categoria === 'Tubería' ? 'selected' : ''}>Tubería</option>
                                <option value="Accesorios" ${proveedor.categoria === 'Accesorios' ? 'selected' : ''}>Accesorios</option>
                                <option value="Otros" ${proveedor.categoria === 'Otros' ? 'selected' : ''}>Otros</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row"><div class="form-group full-width"><label for="provNotas">Notas</label><textarea id="provNotas">${proveedor.notas || ''}</textarea></div></div>
                    <div class="action-buttons"><button type="button" class="btn btn-secondary" onclick="ProveedoresModule.backToMain()">Cancelar</button><button type="submit" class="btn btn-success">${botonTexto}</button></div>
                </form>`;

            document.getElementById('formProveedor').addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProveedor();
            });
        },

        /**
         * Carga la tabla con el directorio de proveedores existentes.
         */
        loadDirectorioProveedores: function() {
            this.showDetailScreen();
            this.editingProviderId = null;
            
            const tableRows = proveedoresData.map(prov => `
                <tr>
                    <td>${prov.nombre}</td>
                    <td>${prov.nit}</td>
                    <td>${prov.contacto || 'N/A'}</td>
                    <td>${prov.telefono || 'N/A'}</td>
                    <td>${prov.categoria || 'N/A'}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm btn-primary" onclick="ProveedoresModule.loadRegistrarProveedor('${prov.id}')" title="Ver / Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="ProveedoresModule.deleteProveedor('${prov.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`).join('');

            document.getElementById('proveedoresContent').innerHTML = `
                <div class="directorio-container">
                    <div class="directorio-header"><h2>Directorio de Proveedores</h2></div>
                    <div class="table-responsive"><table class="proveedores-table"><thead><tr><th>Nombre</th><th>NIT</th><th>Contacto</th><th>Teléfono</th><th>Categoría</th><th class="actions-cell">Acciones</th></tr></thead><tbody>${tableRows}</tbody></table></div>
                </div>`;
        },

        /**
         * Vuelve a la pantalla principal del módulo.
         */
        backToMain: function() {
            this.editingProviderId = null;
            document.querySelector('.proveedores-main-screen').style.display = 'block';
            document.querySelector('.proveedores-detail-screen').style.display = 'none';
        },

        /**
         * Guarda un nuevo proveedor o actualiza uno existente.
         */
        saveProveedor: function() {
            const nombre = document.getElementById('provNombre').value;
            const nit = document.getElementById('provNit').value;
            if (!nombre || !nit) {
                alert('El Nombre y el NIT son campos obligatorios.');
                return;
            }

            const proveedorData = {
                nombre, nit,
                direccion: document.getElementById('provDireccion').value,
                ciudad: document.getElementById('provCiudad').value,
                telefono: document.getElementById('provTelefono').value,
                email: document.getElementById('provEmail').value,
                contacto: document.getElementById('provContacto').value,
                categoria: document.getElementById('provCategoria').value,
                notas: document.getElementById('provNotas').value,
            };

            if (this.editingProviderId) {
                // Actualiza
                const index = proveedoresData.findIndex(p => p.id === this.editingProviderId);
                if (index > -1) {
                    proveedoresData[index] = { ...proveedoresData[index], ...proveedorData };
                    alert('Proveedor actualizado exitosamente.');
                }
            } else {
                // Crea
                proveedorData.id = 'PROV' + String(Date.now()).slice(-4);
                proveedoresData.push(proveedorData);
                alert('Proveedor registrado exitosamente.');
            }

            this.editingProviderId = null;
            this.loadDirectorioProveedores();
        },

        /**
         * Elimina un proveedor del directorio.
         */
        deleteProveedor: function(providerId) {
            const proveedor = proveedoresData.find(p => p.id === providerId);
            if (proveedor && confirm(`¿Está seguro de que desea eliminar a "${proveedor.nombre}"? Esta acción no se puede deshacer.`)) {
                proveedoresData = proveedoresData.filter(p => p.id !== providerId);
                alert('Proveedor eliminado.');
                this.loadDirectorioProveedores();
            }
        }
    };
})();