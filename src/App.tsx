import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import HomePage from './pages/HomePage/HomePage';
import DebugConsole from './components/DebugConsole/DebugConsole';

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
      <Routes>
        <Route path="/" element={<RootRouteGuard />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
      {isDebug && <DebugConsole />}
    </Router>
  );
}



export default App;

