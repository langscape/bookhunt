import type { BookTransaction } from "@/lib/directus";

// Haversine distance in kilometers
function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c; // km
}

export function computeStats(txs: BookTransaction[]) {
  const coords = txs
    .map((t) => ({ lat: t.latitude, lon: t.longitude }))
    .filter((p): p is { lat: number; lon: number } => !!p.lat && !!p.lon);

  let km = 0;
  for (let i = 1; i < coords.length; i++) km += haversine(coords[i - 1], coords[i]);

  const cities = new Set(txs.map((t) => t.city).filter(Boolean) as string[]);
  const countries = new Set(txs.map((t) => t.country).filter(Boolean) as string[]);
  const readers = new Set(txs.map((t) => t.reporter).filter(Boolean) as string[]);

  return {
    kilometers: km,
    miles: km * 0.621371,
    cities: cities.size,
    countries: countries.size,
    readers: readers.size,
  };
}

