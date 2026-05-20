# Cambios recientes

Resumen de mejoras incorporadas al proyecto PRED-CRIM durante la ultima iteracion de desarrollo.

## Notificaciones de denuncias ciudadanas

- Se agrego una campana de notificaciones para usuarios `ADMIN` y `ANALISTA_DATOS`.
- La campana muestra el numero de denuncias pendientes en tiempo real.
- Se agrego un panel lateral de notificaciones para revisar las ultimas denuncias sin tapar el mapa de calor.
- El contador se actualiza automaticamente cada 30 segundos.
- El contador tambien se actualiza al validar o rechazar una denuncia, sin necesidad de refrescar manualmente.
- El polling se pausa cuando la pestana no esta visible para reducir carga innecesaria.
- Se agrego el endpoint `GET /api/notifications/reports` para consultar denuncias pendientes.

## Mejoras en la cola de revision de denuncias

- Las filas de la tabla de denuncias ahora son expandibles.
- Al hacer clic en una denuncia se muestra la descripcion completa, denunciante, contacto, ubicacion, coordenadas, fechas y nota de revision.
- Se agrego una mini vista de mapa en el detalle de cada denuncia.
- Los botones de validar y rechazar siguen funcionando sin abrir o cerrar accidentalmente el detalle.

## Direcciones y geocodificacion

- Se agrego geocodificacion inversa usando Nominatim/OpenStreetMap.
- Al crear una denuncia, cuando el ciudadano marca un punto en el mapa, el sistema intenta completar automaticamente la direccion.
- Si el ciudadano no ingresa direccion manualmente, el backend intenta resolverla antes de guardar la denuncia.
- Se agrego el endpoint publico `GET /api/geocode/reverse`.
- En la cola de revision se prioriza mostrar direccion o sector antes que coordenadas crudas.

## Mapa de calor

- El mapa de calor ahora ajusta automaticamente el encuadre a los puntos visibles.
- Esto permite visualizar datos distribuidos en varias comunas de la V Region.
- Se corrigio el problema visual donde el panel de notificaciones quedaba por debajo de capas de Leaflet.
- Se ajusto el `z-index` del layout para que las notificaciones se vean sobre el mapa.

## Fluidez y rendimiento

- Se redujo la cantidad de datos traidos desde Prisma usando `select` en varias pantallas.
- Se cambiaron varias consultas relacionadas a transacciones Prisma para mejorar el comportamiento con Supabase.
- Se agrego una pantalla `loading.tsx` tipo skeleton para transiciones del dashboard.
- Se optimizaron vistas como dashboard, datos, configuracion, modelos, denuncias, mapa, alertas y reportes.

## Datos demo y seed regional

- Se rehizo `prisma/seed.ts` para generar datos mas coherentes.
- El seed ahora crea 900 incidentes historicos terrestres en distintas comunas de la V Region.
- Los puntos se generan cerca de ubicaciones reales o plausibles, con variacion pequena para evitar incidentes en el mar.
- Se agregaron comunas y sectores como Valparaiso, Vina del Mar, Concon, Quilpue, Villa Alemana, Limache, Quillota, La Calera, Casablanca, San Antonio y Cartagena.
- Las categorias delictuales ahora tienen ponderacion por zona, para que los casos se sientan mas logicos.
- Se actualizo `sample-data/incidentes-demo.csv` con datos de la V Region en vez de datos de Santiago.

## Reinicio de datos demo

Para partir desde cero con el seed nuevo:

```bash
npm run db:seed
```

Este comando limpia datos operativos como incidentes, denuncias, configuraciones, modelos, predicciones y alertas, y vuelve a cargar datos demo coherentes.

## Configuracion recomendada de analisis

Configuracion sugerida para la demo regional:

| Campo | Valor recomendado |
|-------|-------------------|
| Nombre | Config V Region - 12 meses |
| Rango | Ultimos 12 meses |
| Filtro de zona | Vacio |
| Grilla | 0.01 |
| Umbral de riesgo | 0.70 |
| Decay temporal | 0.08 |

Pesos sugeridos:

| Categoria | Peso |
|-----------|------|
| Robo con violencia | 1.6 |
| Robo con intimidacion | 1.5 |
| Hurto | 0.8 |
| Robo de vehiculo | 1.3 |
| Robo en vivienda | 1.2 |
| Lesiones | 1.1 |
| Violencia intrafamiliar | 0.9 |
| Infraccion ley de drogas | 1.0 |

## Verificaciones realizadas

Se ejecutaron las validaciones principales del proyecto:

```bash
npm run type-check
npm run lint
```

Ambas verificaciones quedaron sin errores.
