import { navigate } from "../router";

export function renderHome(root: HTMLElement) {
  root.innerHTML = `
    <header>
      <h1>Know The World — Know Italy</h1>
      <nav>
        <a href="#/">Start</a>
      </nav>
    </header>

    <main>
      <div class="card">
        <h2>Wähle den Lernmodus</h2>
        <p>Heute: Italien. Später: der Rest der Welt.</p>

        <button class="btn" id="btn-mode1">Lernmodus 1: Regionen bestimmen</button>
        <button class="btn" id="btn-mode2">Lernmodus 2: Regionen kennenlernen</button>
      </div>
    </main>
  `;

  root.querySelector<HTMLButtonElement>("#btn-mode1")!
    .addEventListener("click", () => navigate("mode/regions-quiz"));

  root.querySelector<HTMLButtonElement>("#btn-mode2")!
    .addEventListener("click", () => navigate("mode/regions-study"));
}
