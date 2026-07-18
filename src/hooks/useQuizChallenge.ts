import { useMemo, useState } from 'react';
import { quizQuestions, type QuizDifficulty, type QuizQuestion } from '../utils/quizQuestions';

export type QuizResponse = {
  question: QuizQuestion;
  selectedAnswer: number;
  isCorrect: boolean;
};

export function useQuizChallenge() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const score = responses.filter((response) => response.isCorrect).length;
  const totalQuestions = quizQuestions.length;
  const questionNumber = currentIndex + 1;
  const progress = (questionNumber / totalQuestions) * 100;

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

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setResponses([]);
    setIsComplete(false);
  };

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
  };
}
