import type { EnergySource } from '../../data/EnergySources';

type EnergySectionProps = {
  source: EnergySource;
};

function EnergySection({ source }: EnergySectionProps) {

  return (
    <section>
      <h2>{source.name}</h2>

      <p>{source.description}</p>

      <h3>How it works</h3>
      <p>{source.howItWorks}</p>

      <h3>Advantages</h3>
      <ul>
        {source.advantages.map((advantage) => (
          <li key={advantage}>{advantage}</li>
        ))}
      </ul>

      <h3>Limitations</h3>
      <ul>
        {source.limitations.map((limitation) => (
          <li key={limitation}>{limitation}</li>
        ))}
      </ul>

      <h3>Real-world applications</h3>
      <ul>
        {source.applications.map((application) => (
          <li key={application}>{application}</li>
        ))}
      </ul>
    </section>
  );
}

export default EnergySection;