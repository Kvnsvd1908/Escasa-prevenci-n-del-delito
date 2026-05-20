type ReverseGeocodeResult = {
  displayName: string | null;
};

type NominatimResponse = {
  display_name?: string;
  name?: string;
  address?: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
  };
};

const cache = new Map<string, ReverseGeocodeResult>();

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { displayName: null };
  }

  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es-CL,es");

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "PRED-CRIM demo contact: admin@predcrim.cl",
      },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return { displayName: null };

    const data = (await res.json()) as NominatimResponse;
    const displayName = compactAddress(data) ?? data.display_name ?? data.name ?? null;
    const result = { displayName };
    cache.set(key, result);
    return result;
  } catch {
    return { displayName: null };
  }
}

function compactAddress(data: NominatimResponse) {
  const address = data.address;
  if (!address) return null;

  const street = [address.road, address.house_number].filter(Boolean).join(" ");
  const sector =
    address.neighbourhood ??
    address.suburb ??
    address.city ??
    address.town ??
    address.village ??
    address.municipality;
  const region = address.state;

  return [street || null, sector, region].filter(Boolean).join(", ") || null;
}
