# PRED-CRIM

Sistema de análisis y prevención del delito. Web app full-stack que implementa los 7 casos de uso del documento de especificación:

| Caso | Funcionalidad | Ruta | Rol principal |
|------|---------------|------|---------------|
| CU-01 | Cargar registros históricos | `/datos` | Analista de Datos |
| CU-02 | Gestionar denuncias ciudadanas | `/denunciar` (público) + `/denuncias` (moderación) | Ciudadano · Analista de Datos |
| CU-03 | Configurar parámetros | `/configuracion` | Analista de Seguridad |
| CU-04 | Entrenar modelo predictivo | `/modelos` | Analista de Seguridad |
| CU-05 | Mapa de calor | `/mapa` | Jefatura · Analista de Seguridad |
| CU-06 | Reportes estadísticos | `/reportes` | Jefatura · Analista de Seguridad |
| CU-07 | Alertas de seguridad | `/alertas` | Personal de Campo · Jefatura |

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth v5 (JWT + credenciales) con control de acceso por rol
- Leaflet + leaflet.heat para visualización geográfica
- Zod para validación

## Puesta en marcha

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita `.env`. Tienes dos caminos:

   **A. Supabase (recomendado, gratis)**
   1. Crea un proyecto en https://supabase.com → elige región cercana y anota la contraseña.
   2. En el dashboard: **Project Settings → Database → Connection string**.
   3. Copia las dos variantes:
      - **Transaction mode** (puerto `6543`, con `pgbouncer=true`) → `DATABASE_URL`
      - **Session mode** / **Direct connection** (puerto `5432`) → `DIRECT_URL`
   4. Reemplaza `[YOUR-PASSWORD]` por la contraseña en ambas URLs.
   5. Genera `AUTH_SECRET` con `openssl rand -base64 32`.

   **B. Postgres local**
   Apunta ambas variables a la misma URL local (ver `.env.example`).

3. **Inicializar base de datos**
   ```bash
   npm run db:push    # aplica el schema
   npm run db:seed    # usuarios demo + 800 incidentes ficticios en Santiago
   ```

4. **Desarrollo**
   ```bash
   npm run dev
   ```
   → http://localhost:3000

## Cuentas demo (tras `db:seed`)

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| admin@predcrim.cl | admin123 | Administrador |
| datos@predcrim.cl | datos123 | Analista de Datos |
| seguridad@predcrim.cl | seg123 | Analista de Seguridad |
| jefatura@predcrim.cl | jefe123 | Jefatura / Decisor |
| campo@predcrim.cl | campo123 | Personal de Campo |
| ciudadano@predcrim.cl | ciudadano123 | Ciudadano |

## Flujo extremo a extremo

1. Entra como **Analista de Seguridad** → `/configuracion` → crea una configuración, marca "Activar al guardarla".
2. Entra a `/modelos` → "Ejecutar entrenamiento". El modelo queda en estado **READY**.
3. Click **Publicar** → el modelo queda **PUBLISHED** y se generan alertas automáticas para las celdas que superan el umbral.
4. Entra como **Jefatura** → `/mapa` para ver el heatmap; `/reportes` para ver indicadores.
5. Entra como **Personal de Campo** → `/alertas` ve sólo las alertas asignadas y puede confirmar recepción.

## Formato CSV para carga de datos (CU-01)

Encabezados aceptados (se normalizan): `fecha, categoria, latitud, longitud, zona, direccion, descripcion`.

Columna `categoria` debe contener uno de los códigos registrados en la base (ver `/datos`, panel derecho) o el nombre exacto. Ej: `ROBO_VIOLENTO`, `HURTO`, `ROBO_VEHICULO`, etc.

Incluye un archivo de muestra en [sample-data/incidentes-demo.csv](sample-data/incidentes-demo.csv).

## Arquitectura

```
app/
  (auth)/        login y registro
  (dashboard)/   panel protegido por middleware
  denunciar/     formulario público de denuncia ciudadana
  api/           endpoints JSON
components/      UI + dashboard nav + heatmap
lib/             db, auth-utils, csv-parser, predictor (motor de análisis)
prisma/          schema + seed
```

El motor predictivo (`lib/predictor.ts`) aplica agregación espacial en grilla con decay temporal y pesos por categoría — equivalente funcional al motor C++ mencionado en el documento de casos de uso.

## Próximos pasos

- Generación de PDF para reportes ejecutivos (CU-06)
- WebSockets / Server-Sent Events para alertas push en vivo (CU-07)
- Integración con PostGIS para consultas espaciales avanzadas
- Comparativa de efectividad entre modelos publicados (HU 3.2)

---

Grupo 7 · Facultad de Ingeniería UNAB
