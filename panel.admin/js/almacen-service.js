// EN: almacen-service.js
console.log("Cargando AlmacenService.js...");

window.AlmacenService = (function() {
    const BOGOTA_KEY = 'almacen_bogota_stock';
    const CALI_KEY = 'almacen_cali_stock';

    const getStock = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error(`Error cargando stock para ${key}`, e);
            return {};
        }
    };

    const saveStock = (key, stockData) => {
        try {
            localStorage.setItem(key, JSON.stringify(stockData));
            // Disparamos un evento para que otras pestañas (inventario.html) se enteren.
            window.dispatchEvent(new CustomEvent('stockActualizado'));
        } catch (e) {
            console.error(`Error guardando stock para ${key}`, e);
        }
    };

    return {
        // Función para agregar o actualizar stock en una ubicación
        actualizarStock: function(ubicacion, codigo, cantidadNueva, valorNuevo) {
            const key = ubicacion === 'Bogotá' ? BOGOTA_KEY : CALI_KEY;
            const stockActual = getStock(key);

            // Verificamos si ya existe stock para este producto
            const stockExistente = stockActual[codigo];

            if (stockExistente && stockExistente.cantidad > 0) {
                // --- LÓGICA DE PROMEDIO PONDERADO ---
                const cantidadAntigua = stockExistente.cantidad;
                const valorAntiguo = stockExistente.valor;

                // Calculamos el valor total del stock existente y del nuevo
                const valorTotalAntiguo = cantidadAntigua * valorAntiguo;
                const valorTotalNuevo = cantidadNueva * valorNuevo;

                // Calculamos la nueva cantidad total
                const nuevaCantidadTotal = cantidadAntigua + cantidadNueva;
                
                // Calculamos el nuevo valor promedio
                const nuevoValorPromedio = (valorTotalAntiguo + valorTotalNuevo) / nuevaCantidadTotal;

                // Actualizamos el registro en el stock
                stockExistente.cantidad = nuevaCantidadTotal;
                // Redondeamos a 2 decimales para evitar problemas con números flotantes
                stockExistente.valor = parseFloat(nuevoValorPromedio.toFixed(2)); 

            } else {
                // Si no existe o la cantidad era 0, simplemente establecemos los nuevos valores
                stockActual[codigo] = { 
                    cantidad: cantidadNueva, 
                    valor: valorNuevo 
                };
            }
            
            saveStock(key, stockActual);
            console.log(`Stock actualizado para ${codigo} en ${ubicacion}:`, stockActual[codigo]);
        },

        // Función para consultar el stock de un producto en una ubicación específica
        consultarStock: function(ubicacion, codigo) {
            const key = ubicacion === 'Bogotá' ? BOGOTA_KEY : CALI_KEY;
            const stockData = getStock(key);
            
            // Devuelve el objeto { cantidad, valor } o null si no existe
            return stockData[codigo] || null;
        }
    };
})();