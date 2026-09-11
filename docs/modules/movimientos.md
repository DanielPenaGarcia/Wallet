# Módulo de movimientos

## Propósito

La ruta `/movimientos` concentra la actividad financiera registrada por el usuario. Permite crear, editar, consultar y eliminar lógicamente tres tipos de movimiento: gastos, ingresos y transferencias.

## Tipos

- **Gasto:** registra título, monto, fecha y hora, cuenta o tarjeta de origen, forma de pago y una clasificación vinculada a un gasto recurrente o categoría. Si se paga a meses, guarda el plazo y si es sin intereses.
- **Ingreso:** registra título, razón, monto, fecha y hora y la cuenta o tarjeta que recibe el dinero.
- **Transferencia:** registra título, monto, fecha y hora, origen y destino. Ambos deben ser diferentes y usar la misma moneda.

La moneda se toma de la cuenta o tarjeta correspondiente y se conserva en el movimiento. Por ahora los movimientos forman un registro independiente y no recalculan automáticamente los saldos de las tarjetas.

## Consulta y filtros

La lista de movimientos muestra únicamente registros activos, ordenados de los más recientes a los más antiguos. Puede filtrarse por:

- Fecha de inicio.
- Fecha de fin.
- Tarjeta, considerando tanto origen como destino.
- Categoría, considerando la categoría directa del movimiento o la categoría del gasto relacionado.

Si se captura una fecha de inicio sin fecha de fin, la consulta usa el día actual como fin del periodo. La opción `Todas` en tarjeta o categoría no aplica filtro para ese campo.

## Operaciones masivas y exportación

Además del alta individual, la pantalla permite capturar movimientos en lote y seleccionar movimientos existentes para eliminarlos lógicamente. La exportación usa los movimientos consultados en la pantalla actual.

Los movimientos eliminados dejan de aparecer en la lista activa. Cuando un pago de gasto está relacionado con un movimiento eliminado, ese pago solo se considera activo para historial cuando su modo ya quedó marcado como pagado.
