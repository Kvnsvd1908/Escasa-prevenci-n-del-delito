import { PrismaClient, Role, IncidentSource, ReportStatus, ModelStatus, AlertLevel, AlertStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// V Región de Chile — centro entre Valparaíso y Viña del Mar
const CENTER_LAT = -33.035;
const CENTER_LNG = -71.58;

const CATEGORIES = [
  { code: "ROBO_VIOLENTO",      name: "Robo con violencia",     severity: 5 },
  { code: "ROBO_INTIMIDACION",  name: "Robo con intimidación",  severity: 4 },
  { code: "HURTO",              name: "Hurto",                  severity: 2 },
  { code: "ROBO_VEHICULO",      name: "Robo de vehículo",       severity: 4 },
  { code: "ROBO_VIVIENDA",      name: "Robo en vivienda",       severity: 4 },
  { code: "LESIONES",           name: "Lesiones",               severity: 3 },
  { code: "VIOLENCIA_INTRAFAM", name: "Violencia intrafamiliar", severity: 3 },
  { code: "DROGAS",             name: "Infracción ley de drogas", severity: 3 },
];

const USERS = [
  { email: "admin@predcrim.cl",     name: "Administrador",             role: Role.ADMIN,              password: "admin123" },
  { email: "datos@predcrim.cl",     name: "Carla Ruiz (Analista Datos)", role: Role.ANALISTA_DATOS,    password: "datos123" },
  { email: "seguridad@predcrim.cl", name: "Pedro Soto (Analista Seg.)",  role: Role.ANALISTA_SEGURIDAD, password: "seg123" },
  { email: "jefatura@predcrim.cl",  name: "María López (Comisaria)",     role: Role.JEFATURA,          password: "jefe123" },
  { email: "campo@predcrim.cl",     name: "Javier Pinto (Patrulla)",     role: Role.PERSONAL_CAMPO,    password: "campo123" },
  { email: "ciudadano@predcrim.cl", name: "Ciudadano Demo",              role: Role.CIUDADANO,         password: "ciudadano123" },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

// Genera un punto alrededor de un hotspot — concentración simulada
function randomPointNear(lat: number, lng: number, spreadKm: number) {
  // 1 grado lat ≈ 111 km
  const dLat = (Math.random() - 0.5) * (spreadKm / 111) * 2;
  const dLng = (Math.random() - 0.5) * (spreadKm / (111 * Math.cos((lat * Math.PI) / 180))) * 2;
  return { lat: lat + dLat, lng: lng + dLng };
}

async function main() {
  console.log("Seeding PRED-CRIM...");

  // Usuarios
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        unit: u.role === Role.PERSONAL_CAMPO ? "Cuadrante 12" : null,
      },
    });
  }
  console.log(`  ✓ ${USERS.length} usuarios`);

  // Categorías
  for (const c of CATEGORIES) {
    await prisma.crimeCategory.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  const cats = await prisma.crimeCategory.findMany();
  console.log(`  ✓ ${cats.length} categorías`);

  // Limpiar incidentes existentes para reseed determinista
  await prisma.prediction.deleteMany();
  await prisma.alertDelivery.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.predictiveModel.deleteMany();
  await prisma.configCategoryWeight.deleteMany();
  await prisma.analysisConfig.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.incidentUpload.deleteMany();
  await prisma.citizenReport.deleteMany();
  await prisma.statReport.deleteMany();

  // Hotspots simulados — barrios reales de la V Región
  const hotspots = [
    { lat: -33.0458, lng: -71.6197, weight: 1.0, zone: "Plan de Valparaíso" },
    { lat: -33.0388, lng: -71.6242, weight: 0.7, zone: "Cerro Alegre" },
    { lat: -33.0520, lng: -71.6110, weight: 0.8, zone: "Av. Pedro Montt" },
    { lat: -33.0245, lng: -71.5518, weight: 0.9, zone: "Viña del Mar Centro" },
    { lat: -33.0118, lng: -71.5640, weight: 0.6, zone: "Recreo" },
    { lat: -32.9940, lng: -71.5485, weight: 0.7, zone: "Miramar" },
    { lat: -32.9727, lng: -71.5459, weight: 0.5, zone: "Reñaca" },
    { lat: -33.0477, lng: -71.4422, weight: 0.6, zone: "Quilpué" },
  ];

  // Incidentes históricos (últimos 12 meses)
  const now = new Date();
  const incidents: Prisma.IncidentCreateManyInput[] = [];
  const TOTAL = 800;

  for (let i = 0; i < TOTAL; i++) {
    const hotspot = hotspots[randInt(0, hotspots.length - 1)];
    const spread = 0.8 + Math.random() * 1.5; // km
    const { lat, lng } = randomPointNear(hotspot.lat, hotspot.lng, spread);

    const daysAgo = Math.floor(Math.random() * 365);
    const hour = Math.random() < 0.55 ? randInt(19, 23) : randInt(8, 22); // sesgo nocturno
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, randInt(0, 59), 0, 0);

    const category = cats[randInt(0, cats.length - 1)];

    incidents.push({
      categoryId: category.id,
      occurredAt: d,
      latitude: lat,
      longitude: lng,
      zone: hotspot.zone,
      address: `${hotspot.zone} sector ${randInt(1, 20)}`,
      description: null,
      source: IncidentSource.HISTORICAL,
    });
  }
  await prisma.incident.createMany({ data: incidents });
  console.log(`  ✓ ${TOTAL} incidentes históricos`);

  // Denuncias ciudadanas de ejemplo
  const citizen = await prisma.user.findUnique({ where: { email: "ciudadano@predcrim.cl" } });
  const sampleReports = Array.from({ length: 12 }).map((_, i) => {
    const hotspot = hotspots[randInt(0, hotspots.length - 1)];
    const { lat, lng } = randomPointNear(hotspot.lat, hotspot.lng, 1.2);
    const d = new Date(now);
    d.setDate(d.getDate() - randInt(0, 30));
    return {
      reporterId: i % 3 === 0 ? citizen?.id : null,
      reporterName: i % 3 === 0 ? "Vecino del sector" : null,
      reporterContact: i % 3 === 0 ? "+56 9 1234 5678" : null,
      categoryCode: CATEGORIES[randInt(0, CATEGORIES.length - 1)].code,
      occurredAt: d,
      latitude: lat,
      longitude: lng,
      address: `${hotspot.zone} calle Ejemplo ${randInt(1, 500)}`,
      description: "Reporte de ejemplo generado por seed.",
      status: i % 4 === 0 ? ReportStatus.VALIDATED : ReportStatus.PENDING,
    };
  });
  await prisma.citizenReport.createMany({ data: sampleReports });
  console.log(`  ✓ ${sampleReports.length} denuncias ciudadanas`);

  console.log("Seed completado ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
