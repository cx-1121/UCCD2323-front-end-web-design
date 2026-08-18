import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import SocialShare from '../../components/SocialShare/SocialShare';
import {
  Action,
  Bench,
  Chapter,
  Instrument,
  Prose,
  Settle,
  Stamp,
  Stamped,
  Typed,
} from '../../components/accession/Accession';
import { useSettle } from '../../components/accession/useSettle';
import SearchField from '../../components/SearchField/SearchField';
import { CloseGlyph } from '../../components/icons';
import { useProjects } from '../../hooks/useProjects';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { PROJECT_CATEGORIES } from '../../data/projectsData';
import type { ProjectCategory } from '../../data/projectsData';
import styles from './ProjectsPage.module.css';

/**
 * PROJECTS — the impact record.
 *
 * The brief was explicit: not a 3x3 card grid. Each project is presented, one
 * at a time, as a full-width editorial plate with the record on one side and
 * the reading on the other, alternating down the page — so scrolling feels
 * like work being shown rather than a catalogue being browsed.
 *
 * The plate is authored rather than photographed. The club has no photography
 * for these, and a stock image of somebody else's solar farm would be a
 * decorative lie about work that actually happened; the record itself — its
 * accession number, its status stamp, and its measured impact set at figure
 * scale — is the honest visual, and it is the one this design language
 * already speaks.
 *
 * Product logic is untouched: `useProjects` still owns filtering, search and
 * the detail dialog.
 */

/** Milestones. Preserved verbatim from the previous page — club record, not copy. */
const MILESTONES = [
  {
    no: '01',
    year: '2023 — Phase I',
    title: 'Lab Research & Prototyping',
    detail:
      'Formed hardware and software working groups to design renewable energy monitoring hardware and low-cost sensor arrays.',
  },
  {
    no: '02',
    year: '2024 — Phase II',
    title: 'Eco Competition Success',
    detail:
      'Built the Helios-I Solar Racing Prototype and completed 12 building carbon audit assessments for campus facilities.',
  },
  {
    no: '03',
    year: '2025 — Phase III',
    title: 'Campus IoT & AI Integration',
    detail:
      'Deployed the Digital Twin IoT grid and EcoVision AI waste sorting units across central campus dining facilities.',
  },
  {
    no: '04',
    year: '2026 — Phase IV',
    title: 'Off-Grid Hydrogen Scaling',
    detail:
      'Scaling benchtop metal hydride hydrogen storage systems for off-grid power resilience research.',
  },
];

export default function ProjectsPage() {
  const {
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
    totalProjectsCount,
    resetFilters,
  } = useProjects();

  const pageRef = useSettle<HTMLElement>();
  useBodyBackground('#e9dfd0');

  /**
   * While a record is open it is the only thing on screen: the page behind it
   * must not scroll, and Escape must close it. Neither was true before — the
   * whole project list scrolled away underneath the dialog, and the only way
   * out was the close button.
   */
  useEffect(() => {
    if (!selectedProject) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeProjectDetail();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedProject, closeProjectDetail]);

  return (
    <main ref={pageRef} className={styles.page}>
      <HudHeader />

      {/* ==================================================================
          Opening
          ================================================================== */}
      <Chapter stop="firstlight" to="daylight" aria-label="Projects" className={styles.open}>
        <Bench className={styles.openStack}>
          <Settle index={1} onMount>
            <Instrument ruled>
              Green Tech Club · {totalProjectsCount} accessioned
            </Instrument>
            <Stamped as="h1" scale="display" className={styles.title}>
              <span>Engineering Tangible</span>{' '}
              <span className={styles.titleLive}>Climate Solutions</span>
            </Stamped>
          </Settle>

          <Settle index={2} onMount>
            <Typed
              lines={[
                'Every record here is something that was actually built.',
                ['None of it is a render.', true],
              ]}
            />
          </Settle>

          <Settle index={3} onMount>
            <Prose>
              From IoT microgrid digital twins to ultralight solar vehicles and AI waste
              sorters — explore how student researchers and engineers turn green tech
              theories into campus-wide impact.
            </Prose>
          </Settle>

          {/* ---- Filters. A ruled tab row and one rule of an input; the old
                  version put both inside their own bezelled shells. ---- */}
          <Settle index={4} className={styles.controls}>
            <div className={styles.tabs} role="tablist" aria-label="Project categories">
              {PROJECT_CATEGORIES.map((category: ProjectCategory) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className={styles.search}>
              <SearchField
                value={searchQuery}
                onSearch={setSearchQuery}
                getSuggestions={getSearchSuggestions}
                resultCount={matchCount}
              />
            </div>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          The records, alternating
          ================================================================== */}
      <Chapter stop="daylight" from="firstlight" to="living" aria-label="Project records">
        <Bench>
          {filteredProjects.length === 0 ? (
            <div className={styles.empty}>
              <Stamped as="p" scale="section">
                Nothing accessioned under that
              </Stamped>
              <Prose>
                Try adjusting your search query or filter to explore other student
                initiatives.
              </Prose>
              <Action onClick={resetFilters} ghost>
                Clear filters
              </Action>
            </div>
          ) : (
            <>
              {/* Nothing matched, so what follows is a recommendation, and
                  has to say so — an unlabelled full list would read as
                  results the search never actually found. */}
              {isShowingSuggestions && (
                <div className={styles.noMatch}>
                  <Stamped as="p" scale="section">
                    No record matches “{searchQuery.trim()}”
                  </Stamped>
                  <Prose>
                    Nothing in the accession answers that. These are the club&apos;s
                    records in this category — try one of them, or clear the search.
                  </Prose>
                  <Action onClick={resetFilters} ghost>
                    Clear filters
                  </Action>
                </div>
              )}

              <ol className={styles.records}>
              {filteredProjects.map((project, index) => (
                <li key={project.id}>
                  <Settle
                    as="article"
                    index={1}
                    className={
                      index % 2 === 1 ? `${styles.record} ${styles.recordFlip}` : styles.record
                    }
                  >
                    {/* ---- The plate ---- */}
                    <div className={styles.plate}>
                      <p className={styles.plateNo} aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </p>

                      <div className={styles.plateStamp}>
                        <Stamp living={project.status === 'Active'}>{project.status}</Stamp>
                      </div>

                      {project.impactMetrics.length > 0 && (
                        <dl className={styles.plateFigures}>
                          {project.impactMetrics.slice(0, 2).map((metric) => (
                            <div key={metric.label} className={styles.plateFigure}>
                              <dt className={styles.plateFigureLabel}>{metric.label}</dt>
                              <dd className={styles.plateFigureValue} data-figure>
                                {metric.value}
                                {metric.unit && (
                                  <span className={styles.plateFigureUnit}> {metric.unit}</span>
                                )}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>

                    {/* ---- The reading ---- */}
                    <div className={styles.recordCopy}>
                      <Instrument ruled>
                        {project.category} · {project.year}
                      </Instrument>

                      {/* The heading is the control: clicking the project's
                          name is what opens its record, so the button wraps
                          the heading rather than sitting beside it. */}
                      <button
                        type="button"
                        className={styles.recordOpen}
                        onClick={() => openProjectDetail(project)}
                      >
                        <Stamped as="h3" scale="section" className={styles.recordTitle}>
                          {project.title}
                        </Stamped>
                      </button>

                      <p className={styles.recordTagline}>{project.tagline}</p>
                      <Prose>{project.summary}</Prose>

                      <p className={styles.stack}>
                        {project.techStack.map((tech) => (
                          <span key={tech} className={styles.stackItem}>
                            {tech}
                          </span>
                        ))}
                      </p>

                      <Action onClick={() => openProjectDetail(project)} ghost>
                        Open the record
                      </Action>
                    </div>
                  </Settle>
                </li>
                ))}
              </ol>
            </>
          )}
        </Bench>
      </Chapter>

      {/* ==================================================================
          Milestones and the invitation
          ================================================================== */}
      <Chapter stop="living" from="daylight" aria-label="Milestones" className={styles.close}>
        <Bench className={styles.closeStack}>
          <Settle index={1}>
            <Instrument ruled>Club engineering milestones</Instrument>
            <Prose>
              How student initiatives developed from lab concepts into deployed green
              infrastructure.
            </Prose>
          </Settle>

          <Settle index={2}>
            <ol className={styles.milestones}>
              {MILESTONES.map((milestone) => (
                <li key={milestone.no} className={styles.milestone}>
                  <span className={styles.milestoneNo}>{milestone.no}</span>
                  <div className={styles.milestoneBody}>
                    <p className={styles.milestoneYear}>{milestone.year}</p>
                    <h3 className={styles.milestoneTitle}>{milestone.title}</h3>
                    <p className={styles.milestoneDetail}>{milestone.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Settle>

          <Settle index={3} className={styles.invite}>
            <Typed
              lines={[
                'Have a green tech idea or research proposal?',
                ['Bring it. The lab is already here.', true],
              ]}
            />
            <Prose>
              We provide lab access, hardware funding, technical mentorship, and a
              community of passionate student engineers to turn your green energy concept
              into reality.
            </Prose>
            <Action to="/contact">Propose a project</Action>
          </Settle>
        </Bench>
      </Chapter>

      {/* ==================================================================
          The record, opened
          ================================================================== */}
      {selectedProject && (
        <div
          className={styles.backdrop}
          onClick={closeProjectDetail}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
        >
          <div
            className={styles.dialog}
            data-chapter="living"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.dialogHead}>
              <div>
                <Instrument>
                  {selectedProject.category} · {selectedProject.year}
                </Instrument>
                <h2 id="modal-project-title" className={styles.dialogTitle}>
                  {selectedProject.title}
                </h2>
                <p className={styles.dialogTagline}>{selectedProject.tagline}</p>
              </div>

              <button
                type="button"
                className={styles.dialogClose}
                onClick={closeProjectDetail}
                aria-label="Close dialog"
              >
                <CloseGlyph />
              </button>
            </header>

            <div className={styles.dialogBody}>
              <section className={styles.dialogBlock}>
                <Instrument ruled>Problem Statement</Instrument>
                <Prose>{selectedProject.problemStatement}</Prose>
              </section>

              <section className={styles.dialogBlock}>
                <Instrument ruled>Engineering Solution</Instrument>
                <Prose>{selectedProject.solutionDetails}</Prose>
              </section>

              {selectedProject.impactMetrics.length > 0 && (
                <section className={styles.dialogBlock}>
                  <Instrument ruled>Verified Impact Metrics</Instrument>
                  <dl className={styles.dialogFigures}>
                    {selectedProject.impactMetrics.map((metric) => (
                      <div key={metric.label} className={styles.dialogFigure}>
                        <dd className={styles.dialogFigureValue} data-figure>
                          {metric.value}
                          {metric.unit && <span> {metric.unit}</span>}
                        </dd>
                        <dt className={styles.dialogFigureLabel}>{metric.label}</dt>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <section className={styles.dialogBlock}>
                <Instrument ruled>Project Team &amp; Leads</Instrument>
                <ul className={styles.team}>
                  {selectedProject.contributors.map((contributor) => (
                    <li key={contributor.name} className={styles.teamMember}>
                      {/* Rendered verbatim; the caps are styling, not content. */}
                      <span className={styles.teamName}>{contributor.name}</span>
                      <span className={styles.teamRole}>{contributor.role}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={styles.dialogBlock}>
                <Instrument ruled>Technologies &amp; Stack</Instrument>
                <p className={styles.stack}>
                  {selectedProject.techStack.map((tech) => (
                    <span key={tech} className={styles.stackItem}>
                      {tech}
                    </span>
                  ))}
                </p>
              </section>

              {(selectedProject.githubUrl || selectedProject.paperUrl || selectedProject.demoUrl) && (
                <section className={styles.dialogBlock}>
                  <Instrument ruled>Resources</Instrument>
                  <ul className={styles.resources}>
                    {selectedProject.githubUrl && (
                      <li>
                        <a className={styles.resource} href={selectedProject.githubUrl} target="_blank" rel="noreferrer">
                          View GitHub repository
                        </a>
                      </li>
                    )}
                    {selectedProject.paperUrl && (
                      <li>
                        <a className={styles.resource} href={selectedProject.paperUrl} target="_blank" rel="noreferrer">
                          Read the paper
                        </a>
                      </li>
                    )}
                    {selectedProject.demoUrl && (
                      <li>
                        <a className={styles.resource} href={selectedProject.demoUrl} target="_blank" rel="noreferrer">
                          See the demo
                        </a>
                      </li>
                    )}
                  </ul>
                </section>
              )}

              <SocialShare
                label="Share this project"
                title={`${selectedProject.title} — Green Tech Club`}
              />
            </div>
          </div>
        </div>
      )}

      <p className={styles.footNote}>
        <Link to="/contact">Propose a project</Link>
      </p>
    </main>
  );
}
