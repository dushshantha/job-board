import { initDb, companies, jobs } from './db.js';

const COMPANIES = [
  {
    name: 'Stripe',
    website: 'https://stripe.com',
    location: 'San Francisco, CA',
    description:
      "Stripe is a financial infrastructure platform for businesses. Millions of companies—from the world's largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.",
    logo_url: 'https://logo.clearbit.com/stripe.com',
  },
  {
    name: 'Vercel',
    website: 'https://vercel.com',
    location: 'San Francisco, CA',
    description:
      'Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration. Vercel enables teams to iterate quickly and develop, preview, and ship delightful user experiences.',
    logo_url: 'https://logo.clearbit.com/vercel.com',
  },
  {
    name: 'Linear',
    website: 'https://linear.app',
    location: 'Remote',
    description:
      'Linear is the new standard for modern software development. Streamline issues, sprints, and product roadmaps. Linear is built for high-performance teams that want to move fast and build quality software.',
    logo_url: 'https://logo.clearbit.com/linear.app',
  },
  {
    name: 'Figma',
    website: 'https://figma.com',
    location: 'San Francisco, CA',
    description:
      'Figma is a collaborative design platform used by design and engineering teams to build products together. From early exploration to pixel-perfect specs, Figma brings teams together so that great design can happen.',
    logo_url: 'https://logo.clearbit.com/figma.com',
  },
  {
    name: 'Notion',
    website: 'https://notion.so',
    location: 'New York, NY',
    description:
      'Notion is the connected workspace where better, faster work happens. Notes, docs, wikis, projects, and databases—all in one place. Used by over 30 million people and teams worldwide.',
    logo_url: 'https://logo.clearbit.com/notion.so',
  },
];

const JOBS = [
  // ---- Stripe ----
  {
    companyIndex: 0,
    title: 'Senior Software Engineer, Payments Infrastructure',
    description: `We're looking for a Senior Software Engineer to join our Payments Infrastructure team. You'll work on the core systems that process billions of dollars in payments annually.\n\nResponsibilities:\n- Design and build distributed systems for payment processing\n- Write high-quality code in Ruby, Go, and Java\n- Participate in on-call rotations and improve observability\n\nRequirements:\n- 5+ years backend engineering\n- Deep knowledge of distributed systems\n- Experience with high-throughput, low-latency systems`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 180000,
    salary_max: 240000,
    remote: false,
    tags: ['Ruby', 'Go', 'Java', 'Distributed Systems', 'Kubernetes'],
  },
  {
    companyIndex: 0,
    title: 'Product Manager, Billing & Subscriptions',
    description: `Join Stripe's Billing team as a Product Manager and help define the future of recurring revenue infrastructure.\n\nResponsibilities:\n- Define product strategy and roadmap for Stripe Billing\n- Work with engineers and designers to ship high-quality features\n- Conduct customer research and analyze metrics\n\nRequirements:\n- 4+ years of product management experience\n- Experience with B2B SaaS or fintech\n- Strong analytical skills`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 140000,
    salary_max: 185000,
    remote: true,
    tags: ['Product Management', 'B2B SaaS', 'Fintech', 'Analytics'],
  },
  {
    companyIndex: 0,
    title: 'Site Reliability Engineer',
    description: `Stripe's Infrastructure team is looking for a Site Reliability Engineer to ensure our systems are reliable, scalable, and efficient.\n\nResponsibilities:\n- Own availability, latency, and performance SLOs\n- Build and maintain internal tooling for deployment and monitoring\n- Drive post-mortems and reliability improvements\n\nRequirements:\n- 4+ years of SRE or DevOps experience\n- Proficiency in Linux, Kubernetes, and Terraform\n- Experience with Datadog, Prometheus, Grafana`,
    location: 'New York, NY',
    type: 'full-time',
    salary_min: 160000,
    salary_max: 220000,
    remote: false,
    tags: ['Kubernetes', 'Terraform', 'Datadog', 'Prometheus', 'Linux', 'SRE'],
  },

  // ---- Vercel ----
  {
    companyIndex: 1,
    title: 'Senior Frontend Engineer',
    description: `Vercel is hiring a Senior Frontend Engineer to work on our core product. You'll build the interfaces that hundreds of thousands of developers use every day.\n\nResponsibilities:\n- Build and maintain features using React and TypeScript\n- Collaborate with designers to deliver polished, accessible experiences\n- Optimize performance and Core Web Vitals\n\nRequirements:\n- 5+ years of frontend engineering experience\n- Expert-level React and TypeScript skills\n- Strong understanding of web performance`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 160000,
    salary_max: 210000,
    remote: true,
    tags: ['React', 'TypeScript', 'Next.js', 'CSS', 'Web Performance'],
  },
  {
    companyIndex: 1,
    title: 'Developer Advocate',
    description: `We're looking for a Developer Advocate to help educate and inspire the next generation of builders on Vercel.\n\nResponsibilities:\n- Create technical content (blog posts, videos, tutorials)\n- Represent Vercel at conferences and community events\n- Gather developer feedback and relay to product teams\n\nRequirements:\n- 3+ years of software engineering experience\n- Strong public speaking and writing skills\n- Deep familiarity with the Next.js / React ecosystem`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 120000,
    salary_max: 160000,
    remote: true,
    tags: ['React', 'Next.js', 'Technical Writing', 'Developer Relations', 'Public Speaking'],
  },
  {
    companyIndex: 1,
    title: 'Infrastructure Engineer, Edge Network',
    description: `Join Vercel's Infrastructure team and help build the edge network that powers millions of deployments daily.\n\nResponsibilities:\n- Develop and optimize Vercel's global edge infrastructure\n- Improve deployment pipeline performance and reliability\n- Collaborate with product teams on edge computing features\n\nRequirements:\n- 4+ years of infrastructure or systems engineering\n- Strong knowledge of networking and CDN concepts\n- Experience with Rust or Go`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 170000,
    salary_max: 220000,
    remote: false,
    tags: ['Rust', 'Go', 'CDN', 'Networking', 'Edge Computing', 'Kubernetes'],
  },

  // ---- Linear ----
  {
    companyIndex: 2,
    title: 'Full-Stack Engineer',
    description: `Linear is looking for a Full-Stack Engineer to help build the best project management tool in the world.\n\nResponsibilities:\n- Ship product features end-to-end, from database to UI\n- Build with React, TypeScript, and Node.js\n- Write clean, well-tested code with attention to detail\n\nRequirements:\n- 3+ years full-stack experience\n- Proficiency in TypeScript, React, and PostgreSQL\n- Appreciation for great product design`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 150000,
    salary_max: 200000,
    remote: true,
    tags: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
  },
  {
    companyIndex: 2,
    title: 'Product Designer',
    description: `We're hiring a Product Designer to define the future of how software teams work.\n\nResponsibilities:\n- Design end-to-end user experiences for Linear's web and desktop apps\n- Conduct user research and synthesize insights\n- Build prototypes and iterate quickly\n\nRequirements:\n- 4+ years of product design experience\n- Expert Figma skills\n- A portfolio demonstrating strong interaction design`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 130000,
    salary_max: 175000,
    remote: true,
    tags: ['Figma', 'Product Design', 'UX Research', 'Prototyping', 'Design Systems'],
  },
  {
    companyIndex: 2,
    title: 'iOS Engineer',
    description: `Join Linear's mobile team and build world-class iOS experiences for engineering teams.\n\nResponsibilities:\n- Develop and maintain the Linear iOS app in Swift\n- Collaborate with design to deliver polished native experiences\n- Optimize for performance and offline functionality\n\nRequirements:\n- 3+ years of iOS development experience\n- Deep proficiency in Swift and UIKit/SwiftUI\n- Experience with offline-first apps`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 145000,
    salary_max: 190000,
    remote: true,
    tags: ['Swift', 'iOS', 'SwiftUI', 'UIKit', 'Mobile'],
  },

  // ---- Figma ----
  {
    companyIndex: 3,
    title: 'Senior Software Engineer, Rendering',
    description: `Figma's Rendering team is looking for a Senior Engineer to push the boundaries of what's possible in a browser-based design tool.\n\nResponsibilities:\n- Improve Figma's WebGL/Canvas rendering pipeline\n- Optimize performance for complex design files\n- Research and implement cutting-edge rendering techniques\n\nRequirements:\n- 5+ years of software engineering experience\n- Expertise in WebGL, Canvas, or graphics programming\n- Strong C++ or Rust background is a plus`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 185000,
    salary_max: 250000,
    remote: false,
    tags: ['WebGL', 'Canvas', 'TypeScript', 'C++', 'Graphics Programming', 'Rust'],
  },
  {
    companyIndex: 3,
    title: 'Engineering Manager, Collaboration',
    description: `Lead Figma's real-time collaboration engineering team and help scale multiplayer design to millions of users.\n\nResponsibilities:\n- Manage a team of 6-8 engineers\n- Define technical roadmap for collaboration features\n- Hire, mentor, and grow engineers on your team\n\nRequirements:\n- 3+ years of engineering management\n- Strong background in distributed systems or real-time tech\n- Track record of shipping high-quality products`,
    location: 'New York, NY',
    type: 'full-time',
    salary_min: 200000,
    salary_max: 260000,
    remote: false,
    tags: ['Engineering Management', 'Distributed Systems', 'Real-time', 'TypeScript', 'WebSockets'],
  },
  {
    companyIndex: 3,
    title: 'Growth Marketing Manager',
    description: `Figma is hiring a Growth Marketing Manager to drive user acquisition and expansion.\n\nResponsibilities:\n- Develop and execute growth experiments across channels\n- Analyze funnel metrics and identify optimization opportunities\n- Collaborate with product, design, and sales\n\nRequirements:\n- 4+ years of growth or performance marketing experience\n- Strong analytical skills and comfort with A/B testing\n- Experience with Figma or design tools is a plus`,
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_min: 120000,
    salary_max: 155000,
    remote: false,
    tags: ['Growth Marketing', 'Analytics', 'A/B Testing', 'SEO', 'SEM'],
  },

  // ---- Notion ----
  {
    companyIndex: 4,
    title: 'Backend Engineer, Search & Discovery',
    description: `Notion is looking for a Backend Engineer to build the next generation of search and discovery features.\n\nResponsibilities:\n- Build and scale full-text search across billions of blocks\n- Design and implement ranking and relevance algorithms\n- Own search performance and quality metrics\n\nRequirements:\n- 4+ years of backend engineering\n- Experience with search engines (Elasticsearch, Typesense, etc.)\n- Proficiency in Golang or Python`,
    location: 'New York, NY',
    type: 'full-time',
    salary_min: 155000,
    salary_max: 210000,
    remote: false,
    tags: ['Go', 'Python', 'Elasticsearch', 'Search', 'PostgreSQL', 'Backend'],
  },
  {
    companyIndex: 4,
    title: 'Android Engineer',
    description: `Help build Notion's Android app and bring the connected workspace to millions of Android users.\n\nResponsibilities:\n- Develop new features and improve existing Android functionality\n- Collaborate with cross-functional teams on mobile-first experiences\n- Implement offline sync and real-time updates\n\nRequirements:\n- 3+ years of Android development\n- Strong Kotlin and Jetpack Compose skills\n- Experience with offline-first data sync`,
    location: 'Remote',
    type: 'full-time',
    salary_min: 140000,
    salary_max: 185000,
    remote: true,
    tags: ['Kotlin', 'Android', 'Jetpack Compose', 'Mobile', 'Offline Sync'],
  },
  {
    companyIndex: 4,
    title: 'Content Marketing Intern',
    description: `Join Notion's marketing team as a Content Marketing Intern and help tell the story of how teams work better together.\n\nResponsibilities:\n- Write blog posts, case studies, and social media content\n- Research and pitch content ideas\n- Assist with community management\n\nRequirements:\n- Currently enrolled in or recently graduated from a relevant degree\n- Strong writing and editing skills\n- Genuine enthusiasm for productivity and knowledge management`,
    location: 'New York, NY',
    type: 'internship',
    salary_min: 25,
    salary_max: 35,
    remote: false,
    tags: ['Content Marketing', 'Copywriting', 'Social Media', 'SEO'],
  },
];

async function seed() {
  const db = initDb();

  const existingCompanies = db.prepare('SELECT COUNT(*) as c FROM companies').get();
  if (existingCompanies.c > 0) {
    console.log('Database already has data — skipping seed.');
    process.exit(0);
  }

  console.log('Seeding database…');

  const companyRecords = COMPANIES.map((c) => companies.create(c));
  console.log(`  Created ${companyRecords.length} companies.`);

  for (const j of JOBS) {
    const company = companyRecords[j.companyIndex];
    jobs.create({
      company_id: company.id,
      title: j.title,
      description: j.description,
      location: j.location,
      type: j.type,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      remote: j.remote,
      status: 'open',
      tags: j.tags,
    });
  }
  console.log(`  Created ${JOBS.length} jobs.`);
  console.log('Done!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
