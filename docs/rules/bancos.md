# Reglas de bancos

Este documento define cómo funciona el registro de bancos y su relación con las tarjetas.

## Registro de bancos

Antes de registrar una tarjeta debe existir el banco que la emitió. Cada banco mantiene:

- Nombre completo.
- Nombre corto opcional.
- País mediante su código correspondiente.
- Fecha y hora de registro.
- Estado activo o inactivo.
- Calendario de días laborales y no laborales.

Las tarjetas deben guardar el identificador del banco y no una copia de su nombre. De esta manera, una corrección al nombre o al calendario del banco se aplica de forma consistente.

## Estado del banco

Un banco inactivo no puede asignarse a tarjetas nuevas. Desactivar un banco no elimina las tarjetas existentes ni su historial; las tarjetas que ya lo utilizan conservan la relación.

No se debe eliminar un banco mientras existan tarjetas relacionadas. Para retirarlo de las opciones disponibles debe marcarse como inactivo.

## Calendario bancario

El registro del banco es la fuente principal de su calendario. Este incluye:

- Zona horaria.
- Días de la semana no laborales.
- Días festivos.
- Cierres extraordinarios.

Las reglas de corte y pago de cada tarjeta determinan si una fecha no laboral se mueve al día hábil anterior, al siguiente o permanece sin cambios.

Una tarjeta de crédito puede definir una excepción de calendario solamente cuando el producto bancario tenga reglas diferentes a las generales del banco. Si no existe una excepción, debe utilizarse el calendario del banco relacionado.

## Reglas fundamentales

- Un banco se registra una sola vez y puede estar relacionado con varias tarjetas.
- Dos bancos no deben compartir el mismo identificador.
- Desactivar un banco no modifica ni elimina información histórica.
- Los cambios de calendario deben conservar los resultados históricos ya confirmados por estados de cuenta.
- Las fechas futuras pueden recalcularse cuando cambie el calendario del banco.
