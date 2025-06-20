panel-admin/
│
├── dashboard.html          # Punto de entrada único
│   ├─ Carga js/inventario-global.js (SINGLETON)
│   └─ Carga módulos dinámicamente mediante <iframe> o AJAX
│
├── css/
│   ├── main.css            # Estilos globales (compartidos)
│   └── responsive.css      # Media queries (compartidas)
│
├── js/
│   └── inventario-global.js  # Cerebro del sistema
│       ├── Estado global
│       ├── API de inventario
│       ├── Gestión de almacenes
│       └── Sistema de eventos
│
└── modules/                # Módulos autocontenidos
    │
    ├── inventario.html     # Vista de inventario
    │   ├── UI específica
    │   ├── Escucha eventos
    │   └── Sólo lógica de presentación
    │
    ├── almacén.html        # Gestión de almacenes
    │   ├── UI específica
    │   ├── Modifica estado global
    │   └── Dispara eventos
    │
    └── [otros módulos...]  # Misma estructura
        ├── proyectos.html
        ├── requisición.html
        ├── proveedores.html
        └── soporte.html

FLUJO DE DATOS:
1. dashboard.html
   │
   ├─ ① Carga inventario-global.js
   │  (crea instancia única)
   │
   └─ ② Carga módulos/*.html
      │
      ├─ almacén.html ◄───┐
      │  ├─ ③ Modifica estado │
      │  └─ ④ Dispara evento ─┘
      │
      └─ inventario.html
         ├─ ⑤ Escucha evento ◄──┐
         └─ ⑥ Actualiza vista    │
                                 │
localStorage (sync) ◄────────────┘


+-----------------------------------------------------------------------------------+
|                                ESTRUCTURA DEL SISTEMA                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +----------------------------+                                                   |
|  |       dashboard.html       |  <-- Punto de entrada único                       |
|  | (Carga UNA SOLA VEZ el     |                                                   |
|  |  inventario-global.js)     |                                                   |
|  +-------------|--------------+                                                   |
|                |                                                                  |
|                | Carga Módulos (HTML)                                             |
|                |                                                                  |
|  +-------------|----------------------------------------------------------------+ |
|  |             |                                                                | |
|  |  +----------v---------+   +----------------+   +----------------+            | |
|  |  |    almacen.html    |   | inventario.html|   |  otros.html... |            | |
|  |  +----------|---------+   +-------|--------+   +----------------+            | |
|  |             |                 ^  |                                          | |
|  |             | 1. El usuario   |  | 4. El módulo lee                         | |
|  |             |    guarda un    |  |    los datos y                           | |
|  |             |    producto.    |  |    actualiza su                          | |
|  |             |                 |  |    propia vista.                         | |
|  |             v                 |  |                                          | |
|  |  +----------+-----------------v--+-----------------+                        | |
|  |  |         localStorage ("inventarioCompartido")   |  <-- Estado Central    | |
|  |  +----------+-----------------^--+-----------------+    Persistente         | |
|  |             |                 |                                             | |
|  |             | 2. El módulo    | 3. El evento notifica a                     | |
|  |             |    actualiza     |    todos los módulos que                   | |
|  |             |    localStorage. |    hay un cambio.                          | |
|  |             |                 |                                             | |
|  |             v                 |                                             | |
|  |  +----------+-----------------v--+-----------------+                        | |
|  |  |    window.dispatchEvent('inventarioActualizado')   |  <-- Sistema de     | |
|  |  +----------------------------------------------------+    Notificación     | |
|  |                                                                             | |
|  |  +---------------------------------------+                                   | |
|  |  |       js/inventario-global.js         |  <-- Fuente única de verdad       | |
|  |  |                                       |                                   | |
|  |  | - Maneja toda la lógica de inventario |                                   | |
|  |  | - Centraliza acceso a localStorage    |                                   | |
|  |  | - Dispara eventos de actualización    |                                   | |
|  |  +---------------------------------------+                                   | |
|  |                                                                             | |
|  +-----------------------------------------------------------------------------+ |
|                                                                                   |
|  FLUJO DETALLADO:                                                                 |
|                                                                                   |
|  1. Usuario interactúa con almacén.html:                                          |
|     - Agrega/edita producto                                                       |
|     - Llama a InventarioCompartido.actualizarProducto()                           |
|                                                                                   |
|  2. inventario-global.js:                                                         |
|     - Actualiza sus datos internos                                                |
|     - Guarda en localStorage                                                      |
|     - Dispara evento 'inventarioActualizado'                                      |
|                                                                                   |
|  3. inventario.html (y otros módulos):                                            |
|     - Escuchan evento 'inventarioActualizado'                                     |
|     - Vuelven a leer datos de localStorage                                        |
|     - Actualizan sus vistas                                                       |
|                                                                                   |
|  4. dashboard.html:                                                               |
|     - Solo sirve como contenedor principal                                        |
|     - Carga inicial de inventario-global.js                                       |
|                                                                                   |
+-----------------------------------------------------------------------------------+


inicializarDatosPorDefecto: function() {
        const tuberias = [
        {codigo: "IYR0001", descripcion: "TuberíaCobre K 1/4"},
        {codigo: "IYR0002", descripcion: "TuberíaCobre K 3/8"},
        {codigo: "IYR0003", descripcion: "TuberíaCobre K 1/2"},
        {codigo: "IYR0004", descripcion: "TuberíaCobre K 3/4"},
        {codigo: "IYR0005", descripcion: "TuberíaCobre K 1"},
        {codigo: "IYR0006", descripcion: "TuberíaCobre K 1.1/4"},
        {codigo: "IYR0007", descripcion: "TuberíaCobre K 1.1/2"},
        {codigo: "IYR0008", descripcion: "TuberíaCobre K 2"},
        {codigo: "IYR0009", descripcion: "TuberíaCobre K 2.1/2"},
        {codigo: "IYR0010", descripcion: "TuberíaCobre K 3"},
        {codigo: "IYR0011", descripcion: "TuberíaCobre L 1/4"},
        {codigo: "IYR0012", descripcion: "TuberíaCobre L 3/8"},
        {codigo: "IYR0013", descripcion: "TuberíaCobre L 1/2"},
        {codigo: "IYR0014", descripcion: "TuberíaCobre L 3/4"},
        {codigo: "IYR0015", descripcion: "TuberíaCobre L 1"},
        {codigo: "IYR0016", descripcion: "TuberíaCobre L 1.1/4"},
        {codigo: "IYR0017", descripcion: "TuberíaCobre L 1.1/2"},
        {codigo: "IYR0018", descripcion: "TuberíaCobre L 2"},
        {codigo: "IYR0019", descripcion: "TuberíaCobre L 2.1/2"},
        {codigo: "IYR0020", descripcion: "TuberíaCobre L 3"},
        
        // Tuberías de Acero Inoxidable
        {codigo: "IYR0021", descripcion: "TuberíaAceroInoxidable Sch10 1/4"},
        {codigo: "IYR0022", descripcion: "TuberíaAceroInoxidable Sch10 3/8"},
        {codigo: "IYR0023", descripcion: "TuberíaAceroInoxidable Sch10 1/2"},
        {codigo: "IYR0024", descripcion: "TuberíaAceroInoxidable Sch10 3/4"},
        {codigo: "IYR0025", descripcion: "TuberíaAceroInoxidable Sch10 1"},
        {codigo: "IYR0026", descripcion: "TuberíaAceroInoxidable Sch10 1.1/4"},
        {codigo: "IYR0027", descripcion: "TuberíaAceroInoxidable Sch10 1.1/2"},
        {codigo: "IYR0028", descripcion: "TuberíaAceroInoxidable Sch10 2"},
        {codigo: "IYR0029", descripcion: "TuberíaAceroInoxidable Sch10 2.1/2"},
        {codigo: "IYR0030", descripcion: "TuberíaAceroInoxidable Sch10 3"},
        {codigo: "IYR0031", descripcion: "TuberíaAceroInoxidable Sch40 1/4"},
        {codigo: "IYR0032", descripcion: "TuberíaAceroInoxidable Sch40 3/8"},
        {codigo: "IYR0033", descripcion: "TuberíaAceroInoxidable Sch40 1/2"},
        {codigo: "IYR0034", descripcion: "TuberíaAceroInoxidable Sch40 3/4"},
        {codigo: "IYR0035", descripcion: "TuberíaAceroInoxidable Sch40 1"},
        {codigo: "IYR0036", descripcion: "TuberíaAceroInoxidable Sch40 1.1/4"},
        {codigo: "IYR0037", descripcion: "TuberíaAceroInoxidable Sch40 1.1/2"},
        {codigo: "IYR0038", descripcion: "TuberíaAceroInoxidable Sch40 2"},
        {codigo: "IYR0039", descripcion: "TuberíaAceroInoxidable Sch40 2.1/2"},
        {codigo: "IYR0040", descripcion: "TuberíaAceroInoxidable Sch40 3"},
        {codigo: "IYR0041", descripcion: "TuberíaAceroInoxidable Sch80 1/4"},
        {codigo: "IYR0042", descripcion: "TuberíaAceroInoxidable Sch80 3/8"},
        {codigo: "IYR0043", descripcion: "TuberíaAceroInoxidable Sch80 1/2"},
        {codigo: "IYR0044", descripcion: "TuberíaAceroInoxidable Sch80 3/4"},
        {codigo: "IYR0045", descripcion: "TuberíaAceroInoxidable Sch80 1"},
        {codigo: "IYR0046", descripcion: "TuberíaAceroInoxidable Sch80 1.1/4"},
        {codigo: "IYR0047", descripcion: "TuberíaAceroInoxidable Sch80 1.1/2"},
        {codigo: "IYR0048", descripcion: "TuberíaAceroInoxidable Sch80 2"},
        {codigo: "IYR0049", descripcion: "TuberíaAceroInoxidable Sch80 2.1/2"},
        {codigo: "IYR0050", descripcion: "TuberíaAceroInoxidable Sch80 3"},
        
        // Tuberías de Acero Carbono
        {codigo: "IYR0051", descripcion: "TuberíaAceroCarbono Sch10 1/4"},
        {codigo: "IYR0052", descripcion: "TuberíaAceroCarbono Sch10 3/8"},
        {codigo: "IYR0053", descripcion: "TuberíaAceroCarbono Sch10 1/2"},
        {codigo: "IYR0054", descripcion: "TuberíaAceroCarbono Sch10 3/4"},
        {codigo: "IYR0055", descripcion: "TuberíaAceroCarbono Sch10 1"},
        {codigo: "IYR0056", descripcion: "TuberíaAceroCarbono Sch10 1.1/4"},
        {codigo: "IYR0057", descripcion: "TuberíaAceroCarbono Sch10 1.1/2"},
        {codigo: "IYR0058", descripcion: "TuberíaAceroCarbono Sch10 2"},
        {codigo: "IYR0059", descripcion: "TuberíaAceroCarbono Sch10 2.1/2"},
        {codigo: "IYR0060", descripcion: "TuberíaAceroCarbono Sch10 3"},
        {codigo: "IYR0061", descripcion: "TuberíaAceroCarbono Sch40 1/4"},
        {codigo: "IYR0062", descripcion: "TuberíaAceroCarbono Sch40 3/8"},
        {codigo: "IYR0063", descripcion: "TuberíaAceroCarbono Sch40 1/2"},
        {codigo: "IYR0064", descripcion: "TuberíaAceroCarbono Sch40 3/4"},
        {codigo: "IYR0065", descripcion: "TuberíaAceroCarbono Sch40 1"},
        {codigo: "IYR0066", descripcion: "TuberíaAceroCarbono Sch40 1.1/4"},
        {codigo: "IYR0067", descripcion: "TuberíaAceroCarbono Sch40 1.1/2"},
        {codigo: "IYR0068", descripcion: "TuberíaAceroCarbono Sch40 2"},
        {codigo: "IYR0069", descripcion: "TuberíaAceroCarbono Sch40 2.1/2"},
        {codigo: "IYR0070", descripcion: "TuberíaAceroCarbono Sch40 3"},
        {codigo: "IYR0071", descripcion: "TuberíaAceroCarbono Sch80 1/4"},
        {codigo: "IYR0072", descripcion: "TuberíaAceroCarbono Sch80 3/8"},
        {codigo: "IYR0073", descripcion: "TuberíaAceroCarbono Sch80 1/2"},
        {codigo: "IYR0074", descripcion: "TuberíaAceroCarbono Sch80 3/4"},
        {codigo: "IYR0075", descripcion: "TuberíaAceroCarbono Sch80 1"},
        {codigo: "IYR0076", descripcion: "TuberíaAceroCarbono Sch80 1.1/4"},
        {codigo: "IYR0077", descripcion: "TuberíaAceroCarbono Sch80 1.1/2"},
        {codigo: "IYR0078", descripcion: "TuberíaAceroCarbono Sch80 2"},
        {codigo: "IYR0079", descripcion: "TuberíaAceroCarbono Sch80 2.1/2"},
        {codigo: "IYR0080", descripcion: "TuberíaAceroCarbono Sch80 3"},
        
        // Tuberías de PVC
        {codigo: "IYR0081", descripcion: "TuberíaPVCPresion 3/8"},
        {codigo: "IYR0082", descripcion: "TuberíaPVCPresion 1/2"},
        {codigo: "IYR0083", descripcion: "TuberíaPVCPresion 3/4"},
        {codigo: "IYR0084", descripcion: "TuberíaPVCPresion 1"},
        {codigo: "IYR0085", descripcion: "TuberíaPVCPresion 1.1/4"},
        {codigo: "IYR0086", descripcion: "TuberíaPVCPresion 1.1/2"},
        {codigo: "IYR0087", descripcion: "TuberíaPVCPresion 2"},
        {codigo: "IYR0088", descripcion: "TuberíaPVCPresion 2.1/2"},
        {codigo: "IYR0089", descripcion: "TuberíaPVCPresion 3"},
        
        // Tuberías EMT
        {codigo: "IYR0090", descripcion: "TuberíaEMT 1/2"},
        {codigo: "IYR0091", descripcion: "TuberíaEMT 3/4"},
        {codigo: "IYR0092", descripcion: "TuberíaEMT 1"},
        {codigo: "IYR0093", descripcion: "TuberíaEMT 1.1/2"},
        {codigo: "IYR0094", descripcion: "TuberíaEMT 2"},

        // ============= COBRE ============= (95-188)
        // Uniones
        {codigo: "IYR0095", descripcion: "Union Cobre 1/8"},
        {codigo: "IYR0096", descripcion: "Union Cobre 1/4"},
        {codigo: "IYR0097", descripcion: "Union Cobre 1/2"},
        {codigo: "IYR0098", descripcion: "Union Cobre 3/8"},
        {codigo: "IYR0099", descripcion: "Union Cobre 3/4"},
        {codigo: "IYR0100", descripcion: "Union Cobre 1"},
        {codigo: "IYR0101", descripcion: "Union Cobre 1.1/4"},
        {codigo: "IYR0102", descripcion: "Union Cobre 1.1/2"},
        {codigo: "IYR0103", descripcion: "Union Cobre 2"},
        {codigo: "IYR0104", descripcion: "Union Cobre 2.1/2"},
        {codigo: "IYR0105", descripcion: "Union Cobre 3"},

        // Tees
        {codigo: "IYR0106", descripcion: "Tee Cobre 1/8"},
        {codigo: "IYR0107", descripcion: "Tee Cobre 1/4"},
        {codigo: "IYR0108", descripcion: "Tee Cobre 1/2"},
        {codigo: "IYR0109", descripcion: "Tee Cobre 3/8"},
        {codigo: "IYR0110", descripcion: "Tee Cobre 3/4"},
        {codigo: "IYR0111", descripcion: "Tee Cobre 1"},
        {codigo: "IYR0112", descripcion: "Tee Cobre 1.1/4"},
        {codigo: "IYR0113", descripcion: "Tee Cobre 1.1/2"},
        {codigo: "IYR0114", descripcion: "Tee Cobre 2"},
        {codigo: "IYR0115", descripcion: "Tee Cobre 2.1/2"},
        {codigo: "IYR0116", descripcion: "Tee Cobre 3"},

        // Tees Reducidas
        {codigo: "IYR0117", descripcion: "Tee Reducida Cobre 1*3/4"},
        {codigo: "IYR0118", descripcion: "Tee Reducida Cobre 1*1/2"},
        {codigo: "IYR0119", descripcion: "Tee Reducida Cobre 3/4*1/2"},
        {codigo: "IYR0120", descripcion: "Tee Reducida Cobre 1/2*3/8"},
        {codigo: "IYR0121", descripcion: "Tee Reducida Cobre 1/2*1"},
        {codigo: "IYR0122", descripcion: "Tee Reducida Cobre 1.1/4*3/4"},

        // Codos
        {codigo: "IYR0123", descripcion: "Codo Cobre 1/8"},
        {codigo: "IYR0124", descripcion: "Codo Cobre 1/4"},
        {codigo: "IYR0125", descripcion: "Codo Cobre 3/8"},
        {codigo: "IYR0126", descripcion: "Codo Cobre 1/2"},
        {codigo: "IYR0127", descripcion: "Codo Cobre 3/4"},
        {codigo: "IYR0128", descripcion: "Codo Cobre 1"},
        {codigo: "IYR0129", descripcion: "Codo Cobre 1.1/4"},
        {codigo: "IYR0130", descripcion: "Codo Cobre 1.1/2"},
        {codigo: "IYR0131", descripcion: "Codo Cobre 2"},
        {codigo: "IYR0132", descripcion: "Codo Cobre 2.1/2"},
        {codigo: "IYR0133", descripcion: "Codo Cobre 3"},

        // Semicodos
        {codigo: "IYR0134", descripcion: "Semicodo Cobre 1/2"},
        {codigo: "IYR0135", descripcion: "Semicodo Cobre 3/4"},
        {codigo: "IYR0136", descripcion: "Semicodo Cobre 1"},
        {codigo: "IYR0137", descripcion: "Semicodo Cobre 1.1/4"},
        {codigo: "IYR0138", descripcion: "Semicodo Cobre 1.1/2"},
        {codigo: "IYR0139", descripcion: "Semicodo Cobre 2"},
        {codigo: "IYR0140", descripcion: "Semicodo Cobre 3"},

        // Copas Reductoras
        {codigo: "IYR0141", descripcion: "CopaRed Cobre 3*2.1/2"},
        {codigo: "IYR0142", descripcion: "CopaRed Cobre 3*2"},
        {codigo: "IYR0143", descripcion: "CopaRed Cobre 2*1.1/2"},
        {codigo: "IYR0144", descripcion: "CopaRed Cobre 2*1.1/4"},
        {codigo: "IYR0145", descripcion: "CopaRed Cobre 2*1"},
        {codigo: "IYR0146", descripcion: "CopaRed Cobre 1*3/4"},
        {codigo: "IYR0147", descripcion: "CopaRed Cobre 1*3/8"},
        {codigo: "IYR0148", descripcion: "CopaRed Cobre 1*1/2"},
        {codigo: "IYR0149", descripcion: "CopaRed Cobre 3/4*1/2"},
        {codigo: "IYR0150", descripcion: "CopaRed Cobre 3/4*3/8"},
        {codigo: "IYR0151", descripcion: "CopaRed Cobre 3/4*1/4"},
        {codigo: "IYR0152", descripcion: "CopaRed Cobre 1/2*3/8"},
        {codigo: "IYR0153", descripcion: "CopaRed Cobre 1/2*1/4"},
        {codigo: "IYR0154", descripcion: "CopaRed Cobre 1/2*1/8"},

        // Universales
        {codigo: "IYR0155", descripcion: "Universal Cobre 3/8"},
        {codigo: "IYR0156", descripcion: "Universal Cobre 1/2"},
        {codigo: "IYR0157", descripcion: "Universal Cobre 3/4"},
        {codigo: "IYR0158", descripcion: "Universal Cobre 1"},
        {codigo: "IYR0159", descripcion: "Universal Cobre 1.1/4"},
        {codigo: "IYR0160", descripcion: "Universal Cobre 1.1/2"},
        {codigo: "IYR0161", descripcion: "Universal Cobre 2"},
        {codigo: "IYR0162", descripcion: "Universal Cobre 2.1/2"},
        {codigo: "IYR0163", descripcion: "Universal Cobre 3"},

        // Tapones
        {codigo: "IYR0164", descripcion: "Tapon Cobre 1/8"},
        {codigo: "IYR0165", descripcion: "Tapon Cobre 1/4"},
        {codigo: "IYR0166", descripcion: "Tapon Cobre 3/8"},
        {codigo: "IYR0167", descripcion: "Tapon Cobre 1/2"},
        {codigo: "IYR0168", descripcion: "Tapon Cobre 3/4"},
        {codigo: "IYR0169", descripcion: "Tapon Cobre 1"},
        {codigo: "IYR0170", descripcion: "Tapon Cobre 1.1/4"},
        {codigo: "IYR0171", descripcion: "Tapon Cobre 1.1/2"},
        {codigo: "IYR0172", descripcion: "Tapon Cobre 2"},
        {codigo: "IYR0173", descripcion: "Tapon Cobre 2.1/2"},
        {codigo: "IYR0174", descripcion: "Tapon Cobre 3"},

        // Adaptadores NPTH
        {codigo: "IYR0175", descripcion: "Adaptador Cobre 3/8 Soldeo NPTH"},
        {codigo: "IYR0176", descripcion: "Adaptador Cobre 1/2 Soldeo NPTH"},
        {codigo: "IYR0177", descripcion: "Adaptador Cobre 3/4 Soldeo NPTH"},
        {codigo: "IYR0178", descripcion: "Adaptador Cobre 1 Soldeo NPTH"},
        {codigo: "IYR0179", descripcion: "Adaptador Cobre 1.1/4 Soldeo NPTH"},
        {codigo: "IYR0180", descripcion: "Adaptador Cobre 1.1/2 Soldeo NPTH"},
        {codigo: "IYR0181", descripcion: "Adaptador Cobre 2 Soldeo NPTH"},

        // Adaptadores NPTM
        {codigo: "IYR0182", descripcion: "Adaptador Cobre 3/8 Soldeo NPTM"},
        {codigo: "IYR0183", descripcion: "Adaptador Cobre 1/2 Soldeo NPTM"},
        {codigo: "IYR0184", descripcion: "Adaptador Cobre 3/4 Soldeo NPTM"},
        {codigo: "IYR0185", descripcion: "Adaptador Cobre 1 Soldeo NPTM"},
        {codigo: "IYR0186", descripcion: "Adaptador Cobre 1.1/4 Soldeo NPTM"},
        {codigo: "IYR0187", descripcion: "Adaptador Cobre 1.1/2 Soldeo NPTM"},
        {codigo: "IYR0188", descripcion: "Adaptador Cobre 2 Soldeo NPTM"},

        // ============= ACERO INOXIDABLE ============= (189-484)
        // Conectores básicos
        {codigo: "IYR0189", descripcion: "Conector Inox 1/8"},
        {codigo: "IYR0190", descripcion: "Conector Inox 1/4"},
        {codigo: "IYR0191", descripcion: "Conector Inox 1/2"},
        {codigo: "IYR0192", descripcion: "Conector Inox 3/8"},
        {codigo: "IYR0193", descripcion: "Conector Inox 3/4"},
        {codigo: "IYR0194", descripcion: "Conector Inox 1"},
        {codigo: "IYR0195", descripcion: "Conector Inox 1.1/4"},
        {codigo: "IYR0196", descripcion: "Conector Inox 1.1/2"},
        {codigo: "IYR0197", descripcion: "Conector Inox 2"},

        // Conectores OD/OD
        {codigo: "IYR0198", descripcion: "Conector Inox 1/8 OD * 1/8 OD"},
        {codigo: "IYR0199", descripcion: "Conector Inox 1/4 OD * 1/4 OD"},
        {codigo: "IYR0200", descripcion: "Conector Inox 1/2 OD * 1/2 OD"},
        {codigo: "IYR0201", descripcion: "Conector Inox 3/8 OD * 3/8 OD"},
        {codigo: "IYR0202", descripcion: "Conector Inox 3/4 OD * 3/4 OD"},
        {codigo: "IYR0203", descripcion: "Conector Inox 1 OD * 1 OD"},
        {codigo: "IYR0204", descripcion: "Conector Inox 1.1/4 OD * 1.1/4 OD"},
        {codigo: "IYR0205", descripcion: "Conector Inox 1.1/2 OD * 1.1/2 OD"},
        {codigo: "IYR0206", descripcion: "Conector Inox 2 OD * 2 OD"},

        // ============= ACERO INOXIDABLE (continuación) =============
        // Conectores NPTM/NPTM (207-215)
        {codigo: "IYR0207", descripcion: "Conector Inox 1/8 NPTM * 1/8 NPTM"},
        {codigo: "IYR0208", descripcion: "Conector Inox 1/4 NPTM * 1/4 NPTM"},
        {codigo: "IYR0209", descripcion: "Conector Inox 1/2 NPTM * 1/2 NPTM"},
        {codigo: "IYR0210", descripcion: "Conector Inox 3/8 NPTM * 3/8 NPTM"},
        {codigo: "IYR0211", descripcion: "Conector Inox 3/4 NPTM * 3/4 NPTM"},
        {codigo: "IYR0212", descripcion: "Conector Inox 1 NPTM * 1 NPTM"},
        {codigo: "IYR0213", descripcion: "Conector Inox 1.1/4 NPTM * 1.1/4 NPTM"},
        {codigo: "IYR0214", descripcion: "Conector Inox 1.1/2 NPTM * 1.1/2 NPTM"},
        {codigo: "IYR0215", descripcion: "Conector Inox 2 NPTM * 2 NPTM"},

        // Conectores NPTH/NPTH (216-224)
        {codigo: "IYR0216", descripcion: "Conector Inox 1/8 NPTH * 1/8 NPTH"},
        {codigo: "IYR0217", descripcion: "Conector Inox 1/4 NPTH * 1/4 NPTH"},
        {codigo: "IYR0218", descripcion: "Conector Inox 1/2 NPTH * 1/2 NPTH"},
        {codigo: "IYR0219", descripcion: "Conector Inox 3/8 NPTH * 3/8 NPTH"},
        {codigo: "IYR0220", descripcion: "Conector Inox 3/4 NPTH * 3/4 NPTH"},
        {codigo: "IYR0221", descripcion: "Conector Inox 1 NPTH * 1 NPTH"},
        {codigo: "IYR0222", descripcion: "Conector Inox 1.1/4 NPTH * 1.1/4 NPTH"},
        {codigo: "IYR0223", descripcion: "Conector Inox 1.1/2 NPTH * 1.1/2 NPTH"},
        {codigo: "IYR0224", descripcion: "Conector Inox 2 NPTH * 2 NPTH"},

        // Conectores OD/NPTM (225-279)
        {codigo: "IYR0225", descripcion: "Conector Inox 1/8 OD * 1/4 NPTM"},
        {codigo: "IYR0226", descripcion: "Conector Inox 1/8 OD * 1/2 NPTM"},
        {codigo: "IYR0227", descripcion: "Conector Inox 1/8 OD * 3/4 NPTM"},
        {codigo: "IYR0228", descripcion: "Conector Inox 1/8 OD * 3/8 NPTM"},
        {codigo: "IYR0229", descripcion: "Conector Inox 1/8 OD * 1 NPTM"},
        {codigo: "IYR0230", descripcion: "Conector Inox 1/4 OD * 1/4 NPTM"},
        {codigo: "IYR0231", descripcion: "Conector Inox 1/4 OD * 1/2 NPTM"},
        {codigo: "IYR0232", descripcion: "Conector Inox 1/4 OD * 3/4 NPTM"},
        {codigo: "IYR0233", descripcion: "Conector Inox 1/4 OD * 3/8 NPTM"},
        {codigo: "IYR0234", descripcion: "Conector Inox 1/4 OD * 1 NPTM"},
        {codigo: "IYR0235", descripcion: "Conector Inox 1/2 OD * 1/4 NPTM"},
        {codigo: "IYR0236", descripcion: "Conector Inox 1/2 OD * 1/2 NPTM"},
        {codigo: "IYR0237", descripcion: "Conector Inox 1/2 OD * 3/4 NPTM"},
        {codigo: "IYR0238", descripcion: "Conector Inox 1/2 OD * 3/8 NPTM"},
        {codigo: "IYR0239", descripcion: "Conector Inox 1/2 OD * 1 NPTM"},
        {codigo: "IYR0240", descripcion: "Conector Inox 1/2 OD * 1.1/2 NPTM"},
        {codigo: "IYR0241", descripcion: "Conector Inox 3/8 OD * 1/4 NPTM"},
        {codigo: "IYR0242", descripcion: "Conector Inox 3/8 OD * 1/2 NPTM"},
        {codigo: "IYR0243", descripcion: "Conector Inox 3/8 OD * 3/4 NPTM"},
        {codigo: "IYR0244", descripcion: "Conector Inox 3/8 OD * 3/8 NPTM"},
        {codigo: "IYR0245", descripcion: "Conector Inox 3/8 OD * 1 NPTM"},
        {codigo: "IYR0246", descripcion: "Conector Inox 3/8 OD * 1.1/2 NPTM"},
        {codigo: "IYR0247", descripcion: "Conector Inox 3/4 OD * 1/4 NPTM"},
        {codigo: "IYR0248", descripcion: "Conector Inox 3/4 OD * 1/2 NPTM"},
        {codigo: "IYR0249", descripcion: "Conector Inox 3/4 OD * 3/8 NPTM"},
        {codigo: "IYR0250", descripcion: "Conector Inox 3/4 OD * 3/4 NPTM"},
        {codigo: "IYR0251", descripcion: "Conector Inox 3/4 OD * 1 NPTM"},
        {codigo: "IYR0252", descripcion: "Conector Inox 3/4 OD * 1.1/4 NPTM"},
        {codigo: "IYR0253", descripcion: "Conector Inox 1 OD * 1/4 NPTM"},
        {codigo: "IYR0254", descripcion: "Conector Inox 1 OD * 1/2 NPTM"},
        {codigo: "IYR0255", descripcion: "Conector Inox 1 OD * 3/8 NPTM"},
        {codigo: "IYR0256", descripcion: "Conector Inox 1 OD * 3/4 NPTM"},
        {codigo: "IYR0257", descripcion: "Conector Inox 1 OD * 1 NPTM"},
        {codigo: "IYR0258", descripcion: "Conector Inox 1 OD * 1.1/4 NPTM"},
        {codigo: "IYR0259", descripcion: "Conector Inox 1 OD * 1.1/2 NPTM"},
        {codigo: "IYR0260", descripcion: "Conector Inox 1 OD * 2 NPTM"},
        {codigo: "IYR0261", descripcion: "Conector Inox 1.1/4 OD * 1/2 NPTM"},
        {codigo: "IYR0262", descripcion: "Conector Inox 1.1/4 OD * 3/4 NPTM"},
        {codigo: "IYR0263", descripcion: "Conector Inox 1.1/4 OD * 3/8 NPTM"},
        {codigo: "IYR0264", descripcion: "Conector Inox 1.1/4 OD * 1 NPTM"},
        {codigo: "IYR0265", descripcion: "Conector Inox 1.1/4 OD * 1.1/2 NPTM"},
        {codigo: "IYR0266", descripcion: "Conector Inox 1.1/4 OD * 2 NPTM"},
        {codigo: "IYR0267", descripcion: "Conector Inox 1.1/2 OD * 1/2 NPTM"},
        {codigo: "IYR0268", descripcion: "Conector Inox 1.1/2 OD * 3/4 NPTM"},
        {codigo: "IYR0269", descripcion: "Conector Inox 1.1/2 OD * 3/8 NPTM"},
        {codigo: "IYR0270", descripcion: "Conector Inox 1.1/2 OD * 1 NPTM"},
        {codigo: "IYR0271", descripcion: "Conector Inox 1.1/2 OD * 1.1/2 NPTM"},
        {codigo: "IYR0272", descripcion: "Conector Inox 1.1/2 OD * 2 NPTM"},
        {codigo: "IYR0273", descripcion: "Conector Inox 2 OD * 1/2 NPTM"},
        {codigo: "IYR0274", descripcion: "Conector Inox 2 OD * 3/4 NPTM"},
        {codigo: "IYR0275", descripcion: "Conector Inox 2 OD * 3/8 NPTM"},
        {codigo: "IYR0276", descripcion: "Conector Inox 2 OD * 1 NPTM"},
        {codigo: "IYR0277", descripcion: "Conector Inox 2 OD * 1.1/2 NPTM"},
        {codigo: "IYR0278", descripcion: "Conector Inox 2 OD * 2 NPTM"},

        // ============= ACERO INOXIDABLE - CONECTORES OD/NPTH (279-332) =============
        {codigo: "IYR0279", descripcion: "Conector Inox 1/8 OD * 1/4 NPTH"},
        {codigo: "IYR0280", descripcion: "Conector Inox 1/8 OD * 1/2 NPTH"},
        {codigo: "IYR0281", descripcion: "Conector Inox 1/8 OD * 3/4 NPTH"},
        {codigo: "IYR0282", descripcion: "Conector Inox 1/8 OD * 3/8 NPTH"},
        {codigo: "IYR0283", descripcion: "Conector Inox 1/8 OD * 1 NPTH"},
        {codigo: "IYR0284", descripcion: "Conector Inox 1/4 OD * 1/4 NPTH"},
        {codigo: "IYR0285", descripcion: "Conector Inox 1/4 OD * 1/2 NPTH"},
        {codigo: "IYR0286", descripcion: "Conector Inox 1/4 OD * 3/4 NPTH"},
        {codigo: "IYR0287", descripcion: "Conector Inox 1/4 OD * 3/8 NPTH"},
        {codigo: "IYR0288", descripcion: "Conector Inox 1/4 OD * 1 NPTH"},
        {codigo: "IYR0289", descripcion: "Conector Inox 1/2 OD * 1/4 NPTH"},
        {codigo: "IYR0290", descripcion: "Conector Inox 1/2 OD * 1/2 NPTH"},
        {codigo: "IYR0291", descripcion: "Conector Inox 1/2 OD * 3/4 NPTH"},
        {codigo: "IYR0292", descripcion: "Conector Inox 1/2 OD * 3/8 NPTH"},
        {codigo: "IYR0293", descripcion: "Conector Inox 1/2 OD * 1 NPTH"},
        {codigo: "IYR0294", descripcion: "Conector Inox 1/2 OD * 1.1/2 NPTH"},
        {codigo: "IYR0295", descripcion: "Conector Inox 3/8 OD * 1/4 NPTH"},
        {codigo: "IYR0296", descripcion: "Conector Inox 3/8 OD * 1/2 NPTH"},
        {codigo: "IYR0297", descripcion: "Conector Inox 3/8 OD * 3/4 NPTH"},
        {codigo: "IYR0298", descripcion: "Conector Inox 3/8 OD * 3/8 NPTH"},
        {codigo: "IYR0299", descripcion: "Conector Inox 3/8 OD * 1 NPTH"},
        {codigo: "IYR0300", descripcion: "Conector Inox 3/8 OD * 1.1/2 NPTH"},
        {codigo: "IYR0301", descripcion: "Conector Inox 3/4 OD * 1/4 NPTH"},
        {codigo: "IYR0302", descripcion: "Conector Inox 3/4 OD * 1/2 NPTH"},
        {codigo: "IYR0303", descripcion: "Conector Inox 3/4 OD * 3/4 NPTH"},
        {codigo: "IYR0304", descripcion: "Conector Inox 3/4 OD * 3/8 NPTH"},
        {codigo: "IYR0305", descripcion: "Conector Inox 3/4 OD * 1 NPTH"},
        {codigo: "IYR0306", descripcion: "Conector Inox 3/4 OD * 1.1/4 NPTH"},
        {codigo: "IYR0307", descripcion: "Conector Inox 1 OD * 1/4 NPTH"},
        {codigo: "IYR0308", descripcion: "Conector Inox 1 OD * 1/2 NPTH"},
        {codigo: "IYR0309", descripcion: "Conector Inox 1 OD * 3/4 NPTH"},
        {codigo: "IYR0310", descripcion: "Conector Inox 1 OD * 3/8 NPTH"},
        {codigo: "IYR0311", descripcion: "Conector Inox 1 OD * 1 NPTH"},
        {codigo: "IYR0312", descripcion: "Conector Inox 1 OD * 1.1/2 NPTH"},
        {codigo: "IYR0313", descripcion: "Conector Inox 1.1/4 OD * 1/2 NPTH"},
        {codigo: "IYR0314", descripcion: "Conector Inox 1.1/4 OD * 3/4 NPTH"},
        {codigo: "IYR0315", descripcion: "Conector Inox 1.1/4 OD * 3/8 NPTH"},
        {codigo: "IYR0316", descripcion: "Conector Inox 1.1/4 OD * 1 NPTH"},
        {codigo: "IYR0317", descripcion: "Conector Inox 1.1/4 OD * 1.1/2 NPTH"},
        {codigo: "IYR0318", descripcion: "Conector Inox 1.1/4 OD * 2 NPTH"},
        {codigo: "IYR0319", descripcion: "Conector Inox 1.1/2 OD * 1/2 NPTH"},
        {codigo: "IYR0320", descripcion: "Conector Inox 1.1/2 OD * 3/4 NPTH"},
        {codigo: "IYR0321", descripcion: "Conector Inox 1.1/2 OD * 3/8 NPTH"},
        {codigo: "IYR0322", descripcion: "Conector Inox 1.1/2 OD * 1 NPTH"},
        {codigo: "IYR0323", descripcion: "Conector Inox 1.1/2 OD * 1.1/2 NPTH"},
        {codigo: "IYR0324", descripcion: "Conector Inox 1.1/2 OD * 2 NPTH"},
        {codigo: "IYR0325", descripcion: "Conector Inox 2 OD * 1/2 NPTH"},
        {codigo: "IYR0326", descripcion: "Conector Inox 2 OD * 3/4 NPTH"},
        {codigo: "IYR0327", descripcion: "Conector Inox 2 OD * 3/8 NPTH"},
        {codigo: "IYR0328", descripcion: "Conector Inox 2 OD * 1 NPTH"},
        {codigo: "IYR0329", descripcion: "Conector Inox 2 OD * 1.1/2 NPTH"},
        {codigo: "IYR0330", descripcion: "Conector Inox 2 OD * 2 NPTH"},

        // ============= ACERO INOXIDABLE - CONECTORES NPTM/NPTH (333-384) =============
        {codigo: "IYR0331", descripcion: "Conector Inox 1/8 NPTM * 1/4 NPTH"},
        {codigo: "IYR0332", descripcion: "Conector Inox 1/8 NPTM * 1/2 NPTH"},
        {codigo: "IYR0333", descripcion: "Conector Inox 1/8 NPTM * 3/4 NPTH"},
        {codigo: "IYR0334", descripcion: "Conector Inox 1/8 NPTM * 3/8 NPTH"},
        {codigo: "IYR0335", descripcion: "Conector Inox 1/8 NPTM * 1 NPTH"},
        {codigo: "IYR0336", descripcion: "Conector Inox 1/4 NPTM * 1/4 NPTH"},
        {codigo: "IYR0337", descripcion: "Conector Inox 1/4 NPTM * 1/2 NPTH"},
        {codigo: "IYR0338", descripcion: "Conector Inox 1/4 NPTM * 3/4 NPTH"},
        {codigo: "IYR0339", descripcion: "Conector Inox 1/4 NPTM * 3/8 NPTH"},
        {codigo: "IYR0340", descripcion: "Conector Inox 1/4 NPTM * 1 NPTH"},
        {codigo: "IYR0341", descripcion: "Conector Inox 1/2 NPTM * 1/4 NPTH"},
        {codigo: "IYR0342", descripcion: "Conector Inox 1/2 NPTM * 1/2 NPTH"},
        {codigo: "IYR0343", descripcion: "Conector Inox 1/2 NPTM * 3/4 NPTH"},
        {codigo: "IYR0344", descripcion: "Conector Inox 1/2 NPTM * 3/8 NPTH"},
        {codigo: "IYR0345", descripcion: "Conector Inox 1/2 NPTM * 1 NPTH"},
        {codigo: "IYR0346", descripcion: "Conector Inox 1/2 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0347", descripcion: "Conector Inox 3/8 NPTM * 1/4 NPTH"},
        {codigo: "IYR0348", descripcion: "Conector Inox 3/8 NPTM * 1/2 NPTH"},
        {codigo: "IYR0349", descripcion: "Conector Inox 3/8 NPTM * 3/4 NPTH"},
        {codigo: "IYR0350", descripcion: "Conector Inox 3/8 NPTM * 3/8 NPTH"},
        {codigo: "IYR0351", descripcion: "Conector Inox 3/8 NPTM * 1 NPTH"},
        {codigo: "IYR0352", descripcion: "Conector Inox 3/8 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0353", descripcion: "Conector Inox 3/4 NPTM * 1/4 NPTH"},
        {codigo: "IYR0354", descripcion: "Conector Inox 3/4 NPTM * 1/2 NPTH"},
        {codigo: "IYR0355", descripcion: "Conector Inox 3/4 NPTM * 3/4 NPTH"},
        {codigo: "IYR0356", descripcion: "Conector Inox 3/4 NPTM * 3/8 NPTH"},
        {codigo: "IYR0357", descripcion: "Conector Inox 3/4 NPTM * 1 NPTH"},
        {codigo: "IYR0358", descripcion: "Conector Inox 3/4 NPTM * 1.1/4 NPTH"},
        {codigo: "IYR0359", descripcion: "Conector Inox 1 NPTM * 1/4 NPTH"},
        {codigo: "IYR0360", descripcion: "Conector Inox 1 NPTM * 1/2 NPTH"},
        {codigo: "IYR0361", descripcion: "Conector Inox 1 NPTM * 3/4 NPTH"},
        {codigo: "IYR0362", descripcion: "Conector Inox 1 NPTM * 3/8 NPTH"},
        {codigo: "IYR0363", descripcion: "Conector Inox 1 NPTM * 1 NPTH"},
        {codigo: "IYR0364", descripcion: "Conector Inox 1 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0365", descripcion: "Conector Inox 1.1/4 NPTM * 1/2 NPTH"},
        {codigo: "IYR0366", descripcion: "Conector Inox 1.1/4 NPTM * 3/4 NPTH"},
        {codigo: "IYR0367", descripcion: "Conector Inox 1.1/4 NPTM * 3/8 NPTH"},
        {codigo: "IYR0368", descripcion: "Conector Inox 1.1/4 NPTM * 1 NPTH"},
        {codigo: "IYR0369", descripcion: "Conector Inox 1.1/4 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0370", descripcion: "Conector Inox 1.1/4 NPTM * 2 NPTH"},
        {codigo: "IYR0371", descripcion: "Conector Inox 1.1/2 NPTM * 1/2 NPTH"},
        {codigo: "IYR0372", descripcion: "Conector Inox 1.1/2 NPTM * 3/4 NPTH"},
        {codigo: "IYR0373", descripcion: "Conector Inox 1.1/2 NPTM * 3/8 NPTH"},
        {codigo: "IYR0374", descripcion: "Conector Inox 1.1/2 NPTM * 1 NPTH"},
        {codigo: "IYR0375", descripcion: "Conector Inox 1.1/2 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0376", descripcion: "Conector Inox 1.1/2 NPTM * 2 NPTH"},
        {codigo: "IYR0377", descripcion: "Conector Inox 2 NPTM * 1/2 NPTH"},
        {codigo: "IYR0378", descripcion: "Conector Inox 2 NPTM * 3/4 NPTH"},
        {codigo: "IYR0379", descripcion: "Conector Inox 2 NPTM * 3/8 NPTH"},
        {codigo: "IYR0380", descripcion: "Conector Inox 2 NPTM * 1 NPTH"},
        {codigo: "IYR0381", descripcion: "Conector Inox 2 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0382", descripcion: "Conector Inox 2 NPTM * 2 NPTH"},

        // ============= ACERO INOXIDABLE - TEES (383-428) =============
        {codigo: "IYR0383", descripcion: "Tee Inox 1/4 OD"},
        {codigo: "IYR0384", descripcion: "Tee Inox 1/2 OD"},
        {codigo: "IYR0385", descripcion: "Tee Inox 3/8 OD"},
        {codigo: "IYR0386", descripcion: "Tee Inox 3/4 OD"},
        {codigo: "IYR0387", descripcion: "Tee Inox 1 OD"},
        {codigo: "IYR0388", descripcion: "Tee Inox 1.1/4 OD"},
        {codigo: "IYR0389", descripcion: "Tee Inox 1.1/2 OD"},

        {codigo: "IYR0390", descripcion: "Tee Inox 1/4 NPTM"},
        {codigo: "IYR0391", descripcion: "Tee Inox 1/2 NPTM"},
        {codigo: "IYR0392", descripcion: "Tee Inox 3/8 NPTM"},
        {codigo: "IYR0393", descripcion: "Tee Inox 3/4 NPTM"},
        {codigo: "IYR0394", descripcion: "Tee Inox 1 NPTM"},
        {codigo: "IYR0395", descripcion: "Tee Inox 1.1/4 NPTM"},
        {codigo: "IYR0396", descripcion: "Tee Inox 1.1/2 NPTM"},

        {codigo: "IYR0397", descripcion: "Tee Inox 1/4 NPTH"},
        {codigo: "IYR0398", descripcion: "Tee Inox 1/2 NPTH"},
        {codigo: "IYR0399", descripcion: "Tee Inox 3/8 NPTH"},
        {codigo: "IYR0400", descripcion: "Tee Inox 3/4 NPTH"},
        {codigo: "IYR0401", descripcion: "Tee Inox 1 NPTH"},
        {codigo: "IYR0402", descripcion: "Tee Inox 1.1/4 NPTH"},
        {codigo: "IYR0403", descripcion: "Tee Inox 1.1/2 NPTH"},

        // ============= ACERO INOXIDABLE - TEES SCH40 (404-428) =============
        {codigo: "IYR0404", descripcion: "Tee Inox Sch40 1/4 SoldeoTope"},
        {codigo: "IYR0405", descripcion: "Tee Inox Sch40 1/2 SoldeoTope"},
        {codigo: "IYR0406", descripcion: "Tee Inox Sch40 3/8 SoldeoTope"},
        {codigo: "IYR0407", descripcion: "Tee Inox Sch40 3/4 SoldeoTope"},
        {codigo: "IYR0408", descripcion: "Tee Inox Sch40 1 SoldeoTope"},
        {codigo: "IYR0409", descripcion: "Tee Inox Sch40 1.1/4 SoldeoTope"},
        {codigo: "IYR0410", descripcion: "Tee Inox Sch40 1.1/2 SoldeoTope"},
        {codigo: "IYR0411", descripcion: "Tee Inox Sch40 2 SoldeoTope"},

        {codigo: "IYR0412", descripcion: "Tee Inox Sch40 1/4 NPTM"},
        {codigo: "IYR0413", descripcion: "Tee Inox Sch40 1/2 NPTM"},
        {codigo: "IYR0414", descripcion: "Tee Inox Sch40 3/8 NPTM"},
        {codigo: "IYR0415", descripcion: "Tee Inox Sch40 3/4 NPTM"},
        {codigo: "IYR0416", descripcion: "Tee Inox Sch40 1 NPTM"},
        {codigo: "IYR0417", descripcion: "Tee Inox Sch40 1.1/4 NPTM"},
        {codigo: "IYR0418", descripcion: "Tee Inox Sch40 1.1/2 NPTM"},
        {codigo: "IYR0419", descripcion: "Tee Inox Sch40 2 NPTM"},

        {codigo: "IYR0420", descripcion: "Tee Inox Sch40 1/4 NPTH"},
        {codigo: "IYR0421", descripcion: "Tee Inox Sch40 1/2 NPTH"},
        {codigo: "IYR0422", descripcion: "Tee Inox Sch40 3/8 NPTH"},
        {codigo: "IYR0423", descripcion: "Tee Inox Sch40 3/4 NPTH"},
        {codigo: "IYR0424", descripcion: "Tee Inox Sch40 1 NPTH"},
        {codigo: "IYR0425", descripcion: "Tee Inox Sch40 1.1/4 NPTH"},
        {codigo: "IYR0426", descripcion: "Tee Inox Sch40 1.1/2 NPTH"},
        {codigo: "IYR0427", descripcion: "Tee Inox Sch40 2 NPTH"},

        // ============= ACERO INOXIDABLE - CODOS (428-484) =============
        {codigo: "IYR0428", descripcion: "Codo Inox 1/8 OD"},
        {codigo: "IYR0429", descripcion: "Codo Inox 1/4 OD"},
        {codigo: "IYR0430", descripcion: "Codo Inox 1/2 OD"},
        {codigo: "IYR0431", descripcion: "Codo Inox 3/8 OD"},
        {codigo: "IYR0432", descripcion: "Codo Inox 3/4 OD"},
        {codigo: "IYR0433", descripcion: "Codo Inox 1 OD"},
        {codigo: "IYR0434", descripcion: "Codo Inox 1.1/4 OD"},
        {codigo: "IYR0435", descripcion: "Codo Inox 1.1/2 OD"},

        {codigo: "IYR0436", descripcion: "Codo Inox 1/8 NPTM"},
        {codigo: "IYR0437", descripcion: "Codo Inox 1/4 NPTM"},
        {codigo: "IYR0438", descripcion: "Codo Inox 1/2 NPTM"},
        {codigo: "IYR0439", descripcion: "Codo Inox 3/8 NPTM"},
        {codigo: "IYR0440", descripcion: "Codo Inox 3/4 NPTM"},
        {codigo: "IYR0441", descripcion: "Codo Inox 1 NPTM"},
        {codigo: "IYR0442", descripcion: "Codo Inox 1.1/4 NPTM"},
        {codigo: "IYR0443", descripcion: "Codo Inox 1.1/2 NPTM"},

        {codigo: "IYR0444", descripcion: "Codo Inox 1/8 NPTH"},
        {codigo: "IYR0445", descripcion: "Codo Inox 1/4 NPTH"},
        {codigo: "IYR0446", descripcion: "Codo Inox 1/2 NPTH"},
        {codigo: "IYR0447", descripcion: "Codo Inox 3/8 NPTH"},
        {codigo: "IYR0448", descripcion: "Codo Inox 3/4 NPTH"},
        {codigo: "IYR0449", descripcion: "Codo Inox 1 NPTH"},
        {codigo: "IYR0450", descripcion: "Codo Inox 1.1/4 NPTH"},
        {codigo: "IYR0451", descripcion: "Codo Inox 1.1/2 NPTH"},

        // ============= ACERO INOXIDABLE - CODOS MIXTOS OD/NPTM (452-484) =============
        {codigo: "IYR0452", descripcion: "Codo Inox 1/8 OD * 1/8 NPTM"},
        {codigo: "IYR0453", descripcion: "Codo Inox 1/8 OD * 1/4 NPTM"},
        {codigo: "IYR0454", descripcion: "Codo Inox 1/8 OD * 1/2 NPTM"},
        {codigo: "IYR0455", descripcion: "Codo Inox 1/4 OD * 1/4 NPTM"},
        {codigo: "IYR0456", descripcion: "Codo Inox 1/4 OD * 1/8 NPTM"},
        {codigo: "IYR0457", descripcion: "Codo Inox 1/4 OD * 1/2 NPTM"},
        {codigo: "IYR0458", descripcion: "Codo Inox 1/4 OD * 3/8 NPTM"},
        {codigo: "IYR0459", descripcion: "Codo Inox 1/4 OD * 3/4 NPTM"},
        {codigo: "IYR0460", descripcion: "Codo Inox 1/4 OD * 1 NPTM"},
        {codigo: "IYR0461", descripcion: "Codo Inox 1/2 OD * 1/8 NPTM"},
        {codigo: "IYR0462", descripcion: "Codo Inox 1/2 OD * 1/4 NPTM"},
        {codigo: "IYR0463", descripcion: "Codo Inox 1/2 OD * 1/2 NPTM"},
        {codigo: "IYR0464", descripcion: "Codo Inox 1/2 OD * 3/8 NPTM"},
        {codigo: "IYR0465", descripcion: "Codo Inox 1/2 OD * 3/4 NPTM"},
        {codigo: "IYR0466", descripcion: "Codo Inox 1/2 OD * 1 NPTM"},
        {codigo: "IYR0467", descripcion: "Codo Inox 1/2 OD * 1.1/4 NPTM"},
        {codigo: "IYR0468", descripcion: "Codo Inox 3/8 OD * 1/4 NPTM"},
        {codigo: "IYR0469", descripcion: "Codo Inox 3/8 OD * 1/2 NPTM"},
        {codigo: "IYR0470", descripcion: "Codo Inox 3/8 OD * 3/8 NPTM"},
        {codigo: "IYR0471", descripcion: "Codo Inox 3/8 OD * 3/4 NPTM"},
        {codigo: "IYR0472", descripcion: "Codo Inox 3/8 OD * 1 NPTM"},
        {codigo: "IYR0473", descripcion: "Codo Inox 3/8 OD * 1.1/4 NPTM"},
        {codigo: "IYR0474", descripcion: "Codo Inox 3/4 OD * 1/4 NPTM"},
        {codigo: "IYR0475", descripcion: "Codo Inox 3/4 OD * 1/2 NPTM"},
        {codigo: "IYR0476", descripcion: "Codo Inox 3/4 OD * 3/8 NPTM"},
        {codigo: "IYR0477", descripcion: "Codo Inox 3/4 OD * 3/4 NPTM"},
        {codigo: "IYR0478", descripcion: "Codo Inox 3/4 OD * 1 NPTM"},
        {codigo: "IYR0479", descripcion: "Codo Inox 3/4 OD * 1.1/4 NPTM"},
        {codigo: "IYR0480", descripcion: "Codo Inox 1 OD * 1/4 NPTM"},
        {codigo: "IYR0481", descripcion: "Codo Inox 1 OD * 1/2 NPTM"},
        {codigo: "IYR0482", descripcion: "Codo Inox 1 OD * 3/8 NPTM"},
        {codigo: "IYR0483", descripcion: "Codo Inox 1 OD * 3/4 NPTM"},
        {codigo: "IYR0484", descripcion: "Codo Inox 1 OD * 1 NPTM"},
        {codigo: "IYR0485", descripcion: "Codo Inox 1 OD * 1.1/4 NPTM"},
        {codigo: "IYR0486", descripcion: "Codo Inox 1 OD * 1.1/2 NPTM"},
        {codigo: "IYR0487", descripcion: "Codo Inox 1 OD * 2 NPTM"},

        // ============= ACERO INOXIDABLE - CODOS MIXTOS OD/NPTH (489-524) =============
        {codigo: "IYR0489", descripcion: "Codo Inox 1/8 OD * 1/8 NPTH"},
        {codigo: "IYR0490", descripcion: "Codo Inox 1/8 OD * 1/4 NPTH"},
        {codigo: "IYR0491", descripcion: "Codo Inox 1/8 OD * 1/2 NPTH"},
        {codigo: "IYR0492", descripcion: "Codo Inox 1/4 OD * 1/4 NPTH"},
        {codigo: "IYR0493", descripcion: "Codo Inox 1/4 OD * 1/8 NPTH"},
        {codigo: "IYR0494", descripcion: "Codo Inox 1/4 OD * 1/2 NPTH"},
        {codigo: "IYR0495", descripcion: "Codo Inox 1/4 OD * 3/8 NPTH"},
        {codigo: "IYR0496", descripcion: "Codo Inox 1/4 OD * 3/4 NPTH"},
        {codigo: "IYR0497", descripcion: "Codo Inox 1/4 OD * 1 NPTH"},
        {codigo: "IYR0498", descripcion: "Codo Inox 1/2 OD * 1/8 NPTH"},
        {codigo: "IYR0499", descripcion: "Codo Inox 1/2 OD * 1/4 NPTH"},
        {codigo: "IYR0500", descripcion: "Codo Inox 1/2 OD * 1/2 NPTH"},
        {codigo: "IYR0501", descripcion: "Codo Inox 1/2 OD * 3/8 NPTH"},
        {codigo: "IYR0502", descripcion: "Codo Inox 1/2 OD * 3/4 NPTH"},
        {codigo: "IYR0503", descripcion: "Codo Inox 1/2 OD * 1 NPTH"},
        {codigo: "IYR0504", descripcion: "Codo Inox 1/2 OD * 1.1/4 NPTH"},
        {codigo: "IYR0505", descripcion: "Codo Inox 3/8 OD * 1/4 NPTH"},
        {codigo: "IYR0506", descripcion: "Codo Inox 3/8 OD * 1/2 NPTH"},
        {codigo: "IYR0507", descripcion: "Codo Inox 3/8 OD * 3/8 NPTH"},
        {codigo: "IYR0508", descripcion: "Codo Inox 3/8 OD * 3/4 NPTH"},
        {codigo: "IYR0509", descripcion: "Codo Inox 3/8 OD * 1 NPTH"},
        {codigo: "IYR0510", descripcion: "Codo Inox 3/8 OD * 1.1/4 NPTH"},
        {codigo: "IYR0511", descripcion: "Codo Inox 3/4 OD * 1/4 NPTH"},
        {codigo: "IYR0512", descripcion: "Codo Inox 3/4 OD * 1/2 NPTH"},
        {codigo: "IYR0513", descripcion: "Codo Inox 3/4 OD * 3/8 NPTH"},
        {codigo: "IYR0514", descripcion: "Codo Inox 3/4 OD * 3/4 NPTH"},
        {codigo: "IYR0515", descripcion: "Codo Inox 3/4 OD * 1 NPTH"},
        {codigo: "IYR0516", descripcion: "Codo Inox 3/4 OD * 1.1/4 NPTH"},
        {codigo: "IYR0517", descripcion: "Codo Inox 1 OD * 1/4 NPTH"},
        {codigo: "IYR0518", descripcion: "Codo Inox 1 OD * 1/2 NPTH"},
        {codigo: "IYR0519", descripcion: "Codo Inox 1 OD * 3/8 NPTH"},
        {codigo: "IYR0520", descripcion: "Codo Inox 1 OD * 3/4 NPTH"},
        {codigo: "IYR0521", descripcion: "Codo Inox 1 OD * 1 NPTH"},
        {codigo: "IYR0522", descripcion: "Codo Inox 1 OD * 1.1/4 NPTH"},
        {codigo: "IYR0523", descripcion: "Codo Inox 1 OD * 1.1/2 NPTH"},
        {codigo: "IYR0524", descripcion: "Codo Inox 1 OD * 2 NPTH"},

        // ============= ACERO INOXIDABLE - CODOS SCH40 (561-584) =============
        {codigo: "IYR0561", descripcion: "Codo Inox Sch40 1/4 SoldeoTope"},
        {codigo: "IYR0562", descripcion: "Codo Inox Sch40 1/2 SoldeoTope"},
        {codigo: "IYR0563", descripcion: "Codo Inox Sch40 3/8 SoldeoTope"},
        {codigo: "IYR0564", descripcion: "Codo Inox Sch40 3/4 SoldeoTope"},
        {codigo: "IYR0565", descripcion: "Codo Inox Sch40 1 SoldeoTope"},
        {codigo: "IYR0566", descripcion: "Codo Inox Sch40 1.1/4 SoldeoTope"},
        {codigo: "IYR0567", descripcion: "Codo Inox Sch40 1.1/2 SoldeoTope"},
        {codigo: "IYR0568", descripcion: "Codo Inox Sch40 2 SoldeoTope"},

        // ============= ACERO INOXIDABLE - CODOS SCH40 NPTM (569-576) =============
        {codigo: "IYR0569", descripcion: "Codo Inox Sch40 1/4 NPTM"},
        {codigo: "IYR0570", descripcion: "Codo Inox Sch40 1/2 NPTM"},
        {codigo: "IYR0571", descripcion: "Codo Inox Sch40 3/8 NPTM"},
        {codigo: "IYR0572", descripcion: "Codo Inox Sch40 3/4 NPTM"},
        {codigo: "IYR0573", descripcion: "Codo Inox Sch40 1 NPTM"},
        {codigo: "IYR0574", descripcion: "Codo Inox Sch40 1.1/4 NPTM"},
        {codigo: "IYR0575", descripcion: "Codo Inox Sch40 1.1/2 NPTM"},
        {codigo: "IYR0576", descripcion: "Codo Inox Sch40 2 NPTM"},

        // ============= ACERO INOXIDABLE - CODOS SCH40 NPTH (577-584) =============
        {codigo: "IYR0577", descripcion: "Codo Inox Sch40 1/4 NPTH"},
        {codigo: "IYR0578", descripcion: "Codo Inox Sch40 1/2 NPTH"},
        {codigo: "IYR0579", descripcion: "Codo Inox Sch40 3/8 NPTH"},
        {codigo: "IYR0580", descripcion: "Codo Inox Sch40 3/4 NPTH"},
        {codigo: "IYR0581", descripcion: "Codo Inox Sch40 1 NPTH"},
        {codigo: "IYR0582", descripcion: "Codo Inox Sch40 1.1/4 NPTH"},
        {codigo: "IYR0583", descripcion: "Codo Inox Sch40 1.1/2 NPTH"},
        {codigo: "IYR0584", descripcion: "Codo Inox Sch40 2 NPTH"},

        // ============= ACERO INOXIDABLE - NIPLES SCH40 (585-608) =============
        {codigo: "IYR0585", descripcion: "Niple Inox Sch40 1/4 SoldeoTope"},
        {codigo: "IYR0586", descripcion: "Niple Inox Sch40 1/2 SoldeoTope"},
        {codigo: "IYR0587", descripcion: "Niple Inox Sch40 3/8 SoldeoTope"},
        {codigo: "IYR0588", descripcion: "Niple Inox Sch40 3/4 SoldeoTope"},
        {codigo: "IYR0589", descripcion: "Niple Inox Sch40 1 SoldeoTope"},
        {codigo: "IYR0590", descripcion: "Niple Inox Sch40 1.1/4 SoldeoTope"},
        {codigo: "IYR0591", descripcion: "Niple Inox Sch40 1.1/2 SoldeoTope"},
        {codigo: "IYR0592", descripcion: "Niple Inox Sch40 2 SoldeoTope"},
        {codigo: "IYR0593", descripcion: "Niple Inox Sch40 1/4 NPTM"},
        {codigo: "IYR0594", descripcion: "Niple Inox Sch40 1/2 NPTM"},
        {codigo: "IYR0595", descripcion: "Niple Inox Sch40 3/8 NPTM"},
        {codigo: "IYR0596", descripcion: "Niple Inox Sch40 3/4 NPTM"},
        {codigo: "IYR0597", descripcion: "Niple Inox Sch40 1 NPTM"},
        {codigo: "IYR0598", descripcion: "Niple Inox Sch40 1.1/4 NPTM"},
        {codigo: "IYR0599", descripcion: "Niple Inox Sch40 1.1/2 NPTM"},
        {codigo: "IYR0600", descripcion: "Niple Inox Sch40 2 NPTM"},
        {codigo: "IYR0601", descripcion: "Niple Inox Sch40 1/4 NPTH"},
        {codigo: "IYR0602", descripcion: "Niple Inox Sch40 1/2 NPTH"},
        {codigo: "IYR0603", descripcion: "Niple Inox Sch40 3/8 NPTH"},
        {codigo: "IYR0604", descripcion: "Niple Inox Sch40 3/4 NPTH"},
        {codigo: "IYR0605", descripcion: "Niple Inox Sch40 1 NPTH"},
        {codigo: "IYR0606", descripcion: "Niple Inox Sch40 1.1/4 NPTH"},
        {codigo: "IYR0607", descripcion: "Niple Inox Sch40 1.1/2 NPTH"},
        {codigo: "IYR0608", descripcion: "Niple Inox Sch40 2 NPTH"},

        // ============= ACERO INOXIDABLE - UNIVERSALES (609-613) =============
        {codigo: "IYR0609", descripcion: "Universal Inox 1/2"},
        {codigo: "IYR0610", descripcion: "Universal Inox 3/4"},
        {codigo: "IYR0611", descripcion: "Universal Inox 1"},
        {codigo: "IYR0612", descripcion: "Universal Inox 1.1/4"},
        {codigo: "IYR0613", descripcion: "Universal Inox 1.1/2"},

        // ============= ACERO INOXIDABLE - TAPONES SCH40 (614-629) =============
        {codigo: "IYR0614", descripcion: "Tapon Inox Sch40 1/4"},
        {codigo: "IYR0615", descripcion: "Tapon Inox Sch40 3/8"},
        {codigo: "IYR0616", descripcion: "Tapon Inox Sch40 1/2"},
        {codigo: "IYR0617", descripcion: "Tapon Inox Sch40 3/4"},
        {codigo: "IYR0618", descripcion: "Tapon Inox Sch40 1"},
        {codigo: "IYR0619", descripcion: "Tapon Inox Sch40 1.1/4"},
        {codigo: "IYR0620", descripcion: "Tapon Inox Sch40 1.1/2"},
        {codigo: "IYR0621", descripcion: "Tapon Inox Sch40 2"},
        {codigo: "IYR0622", descripcion: "Tapon Inox Sch40 1/4 NPTH"},
        {codigo: "IYR0623", descripcion: "Tapon Inox Sch40 3/8 NPTH"},
        {codigo: "IYR0624", descripcion: "Tapon Inox Sch40 1/2 NPTH"},
        {codigo: "IYR0625", descripcion: "Tapon Inox Sch40 3/4 NPTH"},
        {codigo: "IYR0626", descripcion: "Tapon Inox Sch40 1 NPTH"},
        {codigo: "IYR0627", descripcion: "Tapon Inox Sch40 1.1/4 NPTH"},
        {codigo: "IYR0628", descripcion: "Tapon Inox Sch40 1.1/2 NPTH"},
        {codigo: "IYR0629", descripcion: "Tapon Inox Sch40 2 NPTH"},

        // ============= ACERO INOXIDABLE - TAPONES NPTM (630-637) =============
        {codigo: "IYR0630", descripcion: "Tapon Inox Sch40 1/4 NPTM"},
        {codigo: "IYR0631", descripcion: "Tapon Inox Sch40 3/8 NPTM"},
        {codigo: "IYR0632", descripcion: "Tapon Inox Sch40 1/2 NPTM"},
        {codigo: "IYR0633", descripcion: "Tapon Inox Sch40 3/4 NPTM"},
        {codigo: "IYR0634", descripcion: "Tapon Inox Sch40 1 NPTM"},
        {codigo: "IYR0635", descripcion: "Tapon Inox Sch40 1.1/4 NPTM"},
        {codigo: "IYR0636", descripcion: "Tapon Inox Sch40 1.1/2 NPTM"},
        {codigo: "IYR0637", descripcion: "Tapon Inox Sch40 2 NPTM"},

        // ============= ACERO INOXIDABLE - BUSHINGS (638-655) =============
        {codigo: "IYR0638", descripcion: "Bushing Inox Sch40 1/4 * 3/8"},
        {codigo: "IYR0639", descripcion: "Bushing Inox Sch40 1/4 * 1/2"},
        {codigo: "IYR0640", descripcion: "Bushing Inox Sch40 1/4 * 1"},
        {codigo: "IYR0641", descripcion: "Bushing Inox Sch40 1/2 * 1"},
        {codigo: "IYR0642", descripcion: "Bushing Inox Sch40 1/2 * 1.1/2"},
        {codigo: "IYR0643", descripcion: "Bushing Inox Sch40 1/2 * 2"},
        {codigo: "IYR0644", descripcion: "Bushing Inox Sch40 3/8 * 1/2"},
        {codigo: "IYR0645", descripcion: "Bushing Inox Sch40 3/8 * 1"},
        {codigo: "IYR0646", descripcion: "Bushing Inox Sch40 3/4 * 1"},
        {codigo: "IYR0647", descripcion: "Bushing Inox Sch40 3/4 * 1.1/4"},
        {codigo: "IYR0648", descripcion: "Bushing Inox Sch40 3/4 * 1.1/2"},
        {codigo: "IYR0649", descripcion: "Bushing Inox Sch40 3/4 * 2"},
        {codigo: "IYR0650", descripcion: "Bushing Inox Sch40 1 * 1/4"},
        {codigo: "IYR0651", descripcion: "Bushing Inox Sch40 1 * 1/2"},
        {codigo: "IYR0652", descripcion: "Bushing Inox Sch40 1 * 2"},
        {codigo: "IYR0653", descripcion: "Bushing Inox Sch40 1.1/4 * 1.1/2"},
        {codigo: "IYR0654", descripcion: "Bushing Inox Sch40 1.1/4 * 2"},
        {codigo: "IYR0655", descripcion: "Bushing Inox Sch40 1.1/2 * 2"},

        // ============= ACERO INOXIDABLE - COPARED (656-665) =============
        {codigo: "IYR0656", descripcion: "CopaRed Inox Sch40 1/4 * 1/2"},
        {codigo: "IYR0657", descripcion: "CopaRed Inox Sch40 1/4 * 3/4"},
        {codigo: "IYR0658", descripcion: "CopaRed Inox Sch40 1/2 * 3/4"},
        {codigo: "IYR0659", descripcion: "CopaRed Inox Sch40 1/2 * 1"},
        {codigo: "IYR0660", descripcion: "CopaRed Inox Sch40 1/2 * 1.1/2"},
        {codigo: "IYR0661", descripcion: "CopaRed Inox Sch40 3/4 * 1"},
        {codigo: "IYR0662", descripcion: "CopaRed Inox Sch40 3/4 * 1.1/2"},
        {codigo: "IYR0663", descripcion: "CopaRed Inox Sch40 3/4 * 2"},
        {codigo: "IYR0664", descripcion: "CopaRed Inox Sch40 1 * 1.1/2"},
        {codigo: "IYR0665", descripcion: "CopaRed Inox Sch40 1.1/2 * 2"},

        // ============= ACERO INOXIDABLE - BRIDAS (666-670) =============
        {codigo: "IYR0666", descripcion: "Brida Inox Sch40 1/2 SoldeoTope"},
        {codigo: "IYR0667", descripcion: "Brida Inox Sch40 3/4 SoldeoTope"},
        {codigo: "IYR0668", descripcion: "Brida Inox Sch40 1 SoldeoTope"},
        {codigo: "IYR0669", descripcion: "Brida Inox Sch40 1.1/2 SoldeoTope"},
        {codigo: "IYR0670", descripcion: "Brida Inox Sch40 2 SoldeoTope"},

        // ============= ACERO INOXIDABLE - VÁLVULAS (671-692) =============
        {codigo: "IYR0671", descripcion: "Valvula Inox 4Tornillos 1/4"},
        {codigo: "IYR0672", descripcion: "Valvula Inox 4Tornillos 1/2"},
        {codigo: "IYR0673", descripcion: "Valvula Inox 4Tornillos 3/4"},
        {codigo: "IYR0674", descripcion: "Valvula Inox 4Tornillos 1"},
        {codigo: "IYR0675", descripcion: "Valvula Inox 4Tornillos 1.1/4"},
        {codigo: "IYR0676", descripcion: "Valvula Inox 4Tornillos 1.1/2"},
        {codigo: "IYR0677", descripcion: "Valvula Inox 4Tornillos 2"},
        {codigo: "IYR0678", descripcion: "Valvula Inox deBola 1/4"},
        {codigo: "IYR0679", descripcion: "Valvula Inox deBola 1/2"},
        {codigo: "IYR0680", descripcion: "Valvula Inox deBola 3/4"},
        {codigo: "IYR0681", descripcion: "Valvula Inox deBola 1"},
        {codigo: "IYR0682", descripcion: "Valvula Inox deBola 1.1/4"},
        {codigo: "IYR0683", descripcion: "Valvula Inox deBola 1.1/2"},
        {codigo: "IYR0684", descripcion: "Valvula Inox deBola 2"},
        {codigo: "IYR0685", descripcion: "Valvula Inox TipoL 1/4 OD"},
        {codigo: "IYR0686", descripcion: "Valvula Inox TipoL 1/4 OD * 1/4 NPTM"},
        {codigo: "IYR0687", descripcion: "Valvula Inox 1/8 OD * 1/4 NPTM"},
        {codigo: "IYR0688", descripcion: "Valvula Inox 1/4 OD * 1/4 NPTM"},
        {codigo: "IYR0689", descripcion: "Valvula Inox 1/4 NPTM * 1/4 NPTM"},
        {codigo: "IYR0690", descripcion: "Valvula Inox 1/4 NPTH"},
        {codigo: "IYR0691", descripcion: "Valvula Inox DosVias 1/4 OD"},
        {codigo: "IYR0692", descripcion: "Valvula Inox Recta 1/4 NPTH"},

        // ============= BRONCE - NIPLES (693-700) =============
        {codigo: "IYR0693", descripcion: "Niple Bronce 1/4"},
        {codigo: "IYR0694", descripcion: "Niple Bronce 1/2"},
        {codigo: "IYR0695", descripcion: "Niple Bronce 3/8"},
        {codigo: "IYR0696", descripcion: "Niple Bronce 3/4"},
        {codigo: "IYR0697", descripcion: "Niple Bronce 1"},
        {codigo: "IYR0698", descripcion: "Niple Bronce 1.1/4"},
        {codigo: "IYR0699", descripcion: "Niple Bronce 1.1/2"},
        {codigo: "IYR0700", descripcion: "Niple Bronce 2"},

        // ============= BRONCE - CONECTORES NPTH (701-708) =============
        {codigo: "IYR0701", descripcion: "Conector Bronce 1/4 NPTH"},
        {codigo: "IYR0702", descripcion: "Conector Bronce 1/2 NPTH"},
        {codigo: "IYR0703", descripcion: "Conector Bronce 3/8 NPTH"},
        {codigo: "IYR0704", descripcion: "Conector Bronce 3/4 NPTH"},
        {codigo: "IYR0705", descripcion: "Conector Bronce 1 NPTH"},
        {codigo: "IYR0706", descripcion: "Conector Bronce 1.1/4 NPTH"},
        {codigo: "IYR0707", descripcion: "Conector Bronce 1.1/2 NPTH"},
        {codigo: "IYR0708", descripcion: "Conector Bronce 2 NPTH"},

        // ============= BRONCE - CONECTORES MIXTOS OD/NPTM (709-760) =============
        {codigo: "IYR0709", descripcion: "Conector Bronce 1/8 OD * 1/4 NPTM"},
        {codigo: "IYR0710", descripcion: "Conector Bronce 1/8 OD * 1/2 NPTM"},
        {codigo: "IYR0711", descripcion: "Conector Bronce 1/8 OD * 3/4 NPTM"},
        {codigo: "IYR0712", descripcion: "Conector Bronce 1/8 OD * 3/8 NPTM"},
        {codigo: "IYR0713", descripcion: "Conector Bronce 1/8 OD * 1 NPTM"},
        {codigo: "IYR0714", descripcion: "Conector Bronce 1/4 OD * 1/4 NPTM"},
        {codigo: "IYR0715", descripcion: "Conector Bronce 1/4 OD * 1/2 NPTM"},
        {codigo: "IYR0716", descripcion: "Conector Bronce 1/4 OD * 3/4 NPTM"},
        {codigo: "IYR0717", descripcion: "Conector Bronce 1/4 OD * 3/8 NPTM"},
        {codigo: "IYR0718", descripcion: "Conector Bronce 1/4 OD * 1 NPTM"},
        {codigo: "IYR0719", descripcion: "Conector Bronce 1/2 OD * 1/4 NPTM"},
        {codigo: "IYR0720", descripcion: "Conector Bronce 1/2 OD * 1/2 NPTM"},
        {codigo: "IYR0721", descripcion: "Conector Bronce 1/2 OD * 3/4 NPTM"},
        {codigo: "IYR0722", descripcion: "Conector Bronce 1/2 OD * 3/8 NPTM"},
        {codigo: "IYR0723", descripcion: "Conector Bronce 1/2 OD * 1 NPTM"},
        {codigo: "IYR0724", descripcion: "Conector Bronce 1/2 OD * 1.1/2 NPTM"},
        {codigo: "IYR0725", descripcion: "Conector Bronce 3/8 OD * 1/4 NPTM"},
        {codigo: "IYR0726", descripcion: "Conector Bronce 3/8 OD * 1/2 NPTM"},
        {codigo: "IYR0727", descripcion: "Conector Bronce 3/8 OD * 3/4 NPTM"},
        {codigo: "IYR0728", descripcion: "Conector Bronce 3/8 OD * 3/8 NPTM"},
        {codigo: "IYR0729", descripcion: "Conector Bronce 3/8 OD * 1 NPTM"},
        {codigo: "IYR0730", descripcion: "Conector Bronce 3/8 OD * 1.1/2 NPTM"},
        {codigo: "IYR0731", descripcion: "Conector Bronce 3/4 OD * 1/4 NPTM"},
        {codigo: "IYR0732", descripcion: "Conector Bronce 3/4 OD * 1/2 NPTM"},
        {codigo: "IYR0733", descripcion: "Conector Bronce 3/4 OD * 3/4 NPTM"},
        {codigo: "IYR0734", descripcion: "Conector Bronce 3/4 OD * 3/8 NPTM"},
        {codigo: "IYR0735", descripcion: "Conector Bronce 3/4 OD * 1 NPTM"},
        {codigo: "IYR0736", descripcion: "Conector Bronce 3/4 OD * 1.1/2 NPTM"},
        {codigo: "IYR0737", descripcion: "Conector Bronce 1 OD * 1/4 NPTM"},
        {codigo: "IYR0738", descripcion: "Conector Bronce 1 OD * 1/2 NPTM"},
        {codigo: "IYR0739", descripcion: "Conector Bronce 1 OD * 3/4 NPTM"},
        {codigo: "IYR0740", descripcion: "Conector Bronce 1 OD * 3/8 NPTM"},
        {codigo: "IYR0741", descripcion: "Conector Bronce 1 OD * 1 NPTM"},
        {codigo: "IYR0742", descripcion: "Conector Bronce 1 OD * 1.1/2 NPTM"},
        {codigo: "IYR0743", descripcion: "Conector Bronce 1.1/4 OD * 1/2 NPTM"},
        {codigo: "IYR0744", descripcion: "Conector Bronce 1.1/4 OD * 3/4 NPTM"},
        {codigo: "IYR0745", descripcion: "Conector Bronce 1.1/4 OD * 3/8 NPTM"},
        {codigo: "IYR0746", descripcion: "Conector Bronce 1.1/4 OD * 1 NPTM"},
        {codigo: "IYR0747", descripcion: "Conector Bronce 1.1/4 OD * 1.1/2 NPTM"},
        {codigo: "IYR0748", descripcion: "Conector Bronce 1.1/4 OD * 2 NPTM"},
        {codigo: "IYR0749", descripcion: "Conector Bronce 1.1/2 OD * 1/2 NPTM"},
        {codigo: "IYR0750", descripcion: "Conector Bronce 1.1/2 OD * 3/4 NPTM"},
        {codigo: "IYR0751", descripcion: "Conector Bronce 1.1/2 OD * 3/8 NPTM"},
        {codigo: "IYR0752", descripcion: "Conector Bronce 1.1/2 OD * 1 NPTM"},
        {codigo: "IYR0753", descripcion: "Conector Bronce 1.1/2 OD * 1.1/2 NPTM"},
        {codigo: "IYR0754", descripcion: "Conector Bronce 1.1/2 OD * 2 NPTM"},
        {codigo: "IYR0755", descripcion: "Conector Bronce 2 OD * 1/2 NPTM"},
        {codigo: "IYR0756", descripcion: "Conector Bronce 2 OD * 3/4 NPTM"},
        {codigo: "IYR0757", descripcion: "Conector Bronce 2 OD * 3/8 NPTM"},
        {codigo: "IYR0758", descripcion: "Conector Bronce 2 OD * 1 NPTM"},
        {codigo: "IYR0759", descripcion: "Conector Bronce 2 OD * 1.1/2 NPTM"},
        {codigo: "IYR0760", descripcion: "Conector Bronce 2 OD * 2 NPTM"},

        // ============= BRONCE - CONECTORES MIXTOS OD/NPTH (761-812) =============
        {codigo: "IYR0761", descripcion: "Conector Bronce 1/8 OD * 1/4 NPTH"},
        {codigo: "IYR0762", descripcion: "Conector Bronce 1/8 OD * 1/2 NPTH"},
        {codigo: "IYR0763", descripcion: "Conector Bronce 1/8 OD * 3/4 NPTH"},
        {codigo: "IYR0764", descripcion: "Conector Bronce 1/8 OD * 3/8 NPTH"},
        {codigo: "IYR0765", descripcion: "Conector Bronce 1/8 OD * 1 NPTH"},
        {codigo: "IYR0766", descripcion: "Conector Bronce 1/4 OD * 1/4 NPTH"},
        {codigo: "IYR0767", descripcion: "Conector Bronce 1/4 OD * 1/2 NPTH"},
        {codigo: "IYR0768", descripcion: "Conector Bronce 1/4 OD * 3/4 NPTH"},
        {codigo: "IYR0769", descripcion: "Conector Bronce 1/4 OD * 3/8 NPTH"},
        {codigo: "IYR0770", descripcion: "Conector Bronce 1/4 OD * 1 NPTH"},
        {codigo: "IYR0771", descripcion: "Conector Bronce 1/2 OD * 1/4 NPTH"},
        {codigo: "IYR0772", descripcion: "Conector Bronce 1/2 OD * 1/2 NPTH"},
        {codigo: "IYR0773", descripcion: "Conector Bronce 1/2 OD * 3/4 NPTH"},
        {codigo: "IYR0774", descripcion: "Conector Bronce 1/2 OD * 3/8 NPTH"},
        {codigo: "IYR0775", descripcion: "Conector Bronce 1/2 OD * 1 NPTH"},
        {codigo: "IYR0776", descripcion: "Conector Bronce 1/2 OD * 1.1/2 NPTH"},
        {codigo: "IYR0777", descripcion: "Conector Bronce 3/8 OD * 1/4 NPTH"},
        {codigo: "IYR0778", descripcion: "Conector Bronce 3/8 OD * 1/2 NPTH"},
        {codigo: "IYR0779", descripcion: "Conector Bronce 3/8 OD * 3/4 NPTH"},
        {codigo: "IYR0780", descripcion: "Conector Bronce 3/8 OD * 3/8 NPTH"},
        {codigo: "IYR0781", descripcion: "Conector Bronce 3/8 OD * 1 NPTH"},
        {codigo: "IYR0782", descripcion: "Conector Bronce 3/8 OD * 1.1/2 NPTH"},
        {codigo: "IYR0783", descripcion: "Conector Bronce 3/4 OD * 1/4 NPTH"},
        {codigo: "IYR0784", descripcion: "Conector Bronce 3/4 OD * 1/2 NPTH"},
        {codigo: "IYR0785", descripcion: "Conector Bronce 3/4 OD * 3/4 NPTH"},
        {codigo: "IYR0786", descripcion: "Conector Bronce 3/4 OD * 3/8 NPTH"},
        {codigo: "IYR0787", descripcion: "Conector Bronce 3/4 OD * 1 NPTH"},
        {codigo: "IYR0788", descripcion: "Conector Bronce 3/4 OD * 1.1/2 NPTH"},
        {codigo: "IYR0789", descripcion: "Conector Bronce 1 OD * 1/4 NPTH"},
        {codigo: "IYR0790", descripcion: "Conector Bronce 1 OD * 1/2 NPTH"},
        {codigo: "IYR0791", descripcion: "Conector Bronce 1 OD * 3/4 NPTH"},
        {codigo: "IYR0792", descripcion: "Conector Bronce 1 OD * 3/8 NPTH"},
        {codigo: "IYR0793", descripcion: "Conector Bronce 1 OD * 1 NPTH"},
        {codigo: "IYR0794", descripcion: "Conector Bronce 1 OD * 1.1/2 NPTH"},
        {codigo: "IYR0795", descripcion: "Conector Bronce 1.1/4 OD * 1/2 NPTH"},
        {codigo: "IYR0796", descripcion: "Conector Bronce 1.1/4 OD * 3/4 NPTH"},
        {codigo: "IYR0797", descripcion: "Conector Bronce 1.1/4 OD * 3/8 NPTH"},
        {codigo: "IYR0798", descripcion: "Conector Bronce 1.1/4 OD * 1 NPTH"},
        {codigo: "IYR0799", descripcion: "Conector Bronce 1.1/4 OD * 1.1/2 NPTH"},
        {codigo: "IYR0800", descripcion: "Conector Bronce 1.1/4 OD * 2 NPTH"},
        {codigo: "IYR0801", descripcion: "Conector Bronce 1.1/2 OD * 1/2 NPTH"},
        {codigo: "IYR0802", descripcion: "Conector Bronce 1.1/2 OD * 3/4 NPTH"},
        {codigo: "IYR0803", descripcion: "Conector Bronce 1.1/2 OD * 3/8 NPTH"},
        {codigo: "IYR0804", descripcion: "Conector Bronce 1.1/2 OD * 1 NPTH"},
        {codigo: "IYR0805", descripcion: "Conector Bronce 1.1/2 OD * 1.1/2 NPTH"},
        {codigo: "IYR0806", descripcion: "Conector Bronce 1.1/2 OD * 2 NPTH"},
        {codigo: "IYR0807", descripcion: "Conector Bronce 2 OD * 1/2 NPTH"},
        {codigo: "IYR0808", descripcion: "Conector Bronce 2 OD * 3/4 NPTH"},
        {codigo: "IYR0809", descripcion: "Conector Bronce 2 OD * 3/8 NPTH"},
        {codigo: "IYR0810", descripcion: "Conector Bronce 2 OD * 1 NPTH"},
        {codigo: "IYR0811", descripcion: "Conector Bronce 2 OD * 1.1/2 NPTH"},
        {codigo: "IYR0812", descripcion: "Conector Bronce 2 OD * 2 NPTH"},
    
        // ============= BRONCE - CONECTORES MIXTOS NPTM/NPTH (813-864) =============
        {codigo: "IYR0813", descripcion: "Conector Bronce 1/8 NPTM * 1/4 NPTH"},
        {codigo: "IYR0814", descripcion: "Conector Bronce 1/8 NPTM * 1/2 NPTH"},
        {codigo: "IYR0815", descripcion: "Conector Bronce 1/8 NPTM * 3/4 NPTH"},
        {codigo: "IYR0816", descripcion: "Conector Bronce 1/8 NPTM * 3/8 NPTH"},
        {codigo: "IYR0817", descripcion: "Conector Bronce 1/8 NPTM * 1 NPTH"},
        {codigo: "IYR0818", descripcion: "Conector Bronce 1/4 NPTM * 1/4 NPTH"},
        {codigo: "IYR0819", descripcion: "Conector Bronce 1/4 NPTM * 1/2 NPTH"},
        {codigo: "IYR0820", descripcion: "Conector Bronce 1/4 NPTM * 3/4 NPTH"},
        {codigo: "IYR0821", descripcion: "Conector Bronce 1/4 NPTM * 3/8 NPTH"},
        {codigo: "IYR0822", descripcion: "Conector Bronce 1/4 NPTM * 1 NPTH"},
        {codigo: "IYR0823", descripcion: "Conector Bronce 1/2 NPTM * 1/4 NPTH"},
        {codigo: "IYR0824", descripcion: "Conector Bronce 1/2 NPTM * 1/2 NPTH"},
        {codigo: "IYR0825", descripcion: "Conector Bronce 1/2 NPTM * 3/4 NPTH"},
        {codigo: "IYR0826", descripcion: "Conector Bronce 1/2 NPTM * 3/8 NPTH"},
        {codigo: "IYR0827", descripcion: "Conector Bronce 1/2 NPTM * 1 NPTH"},
        {codigo: "IYR0828", descripcion: "Conector Bronce 1/2 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0829", descripcion: "Conector Bronce 3/8 NPTM * 1/4 NPTH"},
        {codigo: "IYR0830", descripcion: "Conector Bronce 3/8 NPTM * 1/2 NPTH"},
        {codigo: "IYR0831", descripcion: "Conector Bronce 3/8 NPTM * 3/4 NPTH"},
        {codigo: "IYR0832", descripcion: "Conector Bronce 3/8 NPTM * 3/8 NPTH"},
        {codigo: "IYR0833", descripcion: "Conector Bronce 3/8 NPTM * 1 NPTH"},
        {codigo: "IYR0834", descripcion: "Conector Bronce 3/8 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0835", descripcion: "Conector Bronce 3/4 NPTM * 1/4 NPTH"},
        {codigo: "IYR0836", descripcion: "Conector Bronce 3/4 NPTM * 1/2 NPTH"},
        {codigo: "IYR0837", descripcion: "Conector Bronce 3/4 NPTM * 3/4 NPTH"},
        {codigo: "IYR0838", descripcion: "Conector Bronce 3/4 NPTM * 3/8 NPTH"},
        {codigo: "IYR0839", descripcion: "Conector Bronce 3/4 NPTM * 1 NPTH"},
        {codigo: "IYR0840", descripcion: "Conector Bronce 3/4 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0841", descripcion: "Conector Bronce 1 NPTM * 1/4 NPTH"},
        {codigo: "IYR0842", descripcion: "Conector Bronce 1 NPTM * 1/2 NPTH"},
        {codigo: "IYR0843", descripcion: "Conector Bronce 1 NPTM * 3/4 NPTH"},
        {codigo: "IYR0844", descripcion: "Conector Bronce 1 NPTM * 3/8 NPTH"},
        {codigo: "IYR0845", descripcion: "Conector Bronce 1 NPTM * 1 NPTH"},
        {codigo: "IYR0846", descripcion: "Conector Bronce 1 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0847", descripcion: "Conector Bronce 1.1/4 NPTM * 1/2 NPTH"},
        {codigo: "IYR0848", descripcion: "Conector Bronce 1.1/4 NPTM * 3/4 NPTH"},
        {codigo: "IYR0849", descripcion: "Conector Bronce 1.1/4 NPTM * 3/8 NPTH"},
        {codigo: "IYR0850", descripcion: "Conector Bronce 1.1/4 NPTM * 1 NPTH"},
        {codigo: "IYR0851", descripcion: "Conector Bronce 1.1/4 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0852", descripcion: "Conector Bronce 1.1/4 NPTM * 2 NPTH"},
        {codigo: "IYR0853", descripcion: "Conector Bronce 1.1/2 NPTM * 1/2 NPTH"},
        {codigo: "IYR0854", descripcion: "Conector Bronce 1.1/2 NPTM * 3/4 NPTH"},
        {codigo: "IYR0855", descripcion: "Conector Bronce 1.1/2 NPTM * 3/8 NPTH"},
        {codigo: "IYR0856", descripcion: "Conector Bronce 1.1/2 NPTM * 1 NPTH"},
        {codigo: "IYR0857", descripcion: "Conector Bronce 1.1/2 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0858", descripcion: "Conector Bronce 1.1/2 NPTM * 2 NPTH"},
        {codigo: "IYR0859", descripcion: "Conector Bronce 2 NPTM * 1/2 NPTH"},
        {codigo: "IYR0860", descripcion: "Conector Bronce 2 NPTM * 3/4 NPTH"},
        {codigo: "IYR0861", descripcion: "Conector Bronce 2 NPTM * 3/8 NPTH"},
        {codigo: "IYR0862", descripcion: "Conector Bronce 2 NPTM * 1 NPTH"},
        {codigo: "IYR0863", descripcion: "Conector Bronce 2 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR0864", descripcion: "Conector Bronce 2 NPTM * 2 NPTH"},

        // ============= BRONCE - RACORES (865-877) =============
        {codigo: "IYR0865", descripcion: "Racore Bronce 1/2 NPTM * DISSaire"},
        {codigo: "IYR0866", descripcion: "Racore Bronce 1/2 NPTM * DISSoxigeno"},
        {codigo: "IYR0867", descripcion: "Racore Bronce 1/2 NPTM * DISSvacio"},
        {codigo: "IYR0868", descripcion: "Racore Bronce 1/2 NPTM * DISSnitrogeno"},
        {codigo: "IYR0869", descripcion: "Racore Bronce 3/4 NPTM * DISSaire"},
        {codigo: "IYR0870", descripcion: "Racore Bronce 3/4 NPTM * DISSoxigeno"},
        {codigo: "IYR0871", descripcion: "Racore Bronce 3/4 NPTM * DISSvacio"},
        {codigo: "IYR0872", descripcion: "Racore Bronce 3/4 NPTM * DISSnitrogeno"},
        {codigo: "IYR0873", descripcion: "Racore RoscaSoldeo Bronce 1/2"},
        {codigo: "IYR0874", descripcion: "Racore RoscaSoldeo Bronce 3/4"},
        {codigo: "IYR0875", descripcion: "Racore RoscaSoldeo Bronce 1"},
        {codigo: "IYR0876", descripcion: "Racore RoscaSoldeo Bronce 1.1/4"},
        {codigo: "IYR0877", descripcion: "Racore RoscaSoldeo Bronce 1.1/2"},

        // ============= BRONCE - TAPONES (878-884) =============
        {codigo: "IYR0878", descripcion: "Tapon Bronce 1/4 NPTM"},
        {codigo: "IYR0879", descripcion: "Tapon Bronce 1/2 NPTM"},
        {codigo: "IYR0880", descripcion: "Tapon Bronce 3/8 NPTM"},
        {codigo: "IYR0881", descripcion: "Tapon Bronce 3/4 NPTM"},
        {codigo: "IYR0882", descripcion: "Tapon Bronce 1 NPTM"},
        {codigo: "IYR0883", descripcion: "Tapon Bronce 1.1/4 NPTM"},
        {codigo: "IYR0884", descripcion: "Tapon Bronce 1.1/2 NPTM"},

        // ============= BRONCE - BUSHINGS (885-902) =============
        {codigo: "IYR0885", descripcion: "Bushing Bronce 1/4 * 3/8"},
        {codigo: "IYR0886", descripcion: "Bushing Bronce 1/4 * 1/2"},
        {codigo: "IYR0887", descripcion: "Bushing Bronce 1/4 * 1"},
        {codigo: "IYR0888", descripcion: "Bushing Bronce 1/2 * 1"},
        {codigo: "IYR0889", descripcion: "Bushing Bronce 1/2 * 1.1/2"},
        {codigo: "IYR0890", descripcion: "Bushing Bronce 1/2 * 2"},
        {codigo: "IYR0891", descripcion: "Bushing Bronce 3/8 * 1/2"},
        {codigo: "IYR0892", descripcion: "Bushing Bronce 3/8 * 1"},
        {codigo: "IYR0893", descripcion: "Bushing Bronce 3/4 * 1"},
        {codigo: "IYR0894", descripcion: "Bushing Bronce 3/4 * 1.1/4"},
        {codigo: "IYR0895", descripcion: "Bushing Bronce 3/4 * 1.1/2"},
        {codigo: "IYR0896", descripcion: "Bushing Bronce 3/4 * 2"},
        {codigo: "IYR0897", descripcion: "Bushing Bronce 1 * 1/4"},
        {codigo: "IYR0898", descripcion: "Bushing Bronce 1 * 1/2"},
        {codigo: "IYR0899", descripcion: "Bushing Bronce 1 * 2"},
        {codigo: "IYR0900", descripcion: "Bushing Bronce 1.1/4 * 1.1/2"},
        {codigo: "IYR0901", descripcion: "Bushing Bronce 1.1/4 * 2"},
        {codigo: "IYR0902", descripcion: "Bushing Bronce 1.1/2 * 2"},

        // ============= BRONCE - VÁLVULAS (903-917) =============
        {codigo: "IYR0903", descripcion: "Valvula Bronce 4Tornillos 1/4"},
        {codigo: "IYR0904", descripcion: "Valvula Bronce 4Tornillos 1/2"},
        {codigo: "IYR0905", descripcion: "Valvula Bronce 4Tornillos 3/4"},
        {codigo: "IYR0906", descripcion: "Valvula Bronce 4Tornillos 1"},
        {codigo: "IYR0907", descripcion: "Valvula Bronce 4Tornillos 1.1/4"},
        {codigo: "IYR0908", descripcion: "Valvula Bronce 4Tornillos 1.1/2"},
        {codigo: "IYR0909", descripcion: "Valvula Bronce 4Tornillos 2"},
        {codigo: "IYR0910", descripcion: "Valvula Bronce deBola 1/4"},
        {codigo: "IYR0911", descripcion: "Valvula Bronce deBola 1/2"},
        {codigo: "IYR0912", descripcion: "Valvula Bronce deBola 3/4"},
        {codigo: "IYR0913", descripcion: "Valvula Bronce deBola 1"},
        {codigo: "IYR0914", descripcion: "Valvula Bronce deBola 1.1/4"},
        {codigo: "IYR0915", descripcion: "Valvula Bronce deBola 1.1/2"},
        {codigo: "IYR0916", descripcion: "Valvula Bronce deBola 2"},
        {codigo: "IYR0917", descripcion: "Valvula Bronce 4Vias 1/8 NPTH"},

        // ============= BRONCE - CODOS (918-1049) =============
        {codigo: "IYR0918", descripcion: "Codo Bronce 1/8 OD"},
        {codigo: "IYR0919", descripcion: "Codo Bronce 1/4 OD"},
        {codigo: "IYR0920", descripcion: "Codo Bronce 1/2 OD"},
        {codigo: "IYR0921", descripcion: "Codo Bronce 3/8 OD"},
        {codigo: "IYR0922", descripcion: "Codo Bronce 3/4 OD"},
        {codigo: "IYR0923", descripcion: "Codo Bronce 1 OD"},
        {codigo: "IYR0924", descripcion: "Codo Bronce 1.1/4 OD"},
        {codigo: "IYR0925", descripcion: "Codo Bronce 1.1/2 OD"},
        {codigo: "IYR0926", descripcion: "Codo Bronce 1/8 NPTM"},
        {codigo: "IYR0927", descripcion: "Codo Bronce 1/4 NPTM"},
        {codigo: "IYR0928", descripcion: "Codo Bronce 1/2 NPTM"},
        {codigo: "IYR0929", descripcion: "Codo Bronce 3/8 NPTM"},
        {codigo: "IYR0930", descripcion: "Codo Bronce 3/4 NPTM"},
        {codigo: "IYR0931", descripcion: "Codo Bronce 1 NPTM"},
        {codigo: "IYR0932", descripcion: "Codo Bronce 1.1/4 NPTM"},
        {codigo: "IYR0933", descripcion: "Codo Bronce 1.1/2 NPTM"},
        {codigo: "IYR0934", descripcion: "Codo Bronce 1/8 NPTH"},
        {codigo: "IYR0935", descripcion: "Codo Bronce 1/4 NPTH"},
        {codigo: "IYR0936", descripcion: "Codo Bronce 1/2 NPTH"},
        {codigo: "IYR0937", descripcion: "Codo Bronce 3/8 NPTH"},
        {codigo: "IYR0938", descripcion: "Codo Bronce 3/4 NPTH"},
        {codigo: "IYR0939", descripcion: "Codo Bronce 1 NPTH"},
        {codigo: "IYR0940", descripcion: "Codo Bronce 1.1/4 NPTH"},
        {codigo: "IYR0941", descripcion: "Codo Bronce 1.1/2 NPTH"},

        // ============= BRONCE - CODOS MIXTOS OD/NPTM (942-977) =============
        {codigo: "IYR0942", descripcion: "Codo Bronce 1/8 OD * 1/8 NPTM"},
        {codigo: "IYR0943", descripcion: "Codo Bronce 1/8 OD * 1/4 NPTM"},
        {codigo: "IYR0944", descripcion: "Codo Bronce 1/8 OD * 1/2 NPTM"},
        {codigo: "IYR0945", descripcion: "Codo Bronce 1/4 OD * 1/4 NPTM"},
        {codigo: "IYR0946", descripcion: "Codo Bronce 1/4 OD * 1/8 NPTM"},
        {codigo: "IYR0947", descripcion: "Codo Bronce 1/4 OD * 1/2 NPTM"},
        {codigo: "IYR0948", descripcion: "Codo Bronce 1/4 OD * 3/8 NPTM"},
        {codigo: "IYR0949", descripcion: "Codo Bronce 1/4 OD * 3/4 NPTM"},
        {codigo: "IYR0950", descripcion: "Codo Bronce 1/4 OD * 1 NPTM"},
        {codigo: "IYR0951", descripcion: "Codo Bronce 1/2 OD * 1/8 NPTM"},
        {codigo: "IYR0952", descripcion: "Codo Bronce 1/2 OD * 1/4 NPTM"},
        {codigo: "IYR0953", descripcion: "Codo Bronce 1/2 OD * 1/2 NPTM"},
        {codigo: "IYR0954", descripcion: "Codo Bronce 1/2 OD * 3/8 NPTM"},
        {codigo: "IYR0955", descripcion: "Codo Bronce 1/2 OD * 3/4 NPTM"},
        {codigo: "IYR0956", descripcion: "Codo Bronce 1/2 OD * 1 NPTM"},
        {codigo: "IYR0957", descripcion: "Codo Bronce 1/2 OD * 1.1/4 NPTM"},
        {codigo: "IYR0958", descripcion: "Codo Bronce 3/8 OD * 1/4 NPTM"},
        {codigo: "IYR0959", descripcion: "Codo Bronce 3/8 OD * 1/2 NPTM"},
        {codigo: "IYR0960", descripcion: "Codo Bronce 3/8 OD * 3/8 NPTM"},
        {codigo: "IYR0961", descripcion: "Codo Bronce 3/8 OD * 3/4 NPTM"},
        {codigo: "IYR0962", descripcion: "Codo Bronce 3/8 OD * 1 NPTM"},
        {codigo: "IYR0963", descripcion: "Codo Bronce 3/8 OD * 1.1/4 NPTM"},
        {codigo: "IYR0964", descripcion: "Codo Bronce 3/4 OD * 1/4 NPTM"},
        {codigo: "IYR0965", descripcion: "Codo Bronce 3/4 OD * 1/2 NPTM"},
        {codigo: "IYR0966", descripcion: "Codo Bronce 3/4 OD * 3/8 NPTM"},
        {codigo: "IYR0967", descripcion: "Codo Bronce 3/4 OD * 3/4 NPTM"},
        {codigo: "IYR0968", descripcion: "Codo Bronce 3/4 OD * 1 NPTM"},
        {codigo: "IYR0969", descripcion: "Codo Bronce 3/4 OD * 1.1/4 NPTM"},
        {codigo: "IYR0970", descripcion: "Codo Bronce 1 OD * 1/4 NPTM"},
        {codigo: "IYR0971", descripcion: "Codo Bronce 1 OD * 1/2 NPTM"},
        {codigo: "IYR0972", descripcion: "Codo Bronce 1 OD * 3/8 NPTM"},
        {codigo: "IYR0973", descripcion: "Codo Bronce 1 OD * 3/4 NPTM"},
        {codigo: "IYR0974", descripcion: "Codo Bronce 1 OD * 1 NPTM"},
        {codigo: "IYR0975", descripcion: "Codo Bronce 1 OD * 1.1/4 NPTM"},
        {codigo: "IYR0976", descripcion: "Codo Bronce 1 OD * 1.1/2 NPTM"},
        {codigo: "IYR0977", descripcion: "Codo Bronce 1 OD * 2 NPTM"},

        // ============= BRONCE - CODOS MIXTOS OD/NPTH (978-1013) =============
        {codigo: "IYR0978", descripcion: "Codo Bronce 1/8 OD * 1/8 NPTH"},
        {codigo: "IYR0979", descripcion: "Codo Bronce 1/8 OD * 1/4 NPTH"},
        {codigo: "IYR0980", descripcion: "Codo Bronce 1/8 OD * 1/2 NPTH"},
        {codigo: "IYR0981", descripcion: "Codo Bronce 1/4 OD * 1/4 NPTH"},
        {codigo: "IYR0982", descripcion: "Codo Bronce 1/4 OD * 1/8 NPTH"},
        {codigo: "IYR0983", descripcion: "Codo Bronce 1/4 OD * 1/2 NPTH"},
        {codigo: "IYR0984", descripcion: "Codo Bronce 1/4 OD * 3/8 NPTH"},
        {codigo: "IYR0985", descripcion: "Codo Bronce 1/4 OD * 3/4 NPTH"},
        {codigo: "IYR0986", descripcion: "Codo Bronce 1/4 OD * 1 NPTH"},
        {codigo: "IYR0987", descripcion: "Codo Bronce 1/2 OD * 1/8 NPTH"},
        {codigo: "IYR0988", descripcion: "Codo Bronce 1/2 OD * 1/4 NPTH"},
        {codigo: "IYR0989", descripcion: "Codo Bronce 1/2 OD * 1/2 NPTH"},
        {codigo: "IYR0990", descripcion: "Codo Bronce 1/2 OD * 3/8 NPTH"},
        {codigo: "IYR0991", descripcion: "Codo Bronce 1/2 OD * 3/4 NPTH"},
        {codigo: "IYR0992", descripcion: "Codo Bronce 1/2 OD * 1 NPTH"},
        {codigo: "IYR0993", descripcion: "Codo Bronce 1/2 OD * 1.1/4 NPTH"},
        {codigo: "IYR0994", descripcion: "Codo Bronce 3/8 OD * 1/4 NPTH"},
        {codigo: "IYR0995", descripcion: "Codo Bronce 3/8 OD * 1/2 NPTH"},
        {codigo: "IYR0996", descripcion: "Codo Bronce 3/8 OD * 3/8 NPTH"},
        {codigo: "IYR0997", descripcion: "Codo Bronce 3/8 OD * 3/4 NPTH"},
        {codigo: "IYR0998", descripcion: "Codo Bronce 3/8 OD * 1 NPTH"},
        {codigo: "IYR0999", descripcion: "Codo Bronce 3/8 OD * 1.1/4 NPTH"},
        {codigo: "IYR1000", descripcion: "Codo Bronce 3/4 OD * 1/4 NPTH"},
        {codigo: "IYR1001", descripcion: "Codo Bronce 3/4 OD * 1/2 NPTH"},
        {codigo: "IYR1002", descripcion: "Codo Bronce 3/4 OD * 3/8 NPTH"},
        {codigo: "IYR1003", descripcion: "Codo Bronce 3/4 OD * 3/4 NPTH"},
        {codigo: "IYR1004", descripcion: "Codo Bronce 3/4 OD * 1 NPTH"},
        {codigo: "IYR1005", descripcion: "Codo Bronce 3/4 OD * 1.1/4 NPTH"},
        {codigo: "IYR1006", descripcion: "Codo Bronce 1 OD * 1/4 NPTH"},
        {codigo: "IYR1007", descripcion: "Codo Bronce 1 OD * 1/2 NPTH"},
        {codigo: "IYR1008", descripcion: "Codo Bronce 1 OD * 3/8 NPTH"},
        {codigo: "IYR1009", descripcion: "Codo Bronce 1 OD * 3/4 NPTH"},
        {codigo: "IYR1010", descripcion: "Codo Bronce 1 OD * 1 NPTH"},
        {codigo: "IYR1011", descripcion: "Codo Bronce 1 OD * 1.1/4 NPTH"},
        {codigo: "IYR1012", descripcion: "Codo Bronce 1 OD * 1.1/2 NPTH"},
        {codigo: "IYR1013", descripcion: "Codo Bronce 1 OD * 2 NPTH"},

        // ============= BRONCE - CODOS MIXTOS NPTM/NPTH (1014-1049) =============
        {codigo: "IYR1014", descripcion: "Codo Bronce 1/8 NPTM * 1/8 NPTH"},
        {codigo: "IYR1015", descripcion: "Codo Bronce 1/8 NPTM * 1/4 NPTH"},
        {codigo: "IYR1016", descripcion: "Codo Bronce 1/8 NPTM * 1/2 NPTH"},
        {codigo: "IYR1017", descripcion: "Codo Bronce 1/4 NPTM * 1/4 NPTH"},
        {codigo: "IYR1018", descripcion: "Codo Bronce 1/4 NPTM * 1/8 NPTH"},
        {codigo: "IYR1019", descripcion: "Codo Bronce 1/4 NPTM * 1/2 NPTH"},
        {codigo: "IYR1020", descripcion: "Codo Bronce 1/4 NPTM * 3/8 NPTH"},
        {codigo: "IYR1021", descripcion: "Codo Bronce 1/4 NPTM * 3/4 NPTH"},
        {codigo: "IYR1022", descripcion: "Codo Bronce 1/4 NPTM * 1 NPTH"},
        {codigo: "IYR1023", descripcion: "Codo Bronce 1/2 NPTM * 1/8 NPTH"},
        {codigo: "IYR1024", descripcion: "Codo Bronce 1/2 NPTM * 1/4 NPTH"},
        {codigo: "IYR1025", descripcion: "Codo Bronce 1/2 NPTM * 1/2 NPTH"},
        {codigo: "IYR1026", descripcion: "Codo Bronce 1/2 NPTM * 3/8 NPTH"},
        {codigo: "IYR1027", descripcion: "Codo Bronce 1/2 NPTM * 3/4 NPTH"},
        {codigo: "IYR1028", descripcion: "Codo Bronce 1/2 NPTM * 1 NPTH"},
        {codigo: "IYR1029", descripcion: "Codo Bronce 1/2 NPTM * 1.1/4 NPTH"},
        {codigo: "IYR1030", descripcion: "Codo Bronce 3/8 NPTM * 1/4 NPTH"},
        {codigo: "IYR1031", descripcion: "Codo Bronce 3/8 NPTM * 1/2 NPTH"},
        {codigo: "IYR1032", descripcion: "Codo Bronce 3/8 NPTM * 3/8 NPTH"},
        {codigo: "IYR1033", descripcion: "Codo Bronce 3/8 NPTM * 3/4 NPTH"},
        {codigo: "IYR1034", descripcion: "Codo Bronce 3/8 NPTM * 1 NPTH"},
        {codigo: "IYR1035", descripcion: "Codo Bronce 3/8 NPTM * 1.1/4 NPTH"},
        {codigo: "IYR1036", descripcion: "Codo Bronce 3/4 NPTM * 1/4 NPTH"},
        {codigo: "IYR1037", descripcion: "Codo Bronce 3/4 NPTM * 1/2 NPTH"},
        {codigo: "IYR1038", descripcion: "Codo Bronce 3/4 NPTM * 3/8 NPTH"},
        {codigo: "IYR1039", descripcion: "Codo Bronce 3/4 NPTM * 3/4 NPTH"},
        {codigo: "IYR1040", descripcion: "Codo Bronce 3/4 NPTM * 1 NPTH"},
        {codigo: "IYR1041", descripcion: "Codo Bronce 3/4 NPTM * 1.1/4 NPTH"},
        {codigo: "IYR1042", descripcion: "Codo Bronce 1 NPTM * 1/4 NPTH"},
        {codigo: "IYR1043", descripcion: "Codo Bronce 1 NPTM * 1/2 NPTH"},
        {codigo: "IYR1044", descripcion: "Codo Bronce 1 NPTM * 3/8 NPTH"},
        {codigo: "IYR1045", descripcion: "Codo Bronce 1 NPTM * 3/4 NPTH"},
        {codigo: "IYR1046", descripcion: "Codo Bronce 1 NPTM * 1 NPTH"},
        {codigo: "IYR1047", descripcion: "Codo Bronce 1 NPTM * 1.1/4 NPTH"},
        {codigo: "IYR1048", descripcion: "Codo Bronce 1 NPTM * 1.1/2 NPTH"},
        {codigo: "IYR1049", descripcion: "Codo Bronce 1 NPTM * 2 NPTH"},

        // ============= BRONCE - TEES (1050-1070) =============
        {codigo: "IYR1050", descripcion: "Tee Bronce 1/4 OD"},
        {codigo: "IYR1051", descripcion: "Tee Bronce 1/2 OD"},
        {codigo: "IYR1052", descripcion: "Tee Bronce 3/8 OD"},
        {codigo: "IYR1053", descripcion: "Tee Bronce 3/4 OD"},
        {codigo: "IYR1054", descripcion: "Tee Bronce 1 OD"},
        {codigo: "IYR1055", descripcion: "Tee Bronce 1.1/4 OD"},
        {codigo: "IYR1056", descripcion: "Tee Bronce 1.1/2 OD"},
        {codigo: "IYR1057", descripcion: "Tee Bronce 1/4 NPTM"},
        {codigo: "IYR1058", descripcion: "Tee Bronce 1/2 NPTM"},
        {codigo: "IYR1059", descripcion: "Tee Bronce 3/8 NPTM"},
        {codigo: "IYR1060", descripcion: "Tee Bronce 3/4 NPTM"},
        {codigo: "IYR1061", descripcion: "Tee Bronce 1 NPTM"},
        {codigo: "IYR1062", descripcion: "Tee Bronce 1.1/4 NPTM"},
        {codigo: "IYR1063", descripcion: "Tee Bronce 1.1/2 NPTM"},
        {codigo: "IYR1064", descripcion: "Tee Bronce 1/4 NPTH"},
        {codigo: "IYR1065", descripcion: "Tee Bronce 1/2 NPTH"},
        {codigo: "IYR1066", descripcion: "Tee Bronce 3/8 NPTH"},
        {codigo: "IYR1067", descripcion: "Tee Bronce 3/4 NPTH"},
        {codigo: "IYR1068", descripcion: "Tee Bronce 1 NPTH"},
        {codigo: "IYR1069", descripcion: "Tee Bronce 1.1/4 NPTH"},
        {codigo: "IYR1070", descripcion: "Tee Bronce 1.1/2 NPTH"}

    ];
     
        const accesoriosGenerados = [];
        let codigoCounter = 95;
        
        for (const [material, tipos] of Object.entries(accesoriosData)) {
            for (const [tipo, detalles] of Object.entries(tipos)) {
                const nuevosAccesorios = this.generarAccesorios(material, tipo, detalles, codigoCounter);
                accesoriosGenerados.push(...nuevosAccesorios);
                codigoCounter += nuevosAccesorios.length;
            }
        }
        
        // Esto crea la "base de datos" de todos los productos posibles.
        this.productos = [...tuberias, ...accesoriosGenerados].map(p => ({
            ...p,
            cantidad: 0,
            valor: 0.00,
            ubicacion: 'N/A' 
        }));

        this.guardarDatos();
        console.log("Datos por defecto creados y guardados en localStorage.");
    },