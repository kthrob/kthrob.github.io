interface BasicInfo {
  name: string,
  jobRole: string; // e.g., "Full Stack Developer",
  summary: string; // A brief summary or tagline
  location: string;
  contactInfo: ContactInfo;
}

interface ContactInfo {
  email: string;
  phone?: string; // Optional
  linkedin?: string; // Optional LinkedIn profile URL
  github?: string; // Optional GitHub profile URL
}

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialLinks {
  twitter?: SocialLink;
  facebook?: SocialLink;
  instagram?: SocialLink;
  [ key: string ]: SocialLink | undefined; // Allow additional social links
}

interface experienceDate {
  year: string; // e.g., "Jan 2020"
  month?: string; // Optional month, e.g., "Jan"
}

interface experienceItem {
  role: string;
  companyName: string;
  companyLocation: string;
  remote: boolean; // Optional flag for remote work
  companyURL?: string; // Optional link to company website
  startDate: experienceDate;
  endDate?: experienceDate;
  description?: string;
  achievements?: string[]; // Optional list of key achievements for bullet points
  skills?: string[]; // Optional list of skills/technologies used
}

interface educationItem {
  institution: string;
  fieldOfStudy: string;
  degree?: string;
  gpa?: string; // Optional GPA
  startDate: experienceDate;
  endDate?: experienceDate;
  location?: string;
  description?: string;
}

interface portfolioItem {
  title: string;
  type: string; // e.g., "Web App", "Mobile App"
  description: string;
  imgSrc?: string; // URL or path to an image
  webURL?: string;
  githubURL?: string; // Optional link to GitHub repository
  skills?: string[]; // Optional list of skills/technologies used
}

interface pageConfig {
  basicInfo: BasicInfo;
  socialLinks?: SocialLinks; // Optional
  experience: experienceItem[];
  education: educationItem[];
  portfolio?: portfolioItem[]; // Optional
  skills?: string[]; // Optional list of key skills// Optional theme preference
}

export const pageConfig: pageConfig = {
  basicInfo: {
    name: "Keith Robinson",
    jobRole: "Senior Fullstack Software Engineer",
    summary: "Results-driven full-stack engineer with 6+ years of experience building scalable, high-performance web applications. Skilled in modernizing legacy systems, optimizing developer workflows, and delivering user-centric solutions. Proven track record of improving system performance, reducing bugs, and mentoring teams to deliver high-quality software.",
    location: "Phoenix, Arizona",
    contactInfo: {
      email: "kthrob@gmail.com",
      phone: "712-490-7823",
      linkedin: "https://linkedin.com/in/keith-robinson-2b6527118",
      github: "https://github.com/kthrob"
    },
  },
  socialLinks: {
    twitter: { platform: "Twitter", url: "https://twitter.com/kthrob" }
  },
  experience: [
    {
      role: "Senior Product Engineer",
      companyName: "Promethic Systems",
      companyLocation: "Wilmington, Delaware",
      remote: true,
      companyURL: "https://promethic.online",
      startDate: { year: "2024", month: "September" },
      description: "Leading the development of a cutting-edge SaaS platform for managing and optimizing cloud infrastructure. Collaborating closely with cross-functional teams to deliver high-impact features that enhance user experience and operational efficiency.",
      achievements: [
        "Architected and implemented a microservices-based architecture using Node.js, Express, and Docker, resulting in a 30% improvement in system scalability and maintainability.",
        "Led the migration of legacy systems to modern cloud infrastructure on AWS, reducing operational costs by 20% and improving deployment times by 50%.",
        "Mentored junior developers and conducted code reviews, fostering a culture of continuous learning and high-quality code standards within the team."
      ]
    },
    {
      role: "Backend Software Engineer",
      companyName: "DTN",
      companyLocation: "Omaha, Nebraska",
      remote: true,
      companyURL: "https://dtn.com",
      startDate: { year: "2023", month: "January" },
      endDate: { year: "2024", month: "August" },
      achievements: [
        'Designed backend architecture for a greenfield energy product, enabling scalable growth.',
        'Implemented tRPC, reducing integration bugs by ~30 % and accelerating feature delivery.',
        'Pioneered React Server Components, cutting client bundle size by ~20%.',
        'Directed migration from NodeJS to Bun, improving build times by ~25%.'
      ]
    },
    {
      role: "Software Developer",
      companyName: "CareDx, Inc.",
      companyLocation: "Omaha, Nebraska",
      remote: false,
      companyURL: "https://caredx.com/",
      startDate: { year: "2020", month: "February" },
      endDate: { year: "2022", month: "March" },
      achievements: [
        'Developed healthcare software on .NET, ensuring HL7/FHIR compliance.',
        'Modernized legacy .NET app by integrating React components.',
        'Converted XML configs to YAML, reducing setup errors by ~20%.'
      ]
    },
    {
      role: "Backend Software Engineer",
      companyName: "Venley",
      companyLocation: "Los Angeles, California",
      remote: true,
      companyURL: "https://licensechamps.com/venley/",
      startDate: { year: "2019", month: "February" },
      endDate: { year: "2020", month: "February" },
      achievements: [
        'Enhanced Shopify sites with Liquid templates, improving UX.',
        'Built backend automation workflows, reducing inventory overhead by ~12%.',
        'Optimized integrations with NoSQL + GraphQL, reducing manual intervention by ~30%.'
      ]
    },
    {
      role: "IT Support Specialist",
      companyName: "Riverside Technologies, Inc.",
      companyLocation: "North Sioux City, South Dakota",
      remote: false,
      companyURL: "https://www.1rti.com/",
      startDate: { year: "2017", month: "January" },
      endDate: { year: "2018", month: "September" },
      achievements: [
        'Delivered technical support for client networks and systems.',
        'Spearheaded the transition of hosting from VMs to containers, cutting costs by >20%.',
        'Proactively resolved performance bottlenecks to improve reliability.'
      ]
    }
  ],
  education: [
    {
      institution: "Western Iowa Tech Community College",
      fieldOfStudy: "Architectural Engineering Technology",
      startDate: { year: "2007", month: "August" },
      endDate: { year: "2011", month: "January" },
      location: "Sioux City, Iowa"
    },
    {
      institution: "Iowa State University",
      fieldOfStudy: "Architectural Engineering",
      startDate: { year: "2004", month: "January" },
      endDate: { year: "2006", month: "January" },
      location: "Ames, Iowa"
    }
  ],
  portfolio: [
    {
      title: "Bluff's Little Thinkers",
      type: "Website",
      description: "Customer facing website for childcare facility.",
      webURL: 'https://www.bluffslittlethinkers.com'
    },
    {
      title: "Test",
      type: "Website",
      description: "Test Portfolio entry",
      webURL: 'https://www.apple.com'
    },
    {
      title: "Screwfast",
      type: "Website",
      description: "Screwfast Portfolio entry",
      webURL: 'https://www.screwfast.uk'
    }
  ]
}