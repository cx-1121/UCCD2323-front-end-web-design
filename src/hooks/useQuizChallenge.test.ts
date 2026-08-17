import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { quizQuestions } from '../utils/quizQuestions';
import { QUIZ_PROGRESS_KEY } from '../utils/storageKeys';
import { useQuizChallenge } from './useQuizChallenge';

type Quiz = ReturnType<typeof useQuizChallenge>;

/** Answers the current question correctly and advances. */
function answerCurrentAndAdvance(result: { current: Quiz }): void {
  act(() => result.current.selectAnswer(result.current.currentQuestion.answer));
  act(() => result.current.nextQuestion());
}

describe('useQuizChallenge — sessionStorage persistence', () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('does not persist anything for a pristine quiz', () => {
    renderHook(() => useQuizChallenge());

    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();
  });

  it('writes a snapshot as soon as an answer is submitted', () => {
    const { result } = renderHook(() => useQuizChallenge());

    act(() => result.current.selectAnswer(quizQuestions[0].answer));

    const raw = sessionStorage.getItem(QUIZ_PROGRESS_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toMatchObject({
      currentIndex: 0,
      selectedAnswer: quizQuestions[0].answer,
      answers: [quizQuestions[0].answer],
    });
  });

  it('offers resume on remount and restores progress correctly', () => {
    const first = renderHook(() => useQuizChallenge());

    answerCurrentAndAdvance(first.result);
    answerCurrentAndAdvance(first.result);

    expect(first.result.current.questionNumber).toBe(3);
    first.unmount();

    // Fresh mount — like a page refresh mid-quiz
    const { result } = renderHook(() => useQuizChallenge());

    expect(result.current.canResume).toBe(true);
    expect(result.current.savedQuestionNumber).toBe(3);
    expect(result.current.questionNumber).toBe(1);

    act(() => result.current.resumeQuiz());

    expect(result.current.questionNumber).toBe(3);
    expect(result.current.responses).toHaveLength(2);
    expect(result.current.score).toBe(2);
    expect(result.current.canResume).toBe(false);
  });

  it('rebuilds correctness from stored answers, including wrong ones', () => {
    const first = renderHook(() => useQuizChallenge());

    const wrong = (quizQuestions[0].answer + 1) % quizQuestions[0].options.length;
    act(() => first.result.current.selectAnswer(wrong));
    act(() => first.result.current.nextQuestion());
    first.unmount();

    const { result } = renderHook(() => useQuizChallenge());
    act(() => result.current.resumeQuiz());

    expect(result.current.responses).toHaveLength(1);
    expect(result.current.responses[0].isCorrect).toBe(false);
    expect(result.current.score).toBe(0);
  });

  it('clears the snapshot when the quiz completes', () => {
    const { result } = renderHook(() => useQuizChallenge());

    for (let i = 0; i < quizQuestions.length; i += 1) {
      answerCurrentAndAdvance(result);
    }

    expect(result.current.isComplete).toBe(true);
    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();
  });

  it('clears the snapshot on restart', () => {
    const { result } = renderHook(() => useQuizChallenge());

    answerCurrentAndAdvance(result);
    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).not.toBeNull();

    act(() => result.current.restartQuiz());

    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();
    expect(result.current.questionNumber).toBe(1);
    expect(result.current.responses).toHaveLength(0);
  });

  it('drops the snapshot when the visitor chooses to start over', () => {
    const first = renderHook(() => useQuizChallenge());
    answerCurrentAndAdvance(first.result);
    first.unmount();

    const { result } = renderHook(() => useQuizChallenge());
    expect(result.current.canResume).toBe(true);

    act(() => result.current.discardSavedProgress());

    expect(result.current.canResume).toBe(false);
    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();
  });

  it('persists the first answer submitted after choosing Start over', () => {
    const first = renderHook(() => useQuizChallenge());
    answerCurrentAndAdvance(first.result);
    first.unmount();

    const { result } = renderHook(() => useQuizChallenge());
    expect(result.current.canResume).toBe(true);

    act(() => result.current.discardSavedProgress());
    act(() => result.current.selectAnswer(result.current.currentQuestion.answer));

    const raw = sessionStorage.getItem(QUIZ_PROGRESS_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).answers).toHaveLength(1);
  });

  it('persists normally after a restart from the results screen', () => {
    const { result } = renderHook(() => useQuizChallenge());

    for (let i = 0; i < quizQuestions.length; i += 1) {
      answerCurrentAndAdvance(result);
    }
    expect(result.current.isComplete).toBe(true);

    act(() => result.current.restartQuiz());
    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();

    act(() => result.current.selectAnswer(quizQuestions[0].answer));
    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).not.toBeNull();
  });
});
