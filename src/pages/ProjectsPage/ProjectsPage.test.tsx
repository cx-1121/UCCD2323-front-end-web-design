import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, afterEach } from 'vitest';
import ProjectsPage from './ProjectsPage';

afterEach(() => {
  cleanup();
});

const renderProjects = () =>
  render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>
  );

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

    const searchInput = screen.getByPlaceholderText('Search projects, technologies...');
    await user.type(searchInput, 'Helios');

    expect(screen.getByRole('heading', { name: 'Helios-I Solar Racing Prototype' })).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { name: 'Campus Microgrid Digital Twin' })).toHaveLength(0);
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
