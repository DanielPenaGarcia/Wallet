# Módulo de categorías

## Propósito

El módulo de Categorías administra el catálogo jerárquico utilizado para clasificar movimientos financieros. Su interfaz se encuentra en la ruta `/configuracion`, dentro de la pestaña **Categorías**.

Las reglas de negocio completas se encuentran en [Reglas de categorías](../rules/categorias.md).

## Funcionalidad disponible

Actualmente el usuario puede:

- Consultar las categorías activas como un árbol ordenado por nombre.
- Crear una categoría principal desde el botón general `+`.
- Crear una subcategoría desde el botón `+` de su categoría padre.
- Asignar un nombre de hasta 60 caracteres y un color hexadecimal.
- Editar el nombre y el color sin cambiar la posición de la categoría en el árbol.
- Eliminar lógicamente una categoría para conservar su historial.

El formulario de alta no incluye un selector de categoría padre. La posición se determina desde el botón utilizado para abrirlo, de modo que el usuario siempre vea el contexto exacto en el que se creará la categoría.

## Jerarquía y validaciones

Una categoría sin padre pertenece al nivel principal; una categoría con padre aparece como hija de esta. La jerarquía puede contener varios niveles.

No pueden existir dos categorías activas con el mismo nombre dentro del mismo padre. La comparación no distingue entre mayúsculas y minúsculas. El mismo nombre sí puede utilizarse en ramas diferentes.

Solo una categoría activa puede utilizarse como padre. Una categoría con hijas activas no puede eliminarse hasta que estas se eliminen. Actualmente no existe una operación para mover categorías entre ramas.

## Persistencia

Cada categoría conserva:

- Identificador.
- Nombre y color.
- Identificador de la categoría padre, cuando existe.
- Estado activo.
- Fechas de registro, última actualización y eliminación.

Las consultas de la pantalla muestran únicamente registros activos. La eliminación establece el registro como inactivo y guarda la fecha de eliminación; no borra la fila de la base de datos.

## Pendiente

El módulo todavía no permite restaurar categorías inactivas, mover una categoría a otro padre ni consultar su historial de cambios. La clasificación de movimientos comenzará a utilizar este catálogo cuando se implemente el registro de gastos y movimientos.
