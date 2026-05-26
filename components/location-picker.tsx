"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Props {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  center: [number, number];
  zoom?: number;
}

export default function LocationPicker({ value, onChange, center, zoom = 13 }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: value ? [value.lng, value.lat] : [center[1], center[0]],
      zoom,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("click", (event) => {
      onChangeRef.current({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [center, token, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "mapbox-location-marker";
      markerRef.current = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([value.lng, value.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([value.lng, value.lat]);
    }

    map.flyTo({
      center: [value.lng, value.lat],
      zoom: Math.max(map.getZoom(), 14),
      essential: true,
    });
  }, [value]);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background p-4 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-sm font-semibold text-foreground">Mapbox no esta configurado</p>
          <p className="text-xs text-muted-foreground">
            Agrega <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code> en <code className="rounded bg-muted px-1 py-0.5">.env</code>.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="h-full w-full bg-background" />;
}
