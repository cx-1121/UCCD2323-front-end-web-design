import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import HomePage from './pages/HomePage/HomePage';
import QuizChallenge from './pages/QuizChallenge/QuizChallenge';

/**
 * Composition root, responsible for global configuration (routing, global context/state).
 * App routing configuration:
 * - "/" routes to the interactive landing page.
 * - "/home" routes to the club homepage / main entry gateway.
 * - "/quiz-challenge" routes to the renewable-energy quiz.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/quiz-challenge" element={<QuizChallenge />} />
      </Routes>
    </Router>
  );
}

export default App;
