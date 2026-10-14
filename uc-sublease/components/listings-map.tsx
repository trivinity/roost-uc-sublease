"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { DISTANCE_ANY } from "@/lib/filters";
import { fmtMiles, fmtMoney } from "@/lib/format";
import { UC_CENTER } from "@/lib/geo";
import type { Listing } from "@/lib/types";

const NEAR_MILES = 6;

const pin = (text: string, kind: "listing" | "uc") =>
  L.divIcon({
    className: "",
    html: `<div class="map-pin map-pin-${kind}">${text}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

// Re-frames the map whenever the set of listings (or the distance limit) changes.
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 14 });
  }, [map, points]);
  return null;
}

// Zillow-style map: a price pin per listing, UC marked in red, and the distance limit drawn as a circle.
export function ListingsMap({
  listings,
  maxDistance,
}: {
  listings: Listing[];
  maxDistance: number;
}) {
  const uc: [number, number] = [UC_CENTER.lat, UC_CENTER.lng];
  const radius = maxDistance < DISTANCE_ANY ? maxDistance : null;
  // Frame the cluster around campus; far-out listings stay reachable by zooming out.
  const near = listings.filter((l) => l.distanceMiles <= NEAR_MILES);
  const framed = near.length > 0 ? near : listings;
  const farther = listings.length - framed.length;
  const points: [number, number][] = [
    uc,
    ...framed.map((l): [number, number] => [l.lat, l.lng]),
  ];

  return (
    <div className="relative">
      <MapContainer
        center={uc}
        zoom={12}
        scrollWheelZoom
        className="roost-map h-[calc(100dvh-16rem)] min-h-[420px] w-full overflow-hidden rounded-3xl border border-border"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds
          points={
            radius
              ? [
                  [uc[0] + radius / 69, uc[1]],
                  [uc[0] - radius / 69, uc[1]],
                  [uc[0], uc[1] + radius / 53],
                  [uc[0], uc[1] - radius / 53],
                ]
              : points
          }
        />
        {radius && (
          <Circle
            center={uc}
            radius={radius * 1609.34}
            pathOptions={{
              color: "#d0312d",
              weight: 1.5,
              fillColor: "#d0312d",
              fillOpacity: 0.06,
            }}
          />
        )}
        <Marker position={uc} icon={pin("UC", "uc")} zIndexOffset={1000} />
        {listings.map((l) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={pin(fmtMoney(l.rent), "listing")}
          >
            <Popup>
              <Link
                href={`/listing/${l.id}`}
                className="block min-w-44 space-y-0.5 no-underline"
              >
                <span className="block text-sm font-semibold">{l.title}</span>
                <span className="block text-sm">
                  {fmtMoney(l.rent)}/mo · {fmtMiles(l.distanceMiles)} from UC
                </span>
                <span className="block text-xs text-[#d0312d]">
                  View listing →
                </span>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {farther > 0 && (
        <p className="absolute left-3 top-3 z-[1000] rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium shadow-md">
          +{farther} farther out · zoom out to see{" "}
          {farther === 1 ? "it" : "them"}
        </p>
      )}
    </div>
  );
}
