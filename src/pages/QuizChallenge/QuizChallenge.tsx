import HudHeader from '../../components/HudHeader/HudHeader';
import styles from './QuizChallenge.module.css';
import { useQuizChallenge } from '../../hooks/useQuizChallenge';

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
  } = useQuizChallenge();

  if (isComplete) {
    return (
      <main className={styles.page}>
        <div className={styles.ambientGlow} aria-hidden="true" />
        <section className={styles.resultPanel} aria-labelledby="quiz-result-title">
          <p className={styles.eyebrow}>Challenge complete</p>
          <h1 id="quiz-result-title">Your green knowledge score</h1>
          <p className={styles.finalScore}>
            {score}
            <span> / {totalQuestions}</span>
          </p>
          <p className={styles.resultMessage}>
            {score >= 8
              ? 'Excellent work. You understand both renewable-energy fundamentals and the harder systems-level ideas.'
              : score >= 5
                ? 'Good foundation. Review the explanations below to strengthen the topics you missed.'
                : 'A useful first attempt. Read each explanation, then try the challenge again.'}
          </p>

          <div className={styles.scoreGrid} aria-label="Scores by difficulty">
            {difficultyScores.map((item) => (
              <div className={styles.scoreCard} key={item.difficulty}>
                <span>{item.difficulty}</span>
                <strong>
                  {item.correct} / {item.total}
                </strong>
              </div>
            ))}
          </div>

          <div className={styles.reviewList}>
            {responses.map((response, index) => (
              <article className={styles.reviewItem} key={response.question.id}>
                <div className={styles.reviewHeading}>
                  <span>Question {index + 1}</span>
                  <strong
                    className={response.isCorrect ? styles.correctText : styles.incorrectText}
                  >
                    {response.isCorrect ? 'Correct' : 'Incorrect'}
                  </strong>
                </div>
                <p>{response.question.prompt}</p>
                {!response.isCorrect && (
                  <p className={styles.correctAnswer}>
                    Correct answer: {response.question.options[response.question.answer]}
                  </p>
                )}
                <p className={styles.reviewExplanation}>{response.question.explanation}</p>
              </article>
            ))}
          </div>

          <button className={styles.primaryButton} type="button" onClick={restartQuiz}>
            Try again
          </button>
          <a className={styles.textLink} href="/">
            Back to RE:FUTURE
          </a>
        </section>
      </main>
    );
  }

  const selectedIsCorrect = selectedAnswer === currentQuestion.answer;

  return (
    <main className={styles.page}>
      <div className={styles.ambientGlow} aria-hidden="true" />

      <HudHeader />
      <header className={styles.header}>
        <span className={styles.headerLabel}>Quiz &amp; Challenge</span>
      </header>

      <section className={styles.quizShell} aria-labelledby="quiz-title">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Learn by participating</p>
          <h1 id="quiz-title">How green is your knowledge?</h1>
          <p>
            Ten questions move from everyday energy choices to the systems that power a sustainable
            future.
          </p>
        </div>

        <div className={styles.progressMeta}>
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>
          <span>{score} correct</span>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-valuenow={questionNumber}
        >
          <span className={styles.progressFill} style={{ width: progress + '%' }} />
        </div>

        <article className={styles.questionCard}>
          <div className={styles.questionMeta}>
            <span className={styles.difficulty}>{currentQuestion.difficulty}</span>
            <span>{currentQuestion.topic}</span>
          </div>

          <h2>{currentQuestion.prompt}</h2>

          <div className={styles.optionGrid}>
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedAnswer === optionIndex;
              const isCorrectOption = isAnswered && optionIndex === currentQuestion.answer;
              const isWrongSelection = isAnswered && isSelected && !isCorrectOption;

              return (
                <button
                  className={[
                    styles.optionButton,
                    isSelected ? styles.selectedOption : '',
                    isCorrectOption ? styles.correctOption : '',
                    isWrongSelection ? styles.incorrectOption : '',
                  ].join(' ')}
                  type="button"
                  key={option}
                  onClick={() => selectAnswer(optionIndex)}
                  disabled={isAnswered}
                  aria-pressed={isSelected}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div
              className={[
                styles.feedback,
                selectedIsCorrect ? styles.correctFeedback : styles.incorrectFeedback,
              ].join(' ')}
              role="status"
            >
              <strong>{selectedIsCorrect ? 'Correct.' : 'Not quite.'}</strong>
              {!selectedIsCorrect && (
                <p>
                  The correct answer is{' '}
                  <strong>{currentQuestion.options[currentQuestion.answer]}</strong>.
                </p>
              )}
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

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
              {questionNumber === totalQuestions ? 'See results' : 'Next question'}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

export default QuizChallenge;
