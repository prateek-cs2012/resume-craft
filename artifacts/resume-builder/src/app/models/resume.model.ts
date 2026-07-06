export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface WorkExperience {
  id: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  company: string;
  position: string;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
  year: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  duration: string;
  bullets: string[];
}

export interface TechnicalSkillCategory {
  category: string;
  skills: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  profileSummary: string[];
  coreCompetencies: string[];
  technicalSkills: TechnicalSkillCategory[];
  softSkills: string[];
  domainExposure: string[];
  workExperience: WorkExperience[];
  education: Education[];
  projects: Project[];
  languages: string[];
  selectedTemplate: string;
}

export const DEFAULT_RESUME: ResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    title: 'Senior Software Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 555-000-1234',
    address: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    website: 'alexmorgan.dev'
  },
  profileSummary: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, delivering robust solutions across fintech, healthcare, and logistics domains.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat, with hands-on experience in cloud infrastructure, distributed systems, and CI/CD pipelines.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, crafting scalable REST APIs and event-driven architectures.',
    'Excepteur sint occaecat cupidatat non proident, leading cross-functional teams of up to 12 engineers and ensuring timely delivery of high-quality software.',
    'Skilled in designing resilient systems with a focus on performance optimisation, maintainability, and alignment with enterprise-grade standards.'
  ],
  coreCompetencies: [
    'Full-Stack Development', 'System Design & Scalability', 'Performance Optimisation',
    'Microservices Architecture', 'CI/CD Pipeline Implementation', 'Database Design & ORM',
    'Cloud-Native Solutions', 'Containerisation & Orchestration', 'Cross-Functional Collaboration',
    'REST & GraphQL APIs', 'Distributed Systems Architecture', 'Technical Leadership'
  ],
  technicalSkills: [
    { category: 'Programming Languages', skills: 'TypeScript, Python, Go' },
    { category: 'Frameworks & Libraries', skills: 'React, Node.js, Express, FastAPI' },
    { category: 'Databases', skills: 'PostgreSQL, Redis, MongoDB' },
    { category: 'Cloud & DevOps', skills: 'AWS, Docker, Kubernetes, GitHub Actions' },
    { category: 'Architecture', skills: 'Microservices, Event-Driven, Domain-Driven Design' }
  ],
  softSkills: ['Communication', 'Leadership', 'Problem Solving', 'Team Collaboration', 'Mentoring'],
  domainExposure: ['Fintech', 'Healthcare', 'Logistics', 'SaaS'],
  workExperience: [
    {
      id: '1',
      startDate: 'Mar 2022',
      endDate: '',
      isCurrent: true,
      company: 'Acme Corp',
      position: 'Senior Software Engineer',
      bullets: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.'
      ]
    },
    {
      id: '2',
      startDate: 'Jul 2019',
      endDate: 'Mar 2022',
      isCurrent: false,
      company: 'Initech Solutions',
      position: 'Software Engineer',
      bullets: [
        'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
        'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
        'Ut labore et dolore magnam aliquam quaerat voluptatem architecto beatae vitae dicta sunt explicabo.'
      ]
    },
    {
      id: '3',
      startDate: 'Jan 2017',
      endDate: 'Jul 2019',
      isCurrent: false,
      company: 'Globex Systems',
      position: 'Junior Developer',
      bullets: [
        'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
        'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.',
        'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime.'
      ]
    }
  ],
  education: [
    {
      id: '1',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      institution: 'State University of Lorem',
      location: 'Lorem City, USA',
      year: '2017'
    }
  ],
  projects: [
    {
      id: '1',
      title: 'Project Aurum',
      role: 'Lead Engineer',
      duration: '8 months',
      bullets: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
      ]
    },
    {
      id: '2',
      title: 'Nexus Data Platform',
      role: 'Backend Engineer',
      duration: '6 months',
      bullets: [
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem.'
      ]
    },
    {
      id: '3',
      title: 'Vortex Streaming Engine',
      role: 'Full-Stack Developer',
      duration: '5 months',
      bullets: [
        'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit consequuntur magni dolores.',
        'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur adipisci velit.'
      ]
    }
  ],
  languages: ['English', 'Spanish'],
  selectedTemplate: 'modern'
};
