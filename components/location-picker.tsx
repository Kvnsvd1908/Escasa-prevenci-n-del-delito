"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from "react-leaflet";

interface Props {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  center: [number, number];
  zoom?: number;
}

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function CenterOnChange({ value }: { value: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) {
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), 14));
    }
  }, [value, map]);
  return null;
}

export default function LocationPicker({ value, onChange, center, zoom = 13 }: Props) {
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : center}
      zoom={zoom}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap · CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ClickToPlace onPick={(lat, lng) => onChange({ lat, lng })} />
      <CenterOnChange value={value} />
      {value && (
        <CircleMarker
          center={[value.lat, value.lng]}
          radius={10}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.7,
            weight: 2,
          }}
        />
      )}
    </MapContainer>
  );
}
