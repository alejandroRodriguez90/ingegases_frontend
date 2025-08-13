// js/proyectos-module.js

window.ProyectosModule = (function() {
    // --- VARIABLES Y CONSTANTES PRIVADAS DEL MÓDULO ---
    const PROJECT_ID_PREFIX = 'OT-';
    const ADDITION_ID_PREFIX = 'AD-';
    
    let proyectosData = [];
    let proyectoEditandoId = null;
    let currentChartInstance = null; // NUEVO: Para gestionar la instancia del gráfico
    
    const MAIN_PROJECT_EDITABLE_FIELDS = ['descripcion', 'encargado', 'estado'];
    const ADDITION_EDITABLE_FIELDS = ['descripcion', 'ubicacion', 'fechaInicio', 'fechaFin', 'encargado', 'estado', 'presupuesto'];
    
    // --- INTERFAZ PÚBLICA ---
    return {
        // MODIFICADO: Se inicia sin datos de demostración
        init: function() {
            console.log("Módulo de Proyectos inicializado por el dashboard.");
            proyectosData = [];
        },
        
        // --- SECCIÓN PROYECTOS (SIN MODIFICACIONES) ---
        loadProyectos: function() {
            document.querySelector('.proyectos-main-screen').style.display = 'none';
            document.querySelector('.proyectos-detail-screen').style.display = 'block';
            
            const tableContent = `
                <div class="table-title-container">
                    <div class="section-title vertical-title">Proyectos</div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>ID</th>
                                    <th>Proyecto</th>
                                    <th>Descripción</th>
                                    <th>Ubicación</th>
                                    <th>Fecha de Inicio</th>
                                    <th>Fecha de Fin</th>
                                    <th>Encargado</th>
                                    <th>Estado</th>
                                    <th>Presupuesto</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="proyectosTableBody">
                                ${this.renderProyectosRecursivamente(proyectosData)}
                            </tbody>
                        </table>
                        <div class="export-button-container">
                            <button id="createProjectButton">Crear Proyecto</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('proyectosContent').innerHTML = tableContent;
            this.assignEventListeners();
        },
        
        // --- SECCIÓN REPORTES (LÓGICA MODIFICADA) ---
        loadReportes: function() {
            document.querySelector('.proyectos-main-screen').style.display = 'none';
            document.querySelector('.proyectos-detail-screen').style.display = 'block';
            
            const reportesContent = `
                <div class="table-title-container">
                    <div class="reportes-meses-nav">
                        <ul>
                            <li><a href="#" data-month="0" class="active">Enero</a></li>
                            <li><a href="#" data-month="1">Febrero</a></li>
                            <li><a href="#" data-month="2">Marzo</a></li>
                            <li><a href="#" data-month="3">Abril</a></li>
                            <li><a href="#" data-month="4">Mayo</a></li>
                            <li><a href="#" data-month="5">Junio</a></li>
                            <li><a href="#" data-month="6">Julio</a></li>
                            <li><a href="#" data-month="7">Agosto</a></li>
                            <li><a href="#" data-month="8">Septiembre</a></li>
                            <li><a href="#" data-month="9">Octubre</a></li>
                            <li><a href="#" data-month="10">Noviembre</a></li>
                            <li><a href="#" data-month="11">Diciembre</a></li>
                        </ul>
                    </div>
                    <div class="table-container">
                        <h3 id="reporte-titulo">Estadísticas de Proyectos - Enero</h3>
                        <div class="chart-container">
                            <canvas id="proyectosChart"></canvas>
                        </div>
                        <div class="report-actions">
                            <button class="btn-exportar-estilizado btn-excel" onclick="ProyectosModule.generarReporteExcel()">
                                <i class="fas fa-file-excel"></i> Exportar a Excel
                            </button>
                            <button class="btn-exportar-estilizado btn-pdf" onclick="ProyectosModule.generarReportePDF()">
                                <i class="fas fa-file-pdf"></i> Exportar a PDF
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('proyectosContent').innerHTML = reportesContent;
            this.assignReportEventListeners(); // Asignar eventos para los meses
            this.updateProyectosChart(0); // Cargar gráfico de Enero por defecto
        },

        // NUEVO: Asigna los eventos de clic a los enlaces de los meses
        assignReportEventListeners: function() {
            const mesesLinks = document.querySelectorAll('.reportes-meses-nav a');
            mesesLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    mesesLinks.forEach(l => l.classList.remove('active'));
                    e.target.classList.add('active');
                    const monthIndex = parseInt(e.target.dataset.month, 10);
                    this.updateProyectosChart(monthIndex);
                });
            });
        },

        // MODIFICADO: Esta función ahora actualiza el gráfico según el mes seleccionado
        updateProyectosChart: function(monthIndex) {
            const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            const nombreMes = meses[monthIndex];
            
            // Actualizar título
            document.getElementById('reporte-titulo').textContent = `Estadísticas de Proyectos - ${nombreMes}`;

            const ctx = document.getElementById('proyectosChart').getContext('2d');

            // Destruir el gráfico anterior si existe para evitar solapamientos
            if (currentChartInstance) {
                currentChartInstance.destroy();
            }

            // Filtrar proyectos por el mes seleccionado (y año actual)
            const proyectosDelMes = proyectosData.filter(p => {
                if (!p.fechaInicio || p.isAddition) return false;
                const fechaInicio = new Date(p.fechaInicio);
                return fechaInicio.getMonth() === monthIndex && fechaInicio.getFullYear() === new Date().getFullYear();
            });

            // Contar los estados de los proyectos filtrados
            const statusCounts = {
                'Asignado': 0, 'En Ejecución': 0, 'Realizado': 0, 'Facturado': 0, 'Anulado': 0
            };
            proyectosDelMes.forEach(p => {
                if(statusCounts.hasOwnProperty(p.estado)) {
                    statusCounts[p.estado]++;
                }
            });

            const data = {
                labels: ['Asignado', 'En Ejecución', 'Realizado', 'Facturado', 'Anulado'],
                datasets: [{
                    label: `Proyectos de ${nombreMes}`,
                    data: [
                        statusCounts['Asignado'],
                        statusCounts['En Ejecución'],
                        statusCounts['Realizado'],
                        statusCounts['Facturado'],
                        statusCounts['Anulado']
                    ],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)', 'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)', 'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            };
            
            currentChartInstance = new Chart(ctx, { 
                type: 'bar', 
                data: data, 
                options: { 
                    responsive: true, 
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1 // Asegura que el eje Y solo muestre enteros
                            }
                        } 
                    },
                    plugins: {
                        legend: {
                            display: true // Mantenemos la leyenda
                        }
                    }
                } 
            });
        },

        backToMain: function() {
            // Destruir el gráfico al salir para liberar memoria
            if (currentChartInstance) {
                currentChartInstance.destroy();
                currentChartInstance = null;
            }
            document.querySelector('.proyectos-main-screen').style.display = 'block';
            document.querySelector('.proyectos-detail-screen').style.display = 'none';
            document.getElementById('proyectosContent').innerHTML = '';
        },
        
        renderProyectosRecursivamente: function(proyectos, parentId = null) {
            let html = '';
            const proyectosFiltrados = proyectos.filter(proyecto => proyecto.parentId === parentId);
            
            proyectosFiltrados.forEach(proyecto => {
                let actionIcons = '';
                
                if (proyecto.isAddition) {
                    actionIcons = `<i class="fas fa-edit edit-project" data-id="${proyecto.id}" title="Editar"></i> <i class="fas fa-trash delete-project" data-id="${proyecto.id}" title="Eliminar"></i>`;
                } else {
                    actionIcons = `<i class="fas fa-edit edit-project" data-id="${proyecto.id}" title="Editar"></i> <i class="fas fa-plus-square add-addition" data-id="${proyecto.id}" title="Adición"></i> <i class="fas fa-file-pdf load-pdf" data-id="${proyecto.id}" title="Cargar PDF"></i> <i class="fas fa-download download-project" data-id="${proyecto.id}" title="Descargar"></i> <i class="fas fa-trash delete-project" data-id="${proyecto.id}" title="Eliminar"></i>`;
                }
                
                const rowClass = proyecto.isAddition ? 'project-row addition-row' : 'project-row';
                let eyeIcon = '';
                if (!proyecto.isAddition && proyectosData.some(p => p.parentId === proyecto.id)) {
                    eyeIcon = `<i class="fas fa-eye toggle-additions" data-project-id="${proyecto.id}" title="Mostrar/Ocultar Adiciones"></i>`;
                }
                
                html += `<tr class="${rowClass}" data-id="${proyecto.id}" data-parent-id="${proyecto.parentId || ''}"> <td class="eye-icon-cell">${eyeIcon}</td> <td>${proyecto.id}</td> <td>${proyecto.nombre}</td> <td>${proyecto.descripcion}</td> <td>${proyecto.ubicacion}</td> <td>${proyecto.fechaInicio}</td> <td>${proyecto.fechaFin}</td> <td>${proyecto.encargado}</td> <td>${proyecto.estado}</td> <td>${proyecto.presupuesto}</td> <td class="action-icons">${actionIcons}</td> </tr>`;
                html += this.renderProyectosRecursivamente(proyectos, proyecto.id);
            });
            return html;
        },
        
        assignEventListeners: function() {
            const tableBody = document.querySelector('#proyectosTableBody');
            if (tableBody) {
                tableBody.addEventListener('click', (event) => {
                    const target = event.target;
                    const projectId = target.dataset.id;
                    if (target.classList.contains('edit-project')) { this.editProject(projectId); } 
                    else if (target.classList.contains('add-addition')) { this.addAddition(projectId); } 
                    else if (target.classList.contains('load-pdf')) { this.loadPDF(projectId); } 
                    else if (target.classList.contains('download-project')) { this.downloadProject(projectId); } 
                    else if (target.classList.contains('delete-project')) { proyectoEditandoId = projectId; this.openConfirmModal(); } 
                    else if (target.classList.contains('toggle-additions')) { this.toggleAdditions(target.dataset.projectId); }
                });
            }
            document.getElementById('createProjectButton')?.addEventListener('click', () => { this.createProject(); });
        },
        
        toggleAdditions: function(projectId) {
            document.querySelectorAll(`.project-row[data-parent-id="${projectId}"]`).forEach(row => { row.classList.toggle('show-additions'); });
        },
        
        createProject: function() {
            proyectoEditandoId = null;
            this.openModal("Crear Proyecto");
            this.renderProjectForm();
        },
        
        editProject: function(projectId) {
            proyectoEditandoId = projectId;
            const proyecto = proyectosData.find(p => p.id === projectId);
            if (!proyecto) return;
            this.openModal("Editar Proyecto");
            this.renderProjectForm(proyecto);
        },
        
        addAddition: function(projectId) {
            proyectoEditandoId = null;
            this.openModal("Adición a Proyecto");
            this.renderProjectForm(null, projectId);
        },

        renderProjectForm: function(proyecto = null, parentId = null) {
            const isNew = proyecto === null;
            const isAddition = parentId !== null;
            const modalTitle = isNew ? (isAddition ? "Adición a Proyecto" : "Crear Proyecto") : "Editar Proyecto";
            const projectData = proyecto || { id: this.generateId(isAddition ? ADDITION_ID_PREFIX : PROJECT_ID_PREFIX), nombre: '', descripcion: '', ubicacion: '', fechaInicio: '', fechaFin: '', encargado: 'Ing Alexander Herrera', estado: 'Asignado', presupuesto: '' };
            
            let projectForm = `<div class="modal-content"><span class="close" onclick="ProyectosModule.closeModal()">×</span><h2 id="modalTitle">${modalTitle}</h2><form id="projectForm"><label for="projectId">ID:</label><input type="text" id="projectId" name="projectId" value="${projectData.id}" ${!isNew ? 'readonly' : ''} required><label for="projectName">Proyecto:</label><input type="text" id="projectName" name="projectName" value="${projectData.nombre}" ${!isNew && !isAddition ? 'readonly' : ''} required><label for="projectDescription">Descripción:</label><textarea id="projectDescription" name="projectDescription" required>${projectData.descripcion}</textarea><label for="projectLocation">Ubicación:</label><input type="text" id="projectLocation" name="projectLocation" value="${projectData.ubicacion}" ${!isNew && !isAddition ? 'readonly' : ''} required><label for="projectStartDate">Fecha de Inicio:</label><input type="date" id="projectStartDate" name="projectStartDate" value="${projectData.fechaInicio}" ${!isNew && !isAddition ? 'readonly' : ''} required><label for="projectEndDate">Fecha de Fin:</label><input type="date" id="projectEndDate" name="projectEndDate" value="${projectData.fechaFin}" ${!isNew && !isAddition ? 'readonly' : ''} required><label for="projectManager">Encargado:</label><select id="projectManager" name="projectManager" required><option value="Ing Alexander Herrera" ${projectData.encargado === 'Ing Alexander Herrera' ? 'selected' : ''}>Ing Alexander Herrera</option><option value="Ing Javier Sierra" ${projectData.encargado === 'Ing Javier Sierra' ? 'selected' : ''}>Ing Javier Sierra</option><option value="Ing Daniel Buitrago" ${projectData.encargado === 'Ing Daniel Buitrago' ? 'selected' : ''}>Ing Daniel Buitrago</option><option value="Ing Javier Penagos" ${projectData.encargado === 'Ing Javier Penagos' ? 'selected' : ''}>Ing Javier Penagos</option><option value="Ing Nicolás Saavedra" ${projectData.encargado === 'Ing Nicolás Saavedra' ? 'selected' : ''}>Ing Nicolás Saavedra</option><option value="Ing Melissa Gonzalez" ${projectData.encargado === 'Ing Melissa Gonzalez' ? 'selected' : ''}>Ing Melissa Gonzalez</option></select><label for="projectStatus">Estado:</label><select id="projectStatus" name="projectStatus" required><option value="Asignado" ${projectData.estado === 'Asignado' ? 'selected' : ''}>Asignado</option><option value="En Ejecución" ${projectData.estado === 'En Ejecución' ? 'selected' : ''}>En Ejecución</option><option value="Realizado" ${projectData.estado === 'Realizado' ? 'selected' : ''}>Realizado</option><option value="Facturado" ${projectData.estado === 'Facturado' ? 'selected' : ''}>Facturado</option><option value="Anulado" ${projectData.estado === 'Anulado' ? 'selected' : ''}>Anulado</option></select><label for="projectBudget">Presupuesto:</label><input type="text" id="projectBudget" name="projectBudget" value="${projectData.presupuesto}" required>${parentId ? `<input type="hidden" id="parentProjectId" name="parentProjectId" value="${parentId}">` : ''}<button type="submit" id="saveButton">${isNew ? 'Guardar' : 'Actualizar'}</button></form></div>`;
            document.getElementById('projectModal').innerHTML = projectForm;
            document.getElementById('projectForm').addEventListener('submit', (e) => { e.preventDefault(); this.saveProject(); });
            document.getElementById('projectModal').style.display = 'block';
        },
        
        saveProject: function() {
            const form = document.getElementById('projectForm');
            if (!form.checkValidity()) { form.reportValidity(); return; }
            const isEditing = !!proyectoEditandoId;
            const isAddition = !!document.getElementById('parentProjectId');
            const projectData = { id: document.getElementById('projectId').value, nombre: document.getElementById('projectName').value, descripcion: document.getElementById('projectDescription').value, ubicacion: document.getElementById('projectLocation').value, fechaInicio: document.getElementById('projectStartDate').value, fechaFin: document.getElementById('projectEndDate').value, encargado: document.getElementById('projectManager').value, estado: document.getElementById('projectStatus').value, presupuesto: document.getElementById('projectBudget').value, parentId: document.getElementById('parentProjectId')?.value || null, isAddition: isAddition };
            
            if (isEditing) {
                const index = proyectosData.findIndex(p => p.id === proyectoEditandoId);
                if (index !== -1) {
                    const existingProject = proyectosData[index];
                    let fieldsToUpdate = existingProject.isAddition ? ADDITION_EDITABLE_FIELDS : MAIN_PROJECT_EDITABLE_FIELDS;
                    fieldsToUpdate.forEach(field => { if (projectData.hasOwnProperty(field)) { existingProject[field] = projectData[field]; } });
                }
            } else {
                proyectosData.push(projectData);
            }
            this.closeModal();
            this.loadProyectos();
            proyectoEditandoId = null;
        },
        
        deleteProjectAndAdditions: function(projectId) {
            const additionsToDelete = proyectosData.filter(p => p.parentId === projectId).map(p => p.id);
            additionsToDelete.forEach(addId => this.deleteProjectAndAdditions(addId));
            proyectosData = proyectosData.filter(p => p.id !== projectId);
        },
        
        loadPDF: function(projectId) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/pdf';
            input.onchange = (event) => { if (event.target.files[0]) { alert(`PDF cargado para el proyecto ${projectId}: ${event.target.files[0].name}`); } };
            input.click();
        },
        
        downloadProject: function(projectId) {
            const proyecto = proyectosData.find(p => p.id === projectId);
            if (proyecto) {
                const blob = new Blob([JSON.stringify(proyecto, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `proyecto_${proyecto.id}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        },
        
        generateId: function(prefix) {
            return prefix + Date.now().toString().slice(-4) + Math.floor(Math.random() * 10);
        },
        
        openConfirmModal: function() {
            const confirmModal = document.getElementById('confirmModal');
            confirmModal.style.display = 'block';
            document.getElementById('confirmDelete').onclick = () => { this.deleteProjectAndAdditions(proyectoEditandoId); this.closeConfirmModal(); this.loadProyectos(); };
            document.getElementById('cancelDelete').onclick = () => { this.closeConfirmModal(); };
        },
        
        closeConfirmModal: function() {
            document.getElementById('confirmModal').style.display = 'none';
            proyectoEditandoId = null;
        },
        
        openModal: function() {
            document.getElementById('projectModal').style.display = 'block';
        },
        
        closeModal: function() {
             document.getElementById('projectModal').style.display = 'none';
        },
        
        generarReporteExcel: function() {
            alert('Generando reporte en Excel...');
        },
        
        generarReportePDF: function() {
            alert('Generando reporte en PDF...');
        }
    };
})();