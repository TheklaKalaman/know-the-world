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
    private cleanup: Array<() => void> = [];

    mount(container: HTMLElement, initialView: { lat: number; lng: number; zoom: number }) {
        this.destroy(); // räumt auch event listener weg

        this.map = L.map(container, {
            zoomControl: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            boxZoom: false,
            keyboard: false,

            // wichtig: ermöglicht feinere FitBounds-Zoomstufen (auch wenn User-Zoom aus ist)
            zoomSnap: 0.25,
            zoomDelta: 0.25,
        }).setView([initialView.lat, initialView.lng], initialView.zoom);

        // Leaflet-Handler extra-sicher deaktivieren
        this.map.scrollWheelZoom.disable();
        this.map.doubleClickZoom.disable();
        this.map.touchZoom.disable();
        this.map.boxZoom.disable();
        this.map.keyboard.disable();

        // Optional: Mobile tap handler (Leaflet)
        (this.map as any).tap?.disable?.();

        // HARD BLOCK: verhindert Trackpad-Pinch/Ctrl+Wheel & Browser-Gesten über der Karte
        const blockWheel = (e: WheelEvent) => {
            // Trackpad-Pinch wird oft als Ctrl+Wheel geliefert -> komplett blocken
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const blockDblClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const blockGesture = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };

        container.addEventListener("wheel", blockWheel, { passive: false });
        container.addEventListener("dblclick", blockDblClick, { passive: false } as any);

        // Safari/iOS Gestures (schadet nicht, wenn sie nie feuern)
        container.addEventListener("gesturestart", blockGesture as any, { passive: false });
        container.addEventListener("gesturechange", blockGesture as any, { passive: false });
        container.addEventListener("gestureend", blockGesture as any, { passive: false });

        this.cleanup.push(() => container.removeEventListener("wheel", blockWheel as any));
        this.cleanup.push(() => container.removeEventListener("dblclick", blockDblClick as any));
        this.cleanup.push(() => container.removeEventListener("gesturestart", blockGesture as any));
        this.cleanup.push(() => container.removeEventListener("gesturechange", blockGesture as any));
        this.cleanup.push(() => container.removeEventListener("gestureend", blockGesture as any));
    }

    destroy() {
        for (const fn of this.cleanup) fn();
        this.cleanup = [];

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

    // Standard: nach Layout neu messen + fitBounds
    fitToGeoLayerAfterLayout(padding: [number, number] = [0, 0], opts?: { maxZoom?: number }) {
        if (!this.map || !this.geoLayer) return;

        const map = this.map;
        const layer = this.geoLayer;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (this.map !== map || this.geoLayer !== layer) return;

                map.invalidateSize();
                map.fitBounds(layer.getBounds(), {
                    padding,
                    maxZoom: opts?.maxZoom,
                });
            });
        });
    }

    // Tight Fit: größtmöglicher Zoom ohne Abschneiden (ideal für “Italien soll größer, aber komplett sichtbar”)
    fitToGeoLayerTightAfterLayout(
        padding: [number, number] = [0, 0],
        maxExtraZoom = 1,
        step = 0.25
    ) {
        if (!this.map || !this.geoLayer) return;

        const map = this.map;
        const layer = this.geoLayer;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (this.map !== map || this.geoLayer !== layer) return;

                map.invalidateSize();

                const bounds = layer.getBounds();
                map.fitBounds(bounds, { padding });

                const baseZoom = map.getZoom();
                let bestZoom = baseZoom;

                for (let z = baseZoom + step; z <= baseZoom + maxExtraZoom + 1e-9; z += step) {
                    (map as any).setZoom(z, { animate: false });

                    const viewBounds = map.getBounds();
                    if (viewBounds.contains(bounds)) bestZoom = z;
                    else break;
                }

                (map as any).setZoom(bestZoom, { animate: false });
            });
        });
    }

    getGeoLayer() {
        return this.geoLayer;
    }

    invalidateSize() {
        (this.map as any)?.invalidateSize?.();
    }
}
