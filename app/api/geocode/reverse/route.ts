import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/reverse-geocode";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Coordenadas invalidas" }, { status: 400 });
  }

  const result = await reverseGeocode(lat, lng);
  return NextResponse.json(result);
}
