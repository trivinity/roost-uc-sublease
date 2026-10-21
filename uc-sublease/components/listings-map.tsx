"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import MarkerClusterGroup from "react-leaflet-cluster";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { DISTANCE_ANY } from "@/lib/filters";
import { fmtMiles, fmtMoney } from "@/lib/format";
import { UC_CENTER } from "@/lib/geo";
import type { Listing } from "@/lib/types";

const NEAR_MILES = 6;

// OpenStreetMap's public tiles need no key and are fine for a class-sized test. For heavier use, set
// NEXT_PUBLIC_MAP_TILES_URL to a keyed provider (MapTiler, Stadia, Mapbox...) with the same {z}/{x}/{y} pattern.
// (CARTO's free basemaps now require an API key, so they are not used.) Colors are softened in CSS.
const TILES_URL =
  process.env.NEXT_PUBLIC_MAP_TILES_URL ||
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );

// A price bubble with a little tail, anchored at the bottom point.
const priceIcon = (text: string) =>
  L.divIcon({
    className: "roost-pin-wrap",
    html: `<div class="roost-pin"><span>${esc(text)}</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const ucIcon = L.divIcon({
  className: "roost-pin-wrap",
  html: `<div class="roost-uc">UC</div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// Numbered circle for several nearby listings. Click to zoom in.
const clusterIcon = (cluster: { getChildCount: () => number }) =>
  L.divIcon({
    className: "roost-pin-wrap",
    html: `<div class="roost-cluster">${cluster.getChildCount()}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

// Re-frames the map whenever the set of listings (or the distance limit) changes.
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 14 });
  }, [map, points]);
  return null;
}

// Zillow-style map: a price pin per listing (grouped when crowded), UC marked in red, and the distance limit as a circle.
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
  const points: [number, number][] = radius
    ? [
        [uc[0] + radius / 69, uc[1]],
        [uc[0] - radius / 69, uc[1]],
        [uc[0], uc[1] + radius / 53],
        [uc[0], uc[1] - radius / 53],
      ]
    : [uc, ...framed.map((l): [number, number] => [l.lat, l.lng])];

  return (
    <div className="relative">
      <MapContainer
        center={uc}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom
        className="roost-map h-[calc(100dvh-16rem)] min-h-[440px] w-full overflow-hidden rounded-3xl border border-border"
      >
        <TileLayer attribution={ATTRIBUTION} url={TILES_URL} maxZoom={19} />
        <ZoomControl position="bottomright" />
        <FitBounds points={points} />
        {radius && (
          <Circle
            center={uc}
            radius={radius * 1609.34}
            pathOptions={{
              color: "#d0312d",
              weight: 1.5,
              dashArray: "6 6",
              fillColor: "#d0312d",
              fillOpacity: 0.05,
            }}
          />
        )}
        <Marker position={uc} icon={ucIcon} zIndexOffset={1000} />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={clusterIcon}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={46}
        >
          {listings.map((l) => (
            <Marker
              key={l.id}
              position={[l.lat, l.lng]}
              icon={priceIcon(fmtMoney(l.rent))}
            >
              <Popup
                className="roost-popup"
                closeButton={false}
                minWidth={220}
                maxWidth={240}
              >
                <Link href={`/listing/${l.id}`} className="roost-popup-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.thumbs?.[0] ?? l.photos[0]} alt="" />
                  <span className="roost-popup-body">
                    <strong>
                      {fmtMoney(l.rent)}
                      <small>/mo</small>
                    </strong>
                    <span className="roost-popup-title">{l.title}</span>
                    <span className="roost-popup-meta">
                      {fmtMiles(l.distanceMiles)} from UC · {l.neighborhood}
                    </span>
                  </span>
                </Link>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {farther > 0 && (
        <p className="absolute left-3 top-3 z-[1000] rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur">
          +{farther} farther out · zoom out to see{" "}
          {farther === 1 ? "it" : "them"}
        </p>
      )}
    </div>
  );
}
