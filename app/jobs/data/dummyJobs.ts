import { Job, JobBatch, JobBatchItem, ClientWithBatch } from '../types/jobs';

// Dummy Clients for Recruiter
export const dummyClients: ClientWithBatch[] = [
  {
    clientID: 1,
    clientName: 'John Doe',
    clientRole: 'Software Engineer',
    activeBatchID: 1,
    batchStatus: 'Active',
    currentProgress: '12/50 jobs',
  },
  {
    clientID: 2,
    clientName: 'Sarah Smith',
    clientRole: 'Product Manager',
    batchStatus: 'New',
    currentProgress: '0/50 jobs',
  },
  {
    clientID: 3,
    clientName: 'Michael Chen',
    clientRole: 'Data Scientist',
    activeBatchID: 3,
    batchStatus: 'Paused',
    currentProgress: '25/50 jobs',
  },
  {
    clientID: 4,
    clientName: 'Emily Rodriguez',
    clientRole: 'UX Designer',
    activeBatchID: 4,
    batchStatus: 'Completed',
    currentProgress: '50/50 jobs',
  },
];

// Dummy Jobs
export const dummyJobs: Job[] = [
  {
    jobID: 1,
    title: 'Senior Full Stack Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    description: `<h3>About the Role</h3>
<p>We're looking for an experienced Full Stack Engineer to join our core infrastructure team. You'll work on building scalable services that power millions of users worldwide.</p>

<h4>Responsibilities:</h4>
<ul>
<li>Design and implement microservices architecture</li>
<li>Build responsive React applications with excellent UX</li>
<li>Optimize database queries and application performance</li>
<li>Collaborate with product and design teams on feature development</li>
<li>Mentor junior engineers and participate in code reviews</li>
<li>Lead technical discussions and architectural decisions</li>
</ul>

<h4>Requirements:</h4>
<ul>
<li>5+ years of full-stack development experience</li>
<li>Strong proficiency in React, Node.js, and TypeScript</li>
<li>Experience with cloud platforms (AWS, GCP preferred)</li>
<li>Solid understanding of database design and optimization (PostgreSQL, MongoDB)</li>
<li>Excellent problem-solving and communication skills</li>
<li>BS in Computer Science or equivalent practical experience</li>
</ul>

<h4>What We Offer:</h4>
<ul>
<li>Competitive salary ($140K - $180K) and equity package</li>
<li>Comprehensive health, dental, and vision insurance</li>
<li>Flexible work arrangements and remote options</li>
<li>Professional development and learning opportunities</li>
<li>Collaborative and innovative work environment</li>
</ul>`,
    salaryMin: 140000,
    salaryMax: 180000,
    salaryCurrency: 'USD',
    isRemote: true,
    jobLevel: 'Senior',
    jobType: 'Full-time',
    postingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sourceURL: 'https://careers.google.com/jobs/123456',
    applicantCount: 45,
    matchScore: 94,
  },
  {
    jobID: 2,
    title: 'Software Development Engineer II',
    company: 'Amazon',
    location: 'Seattle, WA',
    description: `<h3>About the Role</h3>
<p>Join Amazon's world-class engineering team working on cutting-edge e-commerce solutions. You'll be building systems that handle billions of requests daily.</p>

<h4>Key Responsibilities:</h4>
<ul>
<li>Develop highly scalable distributed systems</li>
<li>Write clean, maintainable code with comprehensive tests</li>
<li>Participate in on-call rotations and operational excellence</li>
<li>Contribute to architecture and design decisions</li>
<li>Work with product managers to define technical requirements</li>
</ul>

<h4>Basic Qualifications:</h4>
<ul>
<li>3+ years of professional software development experience</li>
<li>Experience with Java, Python, or C++</li>
<li>Strong CS fundamentals (data structures, algorithms)</li>
<li>Experience with AWS services and cloud architecture</li>
</ul>

<h4>Preferred Qualifications:</h4>
<ul>
<li>Masters degree in Computer Science</li>
<li>Experience with large-scale distributed systems</li>
<li>Knowledge of microservices architecture</li>
</ul>`,
    salaryMin: 130000,
    salaryMax: 170000,
    salaryCurrency: 'USD',
    isRemote: false,
    jobLevel: 'Mid',
    jobType: 'Full-time',
    postingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sourceURL: 'https://amazon.jobs/en/jobs/123456',
    applicantCount: 120,
    matchScore: 87,
  },
  {
    jobID: 3,
    title: 'Frontend Engineer',
    company: 'Meta',
    location: 'Menlo Park, CA',
    description: `<h3>About the Role</h3>
<p>Build the next generation of social products that connect billions of people around the world. Work on cutting-edge web technologies and shape the future of how people interact online.</p>

<h4>What You'll Do:</h4>
<ul>
<li>Build efficient and reusable front-end systems</li>
<li>Create beautiful, responsive user interfaces</li>
<li>Collaborate with designers to implement pixel-perfect designs</li>
<li>Optimize applications for maximum speed and scalability</li>
<li>Work with backend engineers to design and integrate APIs</li>
</ul>

<h4>Minimum Qualifications:</h4>
<ul>
<li>4+ years of experience with JavaScript and modern frameworks (React, Vue, Angular)</li>
<li>Strong understanding of web technologies (HTML5, CSS3, ES6+)</li>
<li>Experience with state management solutions (Redux, MobX)</li>
<li>Familiarity with RESTful APIs and GraphQL</li>
</ul>

<h4>Benefits:</h4>
<ul>
<li>Competitive compensation including RSUs</li>
<li>Health and wellness benefits</li>
<li>Remote work flexibility</li>
<li>Continuous learning and development</li>
</ul>`,
    salaryMin: 150000,
    salaryMax: 200000,
    salaryCurrency: 'USD',
    isRemote: true,
    jobLevel: 'Senior',
    jobType: 'Full-time',
    postingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sourceURL: 'https://www.metacareers.com/jobs/123456',
    applicantCount: 89,
    matchScore: 91,
  },
  {
    jobID: 4,
    title: 'Backend Software Engineer',
    company: 'Apple',
    location: 'Cupertino, CA',
    description: `<h3>About the Role</h3>
<p>Join Apple's cloud services team and help build the infrastructure that powers iCloud, Apple Music, and other services used by millions of customers worldwide.</p>

<h4>Responsibilities:</h4>
<ul>
<li>Design and implement scalable backend services</li>
<li>Build RESTful APIs and microservices</li>
<li>Optimize database performance and query efficiency</li>
<li>Ensure system reliability and uptime</li>
<li>Participate in architectural reviews and technical planning</li>
</ul>

<h4>Requirements:</h4>
<ul>
<li>5+ years of backend development experience</li>
<li>Proficiency in Python, Go, or Java</li>
<li>Experience with database systems (MySQL, PostgreSQL, Redis)</li>
<li>Understanding of distributed systems and message queues</li>
<li>Experience with containerization (Docker, Kubernetes)</li>
</ul>`,
    salaryMin: 160000,
    salaryMax: 210000,
    salaryCurrency: 'USD',
    isRemote: false,
    jobLevel: 'Senior',
    jobType: 'Full-time',
    postingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sourceURL: 'https://jobs.apple.com/en-us/details/123456',
    applicantCount: 67,
    matchScore: 88,
  },
  {
    jobID: 5,
    title: 'Full Stack Developer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    description: `<h3>About the Role</h3>
<p>Help us deliver the best streaming experience to over 200 million members worldwide. Work on features that impact millions of users every day.</p>

<h4>What You'll Do:</h4>
<ul>
<li>Build new features across the full stack</li>
<li>Optimize application performance and user experience</li>
<li>Collaborate with cross-functional teams</li>
<li>Participate in A/B testing and data-driven decisions</li>
</ul>

<h4>Qualifications:</h4>
<ul>
<li>4+ years of full stack development experience</li>
<li>Strong JavaScript/TypeScript skills</li>
<li>Experience with React and Node.js</li>
<li>Understanding of video streaming technologies (nice to have)</li>
</ul>`,
    salaryMin: 155000,
    salaryMax: 195000,
    salaryCurrency: 'USD',
    isRemote: true,
    jobLevel: 'Senior',
    jobType: 'Full-time',
    postingDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    sourceURL: 'https://jobs.netflix.com/jobs/123456',
    applicantCount: 102,
    matchScore: 85,
  },
  {
    jobID: 6,
    title: 'Software Engineer',
    company: 'Microsoft',
    location: 'Redmond, WA',
    description: `<h3>About the Role</h3>
<p>Join Microsoft's Azure team and work on cloud infrastructure that powers businesses worldwide.</p>

<h4>Responsibilities:</h4>
<ul>
<li>Develop cloud-native applications</li>
<li>Build scalable microservices</li>
<li>Implement CI/CD pipelines</li>
<li>Ensure security and compliance</li>
</ul>

<h4>Requirements:</h4>
<ul>
<li>3+ years of software development experience</li>
<li>Experience with C#, .NET, or similar</li>
<li>Cloud platform experience (Azure preferred)</li>
<li>Strong problem-solving skills</li>
</ul>`,
    salaryMin: 135000,
    salaryMax: 175000,
    salaryCurrency: 'USD',
    isRemote: true,
    jobLevel: 'Mid',
    jobType: 'Full-time',
    postingDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    sourceURL: 'https://careers.microsoft.com/us/en/job/123456',
    applicantCount: 78,
    matchScore: 82,
  },
];

// Create dummy batch items - duplicate jobs to fill 50 slots
export const createDummyBatchItems = (batchID: number): JobBatchItem[] => {
  const batchItems: JobBatchItem[] = [];
  const totalJobs = 50;

  for (let i = 0; i < totalJobs; i++) {
    // Cycle through the 6 dummy jobs
    const job = dummyJobs[i % dummyJobs.length];

    // Determine status based on index
    // First 8: Applied, Next 3: Skipped, Next 1: Viewed, Rest: Pending
    let status: 'Applied' | 'Skipped' | 'Viewed' | 'Pending' = 'Pending';
    if (i < 8) status = 'Applied';
    else if (i < 11) status = 'Skipped';
    else if (i < 12) status = 'Viewed';

    batchItems.push({
      batchItemID: i + 1,
      batchID,
      jobID: job.jobID,
      job: {
        ...job,
        jobID: i + 1, // Give each item a unique jobID
      },
      itemOrder: i + 1,
      itemStatus: status,
      timeSpentSeconds: i < 12 ? Math.floor(Math.random() * 300) + 60 : undefined,
    });
  }

  return batchItems;
};

// Dummy Batch for John Doe
export const dummyBatch: JobBatch = {
  batchID: 1,
  batchGUID: '4829',
  clientID: 1,
  clientName: 'John Doe',
  clientRole: 'Software Engineer',
  recruiterID: 1,
  totalJobs: 50,
  processedJobs: 12,
  appliedJobs: 8,
  skippedJobs: 3,
  viewedJobs: 1,
  batchStatus: 'Active',
  createdTS: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Started 5 hours ago
  expiresTS: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Expires in 8 hours
};
