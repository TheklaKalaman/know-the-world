import "./style.css";
import { getRoute } from "./router";
import { renderHome } from "./pages/home";
import { renderMode1 } from "./pages/mode1";
import { renderMode2 } from "./pages/mode2";

const app = document.querySelector<HTMLDivElement>("#app")!;

function render() {
  const route = getRoute();
  if (route === "") return renderHome(app);
  if (route === "mode/regions-quiz") return renderMode1(app);
  if (route === "mode/regions-study") return renderMode2(app);
  return renderHome(app);
}

window.addEventListener("hashchange", render);
render();
