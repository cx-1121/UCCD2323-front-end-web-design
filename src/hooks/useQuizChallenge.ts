import { useCallback, useEffect, useMemo, useState } from 'react';
import { quizQuestions, type QuizDifficulty, type QuizQuestion } from '../utils/quizQuestions';
import { safeSession } from '../utils/storage';
import { QUIZ_PROGRESS_KEY } from '../utils/storageKeys';

export type QuizResponse = {
  question: QuizQuestion;
  selectedAnswer: number;
  isCorrect: boolean;
};

/**
 * Persisted shape (architecture §6).
 *
 * Only the answer indices are stored, never the question objects themselves.
 * Questions are answered strictly in order, so `answers[i]` always refers to
 * `quizQuestions[i]` — storing the full objects would bloat the entry and,
 * worse, resurrect stale question text if the question bank were edited between
 * the save and the resume.
 */
type PersistedQuizProgress = {
  currentIndex: number;
  selectedAnswer: number | null;
  answers: number[];
  savedAt: number;
};

const TOTAL_QUESTIONS = quizQuestions.length;

/**
 * Validates a persisted snapshot before it is trusted (fail loudly at the
 * boundary). sessionStorage is user-writable, so a hand-edited entry must not
 * be able to drive the quiz into an impossible state.
 *
 * Beyond range checks this asserts the state machine's core invariant: the
 * number of recorded answers equals the current index, plus one if the current
 * question has been answered but not yet advanced past.
 */
function isValidProgress(value: unknown): value is PersistedQuizProgress {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<PersistedQuizProgress>;
  const { currentIndex, selectedAnswer, answers } = candidate;

  if (!Number.isInteger(currentIndex) || currentIndex! < 0 || currentIndex! >= TOTAL_QUESTIONS) {
    return false;
  }

  if (!Array.isArray(answers) || answers.length > TOTAL_QUESTIONS) return false;

  // Each answer is bounded by its own question's option count rather than a
  // shared constant, so the check stays correct if a question ever carries a
  // different number of options.
  const everyAnswerInRange = answers.every(
    (answer, index) =>
      Number.isInteger(answer) && answer >= 0 && answer < quizQuestions[index].options.length,
  );
  if (!everyAnswerInRange) return false;

  const isAnswered = selectedAnswer !== null && selectedAnswer !== undefined;
  if (isAnswered) {
    const optionCount = quizQuestions[currentIndex!].options.length;
    if (!Number.isInteger(selectedAnswer) || selectedAnswer! < 0 || selectedAnswer! >= optionCount) {
      return false;
    }
  }

  const expectedAnswerCount = isAnswered ? currentIndex! + 1 : currentIndex!;
  return answers.length === expectedAnswerCount;
}

/** Reads and validates the saved snapshot, discarding anything malformed. */
function readSavedProgress(): PersistedQuizProgress | null {
  const saved = safeSession.getJSON<unknown>(QUIZ_PROGRESS_KEY);
  if (saved === null) return null;

  if (!isValidProgress(saved)) {
    console.warn('[quiz] Discarding malformed saved progress.');
    safeSession.remove(QUIZ_PROGRESS_KEY);
    return null;
  }

  return saved;
}

/** Rebuilds full responses from the stored answer indices. */
function hydrateResponses(answers: number[]): QuizResponse[] {
  return answers.map((selectedAnswer, index) => {
    const question = quizQuestions[index];
    return {
      question,
      selectedAnswer,
      isCorrect: selectedAnswer === question.answer,
    };
  });
}

export function useQuizChallenge() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  /**
   * The snapshot found at mount, captured once (FR-STO-005).
   *
   * Read via lazy initialiser so it reflects the state of storage *before* this
   * hook writes anything — reading it later would return our own pristine
   * write-through and the resume offer would never appear.
   */
  const [savedProgress, setSavedProgress] = useState<PersistedQuizProgress | null>(
    readSavedProgress,
  );

  const currentQuestion = quizQuestions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const score = responses.filter((response) => response.isCorrect).length;
  const totalQuestions = TOTAL_QUESTIONS;
  const questionNumber = currentIndex + 1;
  const progress = (questionNumber / totalQuestions) * 100;

  /** True when a resumable snapshot exists and the visitor has not acted on it. */
  const canResume = savedProgress !== null && responses.length === 0 && currentIndex === 0;

  /**
   * Mirrors live state into sessionStorage (FR-STO-005) and clears it on
   * completion (FR-STO-006).
   *
   * A pristine quiz is never written: doing so would leave a zero-progress
   * snapshot behind and offer "resume" to someone who has answered nothing.
   * That `isPristine` guard is also what makes the restart and discard paths
   * safe — both reset state to pristine, so the effect declines to re-write the
   * key they just removed. An explicit suppression flag was tried here and
   * removed: `discardSavedProgress` changes no dependency of this effect, so
   * the flag stayed armed and swallowed the *next* real answer instead.
   */
  useEffect(() => {
    if (isComplete) {
      safeSession.remove(QUIZ_PROGRESS_KEY);
      return;
    }

    const isPristine = responses.length === 0 && currentIndex === 0 && selectedAnswer === null;
    if (isPristine) return;

    const snapshot: PersistedQuizProgress = {
      currentIndex,
      selectedAnswer,
      answers: responses.map((response) => response.selectedAnswer),
      savedAt: Date.now(),
    };

    safeSession.setJSON(QUIZ_PROGRESS_KEY, snapshot);
  }, [currentIndex, selectedAnswer, responses, isComplete]);

  const selectAnswer = (answer: number) => {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer(answer);
    setResponses((currentResponses) => [
      ...currentResponses,
      {
        question: currentQuestion,
        selectedAnswer: answer,
        isCorrect: answer === currentQuestion.answer,
      },
    ]);
  };

  const nextQuestion = () => {
    if (!isAnswered) {
      return;
    }

    if (currentIndex === totalQuestions - 1) {
      setIsComplete(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(null);
  };

  /** Restores the saved snapshot into live state (FR-STO-005). */
  const resumeQuiz = useCallback(() => {
    if (savedProgress === null) return;

    setCurrentIndex(savedProgress.currentIndex);
    setSelectedAnswer(savedProgress.selectedAnswer);
    setResponses(hydrateResponses(savedProgress.answers));
    setIsComplete(false);
    setSavedProgress(null);
  }, [savedProgress]);

  /** Dismisses the resume offer and drops the snapshot. */
  const discardSavedProgress = useCallback(() => {
    safeSession.remove(QUIZ_PROGRESS_KEY);
    setSavedProgress(null);
  }, []);

  /** Returns to a pristine quiz and clears persisted progress (FR-STO-006). */
  const restartQuiz = useCallback(() => {
    safeSession.remove(QUIZ_PROGRESS_KEY);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setResponses([]);
    setIsComplete(false);
    setSavedProgress(null);
  }, []);

  const difficultyScores = useMemo(
    () =>
      (['Easy', 'Medium', 'Hard'] as QuizDifficulty[]).map((difficulty) => {
        const questions = quizQuestions.filter((question) => question.difficulty === difficulty);

        return {
          difficulty,
          total: questions.length,
          correct: responses.filter(
            (response) => response.question.difficulty === difficulty && response.isCorrect,
          ).length,
        };
      }),
    [responses],
  );

  return {
    currentQuestion,
    questionNumber,
    totalQuestions,
    progress,
    selectedAnswer,
    isAnswered,
    isComplete,
    score,
    responses,
    difficultyScores,
    selectAnswer,
    nextQuestion,
    restartQuiz,
    canResume,
    savedQuestionNumber: savedProgress ? savedProgress.currentIndex + 1 : null,
    resumeQuiz,
    discardSavedProgress,
  };
}
