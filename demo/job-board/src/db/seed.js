import { initDb, companies, jobs } from './db.js';

const COMPANIES = [
  {
    name: 'Stripe',
    website: 'https://stripe.com',
    location: 'San Francisco, CA',
    description: 'Stripe is a financial infrastructure platform for businesses. Millions of companies—from the world\'s largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.',
    logo_url: 'https://logo.clearbit.com/stripe.com',
  },
  {
    name: 'Vercel',
    website: 'https://vercel.com',
    location: 'San Francisco, CA',
    description: 'Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration. Vercel enables teams to iterate quickly and develop, preview, and ship delightful user experiences.',
    logo_url: 'https://logo.clearbit.com/vercel.com',
  },
  {
    name: 'Linear',
    website: 'https://linear.app',
    location: 'Remote',
    description: 'Linear is the new standard for modern software development. Streamline issues, sprints, and product roadmaps. Linear is built for high-performance teams that want to move fast and build quality software.',
    logo_url: 'https://logo.clearbit.com/linear.app',
  },
  {
    name: 'Figma',
    website: 'https://figma.com',
    location: 'San Francisco, CA',
    description: 'Figma is a collaborative design platform used by design and engineering teams to build products together. From early exploration to pixel-perfect specs, Figma brings teams together so that great design can happen.',
    logo_url: 'https://logo.clearbit.com/figma.com',
  },
  {
    name: 'Notion',
    website: 'https://notion.so',
    location: 'New York, NY',
    description: 'Notion is the connected workspace where better, faster work happens. Notes, docs, wikis, projects, and databases—all in one place. Used by over 30 million people and teams worldwide.',
    logo_url: 'https://logo.clearbit.com/notion.so',
  },
];

const JOBS = [
  // Stripe (index 0)
  {
    companyIndex: 0,
    title: 'Senior Software Engineer, Payments Infrastructure',
    description: `We're looking for a Senior Software Engineer to join our Payments Infrastructure team. You'll work on the core systems that process billions of dollars in payments annually, ensuring reliability, performance, and scalability.

Responsibilities:
- Design and build distributed systems that power Stripe's payment processing
- Collaborate with product and design to ship features used by millions of businesses
- Write high-quality, well-tested code in Ruby, Go, and Java
- Participate in on-call rotations and improve observability

Requirements:
- 5+ years of experience in backend software engineering
- Deep knowledge of distributed systems and databases
- Experience with high-throughput, low-latency systems
- Strong communication skills`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 180000,
    salary_max: 240000,
    remote: false,
  },
  {
    companyIndex: 0,
    title: 'Product Manager, Billing & Subscriptions',
    description: `Join Stripe's Billing team as a Product Manager and help define the future of recurring revenue infrastructure. You'll work closely with engineering, design, and go-to-market teams to ship products that help businesses grow.

Responsibilities:
- Define product strategy and roadmap for Stripe Billing
- Work with engineers and designers to ship high-quality features
- Conduct customer research and synthesize feedback
- Analyze metrics and drive data-informed decisions

Requirements:
- 4+ years of product management experience
- Experience with B2B SaaS or fintech products
- Strong analytical skills and comfort with ambiguity
- Excellent written and verbal communication`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 140000,
    salary_max: 185000,
    remote: true,
  },
  {
    companyIndex: 0,
    title: 'Site Reliability Engineer',
    description: `Stripe's Infrastructure team is looking for a Site Reliability Engineer to ensure our systems are reliable, scalable, and efficient. You'll partner with product engineering teams to bake reliability into everything we build.

Responsibilities:
- Own availability, latency, and performance SLOs for critical services
- Build and maintain internal tooling for deployment, monitoring, and alerting
- Drive post-mortems and implement systemic reliability improvements
- Champion engineering best practices across the organization

Requirements:
- 4+ years of SRE or DevOps experience
- Strong proficiency in Linux, Kubernetes, and Terraform
- Experience with observability tools (Datadog, Prometheus, Grafana)
- Oncall experience and comfort debugging production incidents`,
    location: 'New York, NY',
    type: 'full-time',
    salary_min: 160000,
    salary_max: 220000,
    remote: false,
  },

  // Vercel (index 1)
  {
    companyIndex: 1,
    title: 'Senior Frontend Engineer',
    description: `Vercel is hiring a Senior Frontend Engineer to work on our core product. You'll build the interfaces that hundreds of thousands of developers use every day to deploy and manage their projects.

Responsibilities:
- Build and maintain features in the Vercel dashboard using React and TypeScript
- Collaborate with designers to deliver polished, accessible user experiences
- Optimize performance and Core Web Vitals
- Mentor junior engineers and participate in code review

Requirements:
- 5+ years of experience with React and TypeScript
- Deep understanding of web performance and accessibility
- Experience with Next.js a strong plus
- Passion for developer tools and great UX`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 150000,
    salary_max: 200000,
    remote: true,
  },
  {
    companyIndex: 1,
    title: 'Developer Advocate',
    description: `Join Vercel's Developer Relations team and help developers get the most out of the platform. You'll create content, build demos, speak at conferences, and be a bridge between our users and product teams.

Responsibilities:
- Create technical blog posts, tutorials, and video content
- Build and maintain open-source examples and starter kits
- Represent Vercel at conferences and developer meetups
- Collect and synthesize developer feedback for the product team

Requirements:
- 3+ years of experience in developer relations or technical writing
- Strong proficiency in Next.js and the modern frontend ecosystem
- Active presence in the developer community
- Excellent communication and presentation skills`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 120000,
    salary_max: 160000,
    remote: true,
  },
  {
    companyIndex: 1,
    title: 'Staff Infrastructure Engineer',
    description: `We're looking for a Staff Infrastructure Engineer to lead the design and development of systems that power Vercel's global edge network. You'll work on some of the most challenging distributed systems problems in the industry.

Responsibilities:
- Architect and implement core infrastructure components for our edge network
- Lead technical design and drive cross-team alignment on infrastructure direction
- Improve the reliability and performance of our deployment pipeline
- Mentor senior engineers and raise the engineering bar

Requirements:
- 8+ years of infrastructure or systems engineering experience
- Expert-level knowledge of distributed systems, networking, and cloud platforms (AWS, GCP)
- Experience with Rust, Go, or C++ for performance-critical systems
- Track record of leading large-scale technical initiatives`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 200000,
    salary_max: 265000,
    remote: false,
  },

  // Linear (index 2)
  {
    companyIndex: 2,
    title: 'Full Stack Engineer',
    description: `Linear is looking for a Full Stack Engineer who cares deeply about quality and craftsmanship. You'll work on a small, highly autonomous team building the tools that the world's best software teams use to ship great software.

Responsibilities:
- Build features across the entire stack (TypeScript, React, Node.js, PostgreSQL)
- Own features end-to-end from design to production
- Contribute to our real-time sync engine and offline-first architecture
- Help establish technical direction and best practices

Requirements:
- 4+ years of full-stack experience with TypeScript
- Experience with React and modern state management patterns
- Solid understanding of relational databases and query optimization
- High standards for code quality and user experience`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 130000,
    salary_max: 180000,
    remote: true,
  },
  {
    companyIndex: 2,
    title: 'Senior Product Designer',
    description: `Linear is hiring a Senior Product Designer to help shape the future of software project management. You'll work directly with founders and engineers in a highly autonomous environment where design quality is paramount.

Responsibilities:
- Own the design of major product areas from concept to production
- Create detailed interaction designs, prototypes, and specifications
- Collaborate closely with engineers to ensure pixel-perfect implementation
- Help evolve and maintain our design system

Requirements:
- 5+ years of product design experience with a focus on complex tools
- Exceptional interaction design and visual design skills
- Experience designing for desktop and web applications
- Strong portfolio demonstrating systems thinking and attention to detail`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 120000,
    salary_max: 165000,
    remote: true,
  },
  {
    companyIndex: 2,
    title: 'Engineering Manager',
    description: `Linear is looking for an Engineering Manager to lead one of our product engineering teams. You'll help us scale our engineering organization while maintaining the high bar for quality and craftsmanship that Linear is known for.

Responsibilities:
- Manage and grow a team of 4–6 senior engineers
- Partner with product and design to define roadmap and priorities
- Drive technical strategy, architecture decisions, and engineering processes
- Recruit top engineering talent and build an inclusive team culture

Requirements:
- 3+ years of engineering management experience
- Strong technical background (5+ years as an IC engineer)
- Experience managing remote teams across time zones
- Track record of shipping high-quality products`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 180000,
    salary_max: 235000,
    remote: true,
  },

  // Figma (index 3)
  {
    companyIndex: 3,
    title: 'Software Engineer, Rendering Engine',
    description: `Figma's Rendering team is looking for a Software Engineer to work on the engine that powers our design canvas. You'll work on one of the most technically challenging parts of Figma—a high-performance renderer used by millions of designers.

Responsibilities:
- Develop and optimize Figma's WebAssembly and WebGL rendering pipeline
- Improve performance, fidelity, and correctness of vector graphics rendering
- Collaborate with product teams to enable new design capabilities
- Write performance-critical C++ and Rust code compiled to WebAssembly

Requirements:
- Strong proficiency in C++ or Rust
- Experience with graphics APIs (WebGL, Metal, Vulkan, or similar)
- Deep understanding of computer graphics fundamentals
- Experience with WebAssembly is a plus`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 160000,
    salary_max: 225000,
    remote: false,
  },
  {
    companyIndex: 3,
    title: 'Senior UX Researcher',
    description: `Figma is looking for a Senior UX Researcher to help us deeply understand our users—from indie designers to enterprise design teams. You'll conduct foundational and evaluative research to inform product strategy and design decisions.

Responsibilities:
- Plan and execute qualitative and quantitative research studies
- Synthesize insights and communicate findings to product and design stakeholders
- Partner with designers and PMs to prioritize research questions
- Build and maintain research infrastructure and tooling

Requirements:
- 5+ years of UX research experience in a product environment
- Mastery of qualitative research methods (interviews, usability studies, diary studies)
- Experience with quantitative methods and survey design
- Excellent written and verbal communication skills`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 130000,
    salary_max: 175000,
    remote: false,
  },
  {
    companyIndex: 3,
    title: 'Machine Learning Engineer, Search & Discovery',
    description: `Figma is hiring a Machine Learning Engineer to help us build intelligent features that make design faster and more accessible. You'll work on search, recommendations, and AI-powered design assistance.

Responsibilities:
- Design and train ML models for search ranking, component recommendations, and design suggestions
- Build data pipelines and model serving infrastructure
- Partner with product teams to ship ML features at scale
- Drive the ML roadmap for search and discovery experiences

Requirements:
- 4+ years of ML engineering experience
- Strong Python skills and experience with PyTorch or TensorFlow
- Experience deploying and monitoring ML models in production
- Familiarity with NLP, computer vision, or recommendation systems`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 170000,
    salary_max: 235000,
    remote: true,
  },

  // Notion (index 4)
  {
    companyIndex: 4,
    title: 'Backend Engineer, Data Platform',
    description: `Notion's Data Platform team is looking for a Backend Engineer to build the foundational systems that store, query, and sync data for over 30 million users. You'll work on some of the hardest scaling challenges in the industry.

Responsibilities:
- Build and scale Notion's core data storage and sync infrastructure
- Improve the reliability and performance of our PostgreSQL-based data layer
- Design APIs and data models for new product features
- Own services end-to-end, including on-call responsibilities

Requirements:
- 4+ years of backend engineering experience
- Strong proficiency in TypeScript or another typed backend language
- Deep experience with PostgreSQL or other relational databases at scale
- Experience with distributed systems and eventual consistency`,
    location: 'New York, NY',
    type: 'full-time',
    salary_min: 155000,
    salary_max: 210000,
    remote: false,
  },
  {
    companyIndex: 4,
    title: 'Senior iOS Engineer',
    description: `Join Notion's mobile team and help us build a best-in-class iOS experience for one of the fastest-growing productivity apps in the world. You'll own significant parts of the iOS app and help define how millions of people interact with Notion on mobile.

Responsibilities:
- Build and maintain features in Notion's iOS app using Swift and SwiftUI
- Collaborate with design and backend teams to deliver end-to-end features
- Improve app performance, reliability, and accessibility
- Mentor engineers and contribute to iOS platform standards

Requirements:
- 5+ years of iOS development experience with Swift
- Deep knowledge of UIKit and SwiftUI
- Experience with offline-first apps and sync architectures
- Passion for building polished, high-quality mobile experiences`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 160000,
    salary_max: 210000,
    remote: true,
  },
  {
    companyIndex: 4,
    title: 'Growth Marketing Manager',
    description: `Notion is looking for a Growth Marketing Manager to drive user acquisition and activation across our self-serve channels. You'll design and run experiments to grow Notion's user base and improve conversion throughout the funnel.

Responsibilities:
- Own paid acquisition channels (SEM, social, display) and optimize for efficiency
- Design and run A/B tests on landing pages, onboarding flows, and email campaigns
- Analyze funnel data and identify opportunities for growth
- Partner with product, design, and data teams on growth initiatives

Requirements:
- 4+ years of growth marketing or performance marketing experience
- Strong analytical skills and proficiency with SQL and analytics tools
- Experience with SEM, paid social, and lifecycle marketing
- Track record of running successful growth experiments`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 100000,
    salary_max: 140000,
    remote: false,
  },
];

async function seed() {
  const db = initDb();

  // Clear existing data
  db.exec('DELETE FROM applications');
  db.exec('DELETE FROM jobs');
  db.exec('DELETE FROM companies');

  console.log('Seeding companies...');
  const companyRecords = COMPANIES.map(c => {
    const record = companies.create(c);
    console.log(`  Created: ${record.name} (id=${record.id})`);
    return record;
  });

  console.log('\nSeeding jobs...');
  for (const job of JOBS) {
    const company = companyRecords[job.companyIndex];
    const { companyIndex, ...jobData } = job;
    const record = jobs.create({ ...jobData, company_id: company.id });
    console.log(`  Created: ${record.title} @ ${company.name} (id=${record.id})`);
  }

  console.log(`\nDone! Seeded ${companyRecords.length} companies and ${JOBS.length} jobs.`);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
