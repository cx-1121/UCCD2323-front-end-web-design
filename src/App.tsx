import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import HomePage from './pages/HomePage/HomePage';

/**
 * Composition root, responsible for global configuration (routing, global context/state).
 * App routing configuration:
 * - "/" routes to the interactive landing page.
 * - "/home" routes to the club homepage / main entry gateway.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;

