export type QuizState = {
  targetId: string | null;
  targetName: string | null;
  accepting: boolean;
  tries: number;
  correct: number;
};

export function createQuizState(): QuizState {
  return { targetId: null, targetName: null, accepting: false, tries: 0, correct: 0 };
}

export function resetScore(s: QuizState) {
  s.tries = 0;
  s.correct = 0;
}

export function pickNewTarget(namesById: Record<string, string>, excludeId?: string | null) {
  const ids = Object.keys(namesById).filter((k) => k.startsWith("it-"));
  if (ids.length === 0) return { id: "", name: "" };

  let id = ids[Math.floor(Math.random() * ids.length)];

  if (excludeId && ids.length > 1) {
    for (let i = 0; i < 10 && id === excludeId; i++) {
      id = ids[Math.floor(Math.random() * ids.length)];
    }
    if (id === excludeId) id = ids.find((x) => x !== excludeId)!;
  }

  return { id, name: namesById[id] ?? id };
}
