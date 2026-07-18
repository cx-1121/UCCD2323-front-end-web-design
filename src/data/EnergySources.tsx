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
  id: "solar",
  name: "Solar Energy",
  description:
    "Solar energy is a renewable form of energy that comes from sunlight. It is one of the most widely available clean energy resources because sunlight reaches almost every part of the world. Solar technology can be used to generate electricity, heat water, power small devices, and supply energy to homes, businesses, and large communities. Because solar systems produce electricity without burning fossil fuels, they can help reduce air pollution and greenhouse gas emissions.",
  howItWorks:
    "Solar panels contain many photovoltaic cells, which are usually made from semiconductor materials such as silicon. When sunlight reaches these cells, its energy causes electrons inside the material to move. This movement creates a direct electric current. An inverter then changes the direct current into alternating current, which can be used by homes and buildings. Any extra electricity may be stored in batteries or sent to the electrical grid for other users.",
  advantages: [
    "Uses sunlight, which is renewable and widely available",
    "Produces electricity without direct air pollution",
    "Can reduce household and business electricity costs",
    "Can be installed on rooftops or in large solar farms",
    "Requires relatively little maintenance after installation",
  ],
  limitations: [
    "Electricity production decreases at night and during cloudy weather",
    "Batteries and energy-storage systems can be expensive",
    "Large solar farms may require a significant amount of land",
    "The initial cost of purchasing and installing solar panels can be high",
  ],
  applications: [
    "Rooftop solar panels for homes and commercial buildings",
    "Large solar farms that supply electricity to the grid",
    "Solar-powered streetlights and traffic signs",
    "Solar water-heating systems",
    "Portable solar chargers and equipment used in remote areas",
  ],
},
{
  id: "wind",
  name: "Wind Energy",
  description:
    "Wind energy is a renewable energy source that uses the natural movement of air to generate electricity. Wind is created when the Sun heats different parts of the Earth's surface unevenly, causing air to move from areas of high pressure to areas of low pressure. Wind energy systems can range from small turbines that provide power to individual buildings to large wind farms that generate electricity for thousands of homes. Since wind turbines do not burn fuel while operating, they produce electricity with very low direct greenhouse gas emissions.",
  howItWorks:
    "A wind turbine has large blades that are designed to capture the energy of moving air. When the wind blows, it turns the blades around a central rotor. The rotor is connected to a shaft inside the turbine, which drives a generator. The generator converts the turbine's mechanical movement into electrical energy. The electricity is then adjusted by electrical equipment and sent through power lines to homes, businesses, or the main electricity grid.",
  advantages: [
    "Uses wind, which is renewable and does not require fuel",
    "Produces electricity with very low direct emissions",
    "Can generate large amounts of electricity in windy locations",
    "Land around turbines may still be used for farming",
    "Offshore wind farms can take advantage of stronger and more consistent winds",
  ],
  limitations: [
    "Electricity generation depends on wind speed and weather conditions",
    "Wind turbines may produce noise and change the appearance of landscapes",
    "Poorly located turbines may affect birds and bats",
    "Wind farms require suitable locations and transmission infrastructure",
    "Construction and maintenance can be more difficult for offshore turbines",
  ],
  applications: [
    "Onshore wind farms located on open land",
    "Offshore wind farms built in coastal waters",
    "Small turbines that support farms, homes, and remote communities",
    "Hybrid systems that combine wind energy with solar panels and batteries",
    "Electricity generation for national and regional power grids",
  ],
},
  {
  id: "hydroelectric",
  name: "Hydroelectric Power",
  description:
    "Hydroelectric power is a renewable energy source that uses moving water to generate electricity. It is commonly produced at dams, rivers, and water reservoirs where the movement of water can be controlled. Hydroelectric systems can generate large amounts of electricity and often provide a stable supply of power. Some facilities can also respond quickly when electricity demand increases, making hydropower useful for supporting the wider electricity grid.",
  howItWorks:
    "In a hydroelectric power station, water stored behind a dam or flowing through a river is directed through a pipe called a penstock. The force of the moving water spins the blades of a turbine. The turbine is connected to a generator, which converts the mechanical movement into electrical energy. After passing through the turbine, the water is released back into the river. In pumped-storage systems, water can also be moved to a higher reservoir and released later when more electricity is needed.",
  advantages: [
    "Produces electricity with low direct greenhouse gas emissions",
    "Can generate large amounts of reliable electricity",
    "Can respond quickly to changes in electricity demand",
    "Reservoirs can store water for later power generation",
    "Hydroelectric facilities often operate for many years",
  ],
  limitations: [
    "Building dams and power stations can be very expensive",
    "Dams may disturb rivers, fish populations, and aquatic ecosystems",
    "Nearby communities may need to relocate",
    "Electricity production may decrease during droughts",
    "Large reservoirs can flood forests, farmland, and natural habitats",
  ],
  applications: [
    "Large hydroelectric dams that supply cities and industries",
    "Small-scale hydropower systems for rural communities",
    "Run-of-river power stations",
    "Pumped-storage facilities that store energy",
    "Electricity generation for national power grids",
  ],
},
{
  id: "biomass",
  name: "Biomass Energy",
  description:
    "Biomass energy is produced from organic materials that come from plants, animals, and waste. Common biomass resources include wood, crop remains, food waste, animal manure, and agricultural by-products. These materials can be used to produce heat, electricity, biogas, or liquid fuels. Biomass can help reduce the amount of waste sent to landfills, but it must be managed carefully to avoid deforestation, air pollution, and excessive land use.",
  howItWorks:
    "Biomass can be converted into energy in several ways. It may be burned directly to produce heat, which can create steam and turn a turbine connected to a generator. Organic waste can also be broken down by microorganisms in an oxygen-free environment to produce biogas. Some crops and plant materials can be processed into liquid fuels such as ethanol and biodiesel. The exact method depends on the type of biomass and the energy product required.",
  advantages: [
    "Uses organic materials that may otherwise become waste",
    "Can produce electricity, heat, gas, or liquid fuel",
    "Can provide energy when solar and wind resources are unavailable",
    "May reduce dependence on fossil fuels",
    "Can support waste-management and agricultural industries",
  ],
  limitations: [
    "Burning biomass can release carbon dioxide and air pollutants",
    "Large-scale production may require significant land and water",
    "Unsustainable harvesting can cause deforestation",
    "Transporting heavy biomass materials can be costly",
    "Biomass is only renewable when resources are replaced responsibly",
  ],
  applications: [
    "Biogas systems using food waste and animal manure",
    "Wood pellets used for heating homes and buildings",
    "Biomass power plants that generate electricity",
    "Biofuels such as ethanol and biodiesel",
    "Agricultural waste converted into heat or energy",
  ],
},
{
  id: "geothermal",
  name: "Geothermal Energy",
  description:
    "Geothermal energy comes from heat stored beneath the Earth's surface. This heat is produced by the natural formation of the planet and the slow decay of radioactive materials underground. Geothermal resources can be used to generate electricity, heat buildings, warm greenhouses, and provide hot water. Unlike solar and wind energy, geothermal energy can often operate continuously throughout the day and night.",
  howItWorks:
    "Geothermal power stations use wells drilled deep into the ground to reach hot water or steam. The steam can be directed toward a turbine, which turns a generator and produces electricity. In some systems, hot underground water is brought to the surface and its heat is transferred to another liquid that boils at a lower temperature. Geothermal heat pumps use the stable temperature near the Earth's surface to heat buildings in winter and cool them in summer.",
  advantages: [
    "Can provide energy throughout the day and night",
    "Produces low direct greenhouse gas emissions",
    "Requires less land than many large energy projects",
    "Provides a stable and reliable energy supply",
    "Can be used for both electricity generation and heating",
  ],
  limitations: [
    "Suitable geothermal locations are limited",
    "Drilling and construction can be expensive",
    "Underground gases and minerals must be managed carefully",
    "Some projects may cause small earthquakes",
    "Geothermal wells may lose efficiency over time if poorly managed",
  ],
  applications: [
    "Geothermal power stations",
    "Heating homes, offices, and public buildings",
    "Geothermal heat pump systems",
    "Heating greenhouses and fish farms",
    "Providing hot water for industrial processes and spas",
  ],
},
];
