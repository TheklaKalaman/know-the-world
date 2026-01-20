export type DeNames = Record<string, string>;

export async function loadItalyData(): Promise<{ geojson: any; deNames: DeNames }> {
  const base = import.meta.env.BASE_URL;

  const [gjRes, deRes] = await Promise.all([
    fetch(`${base}data/it/it_regions.geojson`),
    fetch(`${base}data/it/it_regions_de.json`),
  ]);

  if (!gjRes.ok) throw new Error(`GeoJSON nicht gefunden (${gjRes.status})`);
  const geojson = await gjRes.json();

  const deNames: DeNames = deRes.ok ? await deRes.json() : {};
  return { geojson, deNames };
}
