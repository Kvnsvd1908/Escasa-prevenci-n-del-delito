import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { parseIncidentsCsv } from "@/lib/csv-parser";

// CU-01: procesamiento de archivo CSV de incidentes
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.role !== "ANALISTA_DATOS" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Rol no autorizado para cargar datos" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no recibido" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Archivo demasiado grande (máx 10 MB)" }, { status: 400 });
  }

  const csv = await file.text();
  const { accepted, rejected, total } = parseIncidentsCsv(csv);

  const categories = await prisma.crimeCategory.findMany();
  const catByCode = new Map(categories.map((c) => [c.code.toUpperCase(), c]));
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

  // Registrar la carga primero
  const upload = await prisma.incidentUpload.create({
    data: {
      filename: file.name,
      uploadedById: session.user.id,
      totalRows: total,
      acceptedRows: 0,
      rejectedRows: rejected.length,
    },
  });

  let insertedCount = 0;
  const extraErrors: { row: number; reason: string }[] = [];

  // Insertar en batch — mapear categoría por código o nombre
  const toInsert = accepted.flatMap((r, i) => {
    const key = r.categoria.trim().toUpperCase();
    const cat =
      catByCode.get(key) ?? catByName.get(r.categoria.trim().toLowerCase());
    if (!cat) {
      extraErrors.push({ row: i + 2, reason: `Categoría desconocida: "${r.categoria}"` });
      return [];
    }
    return [
      {
        categoryId: cat.id,
        occurredAt: new Date(r.fecha),
        latitude: r.latitud,
        longitude: r.longitud,
        zone: r.zona ?? null,
        address: r.direccion ?? null,
        description: r.descripcion ?? null,
        source: "HISTORICAL" as const,
        uploadId: upload.id,
      },
    ];
  });

  if (toInsert.length > 0) {
    const result = await prisma.incident.createMany({ data: toInsert });
    insertedCount = result.count;
  }

  const allErrors = [...rejected, ...extraErrors];

  await prisma.incidentUpload.update({
    where: { id: upload.id },
    data: {
      acceptedRows: insertedCount,
      rejectedRows: allErrors.length,
      errorLog: allErrors.length
        ? JSON.stringify(allErrors.slice(0, 100))
        : null,
    },
  });

  return NextResponse.json({
    uploadId: upload.id,
    total,
    accepted: insertedCount,
    rejected: allErrors.length,
    errors: allErrors.slice(0, 20),
  });
}
