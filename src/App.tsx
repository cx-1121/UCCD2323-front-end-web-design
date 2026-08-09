import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import HomePage from './pages/HomePage/HomePage';
import ExplorePage from './pages/ExplorePage/ExplorePage';
import QuizChallenge from './pages/QuizChallenge/QuizChallenge';
import AboutPage from './pages/AboutPage/AboutPage';
import ContactPage from './pages/ContactPage/ContactPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import DebugConsole from './components/DebugConsole/DebugConsole';
import RouteHistoryTracker from './components/RouteHistoryTracker';

/**
 * Guard component for the root path "/".
 * If the user has started their journey (hasChosenFuture === 'true')
 * AND is not explicitly requesting a replay (?replay=true is missing),
 * they will be automatically redirected to the home page.
 */
function RootRouteGuard() {
  const [searchParams] = useSearchParams();
  const isReplay = searchParams.get('replay') === 'true';
  const hasStarted = localStorage.getItem('hasChosenFuture') === 'true';

  if (hasStarted && !isReplay) {
    return <Navigate to="/home" replace />;
  }

  return <LandingPage />;
}

/**
 * Composition root, responsible for global configuration (routing, global context/state).
 * App routing configuration:
 * - "/" routes to the interactive landing page, behind the revisit guard.
 * - "/home" routes to the club homepage / main entry gateway.
 * - "/explore" routes to the renewable-energy field guide.
 * - "/projects" routes to the club projects & impact showcase.
 * - "/quiz-challenge" routes to the renewable-energy quiz.
 * - "/about" routes to about / references.
 * - "/contact" routes to contact / support.
 */
function App() {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const urlDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

  let isDebug = false;
  if (isLocal) {
    if (urlDebug) {
      localStorage.setItem('debugModeActive', 'true');
      isDebug = true;
    } else {
      // Default to true in local development unless explicitly set to 'false'
      isDebug = localStorage.getItem('debugModeActive') !== 'false';
    }
  }

  return (
    <Router>
      {/* Records the previous route so HomePage can tell "walked in from the
          landing page" apart from an ordinary nav click. Renders nothing. */}
      <RouteHistoryTracker />
      <Routes>
        <Route path="/" element={<RootRouteGuard />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/quiz-challenge" element={<QuizChallenge />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      {isDebug && <DebugConsole />}
    </Router>
  );
}

export default App;
