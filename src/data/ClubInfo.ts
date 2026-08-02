/**
 * Everything on the About / Contact / References page that is club-specific
 * lives here, so none of it is buried in JSX.
 *
 * ⚠️ PLACEHOLDERS: the committee roster, the email address, the social handles
 * and the room number below are stand-ins. They are shaped correctly but the
 * values are invented. Replace them before this page goes anywhere public.
 * The references are real organisations with real URLs and can stay as they
 * are.
 */

export type CommitteeMember = {
  role: string;
  name: string;
  focus: string;
};

/** ⚠️ Placeholder names. Replace with the actual committee. */
export const committee: CommitteeMember[] = [
  { role: 'President', name: 'Tan Wei Ming', focus: 'Direction and partnerships' },
  { role: 'Vice President', name: 'Nurul Aisyah binti Rahman', focus: 'Programmes and events' },
  { role: 'Secretary', name: 'Lim Jia Hui', focus: 'Records and correspondence' },
  { role: 'Treasurer', name: 'Arvind Raj a/l Kumaran', focus: 'Budget and sponsorship' },
  { role: 'Technical Lead', name: 'Chong Kai Xin', focus: 'Builds, data and this site' },
  { role: 'Outreach Lead', name: 'Muhammad Danial bin Zulkifli', focus: 'Campus and community' },
];

/** ⚠️ Placeholder. Replace with the club's faculty advisor. */
export const advisor = {
  name: 'Dr. Sarawathy Ramasamy',
  title: 'Faculty Advisor',
  department: 'Faculty of Information and Communication Technology',
  note: 'Advises on research direction and reviews the technical claims made across this site.',
};

export type Channel = {
  id: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
};

/** ⚠️ Placeholder contact details. */
export const channels: Channel[] = [
  { id: 'email', label: 'Email', value: 'greentech@example.edu.my', href: 'mailto:greentech@example.edu.my' },
  { id: 'instagram', label: 'Instagram', value: '@greentechclub', href: 'https://instagram.com', external: true },
  { id: 'linkedin', label: 'LinkedIn', value: 'Green Tech Club', href: 'https://linkedin.com', external: true },
];

/** ⚠️ Placeholder location. */
export const location = {
  room: 'Block N, Level 2, Room N204',
  campus: 'Universiti Tunku Abdul Rahman, Sungai Long Campus',
  hours: 'Open Wednesdays and Fridays, 2pm to 6pm',
};

export type SupportRoute = {
  title: string;
  body: string;
  action: string;
  href: string;
  span: 'wide' | 'mid' | 'narrow';
};

export const supportRoutes: SupportRoute[] = [
  {
    title: 'Join the club',
    body: 'Open to every faculty and every year. No background in energy required, only the willingness to build something and see it through.',
    action: 'Talk to us',
    href: '#contact',
    span: 'wide',
  },
  {
    title: 'Collaborate',
    body: 'Departments, student bodies and companies working on energy, climate or hardware. Bring a problem and we will bring people.',
    action: 'Propose a project',
    href: '#contact',
    span: 'mid',
  },
  {
    title: 'Sponsor',
    body: 'Equipment, materials and event costs. Sponsorship is acknowledged on this site and in the work it funds.',
    action: 'Request the deck',
    href: '#contact',
    span: 'narrow',
  },
];

export type Reference = {
  organisation: string;
  abbreviation: string;
  scope: string;
  href: string;
};

/**
 * Real organisations, linked to their own domains. Deliberately cited at the
 * organisation level rather than by report title and year, because a fabricated
 * citation is worse than a general one. Add specific reports as they are used.
 */
export const references: Reference[] = [
  {
    organisation: 'International Energy Agency',
    abbreviation: 'IEA',
    scope: 'Global energy statistics, generation mix and technology outlooks',
    href: 'https://www.iea.org',
  },
  {
    organisation: 'International Renewable Energy Agency',
    abbreviation: 'IRENA',
    scope: 'Renewable capacity data, cost trends and deployment policy',
    href: 'https://www.irena.org',
  },
  {
    organisation: 'Intergovernmental Panel on Climate Change',
    abbreviation: 'IPCC',
    scope: 'Assessment reports on climate science and mitigation pathways',
    href: 'https://www.ipcc.ch',
  },
  {
    organisation: 'United Nations',
    abbreviation: 'UN',
    scope: 'Climate action framing and the Sustainable Development Goals',
    href: 'https://www.un.org/en/climatechange',
  },
  {
    organisation: 'Our World in Data',
    abbreviation: 'OWID',
    scope: 'Open datasets and charts on energy production and consumption',
    href: 'https://ourworldindata.org/energy',
  },
];
