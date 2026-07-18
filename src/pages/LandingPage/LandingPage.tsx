import HudHeader from '../../components/HudHeader/HudHeader';
import ProgressHud from '../../components/ProgressHud/ProgressHud';
import ScrollHint from '../../components/ScrollHint/ScrollHint';
import ScrollContainer from '../../components/ScrollContainer/ScrollContainer';
import SceneIntro from '../../components/SceneIntro/SceneIntro';
import SceneTraditional from '../../components/SceneTraditional/SceneTraditional';
import DevTimeDisplay from '../../components/DevTimeDisplay/DevTimeDisplay';

/**
 * Interactive Landing Page component.
 * Ported from App.tsx as a standalone page route.
 * Handles the complete cinematic scroll animation flow of RE:FUTURE.
 */
function LandingPage() {
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

export default LandingPage;
