import HudHeader from './components/HudHeader/HudHeader';
import ProgressHud from './components/ProgressHud/ProgressHud';
import ScrollHint from './components/ScrollHint/ScrollHint';
import ScrollContainer from './components/ScrollContainer/ScrollContainer';
import SceneIntro from './components/SceneIntro/SceneIntro';
import SceneTraditional from './components/SceneTraditional/SceneTraditional';
import DevTimeDisplay from './components/DevTimeDisplay/DevTimeDisplay';

/**
 * Composition root, mirroring the component tree specified in PRD §3.2.
 * Ported from past_landing_page.html's <body> (lines 30-967): the HUD
 * layer (header/progress dots/scroll hint), the pinned scroll stage
 * (two scenes), and the debug time HUD.
 *
 * Note: HudHeader/ProgressHud/ScrollHint are rendered as App-level siblings
 * of ScrollContainer (not nested inside it) to match the PRD tree exactly.
 * In the legacy DOM they were nested inside .stage-container, but since all
 * three are `position: fixed` with z-index: 100 (far above the stage's own
 * z-index: 1), this reordering has no visual effect — see SceneIntro.tsx
 * for the related z-index/stacking-context note.
 */
function App() {
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
