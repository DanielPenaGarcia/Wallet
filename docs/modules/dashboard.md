# Módulo de dashboard

## Propósito

La ruta `/dashboard` resume la situación financiera inmediata del usuario. Su objetivo es responder cuánto conviene apartar ahora, cuánto quedaría disponible después de esas reservas y cuál es el siguiente ingreso esperado.

## Funcionalidad disponible

Actualmente el dashboard muestra:

- Total sugerido para apartar ahora.
- Disponible estimado después de reservas, cuando el siguiente ingreso puede calcularse en una sola moneda.
- Siguiente ingreso esperado con fecha e importe.
- Reservas por tarjeta de crédito.
- Reservas de la quincena para gastos pendientes.
- Reservas del mes para todos los gastos activos.

## Reservas por tarjeta de crédito

Las tarjetas de crédito aparecen cuando tienen saldo exigible por gasto de contado o por la siguiente mensualidad pendiente de compras a meses sin intereses.

La reserva sugerida se calcula así:

```text
Gasto de contado
+ siguiente mensualidad MSI pendiente
-------------------------------------
= importe a cubrir

Importe a cubrir / quincenas hasta el día límite de pago
= reserva sugerida
```

Si no hay quincenas antes del vencimiento, el sistema usa una como mínimo para evitar divisiones inválidas.

## Reservas de la quincena

Esta sección muestra únicamente gastos cuyo ciclo actual está pendiente. La reserva quincenal se calcula a partir de la reserva mensual:

- Para gastos mensuales, quincenales, semanales, diarios, personalizados por días o semanas, se usa el importe completo como referencia mensual.
- Para gastos anuales, se divide el importe entre 12.
- Para gastos personalizados por meses, se divide entre el número de meses del intervalo.
- Para gastos personalizados por años, se divide entre el número de años por 12.

La reserva de la quincena normalmente es la mitad de la reserva mensual. Si el límite cae en el mes actual antes del último pago quincenal del mes, se sugiere apartar la reserva mensual completa.

## Reservas del mes

Esta sección lista todos los gastos activos, incluyendo los ya pagados en el ciclo actual. Muestra:

- Gasto y categoría.
- Frecuencia.
- Próximo límite o límite del ciclo actual.
- Estado: pendiente o pagado.
- Reserva mensual calculada.

Los gastos pagados se mantienen visibles para explicar la planeación mensual, pero no se suman a `Apartar ahora`.

## Limitaciones actuales

- El dashboard calcula una vista estimada; no registra apartados reales ni movimientos automáticos.
- Si el siguiente ingreso combina varias monedas, el disponible estimado queda pendiente.
- Las reservas se basan en la información capturada por el usuario y no sustituyen estados de cuenta bancarios.
