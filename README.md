# Escasa Prevencion del Delito - PRED-CRIM

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)
![Mapbox](https://img.shields.io/badge/Mapbox-GL_JS-000000?logo=mapbox)
![Scrum](https://img.shields.io/badge/Metodologia-Scrum-0052CC?logo=jira)

PRED-CRIM es una aplicacion web full-stack orientada a la prevencion del delito mediante analisis de datos historicos, denuncias ciudadanas, prediccion espacial de riesgo, mapas de calor, reportes estadisticos y alertas operativas para personal en terreno.

El proyecto se desarrolla en el marco de la carrera de Ingenieria en Computacion e Informatica, bajo una metodologia Scrum apoyada y controlada con GitHub.

## Objetivo del Proyecto

Construir una plataforma que permita transformar una gestion reactiva de seguridad publica en una gestion preventiva basada en datos. Para ello, el sistema permite registrar incidentes, procesar informacion historica, configurar parametros de analisis, entrenar modelos predictivos y visualizar zonas de riesgo en la V Region de Chile, especialmente Valparaiso, Vina del Mar y comunas cercanas.

## Funcionalidades Principales

- Carga de incidentes historicos mediante archivos CSV.
- Registro de denuncias ciudadanas con selector geografico en mapa.
- Categorizacion tecnica de delitos.
- Configuracion de pesos, umbrales y parametros del motor predictivo.
- Entrenamiento y publicacion de modelos de riesgo.
- Visualizacion de hotspots mediante mapas de calor con Mapbox.
- Reportes estadisticos para apoyo a la toma de decisiones.
- Generacion y confirmacion de alertas para personal de campo.
- Control de acceso por roles.

## Stack Tecnico

| Componente | Tecnologia |
|------------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Backend | Next.js API Routes |
| Base de datos | PostgreSQL en Supabase |
| ORM | Prisma |
| Autenticacion | NextAuth v5 |
| Mapas | Mapbox GL JS |
| Estilos | Tailwind CSS |
| Graficos | Recharts |
| Validacion | Zod |
| Gestion del proyecto | Scrum |
| Versionamiento | Git + GitHub |

> La especificacion inicial planteaba un motor predictivo en C++ y uso de PostGIS. Para esta implementacion se realizo un pivot tecnico a un stack web moderno con Next.js, TypeScript y Prisma, manteniendo la logica funcional del analisis predictivo: agregacion espacial, ponderacion por categoria, decay temporal y generacion de alertas segun umbral de riesgo.

## Casos de Uso Cubiertos

| CU | Caso de uso | Actor principal | Estado |
|----|-------------|-----------------|--------|
| CU-01 | Cargar registros historicos | Analista de Datos | Implementado |
| CU-02 | Gestionar denuncias ciudadanas | Ciudadano / Analista de Datos | Implementado |
| CU-03 | Configurar parametros de analisis | Analista de Seguridad | Implementado |
| CU-04 | Ejecutar entrenamiento de modelo | Analista de Seguridad | Implementado |
| CU-05 | Visualizar mapa de calor | Jefatura / Analista de Seguridad | Implementado |
| CU-06 | Generar reporte estadistico | Jefatura / Analista de Seguridad | Implementado |
| CU-07 | Desplegar alertas de seguridad | Personal de Campo / Jefatura | Implementado |

## Historias de Usuario por Sprint

| Sprint | Objetivo | Historias / Casos cubiertos |
|--------|----------|-----------------------------|
| Sprint 1 | Gestion e integracion de datos | HU 1.1, HU 1.2, HU 1.3 / CU-01, CU-02 |
| Sprint 2 | Motor predictivo y configuracion | HU 2.1, HU 2.2, HU 2.3 / CU-03, CU-04 |
| Sprint 3 | Visualizacion, reportes y alertas | HU 3.1, HU 3.2, HU 3.3, HU 4.1, HU 4.2 / CU-05, CU-06, CU-07 |

## Estructura del Proyecto

```txt
pred-crim/
├─ app/                 # Rutas, paginas y API routes de Next.js
├─ components/          # Componentes reutilizables de UI y mapas
├─ lib/                 # Utilidades, Prisma, parser CSV y motor predictivo
├─ prisma/              # Schema y seed de base de datos
├─ sample-data/         # CSV demo para carga de incidentes
├─ types/               # Tipos auxiliares
├─ README.md
└─ package.json
```

## Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/Kvnsvd1908/Escasa-prevenci-n-del-delito.git
cd Escasa-prevenci-n-del-delito
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` usando `.env.example` como base:

```bash
cp .env.example .env
```

Variables principales:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_MAPBOX_TOKEN="pk..."
NEXT_PUBLIC_MAP_CENTER_LAT="-33.0350"
NEXT_PUBLIC_MAP_CENTER_LNG="-71.5800"
NEXT_PUBLIC_MAP_ZOOM="13"
```

Notas:

- `DATABASE_URL` y `DIRECT_URL` corresponden a Supabase/PostgreSQL.
- `NEXT_PUBLIC_MAPBOX_TOKEN` se obtiene desde Mapbox Access Tokens.
- No subir el archivo `.env` al repositorio.

### 4. Inicializar la base de datos

```bash
npm run db:push
npm run db:seed
```

El seed crea usuarios demo, categorias delictuales, denuncias e incidentes historicos de prueba centrados en la V Region.

### 5. Levantar la aplicacion

```bash
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

## Cuentas Demo

| Rol | Correo | Contrasena |
|-----|--------|------------|
| Administrador | admin@predcrim.cl | admin123 |
| Analista de Datos | datos@predcrim.cl | datos123 |
| Analista de Seguridad | seguridad@predcrim.cl | seg123 |
| Jefatura / Decisor | jefatura@predcrim.cl | jefe123 |
| Personal de Campo | campo@predcrim.cl | campo123 |
| Ciudadano | ciudadano@predcrim.cl | ciudadano123 |

La cuenta `admin@predcrim.cl` permite revisar todos los modulos sin cambiar de usuario durante la demostracion.

## Flujo de Demostracion

1. Ingresar como `admin@predcrim.cl`.
2. Revisar `/datos` para la carga de incidentes historicos.
3. Ir a `/denunciar` y registrar una denuncia con ubicacion en el mapa.
4. Entrar a `/configuracion`, crear y activar una configuracion de analisis.
5. Entrar a `/modelos`, ejecutar entrenamiento y publicar el modelo.
6. Revisar `/mapa` para visualizar el heatmap de riesgo.
7. Revisar `/reportes` para indicadores estadisticos.
8. Revisar `/alertas` para confirmar alertas de seguridad.

## Pruebas y Validaciones

Validaciones realizadas:

- Type-check del proyecto con TypeScript.
- Verificacion de rutas principales (`/login`, `/denunciar`, `/mapa`).
- Validacion de carga de datos mediante CSV.
- Validacion manual del flujo de denuncia, entrenamiento, publicacion de modelo y visualizacion de mapa.

Pruebas unitarias planificadas:

- Parser CSV de incidentes historicos.
- Calculo de riesgo por celda geografica.
- Decay temporal aplicado a incidentes antiguos.
- Reglas de generacion de alertas segun umbral.
- Validaciones de formularios y permisos por rol.

## Equipo de Trabajo

| Integrante | Rol |
|------------|-----|
| Jordan Acuna | Product Owner |
| Kevin Soto | Scrum Master |
| Diego Rubilar | Developer |

## Repositorio

Repositorio principal de entrega:

```txt
https://github.com/Kvnsvd1908/Escasa-prevenci-n-del-delito
```

---

Facultad de Ingenieria - Universidad Andres Bello - Grupo 7
