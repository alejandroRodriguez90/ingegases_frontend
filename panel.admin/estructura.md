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


