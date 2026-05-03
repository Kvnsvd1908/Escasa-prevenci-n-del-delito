# PRED-CRIM: Sistema de Prevención del Delito

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)
![Jira](https://img.shields.io/badge/Scrum-Jira-0052CC?logo=jira)

Este proyecto se desarrolla en el marco de la carrera de Ingeniería en Computación e Informática. El objetivo central es la construcción de una plataforma de análisis predictivo diseñada para identificar patrones delictuales geográficos y temporales, optimizando la toma de decisiones estratégicas en seguridad pública. El sistema sigue una arquitectura de software robusta basada en el modelo de vistas 4+1 y principios de programación orientada a objetos.

> **Nota sobre el stack**: la especificación original planteaba un motor en C++ con PostgreSQL/PostGIS. Durante la implementación se pivotó a un stack web moderno (Next.js + TypeScript + Prisma) por razones de tiempo de entrega y demostrabilidad. Los algoritmos predictivos se mantienen funcionalmente equivalentes: agregación espacial en grilla, decay temporal y ponderación por categoría delictual.

## Objetivos del Proyecto

- **Registro de Incidentes**: Almacenamiento de datos clave como coordenadas geográficas, tipología delictual y franjas horarias.
- **Administración de Datos**: Gestión centralizada de bases de datos históricas de criminalidad.
- **Análisis Predictivo**: Generación de pronósticos de riesgo automáticos para ventanas temporales de 24 horas.
- **Visualización Geográfica**: Identificación de puntos de alta concentración delictual (hotspots) mediante herramientas de mapeo.
- **Optimización de Recursos**: Facilitar la asignación eficiente de personal preventivo basada en datos estadísticos.

## Especificaciones Técnicas

| Componente | Tecnología |
|------------|-----------|
| Lenguaje de Programación | TypeScript 5 |
| Framework Web | Next.js 14 (App Router, React 18) |
| Base de Datos | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| Autenticación | NextAuth v5 (JWT, control por rol) |
| Visualización Geográfica | Leaflet + leaflet.heat |
| Estilos | Tailwind CSS |
| Arquitectura | Modelo de Vistas 4+1 |
| Gestión de Proyecto | Marco de trabajo Scrum coordinado en Jira |

## Funcionalidades Implementadas y Planificadas

### Gestión e Integración de Datos

- Importación de registros históricos en formatos estandarizados (CSV).
- Categorización técnica de delitos según la normativa vigente.
- Registro de denuncias ciudadanas con validación de geolocalización.

### Motor de Análisis Predictivo

- Identificación de patrones horarios de mayor incidencia delictual.
- Generación de alertas de riesgo basadas en modelos de probabilidad espacial.
- Configuración de umbrales de sensibilidad para el motor de análisis.

### Visualización y Planificación

- Generación de mapas de calor dinámicos para el mando operativo.
- Emisión de informes estadísticos para la administración municipal.
- Sugerencia automatizada para la asignación de patrullaje preventivo.

## Casos de Uso del Sistema

| Caso | Funcionalidad | Actor principal |
|------|---------------|-----------------|
| CU-01 | Cargar registros históricos | Analista de Datos |
| CU-02 | Gestionar denuncias ciudadanas | Ciudadano · Analista de Datos |
| CU-03 | Configurar parámetros de análisis | Analista de Seguridad |
| CU-04 | Ejecutar entrenamiento de modelo | Analista de Seguridad |
| CU-05 | Visualizar mapa de calor | Jefatura · Analista de Seguridad |
| CU-06 | Generar reporte estadístico | Jefatura · Analista de Seguridad |
| CU-07 | Desplegar alertas de seguridad | Personal de Campo · Jefatura |

## Puesta en Marcha

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/vMeap/pred-crim.git
cd pred-crim
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` a partir del template:

```bash
cp .env.example .env
```

Completar las credenciales de Supabase (obtenibles en *Project Settings → Database → Connection string*) y un `AUTH_SECRET` aleatorio.

### 3. Inicializar la base de datos

```bash
npm run db:push    # aplica el schema en Supabase
npm run db:seed    # carga 6 usuarios demo + 800 incidentes en V Región
```

### 4. Levantar el servidor de desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

## Cuentas Demo

Disponibles tras ejecutar el seed:

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Administrador | admin@predcrim.cl | admin123 |
| Analista de Datos | datos@predcrim.cl | datos123 |
| Analista de Seguridad | seguridad@predcrim.cl | seg123 |
| Jefatura / Decisor | jefatura@predcrim.cl | jefe123 |
| Personal de Campo | campo@predcrim.cl | campo123 |
| Ciudadano | ciudadano@predcrim.cl | ciudadano123 |

## Flujo de Demostración

1. Ingresar como **Analista de Seguridad** → `/configuracion` → crear y activar una configuración.
2. Ir a `/modelos` → ejecutar entrenamiento → publicar el modelo (se generan alertas automáticas).
3. Ingresar como **Jefatura** → `/mapa` para el heatmap, `/reportes` para los indicadores.
4. Ingresar como **Personal de Campo** → `/alertas` para confirmar recepción en terreno.

## Equipo de Trabajo

| Integrante | Rol |
|------------|-----|
| Jordán Acuña | Product Owner |
| Kevin Soto | Scrum Master |
| Diego Rubilar | Developer |

---

*Facultad de Ingeniería · Universidad Andrés Bello · Grupo 7*
