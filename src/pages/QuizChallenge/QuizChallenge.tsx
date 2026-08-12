import { Link } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import SocialShare from '../../components/SocialShare/SocialShare';
import { useQuizChallenge } from '../../hooks/useQuizChallenge';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import styles from './QuizChallenge.module.css';

/**
 * High-End Visual Design Quiz & Challenge component for Green Tech Club.
 * Provides interactive renewable-energy quizzes, immediate feedback,
 * and comprehensive result analytics wrapped in double-bezel architecture.
 */
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
  const navHidden = useHideOnScroll(140);

  const navBar = (
    <div
      className={navHidden ? `${styles.headerBar} ${styles.headerBarHidden}` : styles.headerBar}
      data-hidden={navHidden || undefined}
    >
      <HudHeader variant="static" />
    </div>
  );

  if (isComplete) {
    return (
      <main className={styles.page}>
        <div className={styles.ambientGlow} aria-hidden="true" />
        {navBar}

        <div className={styles.container}>
          <section className={styles.resultShell} aria-labelledby="quiz-result-title">
            <div className={styles.resultCore}>
              <div className={styles.resultHeader}>
                <div className={styles.eyebrowTag}>
                  <span>Challenge Complete</span>
                </div>
                <h1 id="quiz-result-title" className={styles.title}>
                  Your Green Tech <span className={styles.titleHighlight}>Knowledge Score</span>
                </h1>
                <div className={styles.scoreHero}>
                  {score}
                  <span className={styles.scoreDenom}> / {totalQuestions}</span>
                </div>
                <p className={styles.resultMessage}>
                  {score >= 8
                    ? 'Excellent work. You understand both renewable-energy fundamentals and complex systems-level architecture.'
                    : score >= 5
                    ? 'Solid foundation. Review the explanations below to strengthen your understanding of missed topics.'
                    : 'A valuable first attempt. Read through each explanation below and take the challenge again to master green tech principles.'}
                </p>
              </div>

              {/* Difficulty Breakdown Grid */}
              <div className={styles.scoreGrid} aria-label="Scores by difficulty">
                {difficultyScores.map((item) => (
                  <div className={styles.scoreCardShell} key={item.difficulty}>
                    <div className={styles.scoreCardCore}>
                      <span className={styles.scoreCardLabel}>{item.difficulty}</span>
                      <strong className={styles.scoreCardVal}>
                        {item.correct} / {item.total}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Question Review List */}
              <div className={styles.reviewList}>
                {responses.map((response, index) => (
                  <article className={styles.reviewItemShell} key={response.question.id}>
                    <div className={styles.reviewHeading}>
                      <span>Question {index + 1}</span>
                      <strong
                        className={
                          response.isCorrect ? styles.correctText : styles.incorrectText
                        }
                      >
                        {response.isCorrect ? 'Correct' : 'Incorrect'}
                      </strong>
                    </div>
                    <p className={styles.reviewPrompt}>{response.question.prompt}</p>
                    {!response.isCorrect && (
                      <p className={styles.correctAnswerText}>
                        Correct answer: {response.question.options[response.question.answer]}
                      </p>
                    )}
                    <p className={styles.reviewExplanation}>{response.question.explanation}</p>
                  </article>
                ))}
              </div>

              {/* Result Actions */}
              <div className={styles.resultActions}>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={restartQuiz}
                >
                  <span>Try again</span>
                  <div className={styles.btnIconWrapper}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
                <Link className={styles.ghostLink} to="/explore">
                  Back to Explore
                </Link>
              </div>

              {/* Sharing a score is the one moment in the site with genuine
                  social intent, so the plugins live here rather than being
                  scattered across every page (FR-SOC-003). */}
              <SocialShare
                label="Share your score"
                title={`I scored ${score}/${totalQuestions} on the RE:FUTURE green tech challenge!`}
              />
            </div>
          </section>
        </div>
      </main>
    );
  }

  const selectedIsCorrect = selectedAnswer === currentQuestion.answer;

  const diffStyle =
    currentQuestion.difficulty === 'Easy'
      ? styles.diffEasy
      : currentQuestion.difficulty === 'Medium'
      ? styles.diffMedium
      : styles.diffHard;

  return (
    <main className={styles.page}>
      <div className={styles.ambientGlow} aria-hidden="true" />
      {navBar}

      <div className={styles.container}>
        {/* RESUME OFFER — shown when sessionStorage holds unfinished progress
            from this tab (FR-STO-005). Resuming is opt-in: silently restoring
            would strand anyone who deliberately wanted a clean run. */}
        {canResume && (
          <div className={styles.resumeBar} role="status">
            <div className={styles.resumeCopy}>
              <strong className={styles.resumeTitle}>Unfinished attempt found</strong>
              <span className={styles.resumeText}>
                You stopped at question {savedQuestionNumber} of {totalQuestions} in this tab.
              </span>
            </div>
            <div className={styles.resumeActions}>
              <button type="button" className={styles.resumeDismiss} onClick={discardSavedProgress}>
                Start over
              </button>
              <button type="button" className={styles.resumeConfirm} onClick={resumeQuiz}>
                Resume
              </button>
            </div>
          </div>
        )}

        {/* PROGRESS METRIC BAR */}
        <div className={styles.progressMeta}>
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className={styles.progressScore}>{score} correct</span>
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

        {/* QUESTION CARD (DOUBLE-BEZEL) */}
        <section className={styles.questionShell} aria-labelledby="question-prompt">
          <div className={styles.questionCore}>
            <div className={styles.questionMeta}>
              <span className={`${styles.difficultyPill} ${diffStyle}`}>
                {currentQuestion.difficulty}
              </span>
              <span className={styles.topicTag}>{currentQuestion.topic}</span>
            </div>

            <h2 id="question-prompt" className={styles.questionPrompt}>
              {currentQuestion.prompt}
            </h2>

            {/* OPTION GRID */}
            <div className={styles.optionGrid}>
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;
                const isCorrectOption = isAnswered && optionIndex === currentQuestion.answer;
                const isWrongSelection = isAnswered && isSelected && !isCorrectOption;

                return (
                  <div key={option} className={styles.optionShell}>
                    <button
                      className={[
                        styles.optionButton,
                        isSelected ? styles.selectedOption : '',
                        isCorrectOption ? styles.correctOption : '',
                        isWrongSelection ? styles.incorrectOption : '',
                      ].join(' ')}
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
                  </div>
                );
              })}
            </div>

            {/* FEEDBACK EXPLANATION BLOCK */}
            {isAnswered && (
              <div
                className={[
                  styles.feedbackBlock,
                  selectedIsCorrect ? styles.correctFeedback : styles.incorrectFeedback,
                ].join(' ')}
                role="status"
              >
                <div className={styles.feedbackTitle}>
                  {selectedIsCorrect ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span>{selectedIsCorrect ? 'Correct.' : 'Not quite.'}</span>
                </div>
                {!selectedIsCorrect && (
                  <p className={styles.feedbackText} style={{ marginBottom: '0.4rem', fontWeight: 600 }}>
                    The correct answer is{' '}
                    <strong>{currentQuestion.options[currentQuestion.answer]}</strong>.
                  </p>
                )}
                <p className={styles.feedbackText}>{currentQuestion.explanation}</p>
              </div>
            )}

            {/* CARD FOOTER CTA */}
            <div className={styles.cardFooter}>
              <span className={styles.helperText}>
                {isAnswered ? 'Read the explanation before continuing.' : 'Choose one answer.'}
              </span>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={nextQuestion}
                disabled={!isAnswered}
              >
                <span>{questionNumber === totalQuestions ? 'See results' : 'Next question'}</span>
                <div className={styles.btnIconWrapper}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default QuizChallenge;
