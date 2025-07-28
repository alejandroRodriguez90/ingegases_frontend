// js/requisicion-module.js

window.RequisicionesModule = (function() {
    
    // El array de historial ahora empieza vacío, listo para ser poblado con datos reales.
    let historyData = [];

    // Objeto público que se retorna. Todas las funciones accesibles desde fuera deben estar aquí.
    return {

        /**
         * Inicializa el módulo, reseteando los datos para un inicio limpio.
         */
        init: function() {
            console.log("✅ Módulo de Requisiciones listo para usar.");
            historyData = [];
        },
        
        /**
         * Muestra la vista para crear una nueva requisición.
         */
        loadCrearRequisicion: function() {
            document.querySelector('.requisiciones-main-screen').style.display = 'none';
            document.querySelector('.requisiciones-detail-screen').style.display = 'block';
            
            document.getElementById('requisicionesContent').innerHTML = `
                <div class="requisicion-form">
                    <div class="form-header"><h3>SISTEMA INTEGRADO DE GESTIÓN</h3><h4>REQUISICIÓN DE BIENES Y/O SERVICIOS</h4><div class="form-header-details"><span>CÓDIGO: CP-RQ-01</span><span>FECHA: <span id="currentDate">${new Date().toISOString().split('T')[0]}</span></span><span>VERSIÓN: 1</span><span>PÁGINA: 1 DE 1</span></div></div>
                    <div class="form-row"><div class="form-group"><label for="solicitante">SOLICITA:</label><input type="text" id="solicitante" name="solicitante" placeholder="Ingrese el solicitante"></div><div class="form-group"><label for="proyecto">NOMBRE PROYECTO:</label><input type="text" id="proyecto" name="proyecto" placeholder="Ingrese el nombre del proyecto"></div><div class="form-group"><label for="numeroOrden">NÚMERO DE ORDEN:</label><input type="text" id="numeroOrden" name="numeroOrden" placeholder="Ingrese el número de orden"></div></div>
                    <div class="form-row"><div class="form-group"><label for="numeroRequisicion">No. DE REQUISICIÓN:</label><input type="text" id="numeroRequisicion" name="numeroRequisicion" placeholder="Ingrese el número de requisición"></div><div class="form-group"><label for="fechaRequisicion">FECHA DE REQUISICIÓN:</label><input type="date" id="fechaRequisicion" name="fechaRequisicion"></div></div>
                    <div class="table-container"><table class="items-table"><thead><tr><th>ITEM</th><th>DESCRIPCIÓN</th><th>UNIDAD</th><th>FECHA NECESIDAD</th><th>CANT. SOLICITADA</th><th>VALOR UNITARIO</th><th>CANT. ENTREGADA (ALMACÉN)</th><th>VALOR ENTREGADO (ALMACÉN)</th><th>CANT. PENDIENTE</th><th>CANT. ENTREGADA (COMPRAS)</th><th>VALOR ENTREGADO (COMPRAS)</th><th>DEVOLUCIÓN</th><th>VALOR DEVOLUCIÓN</th><th>ACCIÓN</th></tr></thead><tbody id="requisicionItems"></tbody><tfoot><tr><td colspan="6">TOTALES</td><td id="totalEntregadoAlmacen">0</td><td id="totalValorAlmacen">0.00</td><td></td><td id="totalEntregadoCompras">0</td><td id="totalValorCompras">0.00</td><td></td><td id="totalValorDevolucion">0.00</td><td></td></tr></tfoot></table><div class="table-actions"><button class="btn btn-sm btn-success" id="addItemBtn"><i class="fas fa-plus"></i> Agregar Item</button></div></div>
                    <div class="form-group"><label for="observaciones">OBSERVACIONES / RELACIÓN DE ANEXOS:</label><textarea id="observaciones" name="observaciones" placeholder="Ingrese las observaciones"></textarea></div>
                    <div class="signature-section"><div class="signature-box"><label>Solicitó:</label><input type="text" class="signature-field" id="solicitoNombre"><div class="signature-line"></div><div class="signature-position">INGENIERO DE PROYECTOS</div></div><div class="signature-box"><label>Aprobó:</label><input type="text" class="signature-field" id="aproboNombre"><div class="signature-line"></div><div class="signature-position">SUBGERENTE DE PROYECTOS</div></div><div class="signature-box"><label>Recibe:</label><input type="text" class="signature-field" id="recibeNombre"><div class="signature-line"></div><div class="signature-position">ANALISTA DE COMPRAS</div></div><div class="signature-box"><label>Aprobó:</label><input type="text" class="signature-field" id="aproboGerenteNombre"><div class="signature-line"></div><div class="signature-position">GERENTE</div></div></div>
                    <div class="action-buttons"><button class="btn btn-secondary" id="cancelRequisicionBtn"><i class="fas fa-times"></i> Cancelar</button><button class="btn btn-success" id="saveRequisicionBtn"><i class="fas fa-check"></i> Guardar</button></div>
                </div>`;
            this.initializeRequisicionForm();
        },

        /**
         * Muestra la vista del historial de requisiciones, poblada con los datos reales.
         */
        loadHistorialRequisiciones: function() {
            document.querySelector('.requisiciones-main-screen').style.display = 'none';
            document.querySelector('.requisiciones-detail-screen').style.display = 'block';
            
            document.getElementById('requisicionesContent').innerHTML = `
                <div class="history-container">
                    <div class="history-header"><h2><i class="fas fa-history"></i> Historial de Requisiciones</h2><div class="header-actions"><button class="btn btn-primary" id="exportHistoryBtn"><i class="fas fa-file-export"></i> Exportar</button></div></div>
                    <div class="history-filters"><div class="filter-group"><label for="filterDateFrom">Desde:</label><input type="date" id="filterDateFrom"></div><div class="filter-group"><label for="filterDateTo">Hasta:</label><input type="date" id="filterDateTo"></div><div class="filter-group"><label for="filterStatus">Estado:</label><select id="filterStatus"><option value="all">Todos</option><option value="pending">Pendiente</option><option value="approved">Aprobado</option><option value="rejected">Rechazado</option></select></div><div class="filter-group"><label for="filterProject">Proyecto:</label><input type="text" id="filterProject" placeholder="Buscar proyecto..."></div><button class="btn btn-primary" id="filterHistoryBtn"><i class="fas fa-filter"></i> Filtrar</button><button class="btn btn-secondary" id="resetFiltersBtn"><i class="fas fa-undo"></i> Limpiar</button></div>
                    <div class="history-stats"><div class="stat-card total"><h4>Total</h4><p>${historyData.length}</p></div><div class="stat-card approved"><h4>Aprobadas</h4><p>${historyData.filter(item => item.estado === 'approved').length}</p></div><div class="stat-card pending"><h4>Pendientes</h4><p>${historyData.filter(item => item.estado === 'pending').length}</p></div><div class="stat-card rejected"><h4>Rechazadas</h4><p>${historyData.filter(item => item.estado === 'rejected').length}</p></div></div>
                    <div class="table-responsive"><table class="history-table"><thead><tr><th>N° REQUISICIÓN</th><th>FECHA</th><th>SOLICITANTE</th><th>PROYECTO</th><th>ITEMS</th><th>ESTADO</th><th>ACCIONES</th></tr></thead><tbody id="historyTableBody">${historyData.map(item => `<tr><td>${item.id}</td><td>${item.fecha}</td><td>${item.solicitante}</td><td>${item.proyecto}</td><td>${item.items}</td><td class="status-${item.estado}">${this.getEstadoTexto(item.estado)}</td><td class="actions"><button class="btn btn-sm btn-primary" data-id="${item.id}" title="Ver/Editar"><i class="fas fa-eye"></i></button><button class="btn btn-sm btn-info" data-id="${item.id}" title="Descargar"><i class="fas fa-download"></i></button></td></tr>`).join('')}</tbody></table></div>
                    <div class="pagination-controls"><button class="btn btn-secondary" disabled><i class="fas fa-chevron-left"></i> Anterior</button><span>Página 1 de 1</span><button class="btn btn-secondary" disabled>Siguiente <i class="fas fa-chevron-right"></i></button></div>
                </div>`;
            
            document.getElementById('exportHistoryBtn')?.addEventListener('click', this.exportHistory.bind(this));
            document.getElementById('filterHistoryBtn')?.addEventListener('click', this.filterHistory.bind(this));
            document.getElementById('resetFiltersBtn')?.addEventListener('click', this.resetFilters.bind(this));
        },

        // ==========================================================
        // == NUEVA FUNCIÓN AÑADIDA CORRECTAMENTE AQUÍ ==
        // ==========================================================
        loadOrdenDeCompra: function() {
            document.querySelector('.requisiciones-main-screen').style.display = 'none';
            document.querySelector('.requisiciones-detail-screen').style.display = 'block';
            
            // Usamos las mismas clases CSS para mantener el estilo
            document.getElementById('requisicionesContent').innerHTML = `
                <div class="requisicion-form">
                    <div class="form-header">
                        <h3>Orden de Compra</h3>
                        <h4>Gestión de Compras a Proveedores</h4>
                        <div class="form-header-details">
                            <span>FECHA: <span id="currentDate">${new Date().toISOString().split('T')[0]}</span></span>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="proveedor">PROVEEDOR:</label>
                            <input type="text" id="proveedor" name="proveedor" placeholder="Nombre del proveedor">
                        </div>
                        <div class="form-group">
                            <label for="numeroOC">NÚMERO ORDEN DE COMPRA:</label>
                            <input type="text" id="numeroOC" name="numeroOC" placeholder="Ej: OC-2025-001">
                        </div>
                        <div class="form-group">
                            <label for="fechaOC">FECHA DE ORDEN:</label>
                            <input type="date" id="fechaOC" name="fechaOC">
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>ITEM</th>
                                    <th>DESCRIPCIÓN</th>
                                    <th>CANTIDAD</th>
                                    <th>PRECIO UNITARIO</th>
                                    <th>TOTAL</th>
                                    <th>ACCIÓN</th>
                                </tr>
                            </thead>
                            <tbody id="ordenCompraItems">
                                <!-- Las filas se añadirán dinámicamente -->
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" style="text-align:right; font-weight:bold;">SUBTOTAL:</td>
                                    <td id="subtotalOC">0.00</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colspan="4" style="text-align:right; font-weight:bold;">IVA (19%):</td>
                                    <td id="ivaOC">0.00</td>
                                    <td></td>
                                </tr>
                                 <tr>
                                    <td colspan="4" style="text-align:right; font-weight:bold;">TOTAL ORDEN:</td>
                                    <td id="totalOC" style="font-weight:bold; font-size: 1.2em;">0.00</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-success" id="addOCItemBtn">
                                <i class="fas fa-plus"></i> Agregar Item
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="terminos">TÉRMINOS Y CONDICIONES:</label>
                        <textarea id="terminos" name="terminos" placeholder="Especifique condiciones de pago, entrega, etc."></textarea>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="cancelOCBtn">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button class="btn btn-success" id="saveOCBtn">
                            <i class="fas fa-check"></i> Guardar Orden
                        </button>
                    </div>
                </div>
            `;
            // En el futuro, aquí llamaremos a una función para inicializar los eventos de este formulario
            // this.initializeOrdenDeCompraForm(); 
        },

        backToMain: function() {
            document.querySelector('.requisiciones-main-screen').style.display = 'block';
            document.querySelector('.requisiciones-detail-screen').style.display = 'none';
            document.getElementById('requisicionesContent').innerHTML = '';
        },
        
        initializeRequisicionForm: function() {
            document.getElementById('fechaRequisicion').valueAsDate = new Date();
            document.getElementById('addItemBtn').addEventListener('click', this.addNewItem.bind(this));
            document.getElementById('saveRequisicionBtn').addEventListener('click', this.saveRequisition.bind(this));
            document.getElementById('cancelRequisicionBtn').addEventListener('click', this.cancelRequisition.bind(this));
        },

        addNewItem: function() {
            const tbody = document.getElementById('requisicionItems');
            const newItemNumber = tbody.children.length + 1;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${newItemNumber}</td>
                <td><input type="text" class="form-control-sm"></td>
                <td><input type="text" class="form-control-sm"></td>
                <td><input type="date" class="form-control-sm"></td>
                <td><input type="number" class="form-control-sm" value="0" min="0" oninput="RequisicionesModule.calculateRow(this)"></td>
                <td><input type="number" class="form-control-sm" value="0" min="0" oninput="RequisicionesModule.calculateRow(this)"></td>
                <td><input type="number" class="form-control-sm" value="0" min="0" oninput="RequisicionesModule.calculateRow(this)"></td>
                <td><input type="number" class="form-control-sm" value="0" readonly></td>
                <td><input type="number" class="form-control-sm" value="0" readonly></td>
                <td><input type="number" class="form-control-sm" value="0" min="0" oninput="RequisicionesModule.calculateRow(this)"></td>
                <td><input type="number" class="form-control-sm" value="0" readonly></td>
                <td><input type="number" class="form-control-sm" value="0" min="0" oninput="RequisicionesModule.calculateRow(this)"></td>
                <td><input type="number" class="form-control-sm" value="0" readonly></td>
                <td><button class="btn btn-icon btn-danger btn-sm remove-item"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(row);
            row.querySelector('.remove-item').addEventListener('click', function() {
                row.remove();
                RequisicionesModule.renumberItems();
                RequisicionesModule.calculateTotals();
            });
        },

        calculateRow: function(input) {
            const row = input.closest('tr');
            const cells = row.cells;
            const cantidadSolicitada = parseFloat(cells[4].querySelector('input').value) || 0;
            const valorUnitario = parseFloat(cells[5].querySelector('input').value) || 0;
            const cantidadEntregadaAlmacen = parseFloat(cells[6].querySelector('input').value) || 0;
            const cantidadEntregadaCompras = parseFloat(cells[9].querySelector('input').value) || 0;
            const devolucion = parseFloat(cells[11].querySelector('input').value) || 0;
            
            cells[7].querySelector('input').value = (cantidadEntregadaAlmacen * valorUnitario).toFixed(2);
            cells[8].querySelector('input').value = (cantidadSolicitada - cantidadEntregadaAlmacen - cantidadEntregadaCompras).toFixed(2);
            cells[10].querySelector('input').value = (cantidadEntregadaCompras * valorUnitario).toFixed(2);
            cells[12].querySelector('input').value = (devolucion * valorUnitario).toFixed(2);
            
            this.calculateTotals();
        },

        calculateTotals: function() {
            let totalValorAlmacen = 0, totalValorCompras = 0, totalValorDevolucion = 0;
            document.querySelectorAll('#requisicionItems tr').forEach(row => {
                totalValorAlmacen += parseFloat(row.cells[7].querySelector('input').value) || 0;
                totalValorCompras += parseFloat(row.cells[10].querySelector('input').value) || 0;
                totalValorDevolucion += parseFloat(row.cells[12].querySelector('input').value) || 0;
            });
            document.getElementById('totalValorAlmacen').textContent = totalValorAlmacen.toFixed(2);
            document.getElementById('totalValorCompras').textContent = totalValorCompras.toFixed(2);
            document.getElementById('totalValorDevolucion').textContent = totalValorDevolucion.toFixed(2);
        },

        renumberItems: function() {
            document.querySelectorAll('#requisicionItems tr').forEach((row, index) => {
                row.cells[0].textContent = index + 1;
            });
        },

        saveRequisition: function() {
            const solicitante = document.getElementById('solicitante').value;
            const proyecto = document.getElementById('proyecto').value;
            const numeroRequisicion = document.getElementById('numeroRequisicion').value;

            if (!numeroRequisicion || !solicitante || !proyecto) {
                alert('Por favor complete los campos obligatorios: N° Requisición, Solicitante y Proyecto');
                return;
            }

            const items = [];
            document.querySelectorAll('#requisicionItems tr').forEach(row => {
                const cells = row.cells;
                items.push({
                    item: cells[0].textContent,
                    descripcion: cells[1].querySelector('input').value,
                    // ... etc.
                });
            });

            const nuevaRequisicion = {
                id: numeroRequisicion,
                fecha: document.getElementById('fechaRequisicion').value,
                solicitante: solicitante,
                proyecto: proyecto,
                items: items.length,
                estado: 'pending', // Estado inicial por defecto
                detalleItems: items
            };

            historyData.unshift(nuevaRequisicion);
            alert(`Requisición ${numeroRequisicion} guardada con éxito.`);
            this.backToMain();
        },

        cancelRequisition: function() {
            if (confirm('¿Está seguro de cancelar? Los cambios no guardados se perderán.')) {
                this.backToMain();
            }
        },
        
        filterHistory: function() {
            alert('Función de filtrar historial en desarrollo.');
        },
        resetFilters: function() {
            alert('Función de limpiar filtros en desarrollo.');
        },
        exportHistory: function() {
            alert('Función de exportar historial en desarrollo.');
        },
        
        getEstadoTexto: function(estado) {
            const estados = { 'pending': 'Pendiente', 'approved': 'Aprobado', 'rejected': 'Rechazado' };
            return estados[estado] || estado;
        }
    };
})();