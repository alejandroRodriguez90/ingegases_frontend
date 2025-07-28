
    // ==========================================================================
    // FUNCIONES DE UTILIDAD
    // ==========================================================================

    /**
     * Retrasa la ejecución de una función hasta que el usuario deja de invocarla 
     * por un período de tiempo determinado.
     * @param {Function} func La función a ejecutar.
     * @param {number} delay El retraso en milisegundos.
     * @returns {Function} La nueva función "debounced".
     */
    function debounce(func, delay = 300) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // ==========================================================================
    // CONSTANTES Y VARIABLES GLOBALES
    // ==========================================================================
    const ubicacionesDisponibles = ["Bogotá", "Cali"];
    let itemActual = null;
    let itemActualAccesorio = null;
    let itemActualOtros = null;
    let chart = null;
    let chartAccesorios = null;
    let chartOtros = null;
    
    // ==========================================================================
    // FUNCIONES DE NAVEGACIÓN 
    // ==========================================================================
    function backToMain() {
        document.getElementById('mainScreen').style.display = 'block';
        document.getElementById('detailScreen').style.display = 'none';
        window.scrollTo(0, 0);
    }
    
    function showDetailScreen() {
        document.getElementById('mainScreen').style.display = 'none';
        document.getElementById('detailScreen').style.display = 'block';
        window.scrollTo(0, 0);
        setTimeout(() => {
            if (chart) chart.resize();
            if (chartAccesorios) chartAccesorios.resize();
            if (chartOtros) chartOtros.resize();
        }, 100);
    }
    
    function navigateToTuberia() {
        showDetailScreen();
        updateActiveTab('tuberiaTab');
        loadInventory('tuberia');
    }
    
    function navigateToAccesorios() {
        showDetailScreen();
        updateActiveTab('accesoriosTab');
        loadInventory('accesorios');
    }
    
    function navigateToOtros() {
        showDetailScreen();
        updateActiveTab('otrosTab');
        loadInventory('otros');
    }
    
    function updateActiveTab(activeTabId) {
        ['tuberiaTab', 'accesoriosTab', 'otrosTab'].forEach(tabId => {
            document.getElementById(tabId).classList.remove('active');
        });
        document.getElementById(activeTabId).classList.add('active');
    }
    
    // ==========================================================================
    // FUNCIONES PRINCIPALES DE INVENTARIO
    // ==========================================================================
    
    /**
     * Carga el inventario según el tipo especificado
     * @param {string} type - Tipo de inventario a cargar ('tuberia', 'accesorios', 'otros')
     */
     function loadInventory(type) {
        // 1. Obtener configuración y productos (sin cambios)
        const config = getInventoryConfig(type);
        if (!config) {
            console.error(`Configuración no encontrada para el tipo: ${type}`);
            return;
        }
        const productos = getFilteredProducts(type);

        // 2. Actualizar pestaña activa (sin cambios)
        updateActiveTab(config.tabId);

        // 3. Renderizar la tabla (sin cambios)
        renderInventoryTable(type, productos, config);

        // 4. ¡LA CLAVE! Aplazar la configuración de eventos
        // Esto asegura que el DOM esté completamente actualizado ANTES de que intentemos
        // encontrar los elementos y adjuntarles los listeners.
        setTimeout(() => {
            configurarEventosInventario(type, productos, config);
        }, 0); // Un retardo de 0 es suficiente para moverlo al siguiente tick del event loop.
    }
    
    function getInventoryConfig(type) {
        const configs = {
            tuberia: {
                title: 'Tubería',
                filterFn: p => p.descripcion.includes('Tubería'),
                chartColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                tabId: 'tuberiaTab',
                chartVar: 'chart'
            },
            accesorios: {
                title: 'Accesorios',
                // Lógica actualizada: NO es tubería y su código NO empieza con 'IYR12'
                filterFn: p => !p.descripcion.includes('Tubería') && !p.codigo.startsWith('IYR12'),
                chartColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                tabId: 'accesoriosTab',
                chartVar: 'chartAccesorios'
            },
            otros: {
                title: 'Otros',
                // Lógica actualizada: Su código EMPIEZA con 'IYR12'
                filterFn: p => p.codigo.startsWith('IYR12'),
                chartColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tabId: 'otrosTab',
                chartVar: 'chartOtros'
            }
        };
        return configs[type];
    }
    
    function getFilteredProducts(type) {
        const config = getInventoryConfig(type);

        if (!config || typeof config.filterFn !== 'function') {
            console.error(`No se encontró configuración de filtro para el tipo: ${type}`);
            return [];
        }
        
        // 1. Obtenemos TODOS los productos.
        const todosLosProductos = InventarioCompartido.obtenerProductos();

        // 2. Aplicamos el filtro y GUARDAMOS el resultado en la variable 'productosFiltrados'.
        const productosFiltrados = todosLosProductos.filter(config.filterFn);
        
        // 3. (OPCIONAL PERO RECOMENDADO) Mostramos el resultado de la depuración.
        //    Esta línea ahora funcionará porque 'productosFiltrados' ya existe.
        console.log(`[Depuración] Tipo: '${type}'. Productos filtrados: ${productosFiltrados.length}`);
        
        // 4. Devolvemos la lista filtrada.
        return productosFiltrados;
    }


    function renderInventoryTable(type, productos, config) {
    const tableContent = `
        <div class="table-title-container">
            <div class="section-title vertical-title">${config.title}</div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Ubicación</th>
                            <th>Cantidad</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generarFilaConsulta(type, productos)}
                    </tbody>
                </table>
                <div class="export-button-container">
                    <button id="btnExportar-${type}" class="btn-export">
                        <!-- Icono SVG de hoja de cálculo/exportar -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5v2zM3 12v-2h2v2H3zm0 1h2v2H4a1 1 0 0 1-1-1v-1zm3 2v-2h3v2H6zm4 0v-2h2v1a1 1 0 0 1-1 1h-1zm3-3h-2v-2h2v2zm0-3h-2V9h2v2z"/>
                        </svg>
                        <span>Exportar a Excel</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="chart-container" style="display: none;">
            <h3>Gráfica de Consulta</h3>
            <canvas id="chart-${type}"></canvas>
        </div>
    `;

    document.getElementById('inventarioContent').innerHTML = tableContent;
    if (type === 'accesorios') {
        document.getElementById('inventarioContent').classList.add('content-transition');
    }
}
    
    // ==========================================================================
    // FUNCIONES PARA GENERAR FILAS DE CONSULTA
    // ==========================================================================
    
    function generarFilaConsulta(type, productos) {
    const prefix = getInputPrefix(type);
    const cantidadContent = getCantidadInputHtml(type, 0);

    const listaCodigosId = `listaCodigos${prefix}`;
    const listaDescripcionesId = `listaDescripciones${prefix}`;
    
    return `
        <tr class="fila-consulta">
            <td>
                <input type="text" id="inputCodigo${prefix}" placeholder="Código" 
                    list="${listaCodigosId}" autocomplete="off">
                <datalist id="${listaCodigosId}">
                    ${productos.map(item => 
                        `<option value="${item.codigo}" data-descripcion="${item.descripcion}">${item.descripcion}</option>`).join('')}
                </datalist>
            </td>
            <td>
                <input type="text" id="inputDescripcion${prefix}" 
                    placeholder="Buscar ${type}..." 
                    list="${listaDescripcionesId}" autocomplete="off">
                <datalist id="${listaDescripcionesId}">
                    ${productos.map(item => 
                        `<option value="${item.descripcion}" data-codigo="${item.codigo}">${item.codigo}</option>`).join('')}
                </datalist>
            </td>
            <td>
                <select id="inputUbicacion${prefix}" class="form-select">
                    ${AppConfig.ubicacionesDisponibles.map(ubicacion => 
                        `<option value="${ubicacion}">${ubicacion}</option>`).join('')}
                </select>
            </td>
            <td id="cantidadCell${prefix}">
                ${type === 'accesorios' ? `<div class="cantidad-container">${cantidadContent}</div>` : cantidadContent}
            </td>
            <td>
                <input type="number" id="inputValor${prefix}" placeholder="Valor" 
                       min="0" step="0.01" disabled>
            </td>
        </tr>
    `;
}
    
    function getInputPrefix(type) {
        return type === 'tuberia' ? '' : 
               type === 'accesorios' ? 'Accesorio' : 'Otros';
    }
    
    function getCantidadInputHtml(type, value) {
        if (value === 0) {
            return `
                <span class="no-stock" onclick="restaurarInputCantidad('${type}')">No Stock</span>
                <input type="number" id="inputCantidad${getInputPrefix(type)}" value="0" min="0" style="display:none;">
            `;
        }
        return `
            <input type="number" id="inputCantidad${getInputPrefix(type)}" placeholder="Cantidad" 
                   min="0" value="${value}" onchange="actualizarEstadoStock('${type}')">
        `;
    }
    
    // ==========================================================================
    // FUNCIONES PARA MANEJAR EL ESTADO DEL STOCK
    // ==========================================================================
    
    function actualizarEstadoStock(type) {
        const prefix = getInputPrefix(type);
        const cantidadInput = document.getElementById(`inputCantidad${prefix}`);
        const cantidadCell = document.getElementById(`cantidadCell${prefix}`);
        const valor = parseFloat(cantidadInput.value) || 0;
        
        cantidadCell.innerHTML = type === 'accesorios' ? 
            `<div class="cantidad-container">${getCantidadInputHtml(type, valor)}</div>` : 
            getCantidadInputHtml(type, valor);
        
        const currentItem = getCurrentItem(type);
        if (currentItem) {
            currentItem.cantidad = valor;
            actualizarGrafica(type, currentItem);
        }
    }
    
    function restaurarInputCantidad(type) {
        const prefix = getInputPrefix(type);
        const cantidadCell = document.getElementById(`cantidadCell${prefix}`);
        const html = `
            <input type="number" id="inputCantidad${prefix}" placeholder="Cantidad" min="0" 
                   value="0" onchange="actualizarEstadoStock('${type}')" disabled>
        `;
        
        cantidadCell.innerHTML = type === 'accesorios' ? 
            `<div class="cantidad-container">${html}</div>` : html;
        
        const currentItem = getCurrentItem(type);
        if (currentItem) {
            currentItem.cantidad = 0;
            actualizarGrafica(type, currentItem);
        }
    }
    
    // ==========================================================================
    // FUNCIONES PARA MANEJAR GRÁFICAS
    // ==========================================================================
    
    function actualizarGrafica(type, currentItem) {
        const config = getInventoryConfig(type);
        const chartContainer = document.querySelector('.chart-container');
        const chartElement = document.getElementById(`chart-${type}`); // Usar ID dinámico
        
        if (!currentItem || currentItem.cantidad <= 0) {
            chartContainer.style.display = 'none';
            if (window[config.chartVar]) {
                window[config.chartVar].destroy();
                window[config.chartVar] = null;
            }
            return;
        }
        
        chartContainer.style.display = 'block';
    
        if (window[config.chartVar]) {
            window[config.chartVar].destroy();
        }
        
        chartElement.width = chartElement.offsetWidth;
        chartElement.height = type === 'accesorios' ? 300 : 250;
        
        window[config.chartVar] = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels: [currentItem.descripcion],
                datasets: [{
                    label: 'Cantidad',
                    data: [currentItem.cantidad],
                    backgroundColor: config.chartColor,
                    borderColor: config.borderColor,
                    borderWidth: 1
                }]
            },
            options: getChartOptions(type, config, currentItem)
        });
    }
    
    function getChartOptions(type, config, currentItem) { // <-- CAMBIO: Añadimos 'type' aquí
        return {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: { /* ... */ },
            plugins: {
                legend: { display: false },
                tooltip: { /* ... */ }
            },
            layout: type === 'accesorios' ? { // <-- AHORA ESTO FUNCIONARÁ
                padding: { top: 10, right: 10, bottom: 10, left: 10 }
            } : {}
        };
    }
    
    // ==========================================================================
    // FUNCIONES PARA EXPORTAR A EXCEL
    // ==========================================================================
    
    function exportarAExcel(type) {
        const currentItem = getCurrentItem(type);
        if (!currentItem) {
            alert("No hay datos para exportar");
            return;
        }
        
        const prefix = getInputPrefix(type);
        const cantidadInput = document.getElementById(`inputCantidad${prefix}`);
        const cantidad = parseFloat(cantidadInput?.value) || 0;
        
        const datos = [{
            'Código': currentItem.codigo,
            'Descripción': currentItem.descripcion,
            'Ubicación': currentItem.ubicacion || ubicacionesDisponibles[0],
            'Cantidad': cantidad === 0 ? 'No Stock' : cantidad,
            'Valor': currentItem.valor ? '$' + currentItem.valor.toFixed(2) : 'N/A'
        }];
        
        const csvContent = generarContenidoCSV(datos);
        descargarCSV(csvContent, `${type}_${currentItem.codigo}.csv`);
    }
    
    function generarContenidoCSV(datos) {
        const headers = Object.keys(datos[0]);
        const csvRows = [
            headers.join(','),
            ...datos.map(row => 
                headers.map(header => 
                    `"${('' + row[header]).replace(/"/g, '\\"')}"`
                ).join(',')
            )
        ];
        return csvRows.join('\n');
    }
    
    function descargarCSV(content, fileName) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    

    // ==========================================================================
    // CONFIGURACIÓN DE EVENTOS (VERSIÓN FINAL Y CORREGIDA)
    // ==========================================================================

    function configurarEventosInventario(type, productos, config) {
        const prefix = getInputPrefix(type);
        // 1. Obtenemos la colección de elementos del DOM
        const elements = getInputElements(prefix, type);

        // 2. Verificamos que los elementos se encontraron
        if (!elements.inputCodigo || !elements.inputDesc || !elements.inputUbicacion) {
            console.error("❌ Error crítico: No se encontraron los elementos del formulario para la pestaña:", type);
            return; // Detenemos la ejecución para evitar más errores
        }

        // 3. Pasamos AMBOS parámetros, 'type' y 'elements', a la función principal.
        setupEventListeners(type, elements, config);
    }

    // getInputElements ya debería estar bien, pero asegúrate que se parece a esto:
    function getInputElements(prefix, type) {
        const ids = {
            inputCodigo: `inputCodigo${prefix}`,
            inputDesc: `inputDescripcion${prefix}`,
            inputUbicacion: `inputUbicacion${prefix}`,
            cantidadCell: `cantidadCell${prefix}`, // Celda <td> que contiene el input/span de cantidad
            inputValor: `inputValor${prefix}`,
            btnExportar: `btnExportar-${type}`
        };
        const elements = {};
        for (const key in ids) {
            elements[key] = document.getElementById(ids[key]);
        }
        return elements;
    }

    // setupEventListeners con la lógica que ya teníamos, pero ahora SÍ recibe 'elements'
    function setupEventListeners(type, elements, config) {

        // Función central que actualiza la vista basado en la selección
        const actualizarVistaPorSeleccion = () => {
            const codigo = elements.inputCodigo.value;
            const ubicacion = elements.inputUbicacion.value;

            const productoBase = InventarioCompartido.buscarProducto(codigo);
            if (!productoBase || !config.filterFn(productoBase)) {
                elements.inputDesc.value = '';
                elements.inputValor.value = '';
                elements.cantidadCell.innerHTML = getCantidadInputHtml(type, 0);
                resetCurrentItem(type);
                actualizarGrafica(type, null);
                return;
            }
            
            elements.inputDesc.value = productoBase.descripcion;
            
            const stockInfo = AlmacenService.consultarStock(ubicacion, codigo);
            if (stockInfo) {
                elements.cantidadCell.innerHTML = getCantidadInputHtml(type, stockInfo.cantidad);
                elements.inputValor.value = stockInfo.valor;
                setCurrentItem(type, { ...productoBase, ...stockInfo, ubicacion }, elements);
            } else {
                elements.cantidadCell.innerHTML = getCantidadInputHtml(type, 0);
                elements.inputValor.value = 0;
                setCurrentItem(type, { ...productoBase, cantidad: 0, valor: 0, ubicacion }, elements);
            }
            actualizarGrafica(type, getCurrentItem(type));
        };

        // --- ASIGNACIÓN DE LISTENERS ---

        const onSelection = (event) => {
            let producto;
            // Priorizamos la búsqueda por código si ambos campos tienen algo
            if (elements.inputCodigo.value) {
                producto = InventarioCompartido.buscarProducto(elements.inputCodigo.value);
            } else if (elements.inputDesc.value) {
                producto = InventarioCompartido.buscarProductoPorDescripcion(elements.inputDesc.value);
            }

            if (producto) {
                elements.inputCodigo.value = producto.codigo;
                elements.inputDesc.value = producto.descripcion;
            }
            // Siempre llamamos a actualizar para que limpie si el producto no es válido
            actualizarVistaPorSeleccion();
        };
        
        elements.inputCodigo.addEventListener('change', onSelection);
        elements.inputDesc.addEventListener('change', onSelection);
        elements.inputUbicacion.addEventListener('change', actualizarVistaPorSeleccion);
        elements.btnExportar.addEventListener('click', () => exportarAExcel(type));

        // Listener para actualizaciones en tiempo real
        window.addEventListener('stockActualizado', () => {
            if (document.body.contains(elements.inputCodigo) && elements.inputCodigo.value) {
                console.log("Evento 'stockActualizado' recibido. Refrescando...");
                actualizarVistaPorSeleccion();
            }
        });
    }

    
    // ==========================================================================
    // MANEJO DE ITEMS ACTUALES
    // ==========================================================================
    
    function getCurrentItem(type) {
        switch(type) {
            case 'tuberia': return itemActual;
            case 'accesorios': return itemActualAccesorio;
            case 'otros': return itemActualOtros;
            default: return null;
        }
    }
    
    function setCurrentItem(type, producto, elements) {
        let cantidadActual = 0;
        const inputCantidad = elements.cantidadCell.querySelector('input[type="number"]');
        
        if (inputCantidad) {
        
            cantidadActual = parseFloat(inputCantidad.value) || 0;
        } else {

        }

        const item = {
            ...producto,
            ubicacion: elements.inputUbicacion.value,
            valor: parseFloat(elements.inputValor.value) || 0,
            cantidad: cantidadActual // <-- Usamos la variable que calculamos
        };
        
        switch(type) {
            case 'tuberia': itemActual = item; break;
            case 'accesorios': itemActualAccesorio = item; break;
            case 'otros': itemActualOtros = item; break;
        }
    }
    
    function resetCurrentItem(type) {
        switch(type) {
            case 'tuberia': itemActual = null; break;
            case 'accesorios': itemActualAccesorio = null; break;
            case 'otros': itemActualOtros = null; break;
        }
    }
    

    // ==========================================================================
    // LISTENER PARA ACTUALIZACIONES EN TIEMPO REAL
    // ==========================================================================
    window.addEventListener('inventarioActualizado', () => {
        console.log('🔄 Evento "inventarioActualizado" detectado. Refrescando la vista...');
        
        // Obtenemos la pestaña activa actualmente
        const activeTab = document.querySelector('.submenu-inventario button.active');
        if (activeTab) {
            // Extraemos el tipo de inventario del ID del botón (ej: 'tuberiaTab' -> 'tuberia')
            const type = activeTab.id.replace('Tab', '');
            // Volvemos a cargar el inventario para esa pestaña, que tomará los nuevos datos
            loadInventory(type);
        }
    });
    