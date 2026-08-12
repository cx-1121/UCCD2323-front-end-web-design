import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HudHeader from '../../components/HudHeader/HudHeader';
import ProgressHud from '../../components/ProgressHud/ProgressHud';
import ScrollHint from '../../components/ScrollHint/ScrollHint';
import ScrollContainer from '../../components/ScrollContainer/ScrollContainer';
import SceneIntro from '../../components/SceneIntro/SceneIntro';
import SceneTraditional from '../../components/SceneTraditional/SceneTraditional';
import DevTimeDisplay from '../../components/DevTimeDisplay/DevTimeDisplay';
import RevisitOverlay from './RevisitOverlay';
import { safeLocal } from '../../utils/storage';
import { HAS_CHOSEN_FUTURE_KEY, REVISIT_ATTEMPTS_KEY } from '../../utils/storageKeys';

/**
 * Interactive Landing Page component.
 * Ported from App.tsx as a standalone page route.
 * Handles the complete cinematic scroll animation flow of RE:FUTURE.
 */
function LandingPage() {
  const navigate = useNavigate();


  const [revisitLevel] = useState<number>(() => {
    const isReplay = new URLSearchParams(window.location.search).get('replay') === 'true';
    const hasStarted = safeLocal.get(HAS_CHOSEN_FUTURE_KEY) === 'true';
    if (isReplay && hasStarted) {
      const currentCount = parseInt(safeLocal.get(REVISIT_ATTEMPTS_KEY) || '0', 10);
      return currentCount + 1;
    }
    return 0;
  });

  const handleLeaveLanding = (targetPath: string = '/home') => {
    safeLocal.set(HAS_CHOSEN_FUTURE_KEY, 'true');
    if (revisitLevel > 0) {
      // Set the new attempts to return to past upon successful journey exit (easter egg fully triggered/completed)
      safeLocal.set(REVISIT_ATTEMPTS_KEY, revisitLevel.toString());
    }
    navigate(targetPath);
  };

  // If in revisit mode, render the custom overlay with attempts layouts
  if (revisitLevel > 0) {
    return <RevisitOverlay level={revisitLevel} onLeave={handleLeaveLanding} />;
  }

  return (
    <>
      <HudHeader />
      <ProgressHud />
      <ScrollHint />
      <ScrollContainer>
        <SceneIntro />
        <SceneTraditional onEnterFuture={() => handleLeaveLanding('/home')} />
      </ScrollContainer>
      <DevTimeDisplay />
    </>
  );

}

export default LandingPage;

