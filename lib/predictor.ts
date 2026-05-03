import type { Incident, CrimeCategory, AnalysisConfig, ConfigCategoryWeight } from "@prisma/client";

// Motor predictivo simplificado basado en densidad espacio-temporal con decay.
// Emula lo que haría el "motor en C++" del spec: agrega incidentes históricos
// en una grilla, aplica pesos por categoría y penaliza por antigüedad.

export interface GridPrediction {
  lat: number;
  lng: number;
  gridSize: number;
  riskScore: number;          // normalizado 0..1
  hourOfDay: number | null;
  dominantCategory: string | null;
}

export interface TrainInput {
  incidents: (Incident & { category: CrimeCategory })[];
  config: AnalysisConfig & { weights: (ConfigCategoryWeight & { category: CrimeCategory })[] };
}

export interface TrainOutput {
  predictions: GridPrediction[];
  metrics: {
    totalIncidents: number;
    cellsWithRisk: number;
    topRiskScore: number;
    avgRiskScore: number;
    hotspots: { lat: number; lng: number; score: number }[];
  };
  accuracy: number;           // score sintético 0..1
}

function snap(value: number, grid: number) {
  return Math.round(value / grid) * grid;
}

export function trainModel({ incidents, config }: TrainInput): TrainOutput {
  const grid = config.gridSize;
  const weightByCat = new Map<string, number>();
  config.weights.forEach((w) => weightByCat.set(w.categoryId, w.weight));

  const now = new Date();
  // decay temporal: peso = exp(-k * días)
  const k = config.timeDecayFactor;

  type Cell = {
    lat: number;
    lng: number;
    perHour: Map<number, number>;
    perCategory: Map<string, number>;
    total: number;
  };

  const cells = new Map<string, Cell>();

  for (const inc of incidents) {
    const lat = snap(inc.latitude, grid);
    const lng = snap(inc.longitude, grid);
    const key = `${lat.toFixed(4)}:${lng.toFixed(4)}`;

    const w = weightByCat.get(inc.categoryId) ?? 1.0;
    const sev = inc.category.severity;
    const daysOld = Math.max(0, (now.getTime() - inc.occurredAt.getTime()) / (1000 * 60 * 60 * 24));
    const recencyFactor = Math.exp(-k * (daysOld / 30)); // por mes

    const contribution = w * sev * recencyFactor;
    const hour = inc.occurredAt.getHours();

    let cell = cells.get(key);
    if (!cell) {
      cell = { lat, lng, perHour: new Map(), perCategory: new Map(), total: 0 };
      cells.set(key, cell);
    }
    cell.total += contribution;
    cell.perHour.set(hour, (cell.perHour.get(hour) ?? 0) + contribution);
    cell.perCategory.set(inc.categoryId, (cell.perCategory.get(inc.categoryId) ?? 0) + contribution);
  }

  // Normalizar a 0..1
  let maxTotal = 0;
  cells.forEach((c) => {
    if (c.total > maxTotal) maxTotal = c.total;
  });
  if (maxTotal === 0) maxTotal = 1;

  const catIdToCode = new Map<string, string>();
  incidents.forEach((i) => catIdToCode.set(i.categoryId, i.category.code));

  const predictions: GridPrediction[] = [];

  cells.forEach((cell) => {
    // predicción global (sin hora)
    const risk = cell.total / maxTotal;
    if (risk <= 0) return;

    let bestCat: string | null = null;
    let bestCatVal = 0;
    cell.perCategory.forEach((val, catId) => {
      if (val > bestCatVal) {
        bestCatVal = val;
        bestCat = catIdToCode.get(catId) ?? null;
      }
    });

    predictions.push({
      lat: cell.lat,
      lng: cell.lng,
      gridSize: grid,
      riskScore: Math.min(1, risk),
      hourOfDay: null,
      dominantCategory: bestCat,
    });

    // por franja horaria (agrupar por bloques de 3 horas para no inflar)
    const hourBlocks = new Map<number, number>(); // bloque (0,3,6,...21) → suma
    cell.perHour.forEach((v, h) => {
      const block = Math.floor(h / 3) * 3;
      hourBlocks.set(block, (hourBlocks.get(block) ?? 0) + v);
    });

    hourBlocks.forEach((val, block) => {
      const score = val / maxTotal;
      if (score <= 0) return;
      predictions.push({
        lat: cell.lat,
        lng: cell.lng,
        gridSize: grid,
        riskScore: Math.min(1, score),
        hourOfDay: block,
        dominantCategory: bestCat,
      });
    });
  });

  const globalPreds = predictions.filter((p) => p.hourOfDay === null);
  const scores = globalPreds.map((p) => p.riskScore);
  const top = scores.length ? Math.max(...scores) : 0;
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const hotspots = [...globalPreds]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10)
    .map((p) => ({ lat: p.lat, lng: p.lng, score: p.riskScore }));

  // "accuracy" sintética: dispersión + volumen
  const accuracy = Math.min(0.95, 0.5 + Math.log10(incidents.length + 1) * 0.1);

  return {
    predictions,
    metrics: {
      totalIncidents: incidents.length,
      cellsWithRisk: globalPreds.length,
      topRiskScore: top,
      avgRiskScore: avg,
      hotspots,
    },
    accuracy,
  };
}
