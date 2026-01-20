import type * as L from "leaflet";
import { MapView } from "../map/MapView";
import { HighlightManager } from "../map/HighlightManager";
import { loadItalyData, type DeNames } from "../it/data";
import { baseStyle, hoverStyle, correctStyle, wrongStyle } from "../it/styles";
import { createQuizState, resetScore } from "../quiz/engine";
import { bindQuizPanel, type QuizPanel } from "../ui/quizPanel";
import { startNewQuestion } from "../quiz/flow";
import { bindTooltip, bindHover, bindClick } from "../map/FeatureInteractions";

const mapView = new MapView();
let geoLayer: L.GeoJSON | null = null;

const layerById = new Map<string, L.Layer>();
let deNamesCache: DeNames = {};

const quiz = createQuizState();

// Highlight-Manager: verwaltet rot/gruen + reset
const highlights = new HighlightManager(
  () => geoLayer as any,
  { correct: correctStyle, wrong: wrongStyle }
);

export function renderMode1(root: HTMLElement) {
  root.innerHTML = `
    <header>
      <h1>Know Italy — Regionen bestimmen</h1>
      <nav>
        <a href="#/">Start</a>
        <a href="#/mode/regions-study">Modus 2</a>
      </nav>
    </header>

    <main>
      <div class="card">
        <h2 id="question">Lade Regionen…</h2>
        <p id="status">—</p>
        <p id="score">Treffer: 0 / 0</p>
        <button class="btn" id="next" style="display:none;">Nächste Frage</button>
      </div>

      <div id="map" class="card" style="height: 70vh; margin-top: 12px;"></div>
    </main>
  `;

  const panel = bindQuizPanel(root);

  const mapDiv = root.querySelector<HTMLDivElement>("#map");
  if (!mapDiv) throw new Error("Map div not found");

  mapView.mount(mapDiv, { lat: 42.5, lng: 12.5, zoom: 5 });

  panel.onNext(() => {
    const prev = quiz.targetId;
    highlights.reset();
    startNewQuestion(panel, quiz, deNamesCache, { excludeId: prev });
  });


  void loadRegions(panel);
}

async function loadRegions(panel: QuizPanel) {
  if (!mapView.hasMap()) return;

  try {
    const { geojson, deNames } = await loadItalyData();
    deNamesCache = deNames;

    resetScore(quiz);
    panel.setScore(quiz.correct, quiz.tries);
    panel.showNext(false);

    layerById.clear();
    highlights.reset();

    geoLayer = mapView.setGeoJson(geojson, {
      pane: "overlayPane",
      interactive: true,
      style: () => ({ ...baseStyle }),
      getFeatureId: (f) => (f?.properties?.app_id ?? "") as string,
      layerById,
      onEachFeature: (feature: any, layer: L.Layer) => {
        const p = feature?.properties ?? {};
        const id: string = p.app_id ?? "";
        const itName: string = p.NAME ?? "?";
        const name = deNames[id] ?? itName;

        bindTooltip(layer, name);

        bindHover(layer, {
          getGeoLayer: () => geoLayer as any,
          hoverStyle,
          enabled: () => quiz.accepting,
        });


        bindClick(layer, () => {
          if (!quiz.accepting || !quiz.targetId) return;

          // genau ein Versuch
          quiz.accepting = false;
          quiz.tries++;

          highlights.reset();

          const correctLayer = layerById.get(quiz.targetId) ?? null;

          if (id === quiz.targetId) {
            quiz.correct++;
            highlights.markCorrect(layer);
            panel.setStatus(`Richtig! Das ist ${name}.`);
          } else {
            highlights.markWrong(layer);

            if (correctLayer) {
              highlights.markCorrect(correctLayer);
            }

            panel.setStatus(`Falsch: Du hast ${name} geklickt.`);
          }

          panel.setScore(quiz.correct, quiz.tries);
          panel.showNext(true);
        });

      },
    });

    mapView.fitToGeoLayer([10, 10]);
    startNewQuestion(panel, quiz, deNamesCache);
  } catch (err: any) {
    panel.setStatus(`Fehler beim Laden: ${err?.message ?? String(err)}`);
  }
}
