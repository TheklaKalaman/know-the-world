import type { QuizState } from "./engine";
import { pickNewTarget } from "./engine";
import type { QuizPanel } from "../ui/quizPanel";

export type QuestionTextBuilder = (targetName: string) => string;

export function startNewQuestion(
  panel: QuizPanel,
  quiz: QuizState,
  namesById: Record<string, string>,
  opts?: {
    excludeId?: string | null;
    questionText?: QuestionTextBuilder;
    statusText?: string;
  }
) {
  const excludeId = opts?.excludeId ?? null;
  const t = pickNewTarget(namesById, excludeId);

  quiz.targetId = t.id;
  quiz.targetName = t.name;
  quiz.accepting = true;

  const build = opts?.questionText ?? ((name: string) => `Wo liegt ${name}?`);
  panel.setQuestion(build(t.name));
  panel.setStatus(opts?.statusText ?? "Klicke die gesuchte Region an.");
  panel.showNext(false);
}
