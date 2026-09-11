# Módulo de tarjetas

## Propósito

El módulo de Tarjetas permite registrar y consultar tarjetas de débito y crédito desde la ruta `/tarjetas`. Cada tarjeta se relaciona con un banco y conserva por separado los datos comunes y los datos propios de su tipo.

Este módulo aplica las reglas definidas en:

- [Reglas de tarjetas](../rules/tarjetas.md).
- [Reglas de bancos](../rules/bancos.md).

## Funcionalidad disponible

Actualmente el usuario puede:

- Consultar los bancos activos al registrar una tarjeta.
- Registrar tarjetas de débito y crédito.
- Consultar las tarjetas activas ordenadas por alias.
- Distinguir cada tarjeta por alias, banco, últimos cuatro dígitos, color y tipo.
- Consultar el saldo disponible de una tarjeta de débito.
- Consultar el saldo utilizado y el crédito disponible de una tarjeta de crédito.
- Consultar el detalle de una tarjeta.
- Editar tarjetas sin cambiar su tipo.
- Eliminar tarjetas lógicamente.
- Consultar compras a meses sin intereses de tarjetas de crédito.
- Marcar y desmarcar mensualidades MSI como pagadas.

## Relación con bancos

Antes de registrar una tarjeta debe existir un banco activo. Su administración se realiza desde la pestaña **Bancos** de Configuración, donde se puede capturar:

- Nombre completo, que no puede repetirse.
- Nombre corto opcional.
- Código de país de dos caracteres.
- Zona horaria.

Al crear el banco, el sistema configura inicialmente el sábado y domingo como días no laborales y una lista de festivos vacía. Desde Configuración también puede editarse o eliminarse cuando no tenga tarjetas relacionadas.

La tarjeta guarda el identificador del banco, no una copia de su nombre. Si no existen bancos activos, el formulario de tarjeta permanece deshabilitado.

## Alta de una tarjeta

Todas las tarjetas registran:

- Tipo: débito o crédito.
- Alias, con un máximo de 60 caracteres.
- Banco activo.
- Color identificador.
- Últimos cuatro dígitos.
- Código de moneda de tres caracteres.
- Saldo inicial.
- Fecha y hora de registro, generadas automáticamente.

Los últimos cuatro dígitos deben ser exactamente cuatro caracteres numéricos. Los importes admiten hasta dos decimales y se almacenan en la unidad menor de la moneda.

### Tarjeta de débito

Además de los datos comunes, el alta solicita una referencia de la cuenta relacionada. El saldo inicial se utiliza para inicializar el saldo contable y el saldo disponible.

### Tarjeta de crédito

Además de los datos comunes, el alta solicita:

- Crédito máximo ofrecido por el banco.
- Día de corte, del 1 al 31.
- Día límite de pago, del 1 al 31.

El saldo inicial representa el monto ya utilizado y se utiliza para inicializar el saldo actual. El crédito disponible mostrado en la lista se calcula de esta forma:

```text
Crédito máximo ofrecido
- saldo actual utilizado
------------------------
= crédito disponible
```

El resultado puede ser negativo cuando el saldo actual supera el crédito máximo; no se ajusta artificialmente a cero.

## Consulta de tarjetas

La pantalla muestra únicamente tarjetas activas. Cada tarjeta aparece en una ficha con:

- Alias, banco y últimos cuatro dígitos.
- Identificación de débito o crédito.
- Color configurado como apoyo visual.
- Saldo disponible, para débito.
- Saldo utilizado y crédito disponible, para crédito.
- Acciones para ver detalles, editar o eliminar.

El color no sustituye la información textual ni se utiliza por sí solo para comunicar el tipo o el estado de la tarjeta.

## Detalle de tarjetas

El detalle muestra los datos principales de la tarjeta:

- Alias, banco, últimos cuatro dígitos y tipo.
- Saldo utilizado o disponible, según el tipo.
- Gasto de contado, cuando aplica.
- Resto pendiente de meses sin intereses, cuando aplica.
- Línea de crédito, cuando aplica.
- Día de corte y día límite de pago, para tarjetas de crédito.

En tarjetas de crédito, el detalle incluye las compras MSI pendientes agrupadas por compra. Cada compra puede expandirse para consultar sus mensualidades, el importe de cada una y si ya está pagada.

Las mensualidades pueden marcarse como pagadas o desmarcarse. Para desmarcar una mensualidad pagada, primero deben desmarcarse las mensualidades posteriores que también estén pagadas.

## Edición y eliminación

La edición permite corregir los datos de una tarjeta existente, pero no cambiar su tipo entre débito y crédito. Las validaciones de alta se mantienen en la edición.

La eliminación es lógica: la tarjeta deja de aparecer en listas activas y no puede seleccionarse en nuevos movimientos, pero su registro se conserva para historial.

## Funcionalidad pendiente

El modelo de dominio y las reglas contemplan más operaciones que aún no están conectadas a la interfaz ni a la persistencia. Todavía no es posible:

- Actualizar saldos después del alta.
- Configurar festivos, cierres extraordinarios o políticas de ajuste del calendario bancario.
- Registrar pagos directos a tarjeta o estados de cuenta oficiales.
- Capturar el pago mínimo o el pago para no generar intereses informado por el banco.
- Recalcular saldos automáticamente desde todos los movimientos.

Hasta que esas operaciones se implementen, el módulo funciona como registro, consulta operativa de MSI y resumen de saldos de tarjetas activas.
