# Reglas de ingresos

## Ingreso recurrente por trabajo

Un trabajo representa una fuente recurrente de ingresos. Debe registrar:

- Nombre que permita identificar el trabajo.
- Ganancia mensual.
- Frecuencia con la que se recibe el pago.
- Si la ganancia indicada es bruta o neta.
- Moneda.

## Frecuencia de pago

Las frecuencias iniciales son:

- **Semanal:** se recibe un pago cada semana.
- **Quincenal:** se reciben dos pagos al mes. No significa automáticamente un pago cada catorce días.
- **Mensual:** se recibe un pago al mes.

La ganancia mensual es el importe de referencia, independientemente de la frecuencia. No se debe dividir automáticamente una ganancia semanal entre cuatro porque algunos meses contienen cinco fechas de pago.

## Importe bruto y neto

- **Bruto:** importe antes de impuestos, retenciones y otras deducciones.
- **Neto:** importe que realmente recibe el usuario después de deducciones.

Un ingreso bruto no debe considerarse completamente disponible. Para distribuir dinero se deben utilizar importes netos confirmados o pagos que realmente hayan sido recibidos.

## Edición y eliminación

Los datos de un ingreso recurrente pueden editarse cuando cambien el monto, la frecuencia, el tipo de importe, la moneda o el nombre del trabajo. La fecha de actualización debe registrarse sin modificar la fecha original de alta.

La eliminación es lógica (*soft delete*): el ingreso pasa a estar inactivo y registra la fecha de eliminación, pero su fila no se borra. Deja de aparecer entre los ingresos disponibles y conserva sus datos para futuras relaciones e historial financiero.
