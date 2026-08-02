export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

export type QuizQuestion = {
  id: number;
  difficulty: QuizDifficulty;
  topic: string;
  prompt: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    difficulty: 'Easy',
    topic: 'Solar energy',
    prompt: 'Which technology converts sunlight directly into electricity?',
    options: [
      'Solar photovoltaic panels',
      'Solar thermal collectors',
      'Wind turbines',
      'Hydroelectric dams',
    ],
    answer: 0,
    explanation:
      'Photovoltaic cells use semiconductor materials to turn light into electric current. Solar thermal systems capture heat instead of producing electricity directly.',
  },
  {
    id: 2,
    difficulty: 'Easy',
    topic: 'Energy efficiency',
    prompt: 'Why do LED bulbs usually use less electricity than incandescent bulbs?',
    options: [
      'They produce more heat',
      'They convert more energy into light',
      'They only work during daytime',
      'They store electricity inside the bulb',
    ],
    answer: 1,
    explanation:
      'LEDs convert a larger share of electrical energy into visible light. Incandescent bulbs waste much more energy as heat.',
  },
  {
    id: 3,
    difficulty: 'Easy',
    topic: 'Wind energy',
    prompt: 'What form of energy in moving air is captured by a wind turbine?',
    options: ['Chemical energy', 'Nuclear energy', 'Kinetic energy', 'Thermal energy'],
    answer: 2,
    explanation:
      'Moving air has kinetic energy. Turbine blades capture part of that motion and a generator converts it into electrical energy.',
  },
  {
    id: 4,
    difficulty: 'Medium',
    topic: 'Battery storage',
    prompt: 'What is a main role of grid-scale batteries in a renewable-energy system?',
    options: [
      'Create unlimited electricity',
      'Store excess power for later use',
      'Stop electricity demand from changing',
      'Replace every transmission line',
    ],
    answer: 1,
    explanation:
      'Solar and wind output varies with weather and time. Batteries can store surplus electricity and release it when production falls or demand rises.',
  },
  {
    id: 5,
    difficulty: 'Medium',
    topic: 'Electric vehicles',
    prompt:
      'An electric vehicle has no tailpipe emissions. Which source can still cause lifecycle emissions?',
    options: [
      'The colour of the car',
      'Electricity generation and battery production',
      'The number of cup holders',
      'Regenerative braking',
    ],
    answer: 1,
    explanation:
      'EVs avoid tailpipe pollution, but producing batteries and generating the electricity used for charging can create emissions. Cleaner grids reduce these impacts.',
  },
  {
    id: 6,
    difficulty: 'Medium',
    topic: 'Smart grids',
    prompt: 'What makes a smart grid different from a traditional electricity grid?',
    options: [
      'It uses only underground cables',
      'It allows digital monitoring and two-way communication',
      'It prevents all power cuts',
      'It supplies only renewable energy',
    ],
    answer: 1,
    explanation:
      'Sensors, automated controls, and two-way communication help a smart grid balance supply and demand, integrate distributed energy, and respond more quickly.',
  },
  {
    id: 7,
    difficulty: 'Medium',
    topic: 'Net zero',
    prompt: 'What does net-zero emissions mean?',
    options: [
      'No energy may be used',
      'Only renewable electricity may be generated',
      'Remaining emissions are balanced by equivalent removals',
      'Every product must contain zero carbon',
    ],
    answer: 2,
    explanation:
      'Net zero means reducing emissions as far as possible and balancing the small remainder with verified removal of an equivalent amount of greenhouse gases.',
  },
  {
    id: 8,
    difficulty: 'Hard',
    topic: 'Energy systems',
    prompt: 'A wind farm has a 25% capacity factor. What does that describe?',
    options: [
      'It operates for exactly six hours every day',
      'It uses 25% of the available land',
      'Its actual output is 25% of maximum possible output over time',
      'One in four turbines is always switched off',
    ],
    answer: 2,
    explanation:
      'Capacity factor compares actual energy produced over a period with the energy that would be produced at full rated power continuously. It is not simply operating time.',
  },
  {
    id: 9,
    difficulty: 'Hard',
    topic: 'Green hydrogen',
    prompt:
      'Why is green hydrogen usually less energy-efficient than using renewable electricity directly?',
    options: [
      'Hydrogen cannot be transported',
      'Energy is lost during electrolysis, storage, transport, and conversion',
      'Electrolysers require fossil fuels',
      'Hydrogen contains no usable energy',
    ],
    answer: 1,
    explanation:
      'Each conversion step has losses. Direct electrification is often more efficient, while green hydrogen is valuable where direct electricity use is difficult.',
  },
  {
    id: 10,
    difficulty: 'Hard',
    topic: 'Lifecycle assessment',
    prompt: 'Which boundaries should a full lifecycle assessment of a solar panel include?',
    options: [
      'Only electricity generated while operating',
      'Only manufacturing and shipping',
      'Raw materials through manufacturing, use, and end of life',
      'Only recycling after the panel stops working',
    ],
    answer: 2,
    explanation:
      'A complete lifecycle assessment considers raw-material extraction, manufacturing, transport, installation, use, maintenance, and end-of-life treatment.',
  },
];
