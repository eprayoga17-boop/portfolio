/** Profile content from Erik's CV (2026) and portfolio (2025). */

export const profile = {
  name: "Erik Prayoga",
  title: "Brand & social media designer",
  city: "Surabaya, Indonesia",
  motto: "Berkarya untuk Bercanda",
  email: "eprayoga17@gmail.com",
  whatsapp: "6289698914005",
  whatsappDisplay: "+62 896 9891 4005",
  instagram: "erik_riga",
  linkedin: null as string | null, // add the full profile URL when available
  cvPath: "/Erik-Prayoga-CV.pdf",
};

export const stats = [
  { value: 7, suffix: "+", label: "years designing for brands" },
  { value: 50, suffix: "+", label: "brands handled" },
  { value: 4, suffix: "", label: "countries: ID, SG, MY, AU" },
  { value: 12, prefix: "9-", suffix: "", label: "designs a day, at peak" },
  { value: 200, suffix: "%", label: "engagement growth in two months, current role" },
] as const;

export type Experience = {
  company: string;
  role: string;
  type: string;
  location: string;
  country: "ID" | "SG" | "MY" | "AU";
  period: string;
  note: string;
};

export const experience: Experience[] = [
  {
    company: "SFS Group Indonesia",
    role: "Senior Designer",
    type: "Full-time",
    location: "Surabaya",
    country: "ID",
    period: "Dec 2025 - now",
    note: "Leading the design team in a fast FMCG company. Two social accounts, landing pages, e-commerce assets. Engagement up as much as 200% in two months.",
  },
  {
    company: "5Stones Agency",
    role: "Social Media Designer",
    type: "Freelance, remote",
    location: "Wollongong, Australia",
    country: "AU",
    period: "Jan 2025 - Nov 2025",
    note: "Churches, humanitarian groups, assistive software, activewear and electric motorbikes. Plus posters and book covers.",
  },
  {
    company: "Fiture Health",
    role: "Social Media Designer",
    type: "Full-time, remote",
    location: "Singapore",
    country: "SG",
    period: "Jul 2023 - Jun 2025",
    note: "Health, beauty, aesthetics and social care brands. Many identities, one consistent standard. Some client websites too.",
  },
  {
    company: "Vision Indonesia",
    role: "Brand Designer",
    type: "Freelance",
    location: "Surabaya",
    country: "ID",
    period: "May 2024 - Jul 2024",
    note: "Three company social accounts with one visual concept.",
  },
  {
    company: "iMotion Production",
    role: "Senior Brand Designer",
    type: "Project, remote",
    location: "Selangor, Malaysia",
    country: "MY",
    period: "Mar 2024 - May 2024",
    note: "Event branding, logos and pitch decks. Directed the design team to keep everything on theme.",
  },
  {
    company: "AIDA Creative Agency",
    role: "Social Media Designer",
    type: "Project, remote",
    location: "Surabaya",
    country: "ID",
    period: "2023, 3 months",
    note: "Social content on a short project contract.",
  },
  {
    company: "Start Friday Asia",
    role: "Brand Designer",
    type: "Full-time",
    location: "Surabaya",
    country: "ID",
    period: "Oct 2019 - May 2023",
    note: "Four-plus brands at once, 9 to 12 designs a day. Identities, video ads, logo motion, event concepts. Mentored interns.",
  },
  {
    company: "Asia Digital Printing",
    role: "Designer",
    type: "Full-time",
    location: "Surabaya",
    country: "ID",
    period: "Jul 2019 - Oct 2019",
    note: "Fast-turnaround print designs, and helping customers pick the right print.",
  },
  {
    company: "Progressive Yearbook",
    role: "Layout Designer",
    type: "Internship",
    location: "Sidoarjo",
    country: "ID",
    period: "Feb 2019 - May 2019",
    note: "Yearbooks for four-plus schools and 100+ retouched student photos.",
  },
];

export const tools = [
  { name: "Adobe Illustrator", level: "Professional" },
  { name: "Adobe Photoshop", level: "Professional" },
  { name: "Adobe After Effects", level: "Advanced" },
  { name: "Canva", level: "Advanced" },
  { name: "CapCut Pro", level: "Intermediate" },
] as const;

export const education = [
  { school: "Universitas 17 Agustus 1945 Surabaya", detail: "Communication Science", period: "2021 - 2025" },
  { school: "SMKN 1 Surabaya", detail: "Multimedia", period: "2016 - 2019" },
];

export const achievements = [
  "1st place, RSIA Kendangsari 14th anniversary logo",
  "Runner-up, Negkom poster competition 2022",
  "Finalist, Mufest poster competition 2022",
  "Runner-up, Negkom poster competition 2021",
];
