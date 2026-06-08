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
    fullName: 'Prateek Tiwari',
    title: 'Lead Software Engineer',
    email: 'prateek@example.com',
    phone: '+91 XXXXX XXXXX',
    address: 'N2-508, Jaypee Aman, Sector 151, Noida, Uttar Pradesh - 201310',
    linkedin: 'linkedin.com/in/prateektiwari',
    github: '',
    website: ''
  },
  profileSummary: [
    'Accomplished software engineer with 9+ years of experience in full-stack Java development, delivering robust applications across Banking, Healthcare, EV mobility, and IoT domains.',
    'Expertise in microservices architecture and cloud-native solutions, transforming monolithic systems into scalable, modular, and high-performance applications, with hands-on experience in AWS, Docker, Kubernetes, and CI/CD pipelines.',
    'Proficient in system design and backend development, crafting High-Level Designs (HLD), Low-Level Designs (LLD), REST APIs, and enterprise-scale distributed systems including event-driven architectures and Kafka-based solutions.',
    'Experienced team leader and mentor, guiding teams of up to 14 engineers, ensuring efficient task distribution, technical guidance, and timely delivery of high-quality software solutions.',
    'Skilled in designing scalable and resilient software architectures, including modular componentization, service orchestration, and performance optimization, ensuring high availability, maintainability, and alignment with enterprise standards.'
  ],
  coreCompetencies: [
    'Full-Stack Java Development', 'System Design & Scalability', 'Performance Optimization',
    'Microservices Architecture', 'CI/CD Pipeline Implementation', 'Database Design & ORM Frameworks',
    'Cloud-Native Solutions (AWS)', 'Containerization & Orchestration', 'Cross-Functional Collaboration',
    'Backend & REST API Development', 'Distributed & Scalable System Architecture', 'Project Management',
    'Software Development Lifecycle', 'Technical Leadership & Team Mentoring', 'Requirement Gathering & Analysis'
  ],
  technicalSkills: [
    { category: 'Programming Languages', skills: 'Java' },
    { category: 'Frameworks & Libraries', skills: 'Spring, Spring Boot, Hibernate, Spring Data JPA, Angular, React, Node.js' },
    { category: 'Microservices & Messaging', skills: 'Microservices, Kafka' },
    { category: 'Cloud & DevOps', skills: 'AWS, Docker, CI/CD, GIT' },
    { category: 'System Design & Architecture', skills: 'System Design, HLD, LLD, Monolithic to Microservices Migration' }
  ],
  softSkills: ['Communication', 'Leadership', 'Problem Solving', 'Team Collaboration', 'Mentoring'],
  domainExposure: ['Banking', 'Healthcare', 'Electric Vehicles (EV)', 'Internet of Things (IoT)'],
  workExperience: [
    {
      id: '1',
      startDate: 'Apr 2023',
      endDate: '',
      isCurrent: true,
      company: 'TechStar Group',
      position: 'Lead Software Engineer',
      bullets: [
        'Leading and contributing to full-stack Java development projects, delivering end-to-end software solutions.',
        'Designing and developing cloud-native microservices with Spring Boot and AWS for scalable, high-performance applications.',
        'Collaborating with Business Analysts and Product teams, translating requirements into technical designs and actionable solutions.',
        'Performing system design activities, including High-Level Design (HLD) and Low-Level Design (LLD), to create modular and reusable components.',
        'Developing backend services, REST APIs, and managing the full SDLC lifecycle across multiple domains including Banking, Healthcare, EVs, and IoT.',
        'Managing containerized deployments and optimizing CI/CD workflows while mentoring and guiding teams of up to 14 engineers.'
      ]
    },
    {
      id: '2',
      startDate: 'Aug 2022',
      endDate: 'Apr 2023',
      isCurrent: false,
      company: 'Nickelfox Technologies',
      position: 'Lead Software Engineer',
      bullets: [
        'Fostered a collaborative and innovative environment, promoting a culture of excellence.',
        'Led development of cutting-edge software solutions, ensuring high-quality delivery to clients.',
        'Mentored team members and drove best practices in software design, development, and deployment.'
      ]
    },
    {
      id: '3',
      startDate: 'Jun 2016',
      endDate: 'Aug 2022',
      isCurrent: false,
      company: 'Samin Tekmindz',
      position: 'Java Developer',
      bullets: [
        'Worked as a Java Backend Developer using Spring, Spring Boot, Hibernate, Spring Data JPA, and OpenMRS.',
        'Built and maintained backend services, APIs, and data persistence layers to support healthcare-focused applications.',
        'Collaborated with cross-functional teams to deliver reliable, scalable backend solutions.'
      ]
    }
  ],
  education: [
    {
      id: '1',
      degree: 'Bachelor of Technology',
      field: 'Computer Science Engineering',
      institution: 'Uttar Pradesh Technical University (UPTU)',
      location: 'Uttar Pradesh, India',
      year: '2016'
    }
  ],
  projects: [
    {
      id: '1',
      title: 'Blink EV Mobility Platform',
      role: 'Software Engineer',
      duration: '7 months',
      bullets: [
        'Redesigned a legacy monolithic system into a scalable microservices architecture, improving performance and maintainability by 30%.',
        'Optimized CI/CD pipelines to cut deployment time by 40%, increase release frequency, and developed robust APIs/microservices.',
        'Partnered with Business Analysts and Product teams to convert business requirements into clear, actionable technical user stories.'
      ]
    },
    {
      id: '2',
      title: 'Open Charge Alliance – Compliance Testing Tool',
      role: 'Backend/Integration Engineer',
      duration: '10 months',
      bullets: [
        'Developed and maintained a compliance testing tool validating System Under Test (SUT) behavior against OCPP 2.0.1 specifications.',
        'Improved reliability and automation of validation workflows.'
      ]
    },
    {
      id: '3',
      title: 'Mobile Banking Platform (African Bank)',
      role: 'Backend Engineer',
      duration: '7 months',
      bullets: [
        'Developed secure and scalable backend services to support mobile banking operations.',
        'Enhanced API performance and contributed to feature development for financial transaction workflows.'
      ]
    }
  ],
  languages: ['English', 'Hindi'],
  selectedTemplate: 'modern'
};
