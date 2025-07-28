INGEGASES_APP/
└── ingegases_frontend/
    └── panel.admin/
        │
        ├── 🐚 dashboard.html  (El Cascarón/Shell de la Aplicación)
        │   ├─ Es el ÚNICO archivo HTML que se carga directamente.
        │   ├─ Contiene la estructura principal (menús, cabecera, pie de página).
        │   ├─ Define el contenedor <div id="dynamicContent"> para los módulos.
        │   └─ CARGA TODOS LOS SCRIPTS (.js) UNA SOLA VEZ al final del <body>.
        │
        ├── css/
        │   └── styles.css          # Estilos globales y específicos de módulos.
        │
        ├── js/
        │   ├── 🧠 dashboard-main.js (El Director de Orquesta)
        │   │   ├─ Contiene la lógica principal del dashboard.
        │   │   └─ Define window.loadModule(), el motor que carga las vistas.
        │   │
        │   ├── 🗃️ Servicios y Datos Globales (Estado Compartido)
        │   │   ├─ inventario-global.js  (Define InventarioCompartido - Patrón Singleton)
        │   │   └─ almacen-service.js    (Define lógica de negocio para almacenes)
        │   │
        │   └── 🧩 Lógica de Módulos (Cerebros Individuales)
        │       ├─ inventario-module.js  (Define window.InventarioModule)
        │       ├─ almacen-module.js     (Define window.AlmacenModule)
        │       ├─ proyectos-module.js   (Define window.ProyectosModule)
        │       ├─ requisicion-module.js (Define window.RequisicionesModule)
        │       ├─ proveedores-module.js (Define window.ProveedoresModule)
        │       └─ soporte-module.js     (Define window.SoporteModule)
        │
        └── modules/                  # Vistas Puras (Solo HTML)
            │
            ├── inventario.html       ┐
            ├── almacen.html          │
            ├── proyectos.html        ├─ Contienen ÚNICAMENTE la estructura HTML.
            ├── requisicion.html      │  SIN LÓGICA <script>.
            ├── proveedores.html      │  Son "plantillas" que el Director carga.
            └── soporte.html          ┘



+--------------------------------------------------------------------------------------------------+
|                             ARQUITECTURA DE LA APLICACIÓN "INGEGASES APP"                          |
+==================================================================================================+
|                                                                                                  |
|   +---------------------------------+        +-------------------------------------------------+ |
|   |    🐚 dashboard.html (Shell)    |        |        🧠 js/dashboard-main.js (Director)         | |
|   | - Contenedor #dynamicContent    |        | - Define window.loadModule('nombre')              | |
|   | - Menú con onclick="..."        |        | - Se ejecuta en DOMContentLoaded                  | |
|   | - Carga TODOS los scripts .js   |        | - Llama a los .init() globales (Inventario, etc.) | |
|   +---------------------------------+        +-------------------------------------------------+ |
|                   |                                                   |                          |
|  ① El usuario hace |                                                   | ② La función se ejecuta  |
|     clic en un menú|                                                   |                          |
|     (ej: "Proyectos")|_________________________________________________ | ________________________ |
|                                                                         |                          |
|               +---------------------------------------------------------v----------------+         |
|               |              FUNCIÓN CENTRAL: window.loadModule('proyectos')             |         |
|               +---------------------------------|----------------------------------------+         |
|                                                 | 3-PASOS                                          |
|  +----------------------------------------------+-----------------------------------------------+ |
|  |                                              |                                               | |
|  |  [PASO 1: FETCH VISTA]                        |  [PASO 2: INYECTAR VISTA]                     | |
|  |  +---------------------------+                |  +---------------------------------+            | |
|  |  | Pide el archivo HTML      |--------------->|  |    dynamicContent.innerHTML =   |            | |
|  |  | /modules/proyectos.html   |                |  |       <resultado del fetch>     |            | |
|  |  +---------------------------+                |  +---------------------------------+            | |
|  |                                               |                |                                |
|  |  [PASO 3: INICIALIZAR LÓGICA] <---------------+                |                                |
|  |  +------------------------------------+                        | La vista ahora existe en el DOM|
|  |  | Llama a la función correspondiente |                        |                                |
|  |  | window.ProyectosModule.init()    |                        |                                |
|  |  +------------------------------------+                        |                                |
|  |                                                                |                                |
|  +----------------------------------------------------------------+--------------------------------+
|                                                                                                  |
|                                    ESTADO FINAL (MÓDULO ACTIVO)                                    |
|                                                                                                  |
|  +---------------------------+  <-- COMUNICACIÓN --> +-----------------------------------------+ |
|  | modules/proyectos.html    |                     |        js/proyectos-module.js             | |
|  | (La Vista en Pantalla)    |                     |        (La Lógica del Módulo)             | |
|  | - El usuario interactúa   |                     | - Contiene los datos (ej: proyectosData)    | |
|  |   con botones, formularios|                     | - Contiene las funciones (ej: saveProveedor)| |
|  +-------------|-------------+                     +----------------------|--------------------+ |
|                |                                                          |                      |
|                | ⑥ El usuario guarda un nuevo proyecto.                   |                      |
|                |    El onclick llama a una función del módulo.            |                      |
|                |__________________________________________________________| ⑦ La función:         |
|                                                                           | - Actualiza el array   |
|                                                                           |   interno de datos.    |
|  +------------------------------------------------------------------+     | - Llama a una función  |
|  |        PERSISTENCIA Y COMUNICACIÓN ENTRE MÓDULOS                 |     |   para re-renderizar   |
|  +----------------------------+-------------------------------------+     |   su propia vista.     |
|  |   💾 localStorage         |      📣 Sistema de Eventos Global    |     |                        |
|  | - 'inventarioCompartido'  | - window.dispatchEvent(             |     |                        |
|  | - 'almacenesData'         |     'inventarioActualizado'         |     |                        |
|  | - Clave para que los      |   )                                 |     |                        |
|  |   datos no se pierdan.    | - Permite que un módulo notifique   |     |                        |
|  |                           |   a otros de un cambio.             |     |                        |
|  +---------------------------+-------------------------------------+     +------------------------+
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+