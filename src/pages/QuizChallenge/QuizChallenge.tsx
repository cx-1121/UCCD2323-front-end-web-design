import { useEffect, useRef } from 'react';
import HudHeader from '../../components/HudHeader/HudHeader';
import SocialShare from '../../components/SocialShare/SocialShare';
import {
  Action,
  Bench,
  Chapter,
  Instrument,
  Prose,
  Sheet,
  SheetHead,
  Stamp,
  Stamped,
} from '../../components/accession/Accession';
import WorldScene from '../../components/accession/WorldScene';
import { ReplayGlyph } from '../../components/icons';
import { useQuizChallenge } from '../../hooks/useQuizChallenge';
import styles from './QuizChallenge.module.css';

/**
 * QUIZ — the world you are raising.
 *
 * The brief for this page was that it must not look like an exam, and that
 * getting things right should turn a dead world green. Both are the same
 * instruction, so the score is not a number in a corner here: it drives the
 * page's position on the ladder.
 *
 * Every correct answer climbs a rung — soot, haze, firstlight, daylight, sky,
 * living — and the ground, the ink and the specimen beside the question all
 * change together over `--turn-ms`. Answering well is literally what takes the
 * reader out of the smoke, which is the same journey the whole site makes.
 *
 * Product logic is untouched: `useQuizChallenge` still owns questions,
 * scoring, persistence and resume. This file is presentation only.
 */

/**
 * Where the page stands, by score. Six rungs over ten questions, so a single
 * correct answer is often visible immediately and never more than two away
 * from moving the world.
 */
const RUNGS = ['soot', 'haze', 'firstlight', 'daylight', 'sky', 'living'] as const;

function rungFor(score: number, total: number) {
  if (total <= 0) return RUNGS[0];
  const index = Math.floor((score / total) * RUNGS.length);
  return RUNGS[Math.min(RUNGS.length - 1, index)];
}

function QuizChallenge() {
  const {
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
    savedQuestionNumber,
    resumeQuiz,
    discardSavedProgress,
  } = useQuizChallenge();

  const stop = rungFor(score, totalQuestions);
  const growth = totalQuestions > 0 ? score / totalQuestions : 0;

  /**
   * Return to the top when the question changes or the run ends.
   *
   * "Next question" sits at the bottom of the run, so without this the reader
   * is left scrolled past the world they just changed — the reward for
   * answering correctly was rendering above the viewport, which is the one
   * thing this page must never hide. The first render is skipped so ordinary
   * scroll restoration still works when arriving by back or forward.
   */
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, [questionNumber, isComplete]);

  /* ── Result ─────────────────────────────────────────────────────────── */

  if (isComplete) {
    return (
      <main className={styles.page} data-nav-stop={stop}>
        <HudHeader />

        <Chapter stop={stop} aria-label="Your result" className={styles.resultChapter}>
          <Bench className={styles.resultStack}>
            <div className={styles.determination}>
              <Sheet live className={styles.resultSheet}>
                <SheetHead of="Green Tech Club · Determination" no={`GTC·${1900 + score}`} />

                <div className={styles.resultWorld}>
                  <WorldScene growth={growth} />
                </div>

                <Stamp pressed top="18%" living={score >= 8}>
                  {score >= 8 ? 'Determined' : score >= 5 ? 'Re-examine' : 'Unresolved'}
                </Stamp>

                <p className={styles.resultScore} data-figure>
                  {score}
                  <span className={styles.resultDenom}>/ {totalQuestions}</span>
                </p>
                <Instrument onObject>Answers correct</Instrument>
              </Sheet>

              <div className={styles.resultCopy}>
                <Instrument ruled>Result</Instrument>
                <Stamped as="h1" scale="section">
                  {score >= 8
                    ? 'You know how this works'
                    : score >= 5
                      ? 'A solid foundation'
                      : 'Worth another run'}
                </Stamped>
                <Prose>
                  {score >= 8
                    ? 'Excellent work. You understand both renewable-energy fundamentals and complex systems-level architecture.'
                    : score >= 5
                      ? 'Solid foundation. Review the explanations below to strengthen your understanding of missed topics.'
                      : 'A valuable first attempt. Read through each explanation below and take the challenge again to master green tech principles.'}
                </Prose>

                {/* Ruled columns, not score cards: three numbers do not each
                    need a container to be read as three numbers. */}
                <div className={styles.byDifficulty} aria-label="Scores by difficulty">
                  {difficultyScores.map((item) => (
                    <div className={styles.difficultyRow} key={item.difficulty}>
                      <span className={styles.difficultyLabel}>{item.difficulty}</span>
                      <span className={styles.difficultyValue} data-figure>
                        {item.correct} / {item.total}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.resultActions}>
                  <Action onClick={restartQuiz} icon={<ReplayGlyph />}>
                    Try again
                  </Action>
                  <Action to="/explore" ghost>
                    Back to Explore
                  </Action>
                </div>
              </div>
            </div>

            {/* Review. One ruled entry per question — the old version wrapped
                each in its own panel, ten containers for ten paragraphs. */}
            <section className={styles.review}>
              <Instrument ruled>Every question, reviewed</Instrument>

              <ol className={styles.reviewList}>
                {responses.map((response, index) => (
                  <li className={styles.reviewItem} key={response.question.id}>
                    <p className={styles.reviewMeta}>
                      <span>Question {index + 1}</span>
                      <strong
                        className={
                          response.isCorrect ? styles.correctText : styles.incorrectText
                        }
                      >
                        {response.isCorrect ? 'Correct' : 'Incorrect'}
                      </strong>
                    </p>
                    <p className={styles.reviewPrompt}>{response.question.prompt}</p>
                    {!response.isCorrect && (
                      <p className={styles.correctAnswerText}>
                        Correct answer: {response.question.options[response.question.answer]}
                      </p>
                    )}
                    <p className={styles.reviewExplanation}>{response.question.explanation}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Sharing a score is the one moment in the site with genuine
                social intent, so the plugins live here rather than being
                scattered across every page (FR-SOC-003). */}
            <SocialShare
              label="Share your score"
              title={`I scored ${score}/${totalQuestions} on the RE:FUTURE green tech challenge!`}
            />
          </Bench>
        </Chapter>
      </main>
    );
  }

  /* ── Question ───────────────────────────────────────────────────────── */

  const selectedIsCorrect = selectedAnswer === currentQuestion.answer;

  return (
    <main className={styles.page} data-nav-stop={stop}>
      <HudHeader />

      <Chapter stop={stop} aria-label="Green tech challenge" className={styles.runChapter}>
        <Bench className={styles.run}>
          {/* RESUME OFFER — shown when sessionStorage holds unfinished progress
              from this tab (FR-STO-005). Resuming is opt-in: silently restoring
              would strand anyone who deliberately wanted a clean run. */}
          {canResume && (
            <div className={styles.resume} role="status">
              <p className={styles.resumeCopy}>
                <strong>Unfinished attempt found.</strong> You stopped at question{' '}
                {savedQuestionNumber} of {totalQuestions} in this tab.
              </p>
              <div className={styles.resumeActions}>
                <button type="button" className={styles.textButton} onClick={discardSavedProgress}>
                  Start over
                </button>
                <button type="button" className={styles.textButton} onClick={resumeQuiz}>
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* ---- The world, and the reader's standing in it ---- */}
          <aside className={styles.world}>
            <WorldScene growth={growth} />

            <div className={styles.standing}>
              <Instrument ruled>The world you are raising</Instrument>
              <p className={styles.standingScore} data-figure>
                {score}
                <span className={styles.standingDenom}>/ {totalQuestions}</span>
              </p>
              <p className={styles.standingNote}>
                {score === 0
                  ? 'Nothing is growing yet. Every right answer changes that.'
                  : score === totalQuestions
                    ? 'Everything that could grow, grew.'
                    : 'It greens as you get them right.'}
              </p>
            </div>
          </aside>

          {/* ---- The question ---- */}
          <section className={styles.question} aria-labelledby="question-prompt">
            <div className={styles.questionMeta}>
              <span>
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className={styles.questionTags}>
                {currentQuestion.difficulty} · {currentQuestion.topic}
              </span>
            </div>

            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Quiz progress"
              aria-valuemin={1}
              aria-valuemax={totalQuestions}
              aria-valuenow={questionNumber}
            >
              <span className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <Stamped as="h2" scale="section" id="question-prompt" className={styles.prompt}>
              {currentQuestion.prompt}
            </Stamped>

            {/* Options as a filing run: full-width rows opened one at a time,
                not a grid of four boxes. */}
            <ul className={styles.options}>
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;
                const isCorrectOption = isAnswered && optionIndex === currentQuestion.answer;
                const isWrongSelection = isAnswered && isSelected && !isCorrectOption;

                return (
                  <li key={option}>
                    <button
                      className={[
                        styles.option,
                        isSelected ? styles.optionSelected : '',
                        isCorrectOption ? styles.optionCorrect : '',
                        isWrongSelection ? styles.optionWrong : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      type="button"
                      onClick={() => selectAnswer(optionIndex)}
                      disabled={isAnswered}
                      aria-pressed={isSelected}
                    >
                      <span className={styles.optionLetter}>
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{option}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {isAnswered && (
              <div
                className={[
                  styles.feedback,
                  selectedIsCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
                ].join(' ')}
                role="status"
              >
                <p className={styles.feedbackTitle}>
                  <span>{selectedIsCorrect ? 'Correct.' : 'Not quite.'}</span>
                </p>
                {!selectedIsCorrect && (
                  <p className={styles.feedbackAnswer}>
                    The correct answer is{' '}
                    <strong>{currentQuestion.options[currentQuestion.answer]}</strong>.
                  </p>
                )}
                <p className={styles.feedbackText}>{currentQuestion.explanation}</p>
              </div>
            )}

            <div className={styles.runFooter}>
              <Instrument>
                {isAnswered ? 'Read the explanation before continuing.' : 'Choose one answer.'}
              </Instrument>
              {isAnswered && (
                <Action onClick={nextQuestion}>
                  {questionNumber === totalQuestions ? 'See results' : 'Next question'}
                </Action>
              )}
            </div>
          </section>
        </Bench>
      </Chapter>
    </main>
  );
}

export default QuizChallenge;
