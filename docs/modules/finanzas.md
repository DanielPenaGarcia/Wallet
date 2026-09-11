# Módulo de finanzas

## Propósito

El módulo de Finanzas reúne los registros y planes que describen las entradas y salidas de dinero del usuario. Su interfaz se encuentra en la ruta `/finanzas` y está dividida en tres pestañas: **Ingresos**, **Gastos** y **Objetivos**.

## Estado actual

Las tres pestañas permiten registrar y consultar información. Los objetivos complementan los ingresos y gastos con la planeación de compras o metas futuras.

Esta separación permite desarrollar cada flujo de forma independiente sin mezclar sus reglas de negocio.

## Ingresos recurrentes

Actualmente se administran ingresos recurrentes provenientes de trabajos. El usuario puede:

- Consultar los ingresos activos, ordenados por nombre del trabajo.
- Registrar un ingreso.
- Editar todos sus datos.
- Eliminarlo lógicamente sin borrar su historial.

Cada ingreso registra:

- Nombre del trabajo, con un máximo de 80 caracteres.
- Ganancia mensual, mayor que cero.
- Frecuencia de pago: semanal, quincenal o mensual.
- Tipo de monto: bruto o neto.
- Código de moneda de tres caracteres.
- Estado y fechas de registro, actualización y eliminación.

La ganancia siempre se captura como referencia mensual, aunque la frecuencia de pago sea semanal o quincenal. Los importes se convierten y almacenan en la unidad menor de la moneda para evitar cálculos con decimales imprecisos.

La lista muestra únicamente ingresos activos. Al eliminar un ingreso, este se marca como inactivo y deja de aparecer, pero su registro permanece en la base de datos.

Las reglas completas se encuentran en [Reglas de ingresos](../rules/ingresos.md).

## Gastos

La pestaña permite consultar los gastos activos y registrar uno nuevo con:

- Nombre.
- Clasificación: Necesidad, Discrecional, Regalos/Social, Obligaciones, Ahorro/Inversión o Extraordinario.
- Frecuencia: una vez, diaria, semanal, quincenal, mensual, anual o personalizada por intervalo.
- Cantidad fija o aproximada y moneda.
- Día de corte y día límite de pago, cuando correspondan.
- Una categoría activa del catálogo de Configuración.

Una frecuencia personalizada combina un número con días, semanas, meses o años; por ejemplo, `cada 2 meses`. La lista identifica la categoría mediante su color y muestra la clasificación, la frecuencia y si el importe es aproximado. Los cambios de importe se conservan en una bitácora.

Los gastos pueden editarse, pagarse y eliminarse lógicamente. La eliminación los retira de la lista activa sin borrar su registro histórico.

El pago de un gasto registra la fecha de pago, el modo de pago y, cuando aplica, la tarjeta asociada. Esos pagos alimentan el dashboard para distinguir gastos pendientes y pagados dentro del ciclo actual.

Las reglas completas se encuentran en [Reglas de gastos](../rules/gastos.md).

## Objetivos

La pestaña permite crear, editar y eliminar lógicamente objetivos como comprar un carro, ropa u otro producto. Cada objetivo registra:

- Nombre de la meta.
- Precio total y moneda.
- Porcentaje entero de cada ingreso que se desea reservar.

La suma de los porcentajes de todos los objetivos activos no puede superar el 100%. La pantalla muestra tanto el porcentaje asignado como el todavía disponible. Al eliminar un objetivo, su porcentaje vuelve a quedar disponible sin borrar el registro histórico.

El porcentaje representa una regla de planeación para el futuro motor de distribución. En esta etapa todavía no genera movimientos ni registra progreso ahorrado automáticamente.

## Funcionalidad pendiente

- Registrar aportaciones y dar seguimiento al progreso de los objetivos.
- Relacionar ingresos recibidos con el dinero realmente disponible.
- Convertir las reservas sugeridas en apartados reales y conciliables.
