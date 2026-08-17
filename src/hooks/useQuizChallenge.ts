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
 * Shape of what we save to sessionStorage.
 * Only answer indices are stored, not full question objects.
 */
type PersistedQuizProgress = {
  currentIndex: number;
  selectedAnswer: number | null;
  answers: number[];
  savedAt: number;
};

const TOTAL_QUESTIONS = quizQuestions.length;

/** Validates saved progress before using it. */
function isValidProgress(value: unknown): value is PersistedQuizProgress {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<PersistedQuizProgress>;
  const { currentIndex, selectedAnswer, answers } = candidate;

  if (!Number.isInteger(currentIndex) || currentIndex! < 0 || currentIndex! >= TOTAL_QUESTIONS) {
    return false;
  }

  if (!Array.isArray(answers) || answers.length > TOTAL_QUESTIONS) return false;

  // Check each answer is within range for its question
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

/** Reads saved quiz progress from sessionStorage. */
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

/** Rebuilds full responses from stored answer indices. */
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

  /** Saved progress found on mount, if any. */
  const [savedProgress, setSavedProgress] = useState<PersistedQuizProgress | null>(
    readSavedProgress,
  );

  const currentQuestion = quizQuestions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const score = responses.filter((response) => response.isCorrect).length;
  const totalQuestions = TOTAL_QUESTIONS;
  const questionNumber = currentIndex + 1;
  const progress = (questionNumber / totalQuestions) * 100;

  /** True when saved progress exists and the user hasn't acted on it yet. */
  const canResume = savedProgress !== null && responses.length === 0 && currentIndex === 0;

  /** Save progress to sessionStorage whenever it changes. */
  useEffect(() => {
    if (isComplete) {
      safeSession.remove(QUIZ_PROGRESS_KEY);
      return;
    }

    // Don't save a pristine quiz (no answers yet)
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

  /** Restores saved progress into the quiz state. */
  const resumeQuiz = useCallback(() => {
    if (savedProgress === null) return;

    setCurrentIndex(savedProgress.currentIndex);
    setSelectedAnswer(savedProgress.selectedAnswer);
    setResponses(hydrateResponses(savedProgress.answers));
    setIsComplete(false);
    setSavedProgress(null);
  }, [savedProgress]);

  /** Dismisses the resume offer and deletes saved progress. */
  const discardSavedProgress = useCallback(() => {
    safeSession.remove(QUIZ_PROGRESS_KEY);
    setSavedProgress(null);
  }, []);

  /** Resets the quiz to the beginning. */
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
