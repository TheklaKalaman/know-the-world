import type * as L from "leaflet";

export type HighlightStyles = {
  correct: L.PathOptions;
  wrong: L.PathOptions;
};

type ResettableGeoLayer = {
  resetStyle: (layer: any) => void;
  hasLayer?: (layer: any) => boolean;
};

export class HighlightManager {
  private getGeoLayer: () => ResettableGeoLayer | null;
  private styles: HighlightStyles;

  private lastCorrect: L.Layer | null;
  private lastWrong: L.Layer | null;

  constructor(getGeoLayer: () => ResettableGeoLayer | null, styles: HighlightStyles) {
    this.getGeoLayer = getGeoLayer;
    this.styles = styles;

    this.lastCorrect = null;
    this.lastWrong = null;
  }

  reset() {
    const g = this.getGeoLayer();

    if (g && this.lastWrong && (!g.hasLayer || g.hasLayer(this.lastWrong))) {
      g.resetStyle(this.lastWrong);
    }
    if (g && this.lastCorrect && (!g.hasLayer || g.hasLayer(this.lastCorrect))) {
      g.resetStyle(this.lastCorrect);
    }

    this.lastWrong = null;
    this.lastCorrect = null;
  }

  markCorrect(layer: L.Layer) {
    this.lastCorrect = layer;
    (layer as any).setStyle?.(this.styles.correct);
    (layer as any).bringToFront?.();
  }

  markWrong(layer: L.Layer) {
    this.lastWrong = layer;
    (layer as any).setStyle?.(this.styles.wrong);
    (layer as any).bringToFront?.();
  }
}
