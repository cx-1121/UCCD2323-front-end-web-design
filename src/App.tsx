import { useEffect, useState } from 'react';
import HudHeader from './components/HudHeader/HudHeader';
import ProgressHud from './components/ProgressHud/ProgressHud';
import ScrollHint from './components/ScrollHint/ScrollHint';
import ScrollContainer from './components/ScrollContainer/ScrollContainer';
import SceneIntro from './components/SceneIntro/SceneIntro';
import SceneTraditional from './components/SceneTraditional/SceneTraditional';
import DevTimeDisplay from './components/DevTimeDisplay/DevTimeDisplay';
import QuizChallenge from './components/QuizChallenge/QuizChallenge';

/**
 * Composition root for the landing page and the Quiz & Challenge experience.
 * The landing page remains the default. The quiz is available at
 * #quiz-challenge so it can be developed independently without a router.
 */
function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (hash === '#quiz-challenge') {
    return <QuizChallenge />;
  }

  return (
    <>
      <HudHeader />
      <ProgressHud />
      <ScrollHint />
      <ScrollContainer>
        <SceneIntro />
        <SceneTraditional />
      </ScrollContainer>
      <DevTimeDisplay />
    </>
  );
}

export default App;
