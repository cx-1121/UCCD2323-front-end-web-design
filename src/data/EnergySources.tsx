export type EnergySource = {
  id: string;
  name: string;
  description: string;
  howItWorks: string;
  advantages: string[];
  limitations: string[];
  applications: string[];
};

export const energySources: EnergySource[] = [
  {
    id: 'solar',
    name: 'Solar Energy',
    description: 'Solar energy uses sunlight to produce electricity or heat.',
    howItWorks:
      'Solar panels contain photovoltaic cells that convert sunlight into electrical energy.',
    advantages: [
      'Renewable and widely available',
      'Produces no direct air pollution',
      'Can reduce electricity costs',
    ],
    limitations: [
      'Depends on sunlight',
      'Energy storage can be expensive',
      'Requires suitable installation space',
    ],
    applications: ['Rooftop solar panels', 'Solar farms', 'Solar-powered streetlights'],
  },
  {
    id: 'wind',
    name: 'Wind Energy',
    description: 'Wind energy uses moving air to generate electricity.',
    howItWorks: 'Wind turns the blades of a turbine, which powers a generator.',
    advantages: [
      'Produces clean electricity',
      'Uses no fuel',
      'Suitable for large-scale generation',
    ],
    limitations: [
      'Wind speed is not constant',
      'Turbines require large areas',
      'May affect nearby wildlife',
    ],
    applications: ['Onshore wind farms', 'Offshore wind farms', 'Small community turbines'],
  },
  {
    id: 'hydroelectric',
    name: 'Hydroelectric Power',
    description: 'Hydroelectric power uses moving or falling water to generate electricity.',
    howItWorks:
      'Water flows through a dam or channel and spins a turbine. The turbine powers a generator, which converts the movement into electrical energy.',
    advantages: [
      'Produces electricity with low direct greenhouse gas emissions',
      'Can generate large amounts of electricity',
      'Provides a stable and reliable energy supply',
      'Reservoirs can store water for later electricity generation',
    ],
    limitations: [
      'Building dams can be expensive',
      'Dams may disturb rivers and aquatic ecosystems',
      'Nearby communities may need to relocate',
      'Electricity generation can decrease during droughts',
    ],
    applications: [
      'Large hydroelectric dams',
      'Small-scale hydropower systems',
      'Pumped-storage power stations',
      'Electricity generation for cities and industries',
    ],
  },
  {
    id: 'biomass',
    name: 'Biomass Energy',
    description:
      'Biomass energy is produced from organic materials such as plants, wood, food waste, and animal waste.',
    howItWorks:
      'Organic materials can be burned directly to produce heat, converted into biofuels, or broken down to create biogas. The heat or gas can then be used to generate electricity.',
    advantages: [
      'Uses materials that might otherwise become waste',
      'Can provide energy when solar and wind power are unavailable',
      'Can be converted into electricity, heat, or fuel',
      'May reduce dependence on fossil fuels',
    ],
    limitations: [
      'Burning biomass releases carbon dioxide and air pollutants',
      'Large-scale production may require significant land',
      'Removing too much plant material can damage ecosystems',
      'Biomass is only sustainable when resources are replaced responsibly',
    ],
    applications: [
      'Biogas produced from food and animal waste',
      'Wood pellets used for heating',
      'Biofuels such as ethanol and biodiesel',
      'Electricity generation in biomass power plants',
    ],
  },
  {
    id: 'geothermal',
    name: 'Geothermal Energy',
    description:
      'Geothermal energy uses heat from inside the Earth to produce electricity or provide heating.',
    howItWorks:
      'Wells are drilled into underground areas containing hot water or steam. The steam can turn a turbine connected to a generator, while hot water can also be used directly for heating.',
    advantages: [
      'Available throughout the day and night',
      'Produces low direct greenhouse gas emissions',
      'Requires less land than many other energy sources',
      'Provides a stable and reliable supply of energy',
    ],
    limitations: [
      'Suitable geothermal locations are limited',
      'Drilling and construction can be expensive',
      'Underground gases and minerals must be managed carefully',
      'Some projects may cause small earthquakes',
    ],
    applications: [
      'Geothermal power stations',
      'Heating homes and buildings',
      'Heating greenhouses',
      'Geothermal heat pump systems',
    ],
  },
];
