"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "./LanguageContext";

const MESSINA_CENTER = [38.1938, 15.5540];

const CATEGORY_EMOJI = {
  "Camera singola": "🛏️",
  "Camera doppia": "🛌",
  "Posto letto": "🛏️",
  "Monolocale": "🏠",
  "Bilocale": "🏢",
  "Appartamento": "🏢",
};

function markerIcon(type = "home", category = "") {
  const content = type === "selected"
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="#4f46e5" stroke="none"/></svg>`
    : (CATEGORY_EMOJI[category] || "🏠");
  return L.divIcon({
    html: `<div style="background:#4f46e5;color:white;width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 6px 18px rgba(15,23,42,.25)">${content}</div>`,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      if (onSelect) onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function RentalMap({ products = [], selected, onSelect, height = "420px", zoom = 13 }) {
  const { t } = useLanguage();
  const center = selected ? [selected.lat, selected.lng] : MESSINA_CENTER;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={onSelect} />

        {selected && (
          <Marker position={[selected.lat, selected.lng]} icon={markerIcon("selected")}> 
            <Popup>{t("selectedLocation")}</Popup>
          </Marker>
        )}

        {products
          .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
          .map((p) => (
            <Marker key={p.id} position={[p.latitude, p.longitude]} icon={markerIcon("product", p.category)}> 
              <Popup>
                <div style={{ minWidth: 180 }}>
                  {p.image && <img src={p.image} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} onError={(e) => e.target.style.display = "none"} />}
                  <strong>{p.title}</strong>
                  <div style={{ color: "#4f46e5", fontWeight: 700, marginTop: 4 }}>€{p.price} {t("perMonth")}</div>
                  {p.address && <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{p.address}</div>}
                  <Link href={`/products/${p.id}`} style={{ display: "inline-block", marginTop: 8, color: "#4f46e5", fontWeight: 700 }}>
                    {t("viewListing")}
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
