import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, afterEach } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import ProjectsPage from './ProjectsPage';

afterEach(() => {
  cleanup();
});

// The detail modal now contains SocialShare, which requires ConsentProvider.
const renderProjects = () => renderWithProviders(<ProjectsPage />);

describe('ProjectsPage', () => {
  it('renders headline, category tabs, and project cards', () => {
    renderProjects();

    expect(screen.getByText('Engineering Tangible')).toBeInTheDocument();
    expect(screen.getByText('Climate Solutions')).toBeInTheDocument();
    expect(screen.getAllByText('Campus Microgrid Digital Twin').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Helios-I Solar Racing Prototype').length).toBeGreaterThan(0);
  });

  it('filters project cards when category tab is clicked', async () => {
    const user = userEvent.setup();
    renderProjects();

    const competitionTab = screen.getByRole('tab', { name: /Competitions & Hackathons/i });
    await user.click(competitionTab);

    expect(screen.getByRole('heading', { name: 'Helios-I Solar Racing Prototype' })).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { name: 'Campus Microgrid Digital Twin' })).toHaveLength(0);
  });

  it('filters projects using search input', async () => {
    const user = userEvent.setup();
    renderProjects();

    const searchInput = screen.getByRole('combobox', { name: 'Search projects' });
    await user.type(searchInput, 'Helios');
    // The field commits on Enter rather than waiting out its debounce.
    await user.keyboard('{Escape}{Enter}');

    expect(screen.getByRole('heading', { name: 'Helios-I Solar Racing Prototype' })).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { name: 'Campus Microgrid Digital Twin' })).toHaveLength(0);
  });

  it('offers suggestions, recent searches, and a clear control', async () => {
    const user = userEvent.setup();
    renderProjects();

    const searchInput = screen.getByRole('combobox', { name: 'Search projects' });
    await user.type(searchInput, 'Helios');

    // Suggestions are announced as a listbox and pick up the typed fragment.
    const option = await screen.findByRole('option', { name: /Helios-I Solar Racing Prototype/ });
    await user.click(option);

    expect(searchInput).toHaveValue('Helios-I Solar Racing Prototype');

    // Clearing empties the field but leaves focus in it.
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(searchInput).toHaveValue('');
    expect(searchInput).toHaveFocus();

    // The committed term was kept as history and is offered back.
    expect(
      await screen.findByRole('option', { name: 'Helios-I Solar Racing Prototype' })
    ).toBeInTheDocument();
  });

  it('labels the fallback list when nothing matches', async () => {
    const user = userEvent.setup();
    renderProjects();

    const searchInput = screen.getByRole('combobox', { name: 'Search projects' });
    await user.type(searchInput, 'zzqqxw');
    await user.keyboard('{Enter}');

    expect(screen.getByText(/No record matches/)).toBeInTheDocument();
    // Records still render — but as an explicit recommendation, not as hits.
    expect(screen.getAllByRole('heading', { name: 'Campus Microgrid Digital Twin' }).length)
      .toBeGreaterThan(0);
  });

  it('opens and closes project detail modal', async () => {
    const user = userEvent.setup();
    renderProjects();

    const microgridHeadings = screen.getAllByRole('heading', { name: 'Campus Microgrid Digital Twin' });
    await user.click(microgridHeadings[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Problem Statement')).toBeInTheDocument();
    expect(screen.getByText('CHIN JUNXI')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    await user.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
