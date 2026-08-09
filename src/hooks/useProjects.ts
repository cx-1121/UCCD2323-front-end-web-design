import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { projectsData } from '../data/projectsData';
import type { Project, ProjectCategory } from '../data/projectsData';

export function useProjects() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      const matchesCategory =
        activeCategory === 'All' || project.category === activeCategory;

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        project.title.toLowerCase().includes(query) ||
        project.tagline.toLowerCase().includes(query) ||
        project.summary.toLowerCase().includes(query) ||
        project.techStack.some((tech) => tech.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  /**
   * Re-entry choreography for the grid. Keyed off the resolved result set, not
   * off the raw inputs — typing "Hel", "Heli", "Helio" narrows to the same card
   * three times over, and pulsing the grid on every keystroke reads as jitter.
   *
   * `gridEpoch` is spent as a React key so the cards remount and replay their
   * cascade; `isRefreshing` drives the scan sweep over the outgoing set.
   */
  const resultSignature = filteredProjects.map((project) => project.id).join('|');
  const [gridEpoch, setGridEpoch] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFirstResult = useRef(true);

  useEffect(() => {
    if (isFirstResult.current) {
      isFirstResult.current = false;
      return;
    }

    setGridEpoch((epoch) => epoch + 1);
    setIsRefreshing(true);
    const timer = window.setTimeout(() => setIsRefreshing(false), 420);

    return () => window.clearTimeout(timer);
  }, [resultSignature]);

  const openProjectDetail = useCallback((project: Project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeProjectDetail = useCallback(() => {
    setSelectedProject(null);
    document.body.style.overflow = '';
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedProject) {
        closeProjectDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject, closeProjectDetail]);

  const resetFilters = useCallback(() => {
    setActiveCategory('All');
    setSearchQuery('');
  }, []);

  return {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedProject,
    openProjectDetail,
    closeProjectDetail,
    filteredProjects,
    totalProjectsCount: projectsData.length,
    resetFilters,
    gridEpoch,
    isRefreshing,
  };
}
