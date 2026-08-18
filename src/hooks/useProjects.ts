import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { projectsData } from '../data/projectsData';
import type { Project, ProjectCategory } from '../data/projectsData';
import { scoreFields } from '../utils/fuzzySearch';

export function useProjects() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { filteredProjects, matchCount, isShowingSuggestions } = useMemo(() => {
    const inCategory = projectsData.filter(
      (project) => activeCategory === 'All' || project.category === activeCategory
    );

    const query = searchQuery.trim();
    if (!query) {
      return {
        filteredProjects: inCategory,
        matchCount: inCategory.length,
        isShowingSuggestions: false,
      };
    }

    // Ranked, typo-tolerant search: "sloar" still finds solar projects, and
    // the closest matches (title hits) sort ahead of looser ones (tech-stack
    // or summary hits) instead of just preserving catalogue order.
    const scored = inCategory
      .map((project) => ({
        project,
        score: scoreFields(
          [
            { text: project.title, weight: 5 },
            { text: project.tagline, weight: 3 },
            { text: project.category, weight: 2 },
            { text: project.techStack.join(' '), weight: 3 },
            { text: project.summary, weight: 1.5 },
          ],
          query
        ),
      }))
      .filter(({ score }) => score > 0);

    // A query nothing resembles is a dead end if the grid just empties. The
    // page still shows records — but as explicitly labelled recommendations,
    // not as though they were hits, which would misreport the search.
    if (scored.length === 0) {
      return {
        filteredProjects: inCategory,
        matchCount: 0,
        isShowingSuggestions: true,
      };
    }

    scored.sort((a, b) => b.score - a.score);
    return {
      filteredProjects: scored.map(({ project }) => project),
      matchCount: scored.length,
      isShowingSuggestions: false,
    };
  }, [activeCategory, searchQuery]);

  /**
   * Suggestion rows for the search panel. Titles only: a suggestion the
   * visitor picks becomes the next query, so it has to be something that
   * searches well on its own.
   */
  const getSearchSuggestions = useCallback((draft: string) => {
    const query = draft.trim();
    if (!query) return [];

    return projectsData
      .map((project) => ({
        project,
        score: scoreFields(
          [
            { text: project.title, weight: 5 },
            { text: project.techStack.join(' '), weight: 3 },
            { text: project.category, weight: 2 },
            { text: project.tagline, weight: 1.5 },
          ],
          query
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ project }) => ({
        id: project.id,
        label: project.title,
        hint: project.category,
      }));
  }, []);

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
  }, []);

  const closeProjectDetail = useCallback(() => {
    setSelectedProject(null);
  }, []);

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
    matchCount,
    isShowingSuggestions,
    getSearchSuggestions,
    totalProjectsCount: projectsData.length,
    resetFilters,
    gridEpoch,
    isRefreshing,
  };
}
