/**
 * Domain types and data for Green Tech Club Projects.
 * Represents student engineering prototypes, research initiatives,
 * competitions, and environmental campaigns.
 */

export type ProjectCategory =
  | 'All'
  | 'Research & Engineering'
  | 'Competitions & Hackathons'
  | 'Community & Outreach'
  | 'Sustainability Campaigns';

export type ProjectStatus = 'Active' | 'Completed' | 'Scaling';

export type ProjectContributor = {
  name: string;
  role: string;
  avatarUrl?: string;
};

export type ImpactMetric = {
  label: string;
  value: string;
  unit?: string;
};

export type Project = {
  id: string;
  title: string;
  tagline: string;
  category: ProjectCategory;
  status: ProjectStatus;
  year: string;
  featured?: boolean;
  bentoSpan?: 'wide' | 'tall' | 'normal';
  summary: string;
  fullDescription: string;
  problemStatement: string;
  solutionDetails: string;
  impactMetrics: ImpactMetric[];
  techStack: string[];
  contributors: ProjectContributor[];
  githubUrl?: string;
  paperUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
};

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'All',
  'Research & Engineering',
  'Competitions & Hackathons',
  'Community & Outreach',
  'Sustainability Campaigns',
];



export const projectsData: Project[] = [
  {
    id: 'campus-microgrid-twin',
    title: 'Campus Microgrid Digital Twin',
    tagline: 'Real-time IoT simulation & AI energy balancing for university buildings.',
    category: 'Research & Engineering',
    status: 'Active',
    year: '2025 – 2026',
    featured: true,
    bentoSpan: 'wide',
    summary:
      'An IoT sensor network combined with a digital twin model predicting solar rooftop yields and dynamically optimizing building HVAC energy consumption.',
    fullDescription:
      'The Campus Microgrid Digital Twin integrates 48 custom Modbus energy meters deployed across engineering halls with a cloud-hosted predictive model. Using short-term solar irradiance forecasts and occupancy telemetry, the system dynamically manages battery storage charging schedules and optimizes HVAC setpoints.',
    problemStatement:
      'University buildings consume excessive peak grid power during midday surges despite having rooftop solar PV arrays, leading to high maximum demand charges and energy wastage.',
    solutionDetails:
      'Developed custom MQTT-enabled microcontroller sensor boxes connected to building distribution panels. Implemented an LSTM neural network that predicts solar output 4 hours ahead and schedules battery storage discharge during tariff peak windows.',
    impactMetrics: [
      { label: 'Energy Reduction', value: '14.2%' },
      { label: 'Peak Grid Shaving', value: '38 kW' },
      { label: 'Monitored Nodes', value: '48' },
    ],
    techStack: ['React', 'Python / PyTorch', 'MQTT / InfluxDB', 'Grafana', 'ESP32 / Modbus'],
    contributors: [
      { name: 'CHIN JUNXI', role: 'System Architect & Firmware Lead' },
      { name: 'BEH YUAN WEN', role: 'Data Scientist & ML Engineer' },
      { name: 'CHOI HONG ER', role: 'IoT Hardware Lead' },
    ],
    githubUrl: 'https://github.com/example/campus-microgrid-twin',
    paperUrl: 'https://doi.org/10.1016/example.energy.2025.102',
    demoUrl: 'https://microgrid-demo.example.edu.my',
  },
  {
    id: 'solar-car-helios',
    title: 'Helios-I Solar Racing Prototype',
    tagline: 'Aerodynamic ultralight EV powered by high-efficiency solar cells.',
    category: 'Competitions & Hackathons',
    status: 'Completed',
    year: '2024',
    featured: true,
    bentoSpan: 'tall',
    summary:
      'Designed and fabricated an ultralight carbon-fibre solar electric vehicle competing in national eco-marathon challenges.',
    fullDescription:
      'Helios-I represents a multi-disciplinary engineering endeavor combining carbon-fibre monocoque construction, custom MPPT solar charge controllers, and custom regenerative braking algorithms. The vehicle achieved top-tier energy efficiency per kilometer in the 2024 University Eco-Drive Competition.',
    problemStatement:
      'Traditional electric vehicles rely on static grid charging, missing opportunities for onboard solar harvesting and light-weighting optimization.',
    solutionDetails:
      'Integrated 4.2m² of 24.5% efficiency monocrystalline solar cells with custom-designed synchronous boost MPPT modules and custom motor driver firmware.',
    impactMetrics: [
      { label: 'Peak Efficiency', value: '92.4', unit: 'km/kWh' },
      { label: 'Vehicle Weight', value: '148', unit: 'kg' },
      { label: 'Competition Rank', value: '2nd', unit: 'Place' },
    ],
    techStack: ['Carbon Fibre Fabrication', 'Custom PCB Design', 'SolidWorks / ANSYS', 'STM32 Embedded C'],
    contributors: [
      { name: 'CHOI HONG ER', role: 'Mechanical & Chassis Lead' },
      { name: 'MEAH CHEE XIANG', role: 'Power Electronics & Battery Design' },
    ],
    githubUrl: 'https://github.com/example/helios-solar-car',
  },
  {
    id: 'ai-waste-sorter',
    title: 'EcoVision AI Waste Sorting Station',
    tagline: 'Computer-vision autonomous recycling bin for high-traffic campus canteens.',
    category: 'Research & Engineering',
    status: 'Active',
    year: '2025',
    summary:
      'Smart sorting receptacle utilizing edge AI camera recognition to segregate plastics, aluminum cans, and paper automatically.',
    fullDescription:
      'EcoVision uses a low-latency edge TPU module with a tailored YOLO vision model to classify recyclables in under 400 milliseconds, activating pneumatic actuators to route items into appropriate subterranean collection bins.',
    problemStatement:
      'Campus recycling contamination rates exceeded 45% due to improper sorting by users at cafeteria disposal stations.',
    solutionDetails:
      'Trained a lightweight vision model on over 15,000 annotated campus waste images and designed a dual-flap pneumatic redirection mechanism.',
    impactMetrics: [
      { label: 'Classification Accuracy', value: '96.8%' },
      { label: 'Sorting Time', value: '< 400', unit: 'ms' },
      { label: 'Contamination Reduction', value: '82%' },
    ],
    techStack: ['YOLOv8 / TensorFlow Lite', 'Raspberry Pi 5 + Coral TPU', 'OpenCV', 'Pneumatics / Arduino'],
    contributors: [
      { name: 'BEH YUAN WEN', role: 'Computer Vision Engineer' },
      { name: 'CHOI HONG ER', role: 'Embedded Systems Lead' },
    ],
    githubUrl: 'https://github.com/example/ecovision-sorter',
  },
  {
    id: 'green-hydrogen-cell',
    title: 'Off-Grid Solid-State Hydrogen Storage',
    tagline: 'Benchtop PEM electrolyzer powered by surplus solar energy.',
    category: 'Research & Engineering',
    status: 'Active',
    year: '2025 – 2026',
    summary:
      'Experimental micro-scale hydrogen generator storing clean green hydrogen in low-pressure metal hydride canisters.',
    fullDescription:
      'This research prototype explores localized green hydrogen production using excess solar power during midday peak hours. The hydrogen is stored in safe, low-pressure metal hydride alloys and converted back to electrical power via fuel cells during dark hours.',
    problemStatement:
      'Lithium battery degradation and thermal risks limit long-duration seasonal energy storage in high-ambient tropical environments.',
    solutionDetails:
      'Constructed a 500W proton exchange membrane (PEM) electrolyzer coupled with a custom cooling jacket and solid-state alloy storage canister operating under 10 bar pressure.',
    impactMetrics: [
      { label: 'Storage Pressure', value: '< 10', unit: 'bar' },
      { label: 'Purity Level', value: '99.99%' },
      { label: 'Round-trip Efficiency', value: '58%' },
    ],
    techStack: ['Chemical Engineering', 'LabVIEW Data Acquisition', 'Pressure Safety Automation', 'Clean Energy Chemistry'],
    contributors: [
      { name: 'Dr. Nor Fatiha', role: 'Principal Advisor' },
      { name: 'CHIN JUNXI', role: 'Chemical & Energy Research Lead' },
    ],
    paperUrl: 'https://doi.org/10.1016/example.h2storage.2025',
  },
  {
    id: 'campus-energy-audit',
    title: 'Campus Zero-Carbon Pathway Audit',
    tagline: 'Comprehensive baseline carbon footprint assessment for 12 campus facilities.',
    category: 'Sustainability Campaigns',
    status: 'Completed',
    year: '2024',
    summary:
      'Student-led campus-wide energy and Scope 1 & 2 GHG emissions audit published directly to university management.',
    fullDescription:
      'Over 6 months, club members conducted detailed energy audits across 12 campus buildings, surveying lighting efficiency, chiller plant performance, and occupant behavior patterns to publish the university’s inaugural decarbonization roadmap.',
    problemStatement:
      'The university lacked granular energy breakdown data for individual faculties, hindering targeted retrofitting investments.',
    solutionDetails:
      'Deployed mobile power loggers, conducted thermal imaging scans of building envelopes, and modeled building baseline consumption using EnergyPlus software.',
    impactMetrics: [
      { label: 'Buildings Audited', value: '12' },
      { label: 'Identified Savings', value: '$45,000', unit: '/yr' },
      { label: 'Potential Carbon Cut', value: '220', unit: 'Tons/Yr' },
    ],
    techStack: ['EnergyPlus', 'FLIR Thermal Imaging', 'Scope 1/2 GHG Accounting', 'Python Pandas'],
    contributors: [
      { name: 'BEH YUAN WEN', role: 'Audit Team Lead' },
      { name: 'MEAH CHEE XIANG', role: 'Financial Analyst' },
    ],
    paperUrl: 'https://example.edu.my/decarbonization-report.pdf',
  },
  {
    id: 'solar-light-outreach',
    title: 'Rural Community Solar Lighting Initiative',
    tagline: 'Deploying off-grid solar lanterns and mini-kits for remote rural classrooms.',
    category: 'Community & Outreach',
    status: 'Scaling',
    year: '2024 – 2025',
    summary:
      'Hands-on workshop program assembling affordable, modular solar lighting kits and training rural community leaders.',
    fullDescription:
      'The club partnered with local non-profits to build 150 standalone solar lamp kits using recycled lithium battery cells tested and reassembled by students. The kits provide clean lighting for nocturnal study sessions in off-grid rural schools.',
    problemStatement:
      'Remote indigenous communities without reliable grid power rely on toxic kerosene lamps for evening light.',
    solutionDetails:
      'Designed a modular, repairable 12V DC solar lighting kit with 3D-printed enclosures and step-by-step pictorial manuals for local maintainers.',
    impactMetrics: [
      { label: 'Kits Assembled', value: '150+' },
      { label: 'Students Impacted', value: '450+' },
      { label: 'Batteries Repurposed', value: '600', unit: 'Cells' },
    ],
    techStack: ['Li-Ion Cell Testing', '3D Printing (PETG)', 'Modular DC Circuits', 'Community Training'],
    contributors: [
      { name: 'MEAH CHEE XIANG', role: 'Outreach Coordinator' },
      { name: 'CHIN JUNXI', role: 'Hardware Assembly Lead' },
    ],
  },
];
