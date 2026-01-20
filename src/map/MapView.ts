import * as L from "leaflet";

export type FeatureIdGetter = (feature: any) => string;

export type GeoJsonLayerOptions = {
  style?: L.PathOptions | ((feature: any) => L.PathOptions);
  onEachFeature?: (feature: any, layer: L.Layer) => void;
  getFeatureId?: FeatureIdGetter;
  layerById?: Map<string, L.Layer>;
  pane?: string;
  interactive?: boolean;
};

export class MapView {
  private map: L.Map | null = null;
  private geoLayer: L.GeoJSON | null = null;

  mount(container: HTMLElement, initialView: { lat: number; lng: number; zoom: number }) {
    this.destroy(); // falls schon gemountet

    this.map = L.map(container, { zoomControl: true }).setView(
      [initialView.lat, initialView.lng],
      initialView.zoom
    );
  }

  destroy() {
    this.geoLayer?.remove();
    this.geoLayer = null;

    this.map?.remove();
    this.map = null;
  }

  hasMap() {
    return this.map !== null;
  }

  setGeoJson(geojson: any, opts: GeoJsonLayerOptions = {}) {
    if (!this.map) throw new Error("MapView: mount() must be called before setGeoJson().");

    // alten Layer entfernen
    if (this.geoLayer) {
      this.geoLayer.remove();
      this.geoLayer = null;
    }

    // layerById neu befüllen
    if (opts.layerById) opts.layerById.clear();

    const styleFn =
      typeof opts.style === "function"
        ? (opts.style as (feature: any) => L.PathOptions)
        : () => ({ ...(opts.style ?? {}) });

    this.geoLayer = L.geoJSON(geojson, {
      pane: opts.pane ?? "overlayPane",
      interactive: opts.interactive ?? true,
      style: styleFn,
      onEachFeature: (feature: any, layer: L.Layer) => {
        if (opts.getFeatureId && opts.layerById) {
          const id = opts.getFeatureId(feature);
          if (id) opts.layerById.set(id, layer);
        }
        opts.onEachFeature?.(feature, layer);
      },
    }).addTo(this.map);

    return this.geoLayer;
  }

  fitToGeoLayer(padding: [number, number] = [10, 10]) {
    if (!this.map || !this.geoLayer) return;
    this.map.fitBounds(this.geoLayer.getBounds(), { padding });
  }

  getGeoLayer() {
    return this.geoLayer;
  }
}
