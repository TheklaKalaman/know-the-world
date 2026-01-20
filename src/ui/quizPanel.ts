export type QuizPanel = {
  setQuestion: (text: string) => void;
  setStatus: (text: string) => void;
  setScore: (correct: number, tries: number) => void;
  showNext: (show: boolean) => void;
  onNext: (handler: () => void) => void;
};

function mustGet<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`QuizPanel: Element not found: ${selector}`);
  return el;
}

export function bindQuizPanel(root: HTMLElement): QuizPanel {
  const questionEl = mustGet<HTMLHeadingElement>(root, "#question");
  const statusEl = mustGet<HTMLParagraphElement>(root, "#status");
  const scoreEl = mustGet<HTMLParagraphElement>(root, "#score");
  const nextBtn = mustGet<HTMLButtonElement>(root, "#next");

  return {
    setQuestion: (text) => (questionEl.textContent = text),
    setStatus: (text) => (statusEl.textContent = text),
    setScore: (correct, tries) => (scoreEl.textContent = `Treffer: ${correct} / ${tries}`),
    showNext: (show) => (nextBtn.style.display = show ? "inline-block" : "none"),
    onNext: (handler) => {
      nextBtn.onclick = handler;
    },
  };
}
