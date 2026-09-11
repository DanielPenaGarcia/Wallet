# Reglas de categorías

Las categorías permiten clasificar movimientos y otros registros financieros mediante una jerarquía y un color identificador.

## Jerarquía

- Una categoría puede no tener padre; en ese caso es una categoría principal.
- Una categoría puede tener una categoría padre y convertirse en subcategoría.
- Una categoría padre puede tener varios hijos.
- Dentro del mismo padre no pueden existir dos categorías activas con el mismo nombre.
- El mismo nombre puede utilizarse en ramas diferentes cuando su significado dependa del padre.

## Color

Cada categoría tiene un color hexadecimal. El color ayuda a reconocerla, pero la interfaz siempre debe mostrar también su nombre y no comunicar información únicamente mediante color.

## Historial

Las categorías utilizadas por movimientos no deben eliminarse físicamente. Cuando dejen de utilizarse deben marcarse como inactivas para conservar el historial.

La eliminación es lógica: establece la categoría como inactiva y registra la fecha de eliminación. Una categoría con hijos activos no puede eliminarse hasta que esos hijos sean retirados o movidos, evitando que queden categorías visibles sin un padre válido.

## Edición

El nombre y el color pueden modificarse sin alterar la identidad ni la posición de la categoría en la jerarquía. Cada cambio actualiza su fecha de modificación.
