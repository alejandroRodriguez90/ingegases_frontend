// js/requisicion-module.js

window.RequisicionesModule = (function() {

    // --- DATOS LOCALES DEL MÓDULO ---
    let historyData = []; // Almacena Requisiciones
    let ocHistoryData = []; // Almacena Órdenes de Compra
    let reqItemCounter = 0;
    let ocItemCounter = 0;
    const solicitantesPermitidos = ["Ing Alexander Herrera", "Ing Javier Sierra", "Ing Daniel Buitrago", "Ing Javier Penagos", "Ing Nicolás Saavedra", "Ing Melissa Gonzalez"];

    // --- FUNCIONES INTERNAS (Helpers) ---
    const formatCurrency = (value) => (value || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });
    const parseCurrency = (value) => parseFloat(String(value).replace(/[$.]/g, '').replace(',', '.')) || 0;

    // --- RENDERIZADO DE TABLA (DISEÑO ORIGINAL RESTAURADO) ---
    const renderHistoryTable = (dataToRender) => {
        const tableBody = document.getElementById('historyTableBody');
        if (!tableBody) return;

        // --- CAMBIO 1: Se añade el nuevo encabezado "B. SALIDA" ---
        const tableHead = tableBody.parentElement.querySelector('thead');
        tableHead.innerHTML = `<tr><th>N° REQUISICIÓN</th><th>FECHA</th><th>SOLICITANTE</th><th>PROYECTO</th><th>B. SALIDA</th><th>ITEMS</th><th>ESTADO</th><th>ACCIONES</th></tr>`;

        // El resto de la lógica de estadísticas no cambia
        document.querySelector('.stat-card.total p').textContent = dataToRender.length;
        document.querySelector('.stat-card.approved p').textContent = dataToRender.filter(r => r.estado === 'approved').length;
        document.querySelector('.stat-card.pending p').textContent = dataToRender.filter(r => r.estado === 'pending').length;
        const rejectedCard = document.querySelector('.stat-card.rejected');
        if(rejectedCard) rejectedCard.style.display = 'none';

        tableBody.innerHTML = dataToRender.map(item => {
            const isApproved = item.estado === 'approved';
            
            const actionsHtml = `
                <button class="btn btn-sm btn-info" data-id="${item.id}" data-type="${item.type}" data-action="view" title="Ver Resumen"><i class="fas fa-eye"></i></button>
                ${!isApproved ? `<button class="btn btn-sm btn-success" data-id="${item.id}" data-type="${item.type}" data-action="approve" title="Aprobar"><i class="fas fa-check"></i></button>` : ''}
                ${isApproved ? `<button class="btn btn-sm btn-warning" data-id="${item.id}" data-type="${item.type}" data-action="print" title="Imprimir / PDF"><i class="fas fa-print"></i></button>` : ''}
                <button class="btn btn-sm btn-danger" data-id="${item.id}" data-type="${item.type}" data-action="delete" title="Eliminar"><i class="fas fa-trash"></i></button>
            `;

            if (item.type === 'requisicion') {
                return `<tr class="text-center">
                    <td>${item.id}</td>
                    <td>${item.fecha}</td>
                    <td>${item.solicitante}</td>
                    <td>${item.proyecto}</td>
                    <!-- CAMBIO 2: Se añade la celda con la ubicación -->
                    <td><strong>${item.ubicacion || 'N/A'}</strong></td>
                    <td>${item.items.length}</td>
                    <td><span class="status-${item.estado}">${RequisicionesModule.getEstadoTexto(item.estado)}</span></td>
                    <td class="actions">${actionsHtml}</td>
                </tr>`;
            } else { // Es una Orden de Compra
                return `<tr class="text-center">
                    <td>${item.id}</td>
                    <td>${item.fecha}</td>
                    <td><strong>${item.proveedor}</strong></td>
                    <td><em>Compra Directa</em></td>
                    <!-- CAMBIO 3: Se añade la celda con la ubicación -->
                    <td><strong>${item.ubicacion || 'N/A'}</strong></td>
                    <td>${item.items.length}</td>
                    <td><span class="status-${item.estado || 'pending'}">${RequisicionesModule.getEstadoTexto(item.estado)}</span></td>
                    <td class="actions">${actionsHtml}</td>
                </tr>`;
            }
        }).join('');
    };

    const getCombinedHistory = () => {
        const reqs = historyData.map(r => ({ ...r, type: 'requisicion' }));
        const ocs = ocHistoryData.map(o => ({ ...o, type: 'orden_compra' }));
        const combined = [...reqs, ...ocs];
        combined.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        return combined;
    };


    return {
        init: function() {
            console.log("✅ Módulo de Requisiciones listo.");
        },
        backToMain: function() {
            document.querySelector('.requisiciones-main-screen').style.display = 'block';
            document.querySelector('.requisiciones-detail-screen').style.display = 'none';
            document.getElementById('requisicionesContent').innerHTML = '';
        },

        // =============================================
        // == SECCIÓN: CREAR REQUISICIÓN
        // =============================================
        loadCrearRequisicion: function() {
            document.querySelector('.requisiciones-main-screen').style.display = 'none';
            document.querySelector('.requisiciones-detail-screen').style.display = 'block';
            document.getElementById('requisicionesBackButton').onclick = this.backToMain.bind(this);
            document.getElementById('requisicionesContent').innerHTML = `
                <div class="requisicion-form">
                    <div class="form-header"><h3>SISTEMA INTEGRADO DE GESTIÓN</h3><h4>REQUISICIÓN DE BIENES Y/O SERVICIOS</h4><div class="form-header-details"><span>CÓDIGO: CP-RQ-01</span><span>FECHA: <span id="currentDate">${new Date().toISOString().split('T')[0]}</span></span><span>VERSIÓN: 1</span><span>PÁGINA: 1 DE 1</span></div></div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="solicitante">SOLICITA:</label>
                            <input type="text" id="solicitante" name="solicitante" placeholder="Ingrese el solicitante" list="listaSolicitantes"><datalist id="listaSolicitantes">${solicitantesPermitidos.map(nombre => `<option value="${nombre}"></option>`).join('')}</datalist>
                        </div>
                        <div class="form-group">
                            <label for="proyecto">NOMBRE PROYECTO:</label>
                            <input type="text" id="proyecto" name="proyecto" placeholder="Ingrese el nombre del proyecto">
                        </div>
                        <div class="form-group">
                            <label for="numeroOrden">NÚMERO DE ORDEN:</label>
                            <input type="text" id="numeroOrden" name="numeroOrden" placeholder="Ingrese el número de orden">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="numeroRequisicion">No. DE REQUISICIÓN:</label>
                            <input type="text" id="numeroRequisicion" name="numeroRequisicion" placeholder="Ingrese el número de requisición">
                        </div>
                        <div class="form-group">
                            <label for="fechaRequisicion">FECHA DE REQUISICIÓN:</label>
                            <input type="date" id="fechaRequisicion" name="fechaRequisicion">
                        </div>
                        
                        <!-- =========== NUEVO CAMPO AÑADIDO AQUÍ =========== -->
                        <div class="form-group">
                            <label for="ubicacion">BODEGA DE SALIDA:</label>
                            <select id="ubicacion" name="ubicacion" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px; font-size: 1em;">
                                <option value="Bogotá" selected>Bogotá</option>
                                <option value="Cali">Cali</option>
                            </select>
                        </div>
                        <!-- ============================================= -->

                    </div>

                    <div class="table-container">
                        <table class="items-table">
                            <thead><tr><th>ITEM</th><th>CÓDIGO</th><th>DESCRIPCIÓN</th><th>FECHA NECESIDAD</th><th>CANT. SOLICITADA</th><th>VALOR UNITARIO</th><th>VALOR TOTAL</th><th>ACCIÓN</th></tr></thead>
                            <tbody id="requisicionItems"></tbody>
                            <tfoot><tr><td colspan="6" style="text-align:right; font-weight:bold;">TOTAL SOLICITADO:</td><td id="totalSolicitado" style="font-weight:bold;">$ 0.00</td><td></td></tr></tfoot>
                        </table>
                        <div class="table-actions"><button class="btn btn-sm btn-success" id="addItemBtn"><i class="fas fa-plus"></i> Agregar Item</button></div>
                    </div>
                    <div class="form-group"><label for="observaciones">OBSERVACIONES / RELACIÓN DE ANEXOS:</label><textarea id="observaciones" name="observaciones" placeholder="Ingrese las observaciones"></textarea></div>
                    <div class="signature-section"><div class="signature-box"><label>Solicitó:</label><input type="text" class="signature-field" id="solicitoNombre"><div class="signature-line"></div><div class="signature-position">INGENIERO DE PROYECTOS</div></div><div class="signature-box"><label>Aprobó:</label><input type="text" class="signature-field" id="aproboNombre"><div class="signature-line"></div><div class="signature-position">SUBGERENTE DE PROYECTOS</div></div><div class="signature-box"><label>Recibe:</label><input type="text" class="signature-field" id="recibeNombre"><div class="signature-line"></div><div class="signature-position">ANALISTA DE COMPRAS</div></div><div class="signature-box"><label>Aprobó:</label><input type="text" class="signature-field" id="aproboGerenteNombre"><div class="signature-line"></div><div class="signature-position">GERENTE</div></div></div>
                    <div class="action-buttons"><button class="btn btn-secondary" id="cancelRequisicionBtn"><i class="fas fa-times"></i> Cancelar</button><button class="btn btn-success" id="saveRequisicionBtn"><i class="fas fa-check"></i> Guardar</button></div>
                </div>`;
            this.initializeRequisicionForm();
        },

        initializeRequisicionForm: function() {
            reqItemCounter = 0;
            if (typeof InventarioCompartido !== 'undefined' && !document.getElementById('listaCodigosGlobal')) {
                const datalist = document.createElement('datalist');
                datalist.id = 'listaCodigosGlobal';
                InventarioCompartido.obtenerProductos().forEach(p => { datalist.innerHTML += `<option value="${p.codigo}">${p.descripcion}</option>`; });
                document.querySelector('.requisicion-form').appendChild(datalist);
            }
            document.getElementById('fechaRequisicion').valueAsDate = new Date();
            document.getElementById('addItemBtn').addEventListener('click', this.addNewItem.bind(this));
            document.getElementById('saveRequisicionBtn').addEventListener('click', this.saveRequisition.bind(this));
            document.getElementById('cancelRequisicionBtn').addEventListener('click', this.cancelRequisition.bind(this));
            this.addNewItem();
        },
        addNewItem: function() {
            reqItemCounter++;
            const tbody = document.getElementById('requisicionItems');
            const row = document.createElement('tr');
            row.innerHTML = `<td>${reqItemCounter}</td><td><input type="text" class="form-control-sm" list="listaCodigosGlobal"></td><td><input type="text" class="form-control-sm"></td><td><input type="date" class="form-control-sm"></td><td><input type="number" class="form-control-sm" value="1" min="1" oninput="RequisicionesModule.calculateReqTotals()"></td><td><input type="text" class="form-control-sm" value="0" oninput="RequisicionesModule.calculateReqTotals()"></td><td class="req-total-fila" style="text-align:right;">$ 0.00</td><td><button class="btn btn-icon btn-danger btn-sm remove-item"><i class="fas fa-trash"></i></button></td>`;
            tbody.appendChild(row);

            const codigoInput = row.cells[1].querySelector('input');
            const descripcionInput = row.cells[2].querySelector('input');
            const valorInput = row.cells[5].querySelector('input');
            codigoInput.addEventListener('input', () => {
                if (typeof InventarioCompartido !== 'undefined') {
                    const producto = InventarioCompartido.buscarProducto(codigoInput.value);
                    if (producto) {
                        descripcionInput.value = producto.descripcion;
                        valorInput.value = (producto.valor || 0).toLocaleString('es-CO');
                        this.calculateReqTotals();
                    } else {
                        descripcionInput.value = '';
                    }
                }
            });
            row.querySelector('.remove-item').addEventListener('click', () => { row.remove(); this.renumberItems(); this.calculateReqTotals(); });
            this.calculateReqTotals();
        },
        calculateReqTotals: function() {
            let totalGeneral = 0;
            document.querySelectorAll('#requisicionItems tr').forEach(row => {
                const cantidad = parseFloat(row.cells[4].querySelector('input').value) || 0;
                const valorInput = row.cells[5].querySelector('input');
                let valorUnitario = parseFloat(String(valorInput.value).replace(/\D/g, '')) || 0;
                valorInput.value = valorUnitario.toLocaleString('es-CO');
                const totalFila = cantidad * valorUnitario;
                row.cells[6].textContent = formatCurrency(totalFila);
                totalGeneral += totalFila;
            });
            document.getElementById('totalSolicitado').textContent = formatCurrency(totalGeneral);
        },
        renumberItems: function() {
            document.querySelectorAll('#requisicionItems tr').forEach((row, index) => {
                row.cells[0].textContent = index + 1;
            });
        },
        
        saveRequisition: function() {
            // --- 1. Recolectar datos principales ---
            const solicitante = document.getElementById('solicitante').value;
            const proyecto = document.getElementById('proyecto').value;
            const numeroRequisicion = document.getElementById('numeroRequisicion').value;
            const ubicacion = document.getElementById('ubicacion').value;
            const observaciones = document.getElementById('observaciones').value;

            // --- 2. Recolectar datos de las firmas ---
            const firmaSolicito = document.getElementById('solicitoNombre').value;
            const firmaAproboSubgerente = document.getElementById('aproboNombre').value;
            const firmaRecibe = document.getElementById('recibeNombre').value;
            const firmaAproboGerente = document.getElementById('aproboGerenteNombre').value;

            // --- 3. Validación de campos obligatorios ---
            if (!numeroRequisicion || !solicitante || !proyecto || !ubicacion) {
                alert('Por favor complete los campos obligatorios: No. de Requisición, Solicitante, Proyecto y Bodega.');
                return;
            }
            if (!firmaSolicito || !firmaAproboSubgerente || !firmaRecibe || !firmaAproboGerente) {
                alert('Por favor, complete todos los campos de firma (Solicitó, Aprobó, Recibe).');
                return;
            }

            // --- 4. Recolectar items ---
            const items = [];
            document.querySelectorAll('#requisicionItems tr').forEach(row => {
                const codigo = row.cells[1].querySelector('input').value;
                if (codigo) {
                    items.push({
                        item: row.cells[0].textContent,
                        codigo: codigo,
                        // --- ¡AQUÍ ESTABA EL ERROR! Se cambió 'cells' por 'row.cells' ---
                        descripcion: row.cells[2].querySelector('input').value,
                        cantidad: row.cells[4].querySelector('input').value,
                        valorUnitario: row.cells[5].querySelector('input').value
                    });
                }
            });

            if (items.length === 0) {
                alert('Debe agregar al menos un ítem a la requisición.');
                return;
            }

            // --- 5. Crear el objeto final ---
            const nuevaRequisicion = {
                id: numeroRequisicion,
                fecha: document.getElementById('fechaRequisicion').value,
                solicitante,
                proyecto,
                ubicacion: ubicacion,
                observaciones: observaciones,
                firmaSolicito: firmaSolicito,
                firmaAproboSubgerente: firmaAproboSubgerente,
                firmaRecibe: firmaRecibe,
                firmaAproboGerente: firmaAproboGerente,
                items: items,
                estado: 'pending'
            };
            
            historyData.unshift(nuevaRequisicion);
            alert(`Requisición ${numeroRequisicion} guardada y enviada para aprobación.`);
            this.loadHistorial();
        },

        cancelRequisition: function() {
            if (confirm('¿Está seguro de cancelar? Se perderán los datos no guardados.')) {
                this.backToMain();
            }
        },

        // =============================================
        // == SECCIÓN: ORDEN DE COMPRA
        // =============================================
        showOrdenDeCompraMenu: function() {
            document.querySelector('.requisiciones-main-screen').style.display = 'none';
            document.querySelector('.requisiciones-detail-screen').style.display = 'block';
            document.getElementById('requisicionesBackButton').onclick = this.backToMain;
            document.getElementById('requisicionesContent').innerHTML = `
                <div class="main-header" style="padding-top: 20px;">
                    <h1 class="main-title" style="font-size: 2.2rem; margin-bottom: 40px;">Órdenes de Compra</h1>
                    <div class="card-container">
                        <div class="requisicion-card" onclick="RequisicionesModule.loadCrearOrdenDeCompraForm()">
                            <div class="card-icon-container"><div class="card-icon">✍️</div></div>
                            <h3>Crear Orden de Compra</h3>
                            <p class="card-description">Genera una nueva orden de compra directa.</p>
                        </div>
                        <div class="requisicion-card" onclick="RequisicionesModule.loadHistorial()">
                            <div class="card-icon-container"><div class="card-icon">📜</div></div>
                            <h3>Historial y Aprobaciones</h3>
                            <p class="card-description">Consulta y gestiona todos los documentos.</p>
                        </div>
                    </div>
                </div>`;
        },
        
        loadCrearOrdenDeCompraForm: function(requisicionAprobada = null) {
            document.getElementById('requisicionesBackButton').onclick = this.showOrdenDeCompraMenu.bind(this);
            document.getElementById('requisicionesContent').innerHTML = `
                <div class="requisicion-form">
                    <div class="form-header">
                        <h3>Orden de Compra</h3>
                        <h4>Gestión de Compras a Proveedores</h4>
                        <div class="form-header-details"><span>FECHA: <span id="currentDate">${new Date().toISOString().split('T')[0]}</span></span></div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="proveedor">PROVEEDOR / SOLICITANTE:</label>
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

                    <div class="form-row">
                        <div class="form-group" style="flex-basis: 100%">
                            <label for="oc_numero_requisicion">N° DE REQUISICIÓN ASOCIADA:</label>
                            <input type="text" id="oc_numero_requisicion" name="oc_numero_requisicion" disabled>
                        </div>
                        
                        <!-- =========== NUEVO CAMPO AÑADIDO AQUÍ =========== -->
                        <div class="form-group" style="flex-basis: 100%">
                            <label for="ubicacion">BODEGA DE SALIDA:</label>
                            <select id="ubicacion" name="ubicacion" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 5px; font-size: 1em;">
                                <option value="Bogotá" selected>Bogotá</option>
                                <option value="Cali">Cali</option>
                            </select>
                        </div>
                        <!-- ============================================= -->
                    </div>

                    <div class="table-container">
                        <table class="items-table">
                            <thead><tr><th>ITEM</th><th>CÓDIGO</th><th>DESCRIPCIÓN</th><th>CANTIDAD</th><th>PRECIO UNITARIO</th><th>TOTAL</th><th>ACCIÓN</th></tr></thead>
                            <tbody id="ordenCompraItems"></tbody>
                            <tfoot>
                                <tr><td colspan="5" style="text-align:right; font-weight:bold;">SUBTOTAL:</td><td id="subtotalOC">$ 0,00</td><td></td></tr>
                                <tr><td colspan="5" style="text-align:right; font-weight:bold;">IVA (19%):</td><td id="ivaOC">$ 0,00</td><td></td></tr>
                                <tr><td colspan="5" style="text-align:right; font-weight:bold;">TOTAL ORDEN:</td><td id="totalOC" style="font-weight:bold; font-size: 1.2em;">$ 0,00</td><td></td></tr>
                            </tfoot>
                        </table>
                        <div class="table-actions"><button class="btn btn-sm btn-success" id="addOCItemBtn"><i class="fas fa-plus"></i> Agregar Item</button></div>
                    </div>
                    <div class="form-group">
                        <label for="terminos">TÉRMINOS Y CONDICIONES:</label>
                        <textarea id="terminos" name="terminos" placeholder="Especifique condiciones de pago, entrega, etc."></textarea>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="cancelOCBtn"><i class="fas fa-times"></i> Cancelar</button>
                        <button class="btn btn-success" id="saveOCBtn"><i class="fas fa-check"></i> Guardar Orden</button>
                    </div>
                </div>`;
            this.initializeOrdenDeCompraForm(requisicionAprobada);
        },

        initializeOrdenDeCompraForm: function(requisicionAprobada) {
            ocItemCounter = 0;
            if (typeof InventarioCompartido !== 'undefined' && !document.getElementById('listaCodigosGlobal')) {
                const datalist = document.createElement('datalist');
                datalist.id = 'listaCodigosGlobal';
                InventarioCompartido.obtenerProductos().forEach(p => { datalist.innerHTML += `<option value="${p.codigo}">${p.descripcion}</option>`; });
                document.querySelector('.requisicion-form').appendChild(datalist);
            }
            document.getElementById('fechaOC').valueAsDate = new Date();
            document.getElementById('addOCItemBtn').addEventListener('click', this.addNewOCItem.bind(this));
            document.getElementById('cancelOCBtn').addEventListener('click', this.showOrdenDeCompraMenu.bind(this));
            document.getElementById('saveOCBtn').addEventListener('click', this.saveOrdenDeCompra.bind(this));

            if (requisicionAprobada) {
                document.getElementById('oc_numero_requisicion').value = requisicionAprobada.id;
                document.getElementById('numeroOC').value = `OC-${requisicionAprobada.id}`;
                requisicionAprobada.items.forEach(item => {
                    const newRow = this.addNewOCItem(true);
                    newRow.querySelector('.oc-codigo').value = item.codigo;
                    newRow.querySelector('.oc-descripcion').value = item.descripcion;
                    newRow.querySelector('.oc-cantidad').value = item.cantidad;
                    newRow.querySelector('.oc-precio').value = String(item.valorUnitario).replace(/\D/g, '');
                });
            } else {
                this.addNewOCItem();
            }
            this.calculateOCTotals();
        },
        addNewOCItem: function(supressCalculate = false) {
            ocItemCounter++;
            const tbody = document.getElementById('ordenCompraItems');
            const row = document.createElement('tr');
            row.innerHTML = `<td>${ocItemCounter}</td><td><input type="text" class="form-control-sm oc-codigo" list="listaCodigosGlobal"></td><td><input type="text" class="form-control-sm oc-descripcion"></td><td><input type="number" class="form-control-sm oc-cantidad" value="1" min="1" oninput="RequisicionesModule.calculateOCRow(this)"></td><td><input type="text" class="form-control-sm oc-precio" value="0" oninput="RequisicionesModule.calculateOCRow(this)"></td><td class="oc-total-fila">$ 0,00</td><td><button class="btn btn-icon btn-danger btn-sm remove-item"><i class="fas fa-trash"></i></button></td>`;
            tbody.appendChild(row);
            const codigoInput = row.querySelector('.oc-codigo');
            const descripcionInput = row.querySelector('.oc-descripcion');
            const precioInput = row.querySelector('.oc-precio');
            codigoInput.addEventListener('input', () => {
                if (typeof InventarioCompartido !== 'undefined') {
                    const producto = InventarioCompartido.buscarProducto(codigoInput.value);
                    if (producto) {
                        descripcionInput.value = producto.descripcion;
                        precioInput.value = (producto.valor || 0).toLocaleString('es-CO');
                        this.calculateOCRow(precioInput);
                    } else {
                        descripcionInput.value = '';
                    }
                }
            });
            row.querySelector('.remove-item').addEventListener('click', () => {
                row.remove();
                this.calculateOCTotals();
            });
            if (!supressCalculate) {
                this.calculateOCTotals();
            }
            return row;
        },
        calculateOCRow: function(input) {
            const row = input.closest('tr');
            const precioInput = row.querySelector('.oc-precio');
            const cantidad = parseFloat(row.querySelector('.oc-cantidad').value) || 0;
            const precioNumerico = parseFloat(String(precioInput.value).replace(/\D/g, '')) || 0;
            precioInput.value = precioNumerico.toLocaleString('es-CO');
            const totalFila = cantidad * precioNumerico;
            row.querySelector('.oc-total-fila').textContent = formatCurrency(totalFila);
            this.calculateOCTotals();
        },
        calculateOCTotals: function() {
            let subtotal = 0;
            document.querySelectorAll('#ordenCompraItems tr').forEach(row => {
                const totalFilaText = row.querySelector('.oc-total-fila').textContent;
                subtotal += parseCurrency(totalFilaText);
            });
            const iva = subtotal * 0.19;
            const total = subtotal + iva;
            document.getElementById('subtotalOC').textContent = formatCurrency(subtotal);
            document.getElementById('ivaOC').textContent = formatCurrency(iva);
            document.getElementById('totalOC').textContent = formatCurrency(total);
        },
       saveOrdenDeCompra: function() {
            const proveedor = document.getElementById('proveedor').value;
            const numeroOC = document.getElementById('numeroOC').value;
            const ubicacion = document.getElementById('ubicacion').value;
            
            // --- NUEVA LÍNEA AÑADIDA ---
            const terminos = document.getElementById('terminos').value;

            if (!proveedor || !numeroOC) {
                alert('Por favor, complete el nombre del Proveedor y el Número de Orden de Compra.');
                return;
            }
            if (!ubicacion) {
                alert('Por favor, seleccione una Bodega de Salida.');
                return;
            }

            const items = [];
            document.querySelectorAll('#ordenCompraItems tr').forEach((row, index) => {
                const codigo = row.cells[1].querySelector('input').value;
                if (codigo) { // Solo agregar si hay un código
                    items.push({
                        item: index + 1,
                        codigo: codigo,
                        descripcion: row.cells[2].querySelector('input').value,
                        cantidad: parseFloat(row.cells[3].querySelector('input').value) || 0,
                        precioUnitario: parseCurrency(row.cells[4].querySelector('input').value)
                    });
                }
            });
            if (items.length === 0) {
                alert('Debe agregar al menos un ítem válido a la orden de compra.');
                return;
            }

            const nuevaOC = {
                id: numeroOC,
                proveedor,
                fecha: document.getElementById('fechaOC').value,
                ubicacion: ubicacion,
                observaciones: terminos, // --- NUEVA PROPIEDAD GUARDADA ---
                requisicionAsociada: document.getElementById('oc_numero_requisicion').value || 'N/A',
                items,
                subtotal: parseCurrency(document.getElementById('subtotalOC').textContent),
                iva: parseCurrency(document.getElementById('ivaOC').textContent),
                total: parseCurrency(document.getElementById('totalOC').textContent),
                estado: 'pending' 
            };
            
            ocHistoryData.unshift(nuevaOC);
            alert(`¡Orden de Compra ${numeroOC} guardada exitosamente!`);
            this.loadHistorial();
        },

        // =============================================
        // == SECCIÓN: HISTORIAL Y APROBACIONES
        // =============================================
        loadHistorial: function() {
            document.getElementById('requisicionesBackButton').onclick = this.showOrdenDeCompraMenu.bind(this);
            document.getElementById('requisicionesContent').innerHTML = `<style>
                .history-table .text-center td, .history-table .text-center th { text-align: center; vertical-align: middle; }
                .history-table .actions { display: flex; gap: 5px; justify-content: center; }
                .status-pending { color: #f39c12; font-weight: bold; }
                .status-approved { color: #2ecc71; font-weight: bold; }
                .status-rejected { color: #e74c3c; font-weight: bold; }

                 .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px 24px;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #dee2e6;
                }
                .summary-grid-item {
                    line-height: 1.4;
                }
                .summary-grid-item label {
                    font-size: 0.8rem;
                    color: #6c757d;
                    display: block;
                    margin-bottom: 4px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .summary-grid-item strong {
                    font-size: 1rem;
                    color: #212529;
                    font-weight: 600;
                }
                
                /* --- NUEVOS ESTILOS PARA LA SECCIÓN DE FIRMAS --- */
                .summary-signatures {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px 24px;
                    padding: 15px;
                    margin-bottom: 20px;
                    background-color: #f8f9fa; /* Fondo sutil para destacar la sección */
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                }
                .summary-signature-item label {
                    font-size: 0.8rem;
                    color: #6c757d;
                    display: block;
                    margin-bottom: 2px;
                    font-weight: 500;
                }
                .summary-signature-item strong {
                    font-size: 0.95rem;
                    color: #212529;
                    font-weight: 600;
                }
                /* --- FIN DE NUEVOS ESTILOS DE FIRMAS --- */

                .summary-table {
                    margin-top: 15px;
                    border-collapse: collapse;
                    width: 100%;
                }
                .summary-table th {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    background-color: #f8f9fa;
                }
                .summary-table tbody tr:nth-child(odd) {
                    background-color: #fdfdfe;
                }
                .summary-table tfoot td {
                    font-weight: 700;
                    border-top: 1px solid #dee2e6;
                    padding-top: 12px;
                    color: #495057;
                }
                .summary-table tfoot tr:last-child td {
                    font-size: 1.15em;
                    color: #000;
                    background-color: #f8f9fa;
                    border-top: 2px solid #343a40;
                }
                .summary-table td:last-child {
                    text-align: right;
                }
                .summary-notes {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #e0e0e0;
                    margin-bottom: 15px;
                }
                .summary-notes h4 {
                    font-size: 0.9rem;
                    color: #6c757d;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }
                .summary-notes p {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: #212529;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    padding: 10px;
                    white-space: pre-wrap;
                }

            </style>
            <div class="history-container">
                <div class="history-header"><h2><i class="fas fa-history"></i> Historial y Aprobaciones</h2></div>
                <div class="history-filters">
                    <div class="filter-group"><label for="filterDateFrom">Desde:</label><input type="date" id="filterDateFrom"></div>
                    <div class="filter-group"><label for="filterDateTo">Hasta:</label><input type="date" id="filterDateTo"></div>
                    <div class="filter-group"><label for="filterStatus">Estado:</label>
                        <select id="filterStatus">
                            <option value="all">Todos</option>
                            <option value="pending">Pendiente</option>
                            <option value="approved">Aprobado</option>
                        </select>
                    </div>
                    <div class="filter-group"><label for="filterProject">Proyecto:</label><input type="text" id="filterProject" placeholder="Buscar proyecto..."></div>
                    <button class="btn btn-primary" id="filterHistoryBtn"><i class="fas fa-filter"></i> Filtrar</button>
                    <button class="btn btn-secondary" id="resetFiltersBtn"><i class="fas fa-undo"></i> Limpiar</button>
                </div>
                <div class="history-stats">
                    <div class="stat-card total"><h4>TOTAL</h4><p>0</p></div>
                    <div class="stat-card approved"><h4>APROBADAS</h4><p>0</p></div>
                    <div class="stat-card pending"><h4>PENDIENTES</h4><p>0</p></div>
                    <div class="stat-card rejected" style="display: none;"><h4>RECHAZADAS</h4><p>0</p></div>
                </div>
                <div class="table-responsive"><table class="history-table"><thead></thead><tbody id="historyTableBody"></tbody></table></div>
                <div class="pagination-controls"><button class="btn btn-secondary" disabled>Anterior</button><span>Página 1 de 1</span><button class="btn btn-secondary" disabled>Siguiente</button></div>
            </div>`;

        renderHistoryTable(getCombinedHistory());

            document.getElementById('filterHistoryBtn').addEventListener('click', this.filterHistory.bind(this));
            document.getElementById('resetFiltersBtn').addEventListener('click', this.resetFilters.bind(this));

            document.getElementById('historyTableBody').addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button || !button.dataset.action) return;
                const docId = button.dataset.id;
                const docType = button.dataset.type;
                const action = button.dataset.action;

                switch (action) {
                    case 'view':
                        this.showSummaryModal(docId, docType);
                        break;
                    case 'approve':
                        this.confirmApproval(docId, docType);
                        break;
                    case 'print':
                        this.printDocument(docId, docType);
                        break;
                    case 'delete':
                        this.confirmDeletion(docId, docType);
                        break;
                }
            });
        },
        
        
        approveRequisition: function(reqId) {
            const requisicion = historyData.find(req => req.id === reqId);
            if (requisicion) {
                requisicion.estado = 'approved';
                this.closeGenericModal();
                renderHistoryTable(getCombinedHistory());
                alert('Requisición aprobada. Redirigiendo a la creación de Orden de Compra...');
                this.loadCrearOrdenDeCompraForm(requisicion);
            }
        },
        filterHistory: function() {
            const dateFrom = document.getElementById('filterDateFrom').value;
            const dateTo = document.getElementById('filterDateTo').value;
            const status = document.getElementById('filterStatus').value;
            const project = document.getElementById('filterProject').value.toLowerCase();
            let combinedData = getCombinedHistory();
            let filteredData = combinedData.filter(item => {
                let dateMatch = true;
                if (dateFrom) dateMatch = item.fecha >= dateFrom;
                if (dateTo) dateMatch = dateMatch && item.fecha <= dateTo;
                if (!dateMatch) return false;

                const itemStatus = item.estado || 'approved'; // OC sin estado son 'approved'
                let statusMatch = (status === 'all') || (itemStatus === status);

                if (item.type === 'orden_compra') {
                    // Para OCs, solo filtra por estado y fecha, no por proyecto.
                    return statusMatch;
                }
                
                // Filtros para Requisiciones
                let projectMatch = !project || (item.proyecto && item.proyecto.toLowerCase().includes(project));
                return statusMatch && projectMatch;
            });
            renderHistoryTable(filteredData);
        },
        resetFilters: function() {
            document.getElementById('filterDateFrom').value = '';
            document.getElementById('filterDateTo').value = '';
            document.getElementById('filterStatus').value = 'all';
            document.getElementById('filterProject').value = '';
            renderHistoryTable(getCombinedHistory());
        },
        exportHistory: function() {
            alert('Función de exportar historial en desarrollo.');
        },
        getEstadoTexto: function(estado) {
            const estados = {
                'pending': 'Pendiente',
                'approved': 'Aprobado',
                'rejected': 'Rechazado'
            };
            return estados[estado] || 'Generada';
        },

       // =============================================
        // == SECCIÓN: NUEVAS FUNCIONES DE ACCIÓN
        // =============================================
        openPreviewModal: function(title, body) {
            document.getElementById('previewModalTitle').innerHTML = title;
            document.getElementById('previewModalBody').innerHTML = body;
            document.getElementById('requisicionPreviewModal').style.display = 'flex';
        },
        closePreviewModal: function() {
            document.getElementById('requisicionPreviewModal').style.display = 'none';
        },

        // Acción de Ver Resumen (sin cambios)
        showSummaryModal: function(docId, docType) {
            const doc = docType === 'requisicion'
                ? historyData.find(d => d.id === docId)
                : ocHistoryData.find(d => d.id === docId);
            if (!doc) return;

            const title = `Resumen: ${docType === 'requisicion' ? 'Requisición' : 'OC'} N° ${doc.id}`;
            
            // --- Lógica para calcular totales (sin cambios) ---
            let subtotal = 0;
            const itemsHtml = doc.items.map((item, index) => {
                const cantidad = parseFloat(item.cantidad) || 0;
                const valorUnitario = parseCurrency(item.valorUnitario || item.precioUnitario || '0');
                const totalFila = cantidad * valorUnitario;
                subtotal += totalFila;
                
                return `
                <tr>
                    <td>${item.item || index + 1}</td>
                    <td>${item.codigo}</td>
                    <td>${item.descripcion}</td>
                    <td>${cantidad}</td>
                    <td>${formatCurrency(valorUnitario)}</td>
                    <td>${formatCurrency(totalFila)}</td>
                </tr>`;
            }).join('');

            const iva = subtotal * 0.19;
            const totalGeneral = subtotal + iva;

            // --- Construcción del layout del modal (sin cambios) ---
            const headerInfo = docType === 'requisicion'
                ? `
                    <div class="summary-grid-item">
                        <label>Solicitante:</label>
                        <strong>${doc.solicitante}</strong>
                    </div>
                    <div class="summary-grid-item">
                        <label>Proyecto:</label>
                        <strong>${doc.proyecto}</strong>
                    </div>
                `
                : `
                    <div class="summary-grid-item">
                        <label>Proveedor / Solicitante:</label>
                        <strong>${doc.proveedor}</strong>
                    </div>
                    <div class="summary-grid-item">
                        <label>Tipo:</label>
                        <strong>Compra Directa</strong>
                    </div>
                `;

            // --- Lógica para mostrar observaciones (sin cambios) ---
            let observacionesHtml = '';
            if (doc.observaciones && doc.observaciones.trim() !== '') {
                observacionesHtml = `
                    <div class="summary-notes">
                        <h4>Observaciones / Términos y Condiciones:</h4>
                        <p>${doc.observaciones.replace(/\n/g, '<br>')}</p>
                    </div>
                `;
            }

            // --- ¡NUEVO! Lógica para mostrar las firmas solo en requisiciones ---
            let firmasHtml = '';
            if (docType === 'requisicion') {
                firmasHtml = `
                    <div class="summary-signatures">
                        <div class="summary-signature-item">
                            <label>Solicitó (Ing. Proyecto):</label>
                            <strong>${doc.firmaSolicito || 'N/A'}</strong>
                        </div>
                        <div class="summary-signature-item">
                            <label>Aprobó (Subgerente):</label>
                            <strong>${doc.firmaAproboSubgerente || 'N/A'}</strong>
                        </div>
                        <div class="summary-signature-item">
                            <label>Recibe (Compras):</label>
                            <strong>${doc.firmaRecibe || 'N/A'}</strong>
                        </div>
                        <div class="summary-signature-item">
                            <label>Aprobó (Gerente):</label>
                            <strong>${doc.firmaAproboGerente || 'N/A'}</strong>
                        </div>
                    </div>
                `;
            }

            const body = `
                <div class="summary-grid">
                    ${headerInfo}
                    <div class="summary-grid-item">
                        <label>Fecha:</label>
                        <strong>${doc.fecha}</strong>
                    </div>
                    <div class="summary-grid-item">
                        <label>Estado:</label>
                        <strong>${this.getEstadoTexto(doc.estado)}</strong>
                    </div>
                    <div class="summary-grid-item">
                        <label>Bodega de Salida:</label>
                        <strong>${doc.ubicacion || 'No especificada'}</strong>
                    </div>
                </div>

                <!-- AÑADIMOS EL BLOQUE DE FIRMAS AQUÍ (solo aparecerá si es una requisición) -->
                ${firmasHtml}

                <h4>Items</h4>
                <div class="table-responsive">
                    <table class="items-table summary-table" style="width:100%">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>V. Unitario</th>
                                <th>V. Total</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot>
                            <tr>
                                <td colspan="5">Subtotal:</td>
                                <td>${formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                                <td colspan="5">IVA (19%):</td>
                                <td>${formatCurrency(iva)}</td>
                            </tr>
                            <tr>
                                <td colspan="5">TOTAL GENERAL:</td>
                                <td>${formatCurrency(totalGeneral)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- El HTML de las observaciones se mantiene aquí -->
                ${observacionesHtml}
            `;
            
            this.openPreviewModal(title, body);
        },
        
        // Acción de Aprobar (sin cambios)
        confirmApproval: function(docId, docType) {
            const title = 'Confirmar Aprobación';
            const body = `
                <p>¿Realmente quiere aprobar este documento (N° ${docId})?</p>
                <p>Esta acción no se puede deshacer.</p>
                <div class="action-buttons" style="margin-top: 20px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="RequisicionesModule.closePreviewModal()">No, Cancelar</button>
                    <button class="btn btn-success" onclick="RequisicionesModule.executeApproval('${docId}', '${docType}')">Sí, Aprobar</button>
                </div>
            `;
            this.openPreviewModal(title, body);
        },

         executeApproval: function(docId, docType) {
            const doc = docType === 'requisicion'
                ? historyData.find(d => d.id === docId)
                : ocHistoryData.find(d => d.id === docId);
            
            if (!doc) return;

            if (typeof InventarioCompartido === 'undefined' || typeof AlmacenService === 'undefined') {
                alert("Error crítico: Faltan módulos de Inventario o Almacén.");
                this.closePreviewModal();
                return;
            }

            const ubicacion = doc.ubicacion;
            if (!ubicacion) {
                alert("Error: No se pudo determinar la bodega de salida para este documento.");
                this.closePreviewModal();
                return;
            }
            console.log(`Validando stock para aprobación desde: ${ubicacion}`);

            // --- ¡NUEVA LÓGICA DE VALIDACIÓN PREVIA! ---
            let fallosDeStock = [];
            for (const item of doc.items) {
                const stockLocal = AlmacenService.consultarStock(ubicacion, item.codigo);
                const cantidadLocal = stockLocal ? stockLocal.cantidad : 0;
                const cantidadRequerida = parseInt(item.cantidad, 10);

                if (cantidadLocal < cantidadRequerida) {
                    const mensaje = `¡Stock insuficiente para ${item.descripcion || item.codigo} en ${ubicacion}! Disponible: ${cantidadLocal}, Requerido: ${cantidadRequerida}.`;
                    fallosDeStock.push(mensaje);
                }
            }

            // Si hay algún fallo, detenemos TODO antes de hacer cualquier resta.
            if (fallosDeStock.length > 0) {
                this.closePreviewModal();
                alert("La APROBACIÓN FUE CANCELADA por los siguientes motivos:\n\n- " + fallosDeStock.join("\n- "));
                return;
            }
            // --- FIN DE LA VALIDACIÓN PREVIA ---

            // Si llegamos aquí, hay stock suficiente. Procedemos con la resta.
            console.log("Stock validado. Procediendo a restar del inventario...");

            for (const item of doc.items) {
                if (!item.codigo || !item.cantidad) continue;
                
                const cantidadARestar = -parseInt(item.cantidad, 10);

                // 1. Restamos del INVENTARIO GLOBAL
                InventarioCompartido.actualizarProducto(item.codigo, cantidadARestar);
                
                // 2. Restamos del ALMACEN SERVICE
                const valorUnitario = parseCurrency(item.valorUnitario || item.precioUnitario || '0');
                AlmacenService.actualizarStock(ubicacion, item.codigo, cantidadARestar, valorUnitario);
            }

            doc.estado = 'approved';
            this.closePreviewModal();
            renderHistoryTable(getCombinedHistory());
            alert('¡Documento aprobado! El stock global y de almacén ha sido actualizado.');
        },
        
        // NUEVA Acción de Eliminar
        confirmDeletion: function(docId, docType) {
            const title = 'Confirmar Eliminación';
            const body = `
                <p class="text-danger"><strong>¡ADVERTENCIA!</strong></p>
                <p>Está a punto de eliminar permanentemente el documento N° ${docId}.</p>
                <p>¿Está seguro que desea continuar?</p>
                <div class="action-buttons" style="margin-top: 20px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="RequisicionesModule.closePreviewModal()">No, Cancelar</button>
                    <button class="btn btn-danger" onclick="RequisicionesModule.executeDeletion('${docId}', '${docType}')">Sí, Eliminar</button>
                </div>
            `;
            this.openPreviewModal(title, body);
        },

        executeDeletion: function(docId, docType) {
            if (docType === 'requisicion') {
                historyData = historyData.filter(d => d.id !== docId);
            } else {
                ocHistoryData = ocHistoryData.filter(d => d.id !== docId);
            }
            this.closePreviewModal();
            renderHistoryTable(getCombinedHistory());
            alert('Documento eliminado exitosamente.');
        },
        
        // Acción de Imprimir (sin cambios)
        printDocument: function(docId, docType) {
            alert(`Función de Imprimir/Exportar para el documento N° ${docId} está en desarrollo.`);
        }
    };
})();