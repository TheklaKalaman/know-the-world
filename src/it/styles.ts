import type * as L from "leaflet";

export const baseStyle: L.PathOptions = {
  weight: 2,
  opacity: 1,
  fillOpacity: 0.25,
};

export const hoverStyle: L.PathOptions = {
  weight: 3,
  fillOpacity: 0.35,
};

export const correctStyle: L.PathOptions = {
  weight: 4,
  color: "#2e7d32",
  fillColor: "#2e7d32",
  fillOpacity: 0.45,
};

export const wrongStyle: L.PathOptions = {
  weight: 4,
  color: "#c62828",
  fillColor: "#c62828",
  fillOpacity: 0.45,
};
