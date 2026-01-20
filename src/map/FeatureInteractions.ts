import type * as L from "leaflet";

type ResettableGeoLayer = {
  resetStyle: (layer: any) => void;
  hasLayer?: (layer: any) => boolean;
};

export function bindTooltip(layer: L.Layer, text: string) {
  (layer as any).bindTooltip?.(text, { sticky: true });
}

export function bindHover(
  layer: L.Layer,
  opts: {
    getGeoLayer: () => ResettableGeoLayer | null;
    hoverStyle: L.PathOptions;
    enabled: () => boolean;
  }
) {
  layer.on("mouseover", () => {
    if (!opts.enabled()) return;
    (layer as any).setStyle?.(opts.hoverStyle);
  });

  layer.on("mouseout", () => {
    if (!opts.enabled()) return;

    const g = opts.getGeoLayer();
    if (!g) return;
    if (g.hasLayer && !g.hasLayer(layer)) return;

    g.resetStyle(layer);
  });
}

export function bindClick(layer: L.Layer, handler: (e: any) => void) {
  layer.on("click", (e: any) => {
    if (e?.originalEvent) e.originalEvent.stopPropagation();
    handler(e);
  });
}
