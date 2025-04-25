document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual
    const currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('current-date').textContent = `FECHA: ${currentDate}`;
    
    // Datos de ejemplo
    const sampleItems = [
        { descripcion: "Codo de cobre de 1/2\"", unidad: "UND" },
        { descripcion: "Tee de cobre de 3/4\"", unidad: "UND" },
        { descripcion: "Reductor de cobre de 1\" a 1/2\"", unidad: "UND" },
        { descripcion: "Tubo de cobre de 1/2\" (3 metros)", unidad: "MTS" },
        { descripcion: "Soldadura de plata", unidad: "GR" }
    ];
    
    // Añadir fila a la tabla
    function addTableRow(itemData = null) {
        const tbody = document.getElementById('items-body');
        const rowCount = tbody.children.length + 1;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowCount}</td>
            <td><input type="text" value="${itemData?.descripcion || ''}"></td>
            <td><input type="text" value="${itemData?.unidad || ''}"></td>
            <td><input type="date"></td>
            <td><input type="number" class="cant-solicitada" value="${itemData?.cantidadSolicitada || ''}"></td>
            <td><input type="number" class="valor-unitario"></td>
            <td><input type="number" class="cant-entregada" value="${itemData?.cantidadEntregada || ''}"></td>
            <td><input type="number" class="valor-entregado"></td>
            <td><input type="number" class="cant-pendiente" readonly></td>
        `;
        
        tbody.appendChild(row);
        
        // Añadir event listeners para calcular automáticamente
        const inputs = row.querySelectorAll('input[type="number"]:not([readonly])');
        inputs.forEach(input => {
            input.addEventListener('change', calculatePending);
        });
    }
    
    // Calcular cantidad pendiente
    function calculatePending(event) {
        const row = event.target.closest('tr');
        const solicitada = parseFloat(row.querySelector('.cant-solicitada').value) || 0;
        const entregada = parseFloat(row.querySelector('.cant-entregada').value) || 0;
        const pendiente = solicitada - entregada;
        
        row.querySelector('.cant-pendiente').value = pendiente > 0 ? pendiente : 0;
    }
    
    // Inicializar con 3 filas de ejemplo
    for (let i = 0; i < 3; i++) {
        addTableRow(sampleItems[i]);
    }
    
    // Botón para añadir fila
    document.getElementById('add-row').addEventListener('click', function() {
        addTableRow();
    });
    
    // Botón para limpiar formulario
    document.getElementById('clear-form').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas limpiar todo el formulario?')) {
            document.querySelector('.requisicion-form').reset();
            const tbody = document.getElementById('items-body');
            tbody.innerHTML = '';
            addTableRow();
        }
    });
    
    // Botón para exportar a Excel (simulado)
    document.getElementById('export-excel').addEventListener('click', function() {
        alert('Función de exportación a Excel será implementada');
        // Aquí iría la lógica real para exportar a Excel
    });
});