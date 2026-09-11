# Reglas de tarjetas

Este documento define qué significan las tarjetas dentro de la aplicación y cómo deben interpretarse sus importes y fechas.

## Tipos de tarjeta

La aplicación distingue dos tipos de tarjeta:

- **Débito:** utiliza dinero existente en una cuenta bancaria.
- **Crédito:** utiliza una línea de crédito ofrecida por un banco y genera una obligación de pago.

Ambas comparten datos de identificación como alias, banco emisor, color, últimos cuatro dígitos, moneda, fecha de registro y estado activo. Sus saldos y reglas financieras no son intercambiables.

Cada tarjeta debe estar relacionada con un banco previamente registrado mediante su identificador. El nombre y el calendario general del banco no se duplican en la tarjeta.

## Color de identificación

Cada tarjeta tiene un color hexadecimal asignado para facilitar su reconocimiento en listas, resúmenes y formularios. El color es solamente una ayuda visual: no representa el tipo de tarjeta, su estado financiero ni su banco.

La interfaz debe mantener contraste suficiente entre el color de la tarjeta, el texto y los controles. La información nunca debe comunicarse únicamente mediante color.

## Registro y saldo inicial

Al registrar una tarjeta se debe guardar:

- La fecha y hora en que fue registrada en la aplicación.
- El saldo inicial indicado por el usuario.

El saldo inicial es una referencia histórica y no debe cambiar cuando se registren movimientos posteriores. El saldo actual sí cambia con compras, pagos, retiros, depósitos o ajustes, según el tipo de tarjeta.

## Tarjetas de débito

Una tarjeta de débito está asociada a una cuenta bancaria y puede registrar:

- Saldo contable.
- Saldo disponible.
- Saldo contable inicial al momento del registro.
- Límite diario de compras, si existe.
- Límite diario de retiros, si existe.

El saldo disponible de una tarjeta de débito representa dinero propio que puede utilizarse. La diferencia entre saldo contable y disponible puede deberse a movimientos retenidos o todavía no confirmados.

## Tarjetas de crédito

Una tarjeta de crédito debe registrar:

- Monto máximo de crédito ofrecido por el banco.
- Saldo inicial al momento del registro.
- Saldo actual.
- Regla de fecha de corte.
- Regla de fecha límite de pago.
- Pago mínimo informado por el banco.
- Pago para no generar intereses informado por el banco.
- Compras normales.
- Compras a meses sin intereses.

El monto máximo ofrecido es deuda potencial, no ingreso ni dinero disponible. Nunca debe sumarse al efectivo o a los saldos de débito del usuario.

### Saldo, crédito y crédito disponible

En una tarjeta de crédito, el **saldo actual** representa el monto que se ha gastado y todavía se debe. Este saldo es la fuente de verdad para calcular el crédito disponible.

```text
Saldo actual = monto gastado y todavía adeudado
```

El **crédito** o **crédito total** es el monto máximo ofrecido por el banco. El crédito disponible se obtiene así:

```text
Crédito total
- saldo actual
---------------
= crédito disponible
```

Las compras normales y las compras a meses sin intereses ayudan a explicar el saldo y a estimar pagos futuros, pero no reemplazan el saldo actual registrado. Esto evita que una compra anterior al alta de la tarjeta, una comisión o un movimiento todavía no capturado produzca un crédito disponible incorrecto.

Si el saldo actual supera el crédito total, el crédito disponible puede ser negativo. La aplicación debe conservar ese resultado para mostrar que la tarjeta excedió su línea, no convertirlo artificialmente en cero.

## Compras normales

Una compra normal registra su importe completo y puede encontrarse en uno de estos estados:

- **Pendiente:** la operación está en proceso o todavía no pertenece a un estado de cuenta.
- **Por pagar:** la compra ya pertenece a un estado de cuenta y tiene fecha límite de pago.
- **Pagada:** la obligación fue cubierta.
- **Reembolsada:** el importe fue devuelto y ya no forma parte de la deuda.

Una compra pendiente debe reflejarse en el saldo actual cuando ya consume la línea de crédito, pero no debe incluirse en un pago próximo hasta conocer el estado de cuenta y la fecha límite a los que pertenece.

## Compras a meses sin intereses

Una compra a meses sin intereses debe mantenerse separada de los gastos normales. Debe registrar:

- Importe original de la compra.
- Número total de mensualidades.
- Importe y vencimiento de cada mensualidad.
- Estado de cada mensualidad: programada, por pagar o pagada.

El capital pendiente de una compra a meses sin intereses es la suma de sus mensualidades no pagadas. Sin embargo, únicamente la mensualidad que vence en el periodo actual forma parte del próximo pago estimado.

Pagar una mensualidad no elimina la compra completa: solamente marca esa mensualidad como pagada y reduce su capital pendiente.

## Fecha de corte y fecha límite de pago

La **fecha de corte** cierra el conjunto de movimientos que el banco incluirá en un estado de cuenta.

La **fecha límite de pago** indica cuándo debe cubrirse, como mínimo, la obligación correspondiente a ese estado de cuenta.

La fecha límite puede configurarse de dos maneras:

- Como un día fijo del mes, posiblemente en el mismo mes del corte o en el siguiente.
- Como cierta cantidad de días naturales o hábiles después de la fecha de corte.

### Días no laborales del banco

Cada banco tiene un calendario configurable que utilizan sus tarjetas de crédito, con:

- Zona horaria del banco.
- Días de la semana considerados no laborales.
- Días festivos y cierres extraordinarios.
- Política de ajuste al día hábil anterior, al siguiente o sin ajuste.

La política se configura por regla porque un banco puede ajustar de forma distinta la fecha de corte y la fecha límite de pago. No se debe asumir que todos los bancos comparten los mismos feriados o aplican el mismo ajuste. Una tarjeta puede tener una excepción de calendario cuando su producto bancario no siga la configuración general del banco.

## Próximo pago estimado

El próximo pago estimado se calcula para la fecha límite más cercana conocida:

```text
Compras normales por pagar en esa fecha
+ mensualidades MSI que vencen en esa fecha
-------------------------------------------
= próximo pago estimado
```

La estimación sirve para reservar dinero y anticipar obligaciones. No sustituye el pago mínimo ni el pago para no generar intereses que aparecen en el estado de cuenta oficial del banco.

Cuando exista una diferencia, la aplicación debe mostrar por separado:

- El importe estimado a partir de los movimientos capturados.
- El importe oficial informado por el banco.

## Reglas fundamentales

- El crédito disponible no es un ingreso.
- Una compra no puede contarse al mismo tiempo como gasto normal y como compra a meses sin intereses.
- Las mensualidades pagadas no forman parte de la deuda pendiente ni del próximo pago.
- Las compras pagadas o reembolsadas no consumen crédito disponible.
- Todos los importes se representan en la unidad menor de la moneda, por ejemplo centavos.
- Las fechas civiles se interpretan usando la zona horaria configurada para el banco.
- El saldo inicial conserva la deuda existente al registrar una tarjeta de crédito y no se modifica después.
- El saldo actual de crédito representa lo gastado y todavía adeudado.
- El crédito disponible siempre es el crédito total menos el saldo actual.
- Los cálculos estimados deben poder explicarse a partir de los movimientos que los componen.
