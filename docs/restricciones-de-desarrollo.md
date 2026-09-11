# Restricciones y estándares de desarrollo

Este documento define las reglas obligatorias para desarrollar y mantener Personal Finance Manager.

## Herramientas autorizadas

- Usar exclusivamente `pnpm` para instalar dependencias y ejecutar scripts. No usar `npm`, `yarn` ni `bun`.
- Usar SvelteKit con TypeScript en modo estricto.
- Usar Tailwind CSS para los estilos.
- Usar shadcn-svelte como base de los componentes de interfaz reutilizables.
- Usar las tecnologías aprobadas en el README: SQLite, Drizzle ORM y Zod.
- No instalar ni incorporar librerías, SDK, plugins o servicios de terceros sin autorización explícita del desarrollador responsable.
- La autorización de una librería incluye solamente sus dependencias necesarias. No autoriza librerías adicionales para resolver necesidades relacionadas.
- Antes de solicitar una dependencia, comprobar si SvelteKit, TypeScript, la plataforma web o una utilidad interna pequeña ya resuelven el problema.
- Toda dependencia autorizada debe tener un propósito concreto, mantenimiento activo y una licencia compatible con el proyecto.

## Arquitectura

- Mantener un monolito modular; no introducir microservicios, colas, Redis ni infraestructura distribuida para el MVP.
- Mantener las rutas de SvelteKit como adaptadores delgados. Una ruta puede leer datos del framework, validarlos, invocar un caso de uso y devolver su resultado.
- No colocar reglas financieras, consultas a la base de datos ni decisiones de negocio en archivos `+page.svelte`, `+page.server.ts` o `+server.ts`.
- Colocar código seguro para cliente en `src/lib/modules/<modulo>`.
- Colocar servicios, repositorios, transacciones y demás código privado en `src/lib/server/modules/<modulo>`.
- Colocar la infraestructura de base de datos en `src/lib/server/db`.
- No importar desde `$lib/server` en componentes ni módulos que puedan ejecutarse en el navegador, ni siquiera mediante `import type`.
- Los tipos consumidos tanto por servidor como por interfaz deben vivir en `src/lib/modules/<modulo>/types`.
- El flujo esperado es: ruta, servicio, repositorio y base de datos. Los mappers controlan los datos que cruzan entre capas.

## Estructura y nombres

- Nombrar carpetas en `kebab-case`.
- Nombrar componentes Svelte en `PascalCase`.
- Nombrar archivos TypeScript en `kebab-case`, salvo el archivo local obligatorio `props.ts`.
- Usar sufijos que expresen responsabilidad: `*.service.ts`, `*.repository.ts`, `*.mapper.ts`, `*.schema.ts`, `*.input.ts`, `*.output.ts`, `*.types.ts` y `*.test.ts`.
- Cada componente propio debe estar aislado en una carpeta con el nombre del componente en `kebab-case`.
- Esa carpeta debe contener como mínimo `props.ts` y el archivo `NombreDelComponente.svelte`.
- Definir en `props.ts` el tipo `NombreDelComponenteProps` e importarlo desde `./props` dentro del componente.

Ejemplo obligatorio:

```text
components/
└── allocation-summary/
    ├── AllocationSummary.svelte
    ├── props.ts
    └── allocation-summary.test.ts
```

```ts
// props.ts
import type { AllocationView } from '../../types/allocation-view.types';

export type AllocationSummaryProps = {
	allocation: AllocationView;
};
```

Los primitives instalados por el CLI de shadcn-svelte viven en `src/lib/components/ui` y conservan la estructura exigida por su registro para permitir actualizaciones. El código de la aplicación no debe modificarlos directamente: debe componerlos desde componentes propios que sí cumplan la estructura anterior.

## Componentes y estilos

- Priorizar componentes pequeños, enfocados y componibles.
- No colocar lógica financiera en componentes visuales.
- Usar primitives de shadcn-svelte antes de crear controles base equivalentes.
- Instalar componentes shadcn-svelte mediante su CLI y revisar el código generado antes de integrarlo.
- Usar variables semánticas del tema (`background`, `foreground`, `primary`, `muted`, etc.) en lugar de colores arbitrarios.
- Usar utilidades de Tailwind CSS; reservar CSS manual para casos que no puedan expresarse claramente con ellas.
- Mantener accesibilidad de teclado, foco visible, etiquetas de formulario, HTML semántico y contraste suficiente.
- Diseñar primero para pantallas pequeñas y ampliar progresivamente con breakpoints.

## Buenas prácticas

- Mantener TypeScript estricto. Evitar `any`, aserciones inseguras y supresiones de errores.
- Validar toda entrada externa en el límite del sistema con esquemas centralizados.
- Representar dinero con una estrategia exacta y consistente; no depender de operaciones de punto flotante sin una política explícita.
- Mantener funciones pequeñas, nombres que expresen intención y una sola fuente para cada regla financiera.
- No duplicar reglas, cálculos, esquemas ni transformaciones.
- Manejar errores de forma explícita y no exponer detalles internos a la interfaz.
- No incluir secretos, credenciales, datos financieros reales ni archivos `.env` en el repositorio.
- Ejecutar `pnpm check` y `pnpm build` antes de entregar cambios.
- Añadir pruebas unitarias a reglas de negocio y, en especial, al motor de distribución.
- Todo cambio de comportamiento debe incluir o actualizar sus pruebas cuando exista infraestructura de testing autorizada.

## Principios SOLID

- **Responsabilidad única:** cada componente, servicio, repositorio y mapper debe tener un motivo principal de cambio.
- **Abierto/cerrado:** extender reglas mediante contratos y estrategias claras sin modificar innecesariamente código estable.
- **Sustitución de Liskov:** las implementaciones de repositorios y estrategias deben respetar por completo sus contratos.
- **Segregación de interfaces:** preferir contratos pequeños y específicos para cada caso de uso.
- **Inversión de dependencias:** los casos de uso dependen de abstracciones; la infraestructura implementa esas abstracciones.

SOLID no justifica crear abstracciones prematuras. Se debe extraer una abstracción cuando protege una frontera real, permite sustituir infraestructura o elimina una variación comprobable.

## Criterio para nuevas dependencias

Antes de agregar una dependencia de terceros, documentar y obtener aprobación sobre:

1. El problema concreto que resuelve.
2. Por qué las herramientas ya autorizadas no son suficientes.
3. Su impacto en tamaño, seguridad, mantenimiento y licenciamiento.
4. Las alternativas consideradas.
5. La forma de retirarla o sustituirla si deja de mantenerse.

Sin esa autorización, la dependencia no debe añadirse al `package.json`.
