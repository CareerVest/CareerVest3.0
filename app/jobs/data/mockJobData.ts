/**
 * Mock Job Data for Demo/Testing
 *
 * To enable mock data:
 * 1. Set ENABLE_MOCK_DATA = true below
 * 2. Refresh the jobs page
 *
 * To disable and use real API:
 * 1. Set ENABLE_MOCK_DATA = false
 * 2. Refresh the jobs page
 */

export const ENABLE_MOCK_DATA = false; // Toggle this to switch between mock and real data

import { ClientWithBatch, JobBatch, JobBatchItem } from '../types/jobs';

export const mockClients: ClientWithBatch[] = [
  {
    clientID: 9,
    clientName: 'Amit Patel',
    clientRole: 'Job Seeker',
    activeBatchID: 101,
    batchStatus: 'Active',
    currentProgress: '0/5 jobs',
  },
];

export const mockBatch: JobBatch = {
  batchID: 101,
  batchGUID: 'BATCH-2025-001',
  clientID: 9,
  clientName: 'Amit Patel',
  clientRole: 'Job Seeker',
  recruiterID: 1,
  totalJobs: 5,
  processedJobs: 0,
  appliedJobs: 0,
  skippedJobs: 0,
  viewedJobs: 0,
  batchStatus: 'Active',
  createdTS: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  expiresTS: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
};

export const mockBatchItems: JobBatchItem[] = [
  {
    batchItemID: 1,
    batchID: 101,
    jobID: 1001,
    job: {
      jobID: 1001,
      title: 'Senior Full Stack Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      description: `<p>We're looking for a <strong>Senior Full Stack Engineer</strong> to join our growing engineering team. You'll work on cutting-edge web applications using React, Node.js, and TypeScript.</p>

<h3>Responsibilities:</h3>
<ul>
  <li>Design and develop scalable web applications</li>
  <li>Collaborate with product managers and designers</li>
  <li>Mentor junior developers</li>
  <li>Participate in code reviews and architecture discussions</li>
  <li>Optimize application performance and scalability</li>
</ul>

<h3>Requirements:</h3>
<ul>
  <li>5+ years of full-stack development experience</li>
  <li>Expert knowledge of React, TypeScript, Node.js</li>
  <li>Experience with PostgreSQL, Redis, AWS</li>
  <li>Strong understanding of REST APIs and GraphQL</li>
  <li>Excellent communication and teamwork skills</li>
</ul>

<h3>Nice to Have:</h3>
<ul>
  <li>Experience with Next.js, Tailwind CSS</li>
  <li>DevOps experience (Docker, Kubernetes, CI/CD)</li>
  <li>Previous startup experience</li>
</ul>

<h3>Benefits:</h3>
<ul>
  <li>Competitive salary + equity</li>
  <li>Health, dental, vision insurance</li>
  <li>401(k) matching</li>
  <li>Unlimited PTO</li>
  <li>Remote-friendly culture</li>
</ul>`,
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: 'USD',
      isRemote: false,
      jobLevel: 'Senior',
      jobType: 'Full-time',
      postingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sourceURL: 'https://techcorp.com/careers/senior-fullstack',
      matchScore: 92,
      freshnessStatus: 'Current',
    },
    itemOrder: 1,
    itemStatus: 'Pending',
  },
  {
    batchItemID: 2,
    batchID: 101,
    jobID: 1002,
    job: {
      jobID: 1002,
      title: 'Frontend Developer - React Specialist',
      company: 'Innovate Labs',
      location: 'Remote',
      description: `<p>Join our team as a <strong>Frontend Developer</strong> specializing in React! You'll build beautiful, performant user interfaces for our SaaS platform.</p>

<h3>What You'll Do:</h3>
<ul>
  <li>Build responsive, accessible React components</li>
  <li>Implement pixel-perfect designs from Figma</li>
  <li>Optimize frontend performance</li>
  <li>Work closely with backend engineers on API integration</li>
  <li>Contribute to our component library and design system</li>
</ul>

<h3>Must Have:</h3>
<ul>
  <li>3+ years React development experience</li>
  <li>Strong JavaScript/TypeScript skills</li>
  <li>Experience with state management (Redux, Zustand, etc.)</li>
  <li>Understanding of web accessibility (WCAG)</li>
  <li>Git workflow expertise</li>
</ul>

<h3>Bonus Points:</h3>
<ul>
  <li>Next.js experience</li>
  <li>Testing frameworks (Jest, React Testing Library)</li>
  <li>CSS-in-JS libraries (styled-components, emotion)</li>
</ul>`,
      salaryMin: 120000,
      salaryMax: 160000,
      salaryCurrency: 'USD',
      isRemote: true,
      jobLevel: 'Mid',
      jobType: 'Full-time',
      postingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sourceURL: 'https://innovatelabs.com/jobs/frontend-react',
      matchScore: 88,
      freshnessStatus: 'Live',
    },
    itemOrder: 2,
    itemStatus: 'Pending',
  },
  {
    batchItemID: 3,
    batchID: 101,
    jobID: 1003,
    job: {
      jobID: 1003,
      title: 'TypeScript Engineer - Platform Team',
      company: 'DataFlow Inc',
      location: 'New York, NY',
      description: `<p>We're seeking a <strong>TypeScript Engineer</strong> to join our Platform Engineering team building internal tools and infrastructure.</p>

<h3>The Role:</h3>
<ul>
  <li>Design and build internal developer platforms</li>
  <li>Create TypeScript libraries and tools</li>
  <li>Improve developer experience across the organization</li>
  <li>Build CLI tools and automation scripts</li>
  <li>Mentor engineers on TypeScript best practices</li>
</ul>

<h3>Requirements:</h3>
<ul>
  <li>4+ years TypeScript development</li>
  <li>Deep understanding of type systems</li>
  <li>Experience building developer tools</li>
  <li>Knowledge of Node.js internals</li>
  <li>Strong API design skills</li>
</ul>

<h3>Perks:</h3>
<ul>
  <li>$150k-190k base + equity</li>
  <li>Comprehensive health benefits</li>
  <li>Learning & development budget</li>
  <li>Latest tech equipment</li>
  <li>Hybrid work model (3 days in office)</li>
</ul>`,
      salaryMin: 150000,
      salaryMax: 190000,
      salaryCurrency: 'USD',
      isRemote: false,
      jobLevel: 'Senior',
      jobType: 'Full-time',
      postingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sourceURL: 'https://dataflow.com/careers/typescript-platform',
      matchScore: 85,
      freshnessStatus: 'Current',
    },
    itemOrder: 3,
    itemStatus: 'Pending',
  },
  {
    batchItemID: 4,
    batchID: 101,
    jobID: 1004,
    job: {
      jobID: 1004,
      title: 'Full Stack Software Engineer',
      company: 'CloudScale',
      location: 'Austin, TX',
      description: `<p>CloudScale is hiring a <strong>Full Stack Software Engineer</strong> to work on our cloud infrastructure management platform.</p>

<h3>What We're Building:</h3>
<p>Our platform helps enterprises manage multi-cloud infrastructure with ease. You'll work on features that impact thousands of DevOps engineers daily.</p>

<h3>Your Impact:</h3>
<ul>
  <li>Build features across the full stack</li>
  <li>Integrate with AWS, Azure, GCP APIs</li>
  <li>Create real-time dashboards and visualizations</li>
  <li>Design scalable backend services</li>
  <li>Contribute to architectural decisions</li>
</ul>

<h3>We're Looking For:</h3>
<ul>
  <li>3+ years full-stack experience</li>
  <li>Proficiency in JavaScript/TypeScript</li>
  <li>React or Vue.js experience</li>
  <li>Backend experience (Node.js, Python, or Go)</li>
  <li>Cloud platform knowledge (AWS/Azure/GCP)</li>
</ul>`,
      salaryMin: 130000,
      salaryMax: 170000,
      salaryCurrency: 'USD',
      isRemote: false,
      jobLevel: 'Mid',
      jobType: 'Full-time',
      postingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceURL: 'https://cloudscale.io/careers/fullstack',
      matchScore: 82,
      freshnessStatus: 'Week_Old',
    },
    itemOrder: 4,
    itemStatus: 'Pending',
  },
  {
    batchItemID: 5,
    batchID: 101,
    jobID: 1005,
    job: {
      jobID: 1005,
      title: 'React Native Developer',
      company: 'MobileFirst Inc',
      location: 'Remote (US)',
      description: `<p>Build amazing mobile experiences as a <strong>React Native Developer</strong> at MobileFirst. We're creating the next generation of mobile banking apps.</p>

<h3>The Opportunity:</h3>
<ul>
  <li>Work on consumer-facing mobile apps</li>
  <li>Collaborate with product and design teams</li>
  <li>Implement new features and improve performance</li>
  <li>Ensure app security and compliance</li>
  <li>Mentor junior mobile developers</li>
</ul>

<h3>Requirements:</h3>
<ul>
  <li>4+ years React Native experience</li>
  <li>Published apps on iOS and Android</li>
  <li>Understanding of mobile security best practices</li>
  <li>Experience with native modules</li>
  <li>Strong problem-solving skills</li>
</ul>

<h3>Benefits:</h3>
<ul>
  <li>100% remote work</li>
  <li>Competitive salary + stock options</li>
  <li>Premium health insurance</li>
  <li>Professional development budget</li>
  <li>4 weeks PTO</li>
</ul>`,
      salaryMin: 125000,
      salaryMax: 155000,
      salaryCurrency: 'USD',
      isRemote: true,
      jobLevel: 'Senior',
      jobType: 'Full-time',
      postingDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      sourceURL: 'https://mobilefirst.com/jobs/react-native',
      matchScore: 78,
      freshnessStatus: 'Current',
    },
    itemOrder: 5,
    itemStatus: 'Pending',
  },
];
