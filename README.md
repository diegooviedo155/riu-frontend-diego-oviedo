# Frontend - Diego Oviedo

Aplicación SPA desarrollada en **Angular 19** para la gestión y catálogo de superhéroes (CRUD completo).

---

## 🚀 Requisitos previos

- **Node.js**: v20 o superior
- **npm**: v10 o superior (o **Docker / Docker Compose**)

---

## 🛠️ Stack Tecnológico

- **Framework**: Angular 19.2 (Standalone Components, Signals, nueva sintaxis de control de flujo `@if`, `@for`, `@empty`).
- **Estrategia de renderizado**: `ChangeDetectionStrategy.OnPush` en todos los componentes para optimizar el ciclo de detección de cambios.
- **UI & Estilos**: Angular Material (Paginator, Dialog, Icons, Progress Bar) y SCSS modular.
- **Testing**: Vitest + JSDOM + `@vitest/coverage-v8`.
- **Mock Server**: `json-server` para la persistencia de datos REST.
- **Contenedores**: Docker (multi-stage build con Nginx) y Docker Compose.

---

## 💻 Cómo ejecutar el proyecto

### Opción 1: Con Docker (Recomendada)

Levanta en simultáneo el backend (`json-server` en el puerto 3000) y el frontend optimizado con Nginx en el puerto 4200:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:4200](http://localhost:4200)
- **API Mock**: [http://localhost:3000/heroes](http://localhost:3000/heroes)

---

### Opción 2: Ejecución local con npm

1. **Instalar dependencias**:

   ```bash
   npm install
   ```

2. **Iniciar Frontend y Mock Server en simultáneo**:
   ```bash
   npm run start:all
   ```

_(Alternativamente, se pueden ejecutar en dos terminales por separado con `npm run mock:server` y `npm start`)._

---

## 🔄 Restauración de la semilla de datos

Las operaciones de borrado y edición persisten directamente sobre el archivo `db.json`. Para restablecer los datos originales en cualquier momento, ejecutar:

```bash
npm run mock:reset
```

Este comando sobreescribe `db.json` con la copia de respaldo inmutable `db.seed.json`.

---

## 🧪 Tests Unitarios y Cobertura

La suite de tests unitarios está construida con **Vitest**:

- **Ejecutar tests**:

  ```bash
  npm run test:run
  ```

- **Ver reporte de cobertura**:
  ```bash
  npm run test:coverage
  ```

---
