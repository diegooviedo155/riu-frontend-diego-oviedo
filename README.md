# Gestión de Héroes | RIU - Diego Oviedo

Aplicación SPA desarrollada en **Angular 19** para la gestión y catálogo de superhéroes (CRUD completo, paginación, búsqueda reactiva normalizada y validación avanzada).

---

## 🚀 Requisitos previos

- **Node.js**: v20 o superior
- **npm**: v10 o superior (o **Docker / Docker Compose**)

---

## 🛠️ Stack Tecnológico & Arquitectura

- **Framework**: Angular 19.2 (Standalone Components, Signals, nueva sintaxis de control de flujo `@if`, `@for`, `@empty`).
- **Estado Reactivo (Facade Pattern)**: `HeroFacadeService` centraliza el estado mediante Signals reactivos (`_heroes`, `_searchTerm`, `_pageIndex`, `_pageSize`) y propiedades computadas (`filteredHeroes`, `paginatedHeroes`).
- **Persistencia en Cliente**: `HeroApiService` gestiona los datos en memoria a partir de una semilla inicial (`HEROES_INITIAL_DATA`) con sincronización en `localStorage` (`riu_heroes_data`).
- **Manejo Asíncrono y Feedback Visual**: Simulación de latencia configurable (`delay(150ms)`) integrada con `LoadingService`, spinner global y control de errores vía RxJS.
- **Detección de Cambios**: `ChangeDetectionStrategy.OnPush` en todos los componentes para optimizar el ciclo de renderizado.
- **UI y Estilos**: Angular Material (Paginator, Dialog, Icons, Progress Bar) con personalización mediante variables CSS (`--mdc-*`, `--mat-*`) y SCSS modular.
- **Directivas**: `UppercaseDirective` para la transformación automática a mayúsculas con preservación del rango de selección (`setSelectionRange`).
- **Validaciones**: Formularios reactivos con validaciones estándar y personalizadas (`uniqueHeroNameValidator`), incluyendo soporte para normalización de texto y diacríticos.
- **Testing**: Vitest + JSDOM + `@vitest/coverage-v8` con cobertura de flujos principales, alternativos y casos borde.
- **Contenerización**: Docker multi-stage build con Nginx para servir la aplicación de forma autónoma.

---

## 💻 Cómo ejecutar el proyecto

### Opción 1: Ejecución local con npm

1. **Instalar dependencias**:

   ```bash
   npm install
   ```

2. **Iniciar la aplicación**:

   ```bash
   npm start
   ```

   La aplicación estará disponible en [http://localhost:4200](http://localhost:4200).

---

### Opción 2: Con Docker (Contenedor Frontend Autónomo)

Construye y levanta el contenedor con Nginx optimizado para producción en el puerto 4200:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:4200](http://localhost:4200)

---

## 🧪 Ejecución de Tests

Para ejecutar la suite completa de pruebas unitarias con Vitest:

```bash
npm run test:run
```

Para ejecutar en modo interactivo con watch:

```bash
npm run test
```

Para generar el reporte de cobertura:

```bash
npm run test:coverage
```

---

## 🏗️ Construcción para Producción

Para compilar los artefactos de producción:

```bash
npm run build
```

Los archivos resultantes se generarán en el directorio `dist/riu-frontend-diego-oviedo`.
