"use client";

import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";

type Props = {
  lat: number;
  lng: number;
};

export default function MiniLocationMap({ lat, lng }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <CircleMarker
        center={[lat, lng]}
        radius={8}
        pathOptions={{
          color: "#ef4444",
          fillColor: "#ef4444",
          fillOpacity: 0.75,
          weight: 2,
        }}
      />
    </MapContainer>
  );
}
