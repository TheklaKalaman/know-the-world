export function renderMode2(root: HTMLElement) {
  root.innerHTML = `
    <header>
      <h1>Know Italy — Regionen kennenlernen</h1>
      <nav>
        <a href="#/">Start</a>
        <a href="#/mode/regions-quiz">Modus 1</a>
      </nav>
    </header>

    <main>
      <div class="card">
        <h2>Platzhalter</h2>
        <p>Hier kommt später: Regionen auswählen (z.B. Sizilien) → Zoom/Fill → Sites studieren oder Sites-Quiz.</p>
      </div>
    </main>
  `;
}
