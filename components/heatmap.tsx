"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export interface HeatPoint {
  lat: number;
  lng: number;
  riskScore: number;
  category?: string | null;
}

interface Props {
  points: HeatPoint[];
  center: [number, number];
  zoom: number;
  showMarkers?: boolean;
}

function riskColor(score: number) {
  if (score >= 0.8) return "#ef4444";
  if (score >= 0.6) return "#f97316";
  if (score >= 0.4) return "#eab308";
  return "#22c55e";
}

function HeatControlLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (points.length === 0) return;

    const heatPoints = points.map(
      (p) => [p.lat, p.lng, p.riskScore] as [number, number, number]
    );
    const layer = (L as unknown as { heatLayer: (pts: [number, number, number][], opts: Record<string, unknown>) => L.Layer })
      .heatLayer(heatPoints, {
      radius: 25,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.2: "#22c55e",
        0.4: "#eab308",
        0.6: "#f97316",
        0.8: "#ef4444",
        1.0: "#7f1d1d",
      },
    });
    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points]);

  return null;
}

export default function Heatmap({ points, center, zoom, showMarkers = true }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap · CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <HeatControlLayer points={points} />
      {showMarkers &&
        points
          .filter((p) => p.riskScore >= 0.5)
          .slice(0, 50)
          .map((p, i) => (
            <CircleMarker
              key={i}
              center={[p.lat, p.lng]}
              radius={6 + p.riskScore * 8}
              pathOptions={{
                color: riskColor(p.riskScore),
                fillColor: riskColor(p.riskScore),
                fillOpacity: 0.6,
                weight: 1,
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <div>Riesgo: <b>{(p.riskScore * 100).toFixed(0)}%</b></div>
                  {p.category && <div>Categoría: {p.category}</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
    </MapContainer>
  );
}
