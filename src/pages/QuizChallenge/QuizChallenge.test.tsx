import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import QuizChallenge from './QuizChallenge';

/**
 * QuizChallenge renders HudHeader, whose nav became real <NavLink> routing
 * rather than `href="#"` placeholders, so it now needs router context. Render
 * through this helper rather than calling render(<QuizChallenge />) directly.
 */
const renderQuiz = () =>
  render(
    <MemoryRouter>
      <QuizChallenge />
    </MemoryRouter>,
  );

describe('QuizChallenge', () => {
  it('shows one question at a time and explains a correct answer', async () => {
    const user = userEvent.setup();

    renderQuiz();

    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Which technology converts sunlight directly into electricity?',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Solar photovoltaic panels/i }));

    expect(screen.getByText('Correct.')).toBeInTheDocument();
    expect(screen.getByText(/Photovoltaic cells use semiconductor materials/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next question' }));

    expect(screen.getByText('Question 2 of 10')).toBeInTheDocument();
  });

  it('shows the correct answer after an incorrect choice', async () => {
    const user = userEvent.setup();

    renderQuiz();

    await user.click(screen.getByRole('button', { name: /Wind turbines/i }));

    expect(screen.getByText('Not quite.')).toBeInTheDocument();
    expect(screen.getAllByText('Solar photovoltaic panels')).toHaveLength(2);
  });
});
