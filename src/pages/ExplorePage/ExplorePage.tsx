import HudHeader from '../../components/HudHeader/HudHeader';
import { energySources } from '../../data/EnergySources';
import EnergySection from '../../components/EnergySection/EnergySection';

function ExplorePage() {
  return (
    <>
      <HudHeader />
      {energySources.map((source) => (
        <EnergySection key={source.id} source={source} />
      ))}
    </>
  );
}

export default ExplorePage;
