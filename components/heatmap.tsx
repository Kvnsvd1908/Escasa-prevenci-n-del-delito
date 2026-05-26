"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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

function toFeatureCollection(points: HeatPoint[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [p.lng, p.lat],
      },
      properties: {
        riskScore: p.riskScore,
        category: p.category ?? "Sin categoria",
      },
    })),
  };
}

function formatCategory(category: string) {
  if (!category || category === "Sin categoria") return "Sin categoria";
  const normalized = category.replaceAll("_", " ").toLowerCase();
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function riskLevel(score: number) {
  if (score >= 0.8) return "Alto";
  if (score >= 0.6) return "Medio alto";
  if (score >= 0.4) return "Medio";
  return "Bajo";
}

export default function Heatmap({ points, center, zoom, showMarkers = true }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const data = useMemo(() => toFeatureCollection(points), [points]);

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [center[1], center[0]],
      zoom,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("risk-points", {
        type: "geojson",
        data,
      });

      map.addLayer({
        id: "risk-heatmap",
        type: "heatmap",
        source: "risk-points",
        maxzoom: 15,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "riskScore"],
            0,
            0,
            1,
            1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.75,
            13,
            1.6,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(34,197,94,0)",
            0.2,
            "#22c55e",
            0.4,
            "#eab308",
            0.6,
            "#f97316",
            0.8,
            "#ef4444",
            1,
            "#7f1d1d",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            18,
            13,
            34,
          ],
          "heatmap-opacity": 0.86,
        },
      });

      if (showMarkers) {
        map.addLayer({
          id: "risk-markers",
          type: "circle",
          source: "risk-points",
          filter: [">=", ["get", "riskScore"], 0.5],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "riskScore"],
              0.5,
              4,
              1,
              12,
            ],
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "riskScore"],
              0.5,
              "#eab308",
              0.7,
              "#f97316",
              0.85,
              "#ef4444",
              1,
              "#7f1d1d",
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1,
            "circle-opacity": 0.85,
          },
        });

        map.on("mouseenter", "risk-markers", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "risk-markers", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("click", "risk-markers", (event) => {
          const feature = event.features?.[0];
          if (!feature || feature.geometry.type !== "Point") return;
          const coordinates = feature.geometry.coordinates as [number, number];
          const riskScore = Number(feature.properties?.riskScore ?? 0);
          const category = String(feature.properties?.category ?? "Sin categoria");
          const popupContent = document.createElement("div");
          popupContent.className = "risk-popup-content";

          const riskText = document.createElement("div");
          riskText.className = "risk-popup-risk";
          riskText.textContent = `Riesgo ${riskLevel(riskScore)} (${(riskScore * 100).toFixed(0)}%)`;

          const categoryText = document.createElement("div");
          categoryText.className = "risk-popup-category";
          categoryText.textContent = `Categoria: ${formatCategory(category)}`;

          popupContent.append(riskText, categoryText);

          popupRef.current?.remove();
          popupRef.current = new mapboxgl.Popup({
            closeButton: false,
            className: "risk-map-popup",
            offset: 14,
          })
            .setLngLat(coordinates)
            .setDOMContent(popupContent)
            .addTo(map);
        });
      }

      if (points.length >= 2) {
        const bounds = new mapboxgl.LngLatBounds();
        points.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, {
          padding: 48,
          maxZoom: 12,
          duration: 0,
        });
      }
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [center, showMarkers, token, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("risk-points") as mapboxgl.GeoJSONSource | undefined;
    source?.setData(data);

    if (points.length >= 2) {
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, {
        padding: 48,
        maxZoom: 12,
        duration: 250,
      });
    }
  }, [data, points]);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-2">
          <p className="text-sm font-semibold text-foreground">Mapbox no esta configurado</p>
          <p className="text-sm text-muted-foreground">
            Agrega <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code> en tu archivo <code className="rounded bg-muted px-1 py-0.5">.env</code> y reinicia el servidor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full overflow-hidden rounded-lg bg-background"
    />
  );
}
