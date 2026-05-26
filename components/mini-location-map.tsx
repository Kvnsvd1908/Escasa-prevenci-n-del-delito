"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Props = {
  lat: number;
  lng: number;
};

export default function MiniLocationMap({ lat, lng }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lng, lat],
      zoom: 15,
      interactive: false,
      attributionControl: false,
    });

    const el = document.createElement("div");
    el.className = "mapbox-location-marker";
    markerRef.current = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat([lng, lat])
      .addTo(map);
    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, token]);

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background p-3 text-center text-xs text-muted-foreground">
        Configura Mapbox
      </div>
    );
  }

  return <div ref={mapContainerRef} className="h-full w-full bg-background" />;
}
