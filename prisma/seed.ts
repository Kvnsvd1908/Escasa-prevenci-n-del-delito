import { PrismaClient, Role, IncidentSource, ReportStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { code: "ROBO_VIOLENTO", name: "Robo con violencia", severity: 5 },
  { code: "ROBO_INTIMIDACION", name: "Robo con intimidacion", severity: 4 },
  { code: "HURTO", name: "Hurto", severity: 2 },
  { code: "ROBO_VEHICULO", name: "Robo de vehiculo", severity: 4 },
  { code: "ROBO_VIVIENDA", name: "Robo en vivienda", severity: 4 },
  { code: "LESIONES", name: "Lesiones", severity: 3 },
  { code: "VIOLENCIA_INTRAFAM", name: "Violencia intrafamiliar", severity: 3 },
  { code: "DROGAS", name: "Infraccion ley de drogas", severity: 3 },
];

const USERS = [
  { email: "admin@predcrim.cl", name: "Administrador", role: Role.ADMIN, password: "admin123" },
  { email: "datos@predcrim.cl", name: "Carla Ruiz (Analista Datos)", role: Role.ANALISTA_DATOS, password: "datos123" },
  { email: "seguridad@predcrim.cl", name: "Pedro Soto (Analista Seg.)", role: Role.ANALISTA_SEGURIDAD, password: "seg123" },
  { email: "jefatura@predcrim.cl", name: "Maria Lopez (Comisaria)", role: Role.JEFATURA, password: "jefe123" },
  { email: "campo@predcrim.cl", name: "Javier Pinto (Patrulla)", role: Role.PERSONAL_CAMPO, password: "campo123" },
  { email: "ciudadano@predcrim.cl", name: "Ciudadano Demo", role: Role.CIUDADANO, password: "ciudadano123" },
];

type CategoryCode = (typeof CATEGORIES)[number]["code"];

type SeedPoint = {
  zone: string;
  commune: string;
  lat: number;
  lng: number;
  address: string;
  spreadKm: number;
  weight: number;
  categories: Partial<Record<CategoryCode, number>>;
};

const SEED_POINTS: SeedPoint[] = [
  {
    zone: "Valparaiso - Plan",
    commune: "Valparaiso",
    lat: -33.0472,
    lng: -71.6127,
    address: "Plaza Victoria, Valparaiso",
    spreadKm: 0.16,
    weight: 1.25,
    categories: { HURTO: 4, ROBO_INTIMIDACION: 3, ROBO_VIOLENTO: 2, LESIONES: 2, DROGAS: 1 },
  },
  {
    zone: "Valparaiso - Cerro Alegre",
    commune: "Valparaiso",
    lat: -33.0419,
    lng: -71.6263,
    address: "Cerro Alegre, Valparaiso",
    spreadKm: 0.12,
    weight: 0.8,
    categories: { HURTO: 4, ROBO_INTIMIDACION: 2, LESIONES: 1 },
  },
  {
    zone: "Valparaiso - Cerro Baron",
    commune: "Valparaiso",
    lat: -33.0512,
    lng: -71.5887,
    address: "Avenida Argentina, Cerro Baron",
    spreadKm: 0.14,
    weight: 0.9,
    categories: { ROBO_VEHICULO: 3, ROBO_INTIMIDACION: 2, HURTO: 2, LESIONES: 1 },
  },
  {
    zone: "Valparaiso - Playa Ancha",
    commune: "Valparaiso",
    lat: -33.034,
    lng: -71.6355,
    address: "Avenida Playa Ancha, Valparaiso",
    spreadKm: 0.14,
    weight: 0.75,
    categories: { ROBO_VIVIENDA: 3, ROBO_VEHICULO: 2, VIOLENCIA_INTRAFAM: 2, HURTO: 1 },
  },
  {
    zone: "Vina del Mar - Centro",
    commune: "Vina del Mar",
    lat: -33.0245,
    lng: -71.5518,
    address: "Plaza Vergara, Vina del Mar",
    spreadKm: 0.16,
    weight: 1.2,
    categories: { HURTO: 4, ROBO_VEHICULO: 3, ROBO_INTIMIDACION: 2, LESIONES: 1 },
  },
  {
    zone: "Vina del Mar - Recreo",
    commune: "Vina del Mar",
    lat: -33.0298,
    lng: -71.5765,
    address: "Calle Once, Recreo",
    spreadKm: 0.1,
    weight: 0.7,
    categories: { ROBO_VIVIENDA: 3, ROBO_VEHICULO: 2, HURTO: 2 },
  },
  {
    zone: "Vina del Mar - Miraflores",
    commune: "Vina del Mar",
    lat: -33.0109,
    lng: -71.5312,
    address: "Avenida Frei, Miraflores",
    spreadKm: 0.15,
    weight: 0.75,
    categories: { ROBO_VIVIENDA: 3, VIOLENCIA_INTRAFAM: 2, ROBO_VEHICULO: 2, HURTO: 1 },
  },
  {
    zone: "Vina del Mar - Gomez Carreno",
    commune: "Vina del Mar",
    lat: -32.999,
    lng: -71.5268,
    address: "Gomez Carreno, Vina del Mar",
    spreadKm: 0.15,
    weight: 0.65,
    categories: { ROBO_VIVIENDA: 3, VIOLENCIA_INTRAFAM: 2, HURTO: 2, LESIONES: 1 },
  },
  {
    zone: "Concon - Centro",
    commune: "Concon",
    lat: -32.9237,
    lng: -71.5176,
    address: "Avenida Concon Renaca, Concon",
    spreadKm: 0.14,
    weight: 0.7,
    categories: { ROBO_VEHICULO: 3, HURTO: 3, ROBO_VIVIENDA: 2, ROBO_INTIMIDACION: 1 },
  },
  {
    zone: "Concon - Los Pinos",
    commune: "Concon",
    lat: -32.9365,
    lng: -71.5277,
    address: "Los Pinos, Concon",
    spreadKm: 0.1,
    weight: 0.55,
    categories: { ROBO_VIVIENDA: 3, ROBO_VEHICULO: 2, HURTO: 1 },
  },
  {
    zone: "Quilpue - Centro",
    commune: "Quilpue",
    lat: -33.0472,
    lng: -71.4422,
    address: "Plaza Eugenio Rengifo, Quilpue",
    spreadKm: 0.16,
    weight: 0.9,
    categories: { HURTO: 4, ROBO_VEHICULO: 3, ROBO_INTIMIDACION: 2, LESIONES: 1 },
  },
  {
    zone: "Quilpue - El Belloto",
    commune: "Quilpue",
    lat: -33.0478,
    lng: -71.4162,
    address: "El Belloto, Quilpue",
    spreadKm: 0.16,
    weight: 0.85,
    categories: { ROBO_VEHICULO: 3, HURTO: 3, ROBO_VIVIENDA: 2, DROGAS: 1 },
  },
  {
    zone: "Villa Alemana - Centro",
    commune: "Villa Alemana",
    lat: -33.0444,
    lng: -71.3733,
    address: "Plaza Belen, Villa Alemana",
    spreadKm: 0.16,
    weight: 0.85,
    categories: { HURTO: 4, ROBO_VEHICULO: 3, ROBO_INTIMIDACION: 2, LESIONES: 1 },
  },
  {
    zone: "Villa Alemana - Penablanca",
    commune: "Villa Alemana",
    lat: -33.0363,
    lng: -71.3495,
    address: "Penablanca, Villa Alemana",
    spreadKm: 0.15,
    weight: 0.65,
    categories: { ROBO_VIVIENDA: 3, VIOLENCIA_INTRAFAM: 2, ROBO_VEHICULO: 2, HURTO: 1 },
  },
  {
    zone: "Limache - Centro",
    commune: "Limache",
    lat: -33.0034,
    lng: -71.2659,
    address: "Avenida Urmeneta, Limache",
    spreadKm: 0.18,
    weight: 0.55,
    categories: { HURTO: 3, ROBO_VEHICULO: 2, ROBO_VIVIENDA: 2, LESIONES: 1 },
  },
  {
    zone: "Quillota - Centro",
    commune: "Quillota",
    lat: -32.8817,
    lng: -71.2487,
    address: "Plaza de Armas, Quillota",
    spreadKm: 0.18,
    weight: 0.7,
    categories: { HURTO: 4, ROBO_VEHICULO: 3, ROBO_INTIMIDACION: 2, DROGAS: 1 },
  },
  {
    zone: "La Calera - Centro",
    commune: "La Calera",
    lat: -32.7865,
    lng: -71.203,
    address: "Centro de La Calera",
    spreadKm: 0.16,
    weight: 0.5,
    categories: { HURTO: 3, ROBO_VEHICULO: 3, ROBO_VIVIENDA: 2, LESIONES: 1 },
  },
  {
    zone: "Casablanca - Centro",
    commune: "Casablanca",
    lat: -33.3166,
    lng: -71.407,
    address: "Plaza de Armas, Casablanca",
    spreadKm: 0.18,
    weight: 0.45,
    categories: { ROBO_VEHICULO: 3, HURTO: 3, ROBO_VIVIENDA: 2 },
  },
  {
    zone: "San Antonio - Centro",
    commune: "San Antonio",
    lat: -33.5947,
    lng: -71.6072,
    address: "Centro de San Antonio",
    spreadKm: 0.16,
    weight: 0.7,
    categories: { HURTO: 4, ROBO_VEHICULO: 3, ROBO_INTIMIDACION: 2, LESIONES: 1, DROGAS: 1 },
  },
  {
    zone: "Cartagena - Centro",
    commune: "Cartagena",
    lat: -33.5486,
    lng: -71.6049,
    address: "Centro de Cartagena",
    spreadKm: 0.14,
    weight: 0.45,
    categories: { HURTO: 3, ROBO_VIVIENDA: 2, ROBO_VEHICULO: 2, LESIONES: 1 },
  },
];

let rngState = 20260520;

function random() {
  rngState = (rngState * 1664525 + 1013904223) >>> 0;
  return rngState / 4294967296;
}

function rand(min: number, max: number) {
  return random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function pickWeighted<T extends { weight: number }>(items: T[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rand(0, total);
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
}

function pickCategory(point: SeedPoint) {
  const entries = Object.entries(point.categories) as [CategoryCode, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = rand(0, total);
  for (const [code, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return code;
  }
  return entries[0][0];
}

function randomPointNear(point: SeedPoint) {
  const distanceKm = Math.sqrt(random()) * point.spreadKm;
  const angle = random() * Math.PI * 2;
  const dLat = (Math.cos(angle) * distanceKm) / 111;
  const dLng = (Math.sin(angle) * distanceKm) / (111 * Math.cos((point.lat * Math.PI) / 180));
  return { lat: point.lat + dLat, lng: point.lng + dLng };
}

function incidentDescription(code: CategoryCode, zone: string) {
  const byCode: Record<CategoryCode, string[]> = {
    ROBO_VIOLENTO: [
      `Asalto con violencia reportado en sector ${zone}.`,
      `Victima interceptada en via publica en ${zone}.`,
    ],
    ROBO_INTIMIDACION: [
      `Robo con intimidacion en desplazamiento peatonal por ${zone}.`,
      `Amenaza a transeunte durante la noche en ${zone}.`,
    ],
    HURTO: [
      `Hurto de especies personales en comercio o via publica de ${zone}.`,
      `Sustraccion sin violencia en zona de alta circulacion de ${zone}.`,
    ],
    ROBO_VEHICULO: [
      `Robo o intento de robo de vehiculo estacionado en ${zone}.`,
      `Sustraccion de accesorios de vehiculo en ${zone}.`,
    ],
    ROBO_VIVIENDA: [
      `Ingreso no autorizado a vivienda en sector residencial de ${zone}.`,
      `Robo en domicilio reportado por residentes de ${zone}.`,
    ],
    LESIONES: [
      `Agresion o rina en via publica en ${zone}.`,
      `Lesiones reportadas tras conflicto en ${zone}.`,
    ],
    VIOLENCIA_INTRAFAM: [
      `Procedimiento por violencia intrafamiliar en sector ${zone}.`,
      `Reporte reservado asociado a convivencia familiar en ${zone}.`,
    ],
    DROGAS: [
      `Actividad asociada a infraccion de drogas en punto recurrente de ${zone}.`,
      `Denuncia por microtrafico o consumo problematico en ${zone}.`,
    ],
  };
  const options = byCode[code];
  return options[randInt(0, options.length - 1)];
}

function incidentHour(code: CategoryCode) {
  if (code === "ROBO_VEHICULO" || code === "ROBO_VIVIENDA") {
    return random() < 0.7 ? randInt(20, 23) : randInt(0, 5);
  }
  if (code === "HURTO") {
    return random() < 0.65 ? randInt(10, 19) : randInt(20, 22);
  }
  if (code === "DROGAS" || code === "LESIONES") {
    return random() < 0.7 ? randInt(19, 23) : randInt(0, 3);
  }
  return random() < 0.6 ? randInt(18, 23) : randInt(8, 17);
}

async function main() {
  console.log("Seeding PRED-CRIM...");

  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        passwordHash,
        unit: u.role === Role.PERSONAL_CAMPO ? "Cuadrante V Region" : null,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        unit: u.role === Role.PERSONAL_CAMPO ? "Cuadrante V Region" : null,
      },
    });
  }
  console.log(`  OK ${USERS.length} usuarios`);

  for (const c of CATEGORIES) {
    await prisma.crimeCategory.upsert({
      where: { code: c.code },
      update: { name: c.name, severity: c.severity },
      create: c,
    });
  }
  const cats = await prisma.crimeCategory.findMany();
  const catByCode = new Map(cats.map((cat) => [cat.code, cat]));
  console.log(`  OK ${cats.length} categorias`);

  await prisma.$transaction([
    prisma.prediction.deleteMany(),
    prisma.alertDelivery.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.predictiveModel.deleteMany(),
    prisma.configCategoryWeight.deleteMany(),
    prisma.analysisConfig.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.incidentUpload.deleteMany(),
    prisma.citizenReport.deleteMany(),
    prisma.statReport.deleteMany(),
  ]);

  const now = new Date();
  const incidents: Prisma.IncidentCreateManyInput[] = [];
  const TOTAL = 900;

  for (let i = 0; i < TOTAL; i++) {
    const point = pickWeighted(SEED_POINTS);
    const categoryCode = pickCategory(point);
    const category = catByCode.get(categoryCode);
    if (!category) continue;

    const { lat, lng } = randomPointNear(point);
    const d = new Date(now);
    d.setDate(d.getDate() - randInt(0, 365));
    d.setHours(incidentHour(categoryCode), randInt(0, 59), 0, 0);

    incidents.push({
      categoryId: category.id,
      occurredAt: d,
      latitude: lat,
      longitude: lng,
      zone: point.zone,
      address: point.address,
      description: incidentDescription(categoryCode, point.zone),
      source: IncidentSource.HISTORICAL,
    });
  }
  await prisma.incident.createMany({ data: incidents });
  console.log(`  OK ${incidents.length} incidentes historicos terrestres`);

  const citizen = await prisma.user.findUnique({ where: { email: "ciudadano@predcrim.cl" } });
  const reportPoints = [
    SEED_POINTS.find((p) => p.zone === "Valparaiso - Plan"),
    SEED_POINTS.find((p) => p.zone === "Vina del Mar - Centro"),
    SEED_POINTS.find((p) => p.zone === "Concon - Centro"),
    SEED_POINTS.find((p) => p.zone === "Quilpue - Centro"),
    SEED_POINTS.find((p) => p.zone === "Villa Alemana - Centro"),
    SEED_POINTS.find((p) => p.zone === "San Antonio - Centro"),
  ].filter(Boolean) as SeedPoint[];

  const sampleReports = Array.from({ length: 10 }).map((_, i) => {
    const point = reportPoints[i % reportPoints.length];
    const categoryCode = pickCategory(point);
    const { lat, lng } = randomPointNear(point);
    const d = new Date(now);
    d.setDate(d.getDate() - randInt(0, 21));
    d.setHours(incidentHour(categoryCode), randInt(0, 59), 0, 0);
    return {
      reporterId: i % 3 === 0 ? citizen?.id : null,
      reporterName: i % 3 === 0 ? "Vecino del sector" : null,
      reporterContact: i % 3 === 0 ? "+56 9 1234 5678" : null,
      categoryCode,
      occurredAt: d,
      latitude: lat,
      longitude: lng,
      address: point.address,
      description: incidentDescription(categoryCode, point.zone),
      status: i % 5 === 0 ? ReportStatus.VALIDATED : ReportStatus.PENDING,
    };
  });
  await prisma.citizenReport.createMany({ data: sampleReports });
  console.log(`  OK ${sampleReports.length} denuncias ciudadanas`);

  console.log("Seed completado OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
