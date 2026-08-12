import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { quizQuestions } from '../utils/quizQuestions';
import { QUIZ_PROGRESS_KEY } from '../utils/storageKeys';
import { useQuizChallenge } from './useQuizChallenge';

type Quiz = ReturnType<typeof useQuizChallenge>;

/** Answers the current question correctly and advances past it. */
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

    // A zero-progress snapshot would offer "resume" to someone who has not
    // answered a single question.
    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();
  });

  it('FR-STO-005: writes a snapshot as soon as an answer is submitted', () => {
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

  it('AC-STO-005: offers resume on remount and restores index 2 with both responses', () => {
    const first = renderHook(() => useQuizChallenge());

    answerCurrentAndAdvance(first.result);
    answerCurrentAndAdvance(first.result);

    expect(first.result.current.questionNumber).toBe(3);
    first.unmount();

    // Fresh mount — as if the tab were refreshed mid-quiz.
    const { result } = renderHook(() => useQuizChallenge());

    expect(result.current.canResume).toBe(true);
    expect(result.current.savedQuestionNumber).toBe(3);
    // Not restored until the visitor asks for it.
    expect(result.current.questionNumber).toBe(1);

    act(() => result.current.resumeQuiz());

    expect(result.current.questionNumber).toBe(3);
    expect(result.current.responses).toHaveLength(2);
    expect(result.current.score).toBe(2);
    expect(result.current.canResume).toBe(false);
  });

  it('rebuilds correctness from stored answers, including wrong ones', () => {
    const first = renderHook(() => useQuizChallenge());

    // Deliberately wrong: any option index that is not the answer.
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

  it('AC-STO-006: clears the snapshot when the quiz completes', () => {
    const { result } = renderHook(() => useQuizChallenge());

    for (let i = 0; i < quizQuestions.length; i += 1) {
      answerCurrentAndAdvance(result);
    }

    expect(result.current.isComplete).toBe(true);
    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();
  });

  it('AC-STO-006: clears the snapshot on restart', () => {
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

  /**
   * Regression — SEC-M1-STORAGE-001, "Armed suppression flag silently drops the
   * first answer after Start over".
   *
   * A one-shot ref used to gate this effect. `discardSavedProgress` changes no
   * dependency of that effect, so the flag stayed armed and swallowed the next
   * genuine answer instead of the intended no-op write.
   */
  it('persists the first answer submitted after the visitor chooses Start over', () => {
    const first = renderHook(() => useQuizChallenge());
    answerCurrentAndAdvance(first.result);
    first.unmount();

    const { result } = renderHook(() => useQuizChallenge());
    expect(result.current.canResume).toBe(true);

    act(() => result.current.discardSavedProgress());
    act(() => result.current.selectAnswer(result.current.currentQuestion.answer));

    // FR-STO-005: an answer submission must always be persisted.
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

  it('discards a tampered snapshot instead of trusting it', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // answers.length disagrees with currentIndex — an impossible state.
    sessionStorage.setItem(
      QUIZ_PROGRESS_KEY,
      JSON.stringify({ currentIndex: 5, selectedAnswer: null, answers: [0], savedAt: Date.now() }),
    );

    const { result } = renderHook(() => useQuizChallenge());

    expect(result.current.canResume).toBe(false);
    expect(sessionStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();
  });

  it('discards a snapshot whose index is out of range', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    sessionStorage.setItem(
      QUIZ_PROGRESS_KEY,
      JSON.stringify({
        currentIndex: 999,
        selectedAnswer: null,
        answers: [],
        savedAt: Date.now(),
      }),
    );

    const { result } = renderHook(() => useQuizChallenge());

    expect(result.current.canResume).toBe(false);
  });
});
