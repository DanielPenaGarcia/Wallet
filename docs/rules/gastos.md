# Reglas de gastos

## Registro de un gasto

Un gasto representa una salida de dinero que el usuario desea contemplar en su planeación. Cada registro debe incluir:

- Nombre que permita identificarlo.
- Clasificación financiera.
- Frecuencia.
- Cantidad fija o aproximada y moneda.
- Categoría activa del catálogo de categorías.

Los importes se almacenan en la unidad menor de la moneda, por ejemplo centavos, y deben ser mayores que cero.

## Clasificación financiera

Todo gasto pertenece a una de estas clasificaciones:

- **Necesidad:** consumo esencial para la vida cotidiana.
- **Discrecional:** consumo opcional que puede reducirse o posponerse.
- **Regalos/Social:** regalos, reuniones y otros compromisos sociales.
- **Obligaciones:** pagos exigibles por contrato, deuda o responsabilidad adquirida.
- **Ahorro/Inversión:** aportaciones destinadas a conservar o aumentar patrimonio.
- **Extraordinario:** salida atípica que no forma parte del patrón habitual.

La clasificación expresa la función financiera del gasto. La categoría expresa en qué se utiliza el dinero; ambos datos son obligatorios y no se sustituyen entre sí.

## Frecuencia

Las frecuencias iniciales son:

- Una vez.
- Diaria.
- Semanal.
- Quincenal.
- Mensual.
- Anual.
- Personalizada.

La cantidad corresponde a una ocurrencia de la frecuencia seleccionada. El sistema no convierte automáticamente un importe diario, semanal o anual a un equivalente mensual.

La frecuencia personalizada requiere un intervalo entero mayor que cero y una unidad: días, semanas, meses o años. Por ejemplo, un gasto bimestral se configura como **cada 2 meses**.

## Tipo de importe

Un gasto puede tener importe **fijo** o **aproximado**. El importe aproximado se utiliza cuando la obligación varía entre periodos y representa el valor esperado para la planeación. Cada modificación del importe se conserva en su bitácora para mostrar aumentos y disminuciones.

## Categoría

El gasto debe relacionarse mediante identificador con una categoría activa ya registrada. No se guarda el nombre de la categoría como texto libre.

Si una categoría deja de estar activa, los gastos existentes deben conservar su relación histórica, pero no puede utilizarse para registrar gastos nuevos.
