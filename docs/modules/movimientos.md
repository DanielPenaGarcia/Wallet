# Módulo de movimientos

## Propósito

La ruta `/movimientos` concentra la actividad financiera registrada por el usuario. Permite crear, editar, consultar y eliminar lógicamente tres tipos de movimiento: gastos, ingresos y transferencias.

## Tipos

- **Gasto:** registra título, monto, fecha y hora, cuenta o tarjeta de origen, forma de pago y una clasificación vinculada a un gasto recurrente o categoría. Si se paga a meses, guarda el plazo y si es sin intereses.
- **Ingreso:** registra título, razón, monto, fecha y hora y la cuenta o tarjeta que recibe el dinero.
- **Transferencia:** registra título, monto, fecha y hora, origen y destino. Ambos deben ser diferentes y usar la misma moneda.

La moneda se toma de la cuenta o tarjeta correspondiente y se conserva en el movimiento. Por ahora los movimientos forman un registro independiente y no recalculan automáticamente los saldos de las tarjetas.
