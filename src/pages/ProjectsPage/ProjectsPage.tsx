import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import SocialShare from '../../components/SocialShare/SocialShare';
import { useProjects } from '../../hooks/useProjects';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useReveal } from '../../hooks/useReveal';
import { PROJECT_CATEGORIES } from '../../data/projectsData';
import type { ProjectCategory } from '../../data/projectsData';
import styles from './ProjectsPage.module.css';

/**
 * High-End Projects Page component for Green Tech Club.
 * Highlights student engineering innovations, research papers,
 * eco competitions, and campus sustainability campaigns.
 */
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
    totalProjectsCount,
    resetFilters,
    gridEpoch,
    isRefreshing,
  } = useProjects();

  const navHidden = useHideOnScroll(140);
  const mainRef = useReveal<HTMLElement>(styles.revealed);

  // The app-wide body is dark for the cinematic landing route; without this the
  // overscroll bounce bleeds near-black past the page box.
  useBodyBackground('#f7f8fa');

  return (
    <div className={styles.pageContainer}>
      {/* HUD Header Bar */}
      <div
        className={`${styles.headerBar} ${styles.headerBarLaunched} ${
          navHidden ? styles.headerBarHidden : ''
        }`}
        data-hidden={navHidden || undefined}
      >
        <HudHeader variant="static" />
      </div>

      <main
        ref={mainRef}
        className={`${styles.contentWrapper} ${styles.launched}`}
      >
        {/* HERO SECTION
            Uses the same entry choreography as every other interior page:
            useReveal's IntersectionObserver toggles `.revealed`, and the
            transition under `.contentWrapper [data-reveal]` carries it. The
            headline animates as one element rather than unmasking line by
            line, which is what the other heroes do. */}
        <section className={styles.heroSection}>
          <div className={styles.eyebrowTag} data-reveal data-reveal-index="0">
            <span>Impact &amp; Initiatives</span>
          </div>

          <h1 className={styles.heroTitle} data-reveal data-reveal-index="1">
            <span className={styles.lineInk}>Engineering Tangible</span>
            <span className={`${styles.lineInk} ${styles.heroTitleHighlight}`}>
              Climate Solutions
            </span>
          </h1>

          <p className={styles.heroSubtext} data-reveal data-reveal-index="2">
            From IoT microgrid digital twins to ultralight solar vehicles and AI waste sorters —
            explore how student researchers and engineers turn green tech theories into campus-wide impact.
          </p>
        </section>

        {/* SEARCH & CATEGORY FILTER CONTROL BAR */}
        <section className={styles.controlsSection} data-launch style={{ '--i': 8 } as CSSProperties}>
          <div className={styles.filterHeader}>
            <div className={styles.categoryBar} role="tablist" aria-label="Project Categories">
              {PROJECT_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                const count =
                  cat === 'All'
                    ? totalProjectsCount
                    : filteredProjects.filter((p) => p.category === cat).length;

                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isActive}
                    className={`${styles.categoryPill} ${
                      isActive ? styles.categoryPillActive : ''
                    }`}
                    onClick={() => setActiveCategory(cat as ProjectCategory)}
                  >
                    <span>{cat}</span>
                    <span className={styles.categoryCount}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input Box */}
            <div className={styles.searchBoxShell}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search projects, technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ASYMMETRICAL BENTO GRID SHOWCASE */}
        <div
          className={`${styles.gridStage} ${isRefreshing ? styles.gridStageRefreshing : ''}`}
          aria-busy={isRefreshing || undefined}
        >
          <div className={styles.scanSweep} aria-hidden="true" />

          <section key={gridEpoch} className={styles.bentoGrid}>
            {filteredProjects.length === 0 ? (
              <div className={styles.emptyState} style={{ '--i': 0 } as CSSProperties}>
                <h3 className={styles.emptyStateTitle}>No matching projects found</h3>
                <p className={styles.emptyStateSub}>
                  Try adjusting your search query or filter to explore other student initiatives.
                </p>
                <button className={styles.categoryPill} onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredProjects.map((project, index) => {
                const spanClass =
                  project.bentoSpan === 'wide'
                    ? styles.spanWide
                    : project.bentoSpan === 'tall'
                    ? styles.spanTall
                    : '';

                const statusStyle =
                  project.status === 'Active'
                    ? styles.statusActive
                    : project.status === 'Completed'
                    ? styles.statusCompleted
                    : styles.statusScaling;

                return (
                  <article
                    key={project.id}
                    className={`${styles.projectCardShell} ${spanClass}`}
                    style={{ '--i': index } as CSSProperties}
                    onClick={() => openProjectDetail(project)}
                  >
                    <div className={styles.projectCardCore}>
                      <div>
                        {/* Card Header: Category & Status */}
                        <div className={styles.cardHeader}>
                          <span className={styles.categoryBadge}>{project.category}</span>
                          <span className={`${styles.statusBadge} ${statusStyle}`}>
                            <span className={styles.statusDot} />
                            {project.status}
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className={styles.cardBody}>
                          <h2 className={styles.projectTitle}>{project.title}</h2>
                          <div className={styles.projectTagline}>{project.tagline}</div>
                          <p className={styles.projectSummary}>{project.summary}</p>
                        </div>

                        {/* Key Metric Preview */}
                        {project.impactMetrics && project.impactMetrics.length > 0 && (
                          <div className={styles.cardMetricsRow}>
                            {project.impactMetrics.slice(0, 2).map((metric) => (
                              <div key={metric.label} className={styles.cardMetricItem}>
                                <span className={styles.cardMetricVal}>
                                  {metric.value} {metric.unit}
                                </span>
                                <span className={styles.cardMetricLbl}>{metric.label}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tech Stack Pills */}
                        <div className={styles.techTagList}>
                          {project.techStack.map((tech) => (
                            <span key={tech} className={styles.techTag}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Button-in-Button Island CTA */}
                      <div className={styles.ctaButton}>
                        <span>Explore Technical Specs</span>
                        <div className={styles.btnIconWrapper}>
                          <svg className={styles.btnIcon} viewBox="0 0 24 24">
                            <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>

        {/* IMPACT TIMELINE / MILESTONES SECTION */}
        <section className={styles.timelineSection}>
          <div className={styles.sectionHeader} data-reveal data-reveal-index="0">
            <div className={styles.eyebrowTag}>
              <span>Project Roadmap &amp; Evolution</span>
            </div>
            <h2 className={styles.sectionTitle}>Club Engineering Milestones</h2>
            <p className={styles.sectionSub}>
              How student initiatives developed from lab concepts into deployed green infrastructure.
            </p>
          </div>

          <div className={styles.timelineTrack}>
            <div className={styles.timelineItemShell} data-reveal data-reveal-index="1">
              <div className={styles.timelineBadge}>01</div>
              <div className={styles.timelineYear}>2023 – Phase I</div>
              <h3 className={styles.timelineItemTitle}>Lab Research & Prototyping</h3>
              <p className={styles.timelineItemDesc}>
                Formed hardware and software working groups to design renewable energy monitoring hardware and low-cost sensor arrays.
              </p>
            </div>

            <div className={styles.timelineItemShell} data-reveal data-reveal-index="2">
              <div className={styles.timelineBadge}>02</div>
              <div className={styles.timelineYear}>2024 – Phase II</div>
              <h3 className={styles.timelineItemTitle}>Eco Competition Success</h3>
              <p className={styles.timelineItemDesc}>
                Built the Helios-I Solar Racing Prototype and completed 12 building carbon audit assessments for campus facilities.
              </p>
            </div>

            <div className={styles.timelineItemShell} data-reveal data-reveal-index="3">
              <div className={styles.timelineBadge}>03</div>
              <div className={styles.timelineYear}>2025 – Phase III</div>
              <h3 className={styles.timelineItemTitle}>Campus IoT & AI Integration</h3>
              <p className={styles.timelineItemDesc}>
                Deployed the Digital Twin IoT grid and EcoVision AI waste sorting units across central campus dining facilities.
              </p>
            </div>

            <div className={styles.timelineItemShell} data-reveal data-reveal-index="4">
              <div className={styles.timelineBadge}>04</div>
              <div className={styles.timelineYear}>2026 – Phase IV</div>
              <h3 className={styles.timelineItemTitle}>Off-Grid Hydrogen Scaling</h3>
              <p className={styles.timelineItemDesc}>
                Scaling benchtop metal hydride hydrogen storage systems for off-grid power resilience research.
              </p>
            </div>
          </div>
        </section>

        {/* COLLABORATION / PROJECT PITCH CTA CARD */}
        <section className={styles.collaborationSection}>
          <div className={styles.collabShell} data-reveal data-reveal-index="0">
            <div className={styles.collabCore}>
              <div className={styles.collabText}>
                <h2 className={styles.collabTitle}>Have a Green Tech Idea or Research Proposal?</h2>
                <p className={styles.collabBody}>
                  We provide lab access, hardware funding, technical mentorship, and a community of passionate student engineers to turn your green energy concept into reality.
                </p>
              </div>

              <Link to="/contact" className={styles.collabActionBtn}>
                <span>Propose a Project</span>
                <span className={styles.collabActionIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* INTERACTIVE PROJECT DETAIL MODAL / DRAWER */}
      {selectedProject && (
        <div
          className={styles.modalBackdrop}
          onClick={closeProjectDetail}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
        >
          <div className={styles.modalShell} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalCore}>
              {/* Modal Header */}
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <div className={styles.modalBadgeRow}>
                    <span className={styles.categoryBadge}>{selectedProject.category}</span>
                    <span className={styles.techTag}>{selectedProject.year}</span>
                  </div>
                  <h2 id="modal-project-title" className={styles.modalTitle}>
                    {selectedProject.title}
                  </h2>
                  <p className={styles.modalTagline}>{selectedProject.tagline}</p>
                </div>

                <button
                  className={styles.closeBtn}
                  onClick={closeProjectDetail}
                  aria-label="Close dialog"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Problem & Solution Breakdown */}
              <div className={styles.modalBodyBlock} style={{ '--i': 0 } as CSSProperties}>
                <h3 className={styles.modalSectionTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--signal)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  Problem Statement
                </h3>
                <p className={styles.modalText}>{selectedProject.problemStatement}</p>
              </div>

              <div className={styles.modalBodyBlock} style={{ '--i': 1 } as CSSProperties}>
                <h3 className={styles.modalSectionTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--signal-teal)" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  Engineering Solution
                </h3>
                <p className={styles.modalText}>{selectedProject.solutionDetails}</p>
              </div>

              {/* Verified Metrics */}
              {selectedProject.impactMetrics && selectedProject.impactMetrics.length > 0 && (
                <div className={styles.modalBodyBlock} style={{ '--i': 2 } as CSSProperties}>
                  <h3 className={styles.modalSectionTitle}>Verified Impact Metrics</h3>
                  <div className={styles.modalMetricsGrid}>
                    {selectedProject.impactMetrics.map((m) => (
                      <div key={m.label} className={styles.modalMetricTile}>
                        <span className={styles.cardMetricVal}>
                          {m.value} {m.unit}
                        </span>
                        <span className={styles.cardMetricLbl}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contributors / Team Roster */}
              <div className={styles.modalBodyBlock} style={{ '--i': 3 } as CSSProperties}>
                <h3 className={styles.modalSectionTitle}>Project Team & Leads</h3>
                <div className={styles.contributorsList}>
                  {selectedProject.contributors.map((c) => (
                    <div key={c.name} className={styles.contributorItem}>
                      <div className={styles.contributorAvatar}>
                        {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className={styles.contributorName}>{c.name}</div>
                        <div className={styles.contributorRole}>{c.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className={styles.modalBodyBlock} style={{ '--i': 4 } as CSSProperties}>
                <h3 className={styles.modalSectionTitle}>Technologies & Stack</h3>
                <div className={styles.techTagList}>
                  {selectedProject.techStack.map((tech) => (
                    <span key={tech} className={styles.techTag}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resource & Repository Links */}
              <div className={styles.modalLinksRow} style={{ '--i': 5 } as CSSProperties}>
                {selectedProject.githubUrl && (
                  <div className={styles.modalLinkBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>View GitHub Repository</span>
                  </div>
                )}
                {selectedProject.paperUrl && (
                  <div className={styles.modalLinkBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span>Read Research Paper</span>
                  </div>
                )}
                {selectedProject.demoUrl && (
                  <div className={styles.modalLinkBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    <span>Live Interactive Demo</span>
                  </div>
                )}
              </div>

              {/* Share the specific project, not the page: the modal is not a
                  route, so window.location would point at /projects for every
                  one of them. */}
              <SocialShare
                label="Share this project"
                title={`${selectedProject.title} — ${selectedProject.tagline}`}
                url={`${window.location.origin}/projects?project=${selectedProject.id}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
