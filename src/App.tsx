import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import HomePage from './pages/HomePage/HomePage';
import DebugConsole from './components/DebugConsole/DebugConsole';

/**
 * Guard component for the root path "/".
 * If the user has started their journey (greenTechJourneyStarted === 'true')
 * AND is not explicitly requesting a replay (?replay=true is missing),
 * they will be automatically redirected to the home page.
 */
function RootRouteGuard() {
  const [searchParams] = useSearchParams();
  const isReplay = searchParams.get('replay') === 'true';
  const hasStarted = localStorage.getItem('greenTechJourneyStarted') === 'true';

  if (hasStarted && !isReplay) {
    return <Navigate to="/home" replace />;
  }

  return <LandingPage />;
}

/**
 * Composition root, responsible for global configuration (routing, global context/state).
 */
function App() {
  const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRouteGuard />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
      {isDebug && <DebugConsole />}
    </Router>
  );
}



export default App;

