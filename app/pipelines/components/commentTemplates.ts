import { ClientStatus } from "../../types/pipelines/pipeline";

// Template variable definition
export interface TemplateVariable {
  key: string;
  label: string;
  type?: "text" | "date" | "number";
  required: boolean;
  placeholder?: string;
}

// Template definition
export interface CommentTemplate {
  id: string;
  label: string;
  template: string;
  variables?: TemplateVariable[];
  category?: string;
}

// Templates organized by action type and department
export const COMMENT_TEMPLATES: Record<string, CommentTemplate[]> = {
  // Sales Department Actions
  "RateCandidate": [
    {
      id: "rate-exceptional",
      label: "Exceptional - High Potential",
      template: "Exceptional candidate with {{experience}} years of experience in {{field}}. Strong technical background and excellent communication skills. High placement probability.",
      variables: [
        {
          key: "experience",
          label: "Years of Experience",
          type: "number",
          required: true,
          placeholder: "e.g., 10",
        },
        {
          key: "field",
          label: "Field/Domain",
          required: true,
          placeholder: "e.g., Software Development, Healthcare",
        },
      ],
      category: "Positive",
    },
    {
      id: "rate-realtime-current",
      label: "Real-Time - Currently Employed",
      template: "Candidate has real-time experience in {{technology}}. Currently employed at {{company}} with immediate availability for new opportunities.",
      variables: [
        {
          key: "technology",
          label: "Technology/Skill",
          required: true,
          placeholder: "e.g., React, Java, Cloud Computing",
        },
        {
          key: "company",
          label: "Current Company",
          required: false,
          placeholder: "e.g., Tech Corp",
        },
      ],
      category: "Positive",
    },
    {
      id: "rate-fresher-motivated",
      label: "Fresher - Recent Graduate",
      template: "Recent graduate from {{university}} with degree in {{major}}. Strong academic background and eager to start career. Completed {{internships}} internships.",
      variables: [
        {
          key: "university",
          label: "University",
          required: true,
          placeholder: "e.g., State University",
        },
        {
          key: "major",
          label: "Major/Degree",
          required: true,
          placeholder: "e.g., Computer Science, Business",
        },
        {
          key: "internships",
          label: "Number of Internships",
          type: "number",
          required: false,
          placeholder: "e.g., 2",
        },
      ],
      category: "Positive",
    },
    {
      id: "rate-standard-qualified",
      label: "Standard - Well Qualified",
      template: "Standard qualified candidate with {{years}} years of experience. Good fit for mid-level positions in {{industry}}. Resume needs minor updates.",
      variables: [
        {
          key: "years",
          label: "Years of Experience",
          type: "number",
          required: true,
          placeholder: "e.g., 5",
        },
        {
          key: "industry",
          label: "Industry",
          required: true,
          placeholder: "e.g., IT, Finance, Healthcare",
        },
      ],
      category: "Positive",
    },
    {
      id: "rate-budget-concerns",
      label: "Needs Discussion - Budget Alignment",
      template: "Candidate shows potential but needs discussion on budget expectations. Candidate expecting {{salary}} range. Need to align with market rates and our services.",
      variables: [
        {
          key: "salary",
          label: "Expected Salary Range",
          required: true,
          placeholder: "e.g., $80-90K, $60/hr",
        },
      ],
      category: "Neutral",
    },
  ],

  "Upload Required Docs - Sales": [
    {
      id: "docs-complete-ready",
      label: "All Documents Complete",
      template: "All required documents uploaded successfully including resume checklist and current resume. Documents verified and client is ready to proceed to resume preparation stage.",
      category: "Positive",
    },
    {
      id: "docs-complete-updates-needed",
      label: "Documents Complete - Updates Needed",
      template: "Documents received and verified. Resume needs {{updates}} before proceeding. Client informed and agrees to updates.",
      variables: [
        {
          key: "updates",
          label: "Updates Needed",
          required: true,
          placeholder: "e.g., formatting improvements, skill additions, date corrections",
        },
      ],
      category: "Positive",
    },
    {
      id: "docs-checklist-complete",
      label: "Checklist Reviewed - Ready",
      template: "Resume checklist completed with client. Identified {{highlights}} as key selling points. Client provided all necessary work history details.",
      variables: [
        {
          key: "highlights",
          label: "Key Highlights",
          required: true,
          placeholder: "e.g., AWS certifications, leadership experience",
        },
      ],
      category: "Positive",
    },
    {
      id: "docs-additional-provided",
      label: "Documents + Certifications",
      template: "Uploaded resume, checklist, and {{certifications}} certifications. Client has strong credentials that will enhance marketability.",
      variables: [
        {
          key: "certifications",
          label: "Certifications Provided",
          required: true,
          placeholder: "e.g., PMP, AWS Certified, CPA",
        },
      ],
      category: "Positive",
    },
    {
      id: "docs-partial-followup",
      label: "Partial Docs - Following Up",
      template: "Resume and checklist uploaded. Still awaiting {{missing}} from client. Follow-up scheduled for {{followupDate}}.",
      variables: [
        {
          key: "missing",
          label: "Missing Documents",
          required: true,
          placeholder: "e.g., reference letters, transcripts",
        },
        {
          key: "followupDate",
          label: "Follow-up Date",
          type: "date",
          required: false,
        },
      ],
      category: "Neutral",
    },
  ],

  // Resume Department Actions
  "Acknowledged": [
    {
      id: "ack-enthusiastic",
      label: "Client Enthusiastic - Ready",
      template: "Client acknowledged and is enthusiastic about resume preparation process. Available for initial call immediately. Has prepared work history documentation.",
      category: "Positive",
    },
    {
      id: "ack-scheduled-call",
      label: "Acknowledged - Call Scheduled",
      template: "Client acknowledgment received. Initial consultation call scheduled for {{callDate}} at {{callTime}}. Client confirmed availability.",
      variables: [
        {
          key: "callDate",
          label: "Call Date",
          type: "date",
          required: true,
        },
        {
          key: "callTime",
          label: "Call Time",
          required: true,
          placeholder: "e.g., 2:00 PM EST",
        },
      ],
      category: "Positive",
    },
    {
      id: "ack-materials-ready",
      label: "Acknowledged - Materials Ready",
      template: "Client acknowledged. Has existing resume and {{materials}} ready for review. Eager to enhance current resume for better opportunities.",
      variables: [
        {
          key: "materials",
          label: "Additional Materials",
          required: false,
          placeholder: "e.g., cover letters, LinkedIn profile, portfolio",
        },
      ],
      category: "Positive",
    },
    {
      id: "ack-timeline-discussed",
      label: "Acknowledged - Timeline Set",
      template: "Client acknowledged. Discussed timeline expectations - resume completion target is {{completionDate}}. Client understands the process and steps involved.",
      variables: [
        {
          key: "completionDate",
          label: "Target Completion Date",
          type: "date",
          required: true,
        },
      ],
      category: "Positive",
    },
    {
      id: "ack-flexible-schedule",
      label: "Acknowledged - Scheduling Soon",
      template: "Client acknowledged. Currently employed and prefers {{timePreference}} for calls. Will schedule initial consultation within next 2-3 days.",
      variables: [
        {
          key: "timePreference",
          label: "Preferred Time",
          required: true,
          placeholder: "e.g., evenings, weekends, early mornings",
        },
      ],
      category: "Positive",
    },
  ],

  "Initial Call Done": [
    {
      id: "call-comprehensive",
      label: "Comprehensive Call Completed",
      template: "Initial call completed successfully. Gathered detailed work history covering {{years}} years of experience. Identified {{achievements}} key achievements to highlight in resume.",
      variables: [
        {
          key: "years",
          label: "Years Covered",
          type: "number",
          required: true,
          placeholder: "e.g., 10",
        },
        {
          key: "achievements",
          label: "Number of Key Achievements",
          type: "number",
          required: false,
          placeholder: "e.g., 5",
        },
      ],
      category: "Positive",
    },
    {
      id: "call-career-change",
      label: "Call Complete - Career Transition",
      template: "Initial call completed. Client seeking career transition from {{currentField}} to {{targetField}}. Discussed transferable skills and strategy for resume positioning.",
      variables: [
        {
          key: "currentField",
          label: "Current Field",
          required: true,
          placeholder: "e.g., Teaching, Retail Management",
        },
        {
          key: "targetField",
          label: "Target Field",
          required: true,
          placeholder: "e.g., Corporate Training, Operations",
        },
      ],
      category: "Positive",
    },
    {
      id: "call-gap-addressed",
      label: "Call Complete - Gaps Addressed",
      template: "Call completed. Addressed employment gap from {{gapPeriod}}. Reason: {{reason}}. Developed strategy to present positively on resume.",
      variables: [
        {
          key: "gapPeriod",
          label: "Gap Period",
          required: true,
          placeholder: "e.g., Jan 2022 - Jun 2023",
        },
        {
          key: "reason",
          label: "Gap Reason",
          required: true,
          placeholder: "e.g., family care, education, health, freelancing",
        },
      ],
      category: "Positive",
    },
    {
      id: "call-strong-background",
      label: "Call Complete - Strong Profile",
      template: "Excellent initial call. Client has {{experience}} years in {{industry}} with strong track record. Discussed emphasizing {{skillset}} skills for target roles.",
      variables: [
        {
          key: "experience",
          label: "Years of Experience",
          type: "number",
          required: true,
        },
        {
          key: "industry",
          label: "Industry",
          required: true,
          placeholder: "e.g., Finance, Healthcare, Technology",
        },
        {
          key: "skillset",
          label: "Key Skillset",
          required: true,
          placeholder: "e.g., leadership, technical, analytical",
        },
      ],
      category: "Positive",
    },
    {
      id: "call-followup-needed",
      label: "Call Done - Additional Info Needed",
      template: "Initial call completed. Need additional information about {{missing}}. Client will send details by {{deadline}}. Resume work will begin once received.",
      variables: [
        {
          key: "missing",
          label: "Missing Information",
          required: true,
          placeholder: "e.g., project details, specific dates, references",
        },
        {
          key: "deadline",
          label: "Expected By Date",
          type: "date",
          required: false,
        },
      ],
      category: "Neutral",
    },
  ],

  "Resume Completed": [
    {
      id: "resume-approved-excellent",
      label: "Resume Approved - Client Satisfied",
      template: "Resume completed and approved by client on first review. Client very satisfied with the professional presentation and keyword optimization. Ready to move to marketing immediately.",
      category: "Positive",
    },
    {
      id: "resume-revised-approved",
      label: "Resume Finalized After Revisions",
      template: "Resume finalized after {{revisions}} rounds of revisions. Final version incorporates all client feedback and highlights {{strengths}}. Client approved and ready for marketing.",
      variables: [
        {
          key: "revisions",
          label: "Number of Revisions",
          type: "number",
          required: true,
          placeholder: "e.g., 2",
        },
        {
          key: "strengths",
          label: "Key Strengths Highlighted",
          required: true,
          placeholder: "e.g., technical leadership, project management, cost savings",
        },
      ],
      category: "Positive",
    },
    {
      id: "resume-ats-optimized",
      label: "Resume Complete - ATS Optimized",
      template: "Resume completed with strong ATS optimization for {{targetRoles}}. Incorporated {{keywords}} industry-specific keywords. Format tested for ATS compatibility.",
      variables: [
        {
          key: "targetRoles",
          label: "Target Job Roles",
          required: true,
          placeholder: "e.g., Senior Software Engineer, IT Manager",
        },
        {
          key: "keywords",
          label: "Number of Keywords Added",
          type: "number",
          required: false,
          placeholder: "e.g., 25",
        },
      ],
      category: "Positive",
    },
    {
      id: "resume-package-complete",
      label: "Complete Package Ready",
      template: "Resume completed along with {{documents}}. Professional package ready for comprehensive marketing campaign. Client approved all materials.",
      variables: [
        {
          key: "documents",
          label: "Additional Documents",
          required: true,
          placeholder: "e.g., cover letter, LinkedIn profile, executive summary",
        },
      ],
      category: "Positive",
    },
    {
      id: "resume-specialized",
      label: "Specialized Resume Complete",
      template: "Specialized resume completed for {{specialty}} positions. Emphasized {{certifications}} and relevant project experience. Client excited about targeting niche market.",
      variables: [
        {
          key: "specialty",
          label: "Specialty Area",
          required: true,
          placeholder: "e.g., cybersecurity, data science, executive leadership",
        },
        {
          key: "certifications",
          label: "Certifications Featured",
          required: false,
          placeholder: "e.g., CISSP, PMP, Six Sigma",
        },
      ],
      category: "Positive",
    },
  ],

  "Upload Required Docs - Resume": [
    {
      id: "resume-docs-all-complete",
      label: "All Documents Uploaded",
      template: "All required documents uploaded: final approved resume, cover letter template, and resume checklist. Package is complete and ready for marketing team.",
      category: "Positive",
    },
    {
      id: "resume-docs-versions",
      label: "Multiple Versions Uploaded",
      template: "Uploaded {{versions}} resume versions targeting different roles: {{targetRoles}}. Each version optimized for specific job categories.",
      variables: [
        {
          key: "versions",
          label: "Number of Versions",
          type: "number",
          required: true,
          placeholder: "e.g., 2 or 3",
        },
        {
          key: "targetRoles",
          label: "Target Roles",
          required: true,
          placeholder: "e.g., Manager and Director roles, Technical and Leadership positions",
        },
      ],
      category: "Positive",
    },
    {
      id: "resume-docs-portfolio",
      label: "Resume + Portfolio Uploaded",
      template: "Uploaded final resume, cover letter, and {{portfolio}} portfolio items. Strong visual materials will enhance candidate presentation to employers.",
      variables: [
        {
          key: "portfolio",
          label: "Portfolio Items",
          required: true,
          placeholder: "e.g., project samples, design work, publications",
        },
      ],
      category: "Positive",
    },
    {
      id: "resume-docs-references",
      label: "Complete Package with References",
      template: "Uploaded resume, checklist, cover letter, and {{references}} professional references. Client has strong recommendations from {{referenceTypes}}.",
      variables: [
        {
          key: "references",
          label: "Number of References",
          type: "number",
          required: true,
          placeholder: "e.g., 3",
        },
        {
          key: "referenceTypes",
          label: "Reference Types",
          required: false,
          placeholder: "e.g., former managers, clients, colleagues",
        },
      ],
      category: "Positive",
    },
    {
      id: "resume-docs-linkedin",
      label: "Resume + LinkedIn Profile",
      template: "Uploaded final resume and LinkedIn profile optimization document. Both documents aligned for consistent professional branding. LinkedIn profile updated by client.",
      category: "Positive",
    },
  ],

  // Marketing Department Actions
  "Acknowledged-Marketing": [
    {
      id: "marketing-ack-strong-profile",
      label: "Strong Profile - Ready to Market",
      template: "Marketing acknowledgment complete. Candidate has strong profile with {{experience}} years in {{field}}. Beginning active marketing to target companies immediately.",
      variables: [
        {
          key: "experience",
          label: "Years of Experience",
          type: "number",
          required: true,
        },
        {
          key: "field",
          label: "Field/Industry",
          required: true,
          placeholder: "e.g., IT, Healthcare, Finance",
        },
      ],
      category: "Positive",
    },
    {
      id: "marketing-ack-targets-identified",
      label: "Acknowledged - Targets Identified",
      template: "Marketing acknowledged. Identified {{numberOfTargets}} target companies in {{industry}} sector. Strategy includes direct submissions and networking approach.",
      variables: [
        {
          key: "numberOfTargets",
          label: "Number of Target Companies",
          type: "number",
          required: true,
          placeholder: "e.g., 20",
        },
        {
          key: "industry",
          label: "Industry Sector",
          required: true,
          placeholder: "e.g., Technology, Healthcare, Manufacturing",
        },
      ],
      category: "Positive",
    },
    {
      id: "marketing-ack-niche-specialty",
      label: "Acknowledged - Niche Specialist",
      template: "Acknowledged for marketing. Candidate is specialist in {{niche}} which has high demand currently. Targeting {{targetLevel}} level positions.",
      variables: [
        {
          key: "niche",
          label: "Niche Specialty",
          required: true,
          placeholder: "e.g., cloud architecture, regulatory compliance, medical devices",
        },
        {
          key: "targetLevel",
          label: "Target Level",
          required: true,
          placeholder: "e.g., senior, manager, director, executive",
        },
      ],
      category: "Positive",
    },
    {
      id: "marketing-ack-geographic",
      label: "Acknowledged - Geographic Targeting",
      template: "Marketing acknowledged. Client open to opportunities in {{locations}}. Will target {{jobBoards}} and local networking. Client can relocate or remote preferred.",
      variables: [
        {
          key: "locations",
          label: "Target Locations",
          required: true,
          placeholder: "e.g., NY, CA, TX or Remote nationwide",
        },
        {
          key: "jobBoards",
          label: "Job Boards to Target",
          required: false,
          placeholder: "e.g., LinkedIn, Indeed, specialty sites",
        },
      ],
      category: "Positive",
    },
    {
      id: "marketing-ack-timeline",
      label: "Acknowledged - Timeline Discussed",
      template: "Acknowledged for active marketing. Client needs placement by {{targetDate}}. Prioritizing quick-hire companies and contract-to-hire opportunities for faster placement.",
      variables: [
        {
          key: "targetDate",
          label: "Target Placement Date",
          type: "date",
          required: true,
        },
      ],
      category: "Positive",
    },
  ],

  "AssignRecruiter": [
    {
      id: "recruiter-assigned-specialist",
      label: "Specialist Recruiter Assigned",
      template: "Assigned specialized recruiter with expertise in {{industry}}. Recruiter has {{placementRate}}% placement success rate in this field. Active marketing begins immediately.",
      variables: [
        {
          key: "industry",
          label: "Industry Specialty",
          required: true,
          placeholder: "e.g., Healthcare IT, Financial Services, Manufacturing",
        },
        {
          key: "placementRate",
          label: "Placement Success Rate",
          type: "number",
          required: false,
          placeholder: "e.g., 85",
        },
      ],
      category: "Positive",
    },
    {
      id: "recruiter-assigned-network",
      label: "Recruiter with Strong Network",
      template: "Recruiter assigned with extensive network in {{sector}}. Has existing relationships with {{numberOfContacts}} hiring managers. Candidate profile shared already.",
      variables: [
        {
          key: "sector",
          label: "Sector/Industry",
          required: true,
          placeholder: "e.g., Technology, Pharmaceuticals",
        },
        {
          key: "numberOfContacts",
          label: "Number of Hiring Manager Contacts",
          type: "number",
          required: false,
          placeholder: "e.g., 50",
        },
      ],
      category: "Positive",
    },
    {
      id: "recruiter-assigned-active",
      label: "Recruiter Assigned - Active Openings",
      template: "Recruiter assigned and has {{activeJobs}} active job openings matching candidate profile. First submissions planned for this week.",
      variables: [
        {
          key: "activeJobs",
          label: "Active Job Matches",
          type: "number",
          required: true,
          placeholder: "e.g., 5",
        },
      ],
      category: "Positive",
    },
    {
      id: "recruiter-assigned-strategy",
      label: "Recruiter Assigned with Strategy",
      template: "Recruiter assigned. Developed targeted marketing strategy focusing on {{approach}}. Initial outreach to {{companies}} companies scheduled.",
      variables: [
        {
          key: "approach",
          label: "Marketing Approach",
          required: true,
          placeholder: "e.g., direct client relationships, staffing partners, job boards",
        },
        {
          key: "companies",
          label: "Number of Companies",
          type: "number",
          required: false,
          placeholder: "e.g., 15",
        },
      ],
      category: "Positive",
    },
    {
      id: "recruiter-assigned-match",
      label: "Perfect Match Assignment",
      template: "Recruiter assigned based on specialization match. Recruiter previously placed candidates in similar {{roleType}} roles at {{companyTypes}} companies. High confidence for quick placement.",
      variables: [
        {
          key: "roleType",
          label: "Role Type",
          required: true,
          placeholder: "e.g., senior developer, project manager, analyst",
        },
        {
          key: "companyTypes",
          label: "Company Types",
          required: false,
          placeholder: "e.g., Fortune 500, startups, mid-size",
        },
      ],
      category: "Positive",
    },
  ],

  // Remarketing Actions
  "Acknowledged-Remarketing": [
    {
      id: "remarketing-ack-new-strategy",
      label: "New Strategy - Different Approach",
      template: "Remarketing acknowledged. Initial marketing cycle completed without placement. New strategy: {{newApproach}}. Adjusting target roles to include {{additionalRoles}}.",
      variables: [
        {
          key: "newApproach",
          label: "New Marketing Approach",
          required: true,
          placeholder: "e.g., contract roles, different industries, broader geography",
        },
        {
          key: "additionalRoles",
          label: "Additional Role Types",
          required: false,
          placeholder: "e.g., contract, junior level, related fields",
        },
      ],
      category: "Positive",
    },
    {
      id: "remarketing-ack-feedback-incorporated",
      label: "Market Feedback Incorporated",
      template: "Remarketing acknowledged. Market feedback indicates {{feedback}}. Resume updated to emphasize {{newFocus}}. Re-launching with refreshed positioning.",
      variables: [
        {
          key: "feedback",
          label: "Market Feedback Received",
          required: true,
          placeholder: "e.g., need more specific skills, salary expectations high, location constraints",
        },
        {
          key: "newFocus",
          label: "New Focus Areas",
          required: true,
          placeholder: "e.g., technical certifications, cost savings achievements, industry expertise",
        },
      ],
      category: "Positive",
    },
    {
      id: "remarketing-ack-expanded-search",
      label: "Expanded Search Parameters",
      template: "Remarketing acknowledged. Expanding search to include {{additionalMarkets}}. Client agreed to consider {{flexibilities}} for better placement opportunities.",
      variables: [
        {
          key: "additionalMarkets",
          label: "Additional Markets/Industries",
          required: true,
          placeholder: "e.g., adjacent industries, new geographic areas, remote options",
        },
        {
          key: "flexibilities",
          label: "Client Flexibilities",
          required: false,
          placeholder: "e.g., contract work, lower level roles, relocation",
        },
      ],
      category: "Positive",
    },
    {
      id: "remarketing-ack-seasonal-timing",
      label: "Timing-Based Remarketing",
      template: "Remarketing acknowledged. Previous cycle coincided with {{seasonalFactor}}. Market conditions now improved. Restarting active marketing with current hiring season.",
      variables: [
        {
          key: "seasonalFactor",
          label: "Seasonal/Market Factor",
          required: true,
          placeholder: "e.g., holiday freeze, budget cycle end, market downturn",
        },
      ],
      category: "Positive",
    },
    {
      id: "remarketing-ack-skills-updated",
      label: "Skills Enhanced - Ready",
      template: "Remarketing acknowledged. Client completed {{training}} during break. Resume updated with new skills. Stronger candidate profile for current market demands.",
      variables: [
        {
          key: "training",
          label: "Training/Certifications Completed",
          required: true,
          placeholder: "e.g., AWS certification, advanced Excel, project management course",
        },
      ],
      category: "Positive",
    },
  ],

  // Stage Transition Templates - BACKED OUT
  "Move to BackedOut": [
    {
      id: "backedout-accepted-elsewhere",
      label: "Accepted Offer Elsewhere",
      template: "Client accepted position at {{company}} as {{role}}. Offered {{compensation}}. Client expressed gratitude for our services and may return for future career moves.",
      variables: [
        {
          key: "company",
          label: "Company Name",
          required: true,
          placeholder: "Company where they accepted offer",
        },
        {
          key: "role",
          label: "Role/Position",
          required: true,
          placeholder: "Job title accepted",
        },
        {
          key: "compensation",
          label: "Compensation Details",
          required: false,
          placeholder: "e.g., $95K salary, $70/hr contract",
        },
      ],
      category: "Negative",
    },
    {
      id: "backedout-unresponsive",
      label: "Client Became Unresponsive",
      template: "Client became unresponsive after {{attempts}} follow-up attempts over {{timeframe}} period. Last contact was {{lastContactDate}}. Multiple channels tried: {{channels}}.",
      variables: [
        {
          key: "attempts",
          label: "Number of Attempts",
          type: "number",
          required: true,
          placeholder: "e.g., 5",
        },
        {
          key: "timeframe",
          label: "Time Frame",
          required: true,
          placeholder: "e.g., 2 weeks, 1 month",
        },
        {
          key: "lastContactDate",
          label: "Last Contact Date",
          type: "date",
          required: false,
        },
        {
          key: "channels",
          label: "Contact Channels Used",
          required: false,
          placeholder: "e.g., email, phone, text, LinkedIn",
        },
      ],
      category: "Negative",
    },
    {
      id: "backedout-personal-reasons",
      label: "Personal/Family Reasons",
      template: "Client withdrew due to {{reason}}. Situation: {{details}}. Client indicated may return in {{timeframe}} when situation stabilizes.",
      variables: [
        {
          key: "reason",
          label: "Primary Reason",
          required: true,
          placeholder: "e.g., family emergency, health issues, relocation, personal matters",
        },
        {
          key: "details",
          label: "Brief Details",
          required: false,
          placeholder: "Optional context",
        },
        {
          key: "timeframe",
          label: "Potential Return Timeframe",
          required: false,
          placeholder: "e.g., 3-6 months, next year",
        },
      ],
      category: "Negative",
    },
    {
      id: "backedout-expectations-mismatch",
      label: "Expectations Misalignment",
      template: "Client backed out due to misalignment on {{issue}}. Client expectations: {{clientExpectation}}. Unable to meet these requirements within current market conditions.",
      variables: [
        {
          key: "issue",
          label: "Misalignment Issue",
          required: true,
          placeholder: "e.g., salary expectations, timeline, job level, location",
        },
        {
          key: "clientExpectation",
          label: "Client's Expectation",
          required: true,
          placeholder: "e.g., $150K minimum, remote only, VP level positions",
        },
      ],
      category: "Negative",
    },
    {
      id: "backedout-decided-not-pursue",
      label: "Decided Not to Pursue",
      template: "Client decided not to pursue job search at this time. Reason: {{reason}}. Client may re-engage in future if circumstances change. Maintaining good relationship.",
      variables: [
        {
          key: "reason",
          label: "Decision Reason",
          required: true,
          placeholder: "e.g., staying at current job, starting business, returning to school, retiring early",
        },
      ],
      category: "Negative",
    },
  ],

  // Stage Transition Templates - ON HOLD
  "Move to OnHold": [
    {
      id: "onhold-client-request-timing",
      label: "Client Requested - Timing",
      template: "Client requested to pause process due to {{reason}}. Expected to resume {{resumeDate}}. Client remains committed but needs temporary pause. Will check in {{checkInFrequency}}.",
      variables: [
        {
          key: "reason",
          label: "Reason for Hold",
          required: true,
          placeholder: "e.g., current project deadline, personal travel, family commitment",
        },
        {
          key: "resumeDate",
          label: "Expected Resume Date",
          type: "date",
          required: false,
        },
        {
          key: "checkInFrequency",
          label: "Check-in Frequency",
          required: false,
          placeholder: "e.g., weekly, bi-weekly, monthly",
        },
      ],
      category: "Neutral",
    },
    {
      id: "onhold-current-job-situation",
      label: "Current Job Development",
      template: "Client placed on hold. Current employer {{situation}}. Client evaluating options before proceeding with external search. Situation to be resolved by {{resolutionDate}}.",
      variables: [
        {
          key: "situation",
          label: "Current Job Situation",
          required: true,
          placeholder: "e.g., offered promotion, counter-offer made, project ending",
        },
        {
          key: "resolutionDate",
          label: "Expected Resolution Date",
          type: "date",
          required: false,
        },
      ],
      category: "Neutral",
    },
    {
      id: "onhold-market-waiting",
      label: "Waiting for Market Conditions",
      template: "On hold per client request. Waiting for {{condition}}. Client prefers to remain prepared but pause active marketing until conditions improve. Resume remains current.",
      variables: [
        {
          key: "condition",
          label: "Market Condition",
          required: true,
          placeholder: "e.g., hiring season to start, industry stabilization, specific company to open hiring",
        },
      ],
      category: "Neutral",
    },
    {
      id: "onhold-skills-enhancement",
      label: "Skills Enhancement Period",
      template: "Client requested hold to complete {{training}}. This will significantly improve marketability for {{targetRoles}}. Expected completion {{completionDate}}. Will resume immediately after.",
      variables: [
        {
          key: "training",
          label: "Training/Certification",
          required: true,
          placeholder: "e.g., MBA program, technical certification, industry credential",
        },
        {
          key: "targetRoles",
          label: "Target Roles",
          required: true,
          placeholder: "e.g., senior positions, specialized roles",
        },
        {
          key: "completionDate",
          label: "Training Completion Date",
          type: "date",
          required: false,
        },
      ],
      category: "Neutral",
    },
    {
      id: "onhold-health-temporary",
      label: "Temporary Health Matter",
      template: "Client requested hold due to temporary health matter. Expected recovery and return to process by {{returnDate}}. Maintaining contact and ready to resume when client is ready.",
      variables: [
        {
          key: "returnDate",
          label: "Expected Return Date",
          type: "date",
          required: false,
        },
      ],
      category: "Neutral",
    },
  ],

  // Stage Transition Templates - PLACED
  "Move to Placed": [
    {
      id: "placed-direct-hire",
      label: "Direct Hire Placement",
      template: "Client successfully placed at {{company}} as {{position}}. Direct hire position. Salary: {{salary}}. Benefits: {{benefits}}. Start date: {{startDate}}. Client extremely satisfied with outcome.",
      variables: [
        {
          key: "company",
          label: "Company Name",
          required: true,
        },
        {
          key: "position",
          label: "Position/Title",
          required: true,
        },
        {
          key: "salary",
          label: "Annual Salary",
          required: false,
          placeholder: "e.g., $105K",
        },
        {
          key: "benefits",
          label: "Benefits Package",
          required: false,
          placeholder: "e.g., full benefits, 401K match, bonus potential",
        },
        {
          key: "startDate",
          label: "Start Date",
          type: "date",
          required: false,
        },
      ],
      category: "Positive",
    },
    {
      id: "placed-contract",
      label: "Contract Placement",
      template: "Client placed at {{company}} as {{position}}. Contract position: {{duration}} duration. Rate: {{rate}}/hour. Strong possibility of extension or conversion to permanent. Start date: {{startDate}}.",
      variables: [
        {
          key: "company",
          label: "Company Name",
          required: true,
        },
        {
          key: "position",
          label: "Position/Title",
          required: true,
        },
        {
          key: "duration",
          label: "Contract Duration",
          required: true,
          placeholder: "e.g., 6 months, 1 year",
        },
        {
          key: "rate",
          label: "Hourly Rate",
          required: false,
          placeholder: "e.g., $75",
        },
        {
          key: "startDate",
          label: "Start Date",
          type: "date",
          required: false,
        },
      ],
      category: "Positive",
    },
    {
      id: "placed-contract-to-hire",
      label: "Contract-to-Hire Placement",
      template: "Client placed at {{company}} as {{position}}. Contract-to-hire: {{contractPeriod}} contract with conversion to permanent. Rate: {{rate}}/hr, converts to ~{{salary}} salary. Excellent growth opportunity.",
      variables: [
        {
          key: "company",
          label: "Company Name",
          required: true,
        },
        {
          key: "position",
          label: "Position/Title",
          required: true,
        },
        {
          key: "contractPeriod",
          label: "Contract Period",
          required: true,
          placeholder: "e.g., 3 months, 6 months",
        },
        {
          key: "rate",
          label: "Contract Hourly Rate",
          required: false,
          placeholder: "e.g., $65",
        },
        {
          key: "salary",
          label: "Conversion Salary Estimate",
          required: false,
          placeholder: "e.g., $95K",
        },
      ],
      category: "Positive",
    },
    {
      id: "placed-remote",
      label: "Remote Position Placement",
      template: "Client placed at {{company}} as {{position}}. Fully remote position with {{flexibility}}. Compensation: {{compensation}}. Perfect match for client's work-life balance goals. Starting {{startDate}}.",
      variables: [
        {
          key: "company",
          label: "Company Name",
          required: true,
        },
        {
          key: "position",
          label: "Position/Title",
          required: true,
        },
        {
          key: "flexibility",
          label: "Work Flexibility",
          required: false,
          placeholder: "e.g., flexible hours, work from anywhere, occasional travel",
        },
        {
          key: "compensation",
          label: "Compensation",
          required: false,
          placeholder: "e.g., $88K + bonus",
        },
        {
          key: "startDate",
          label: "Start Date",
          type: "date",
          required: false,
        },
      ],
      category: "Positive",
    },
    {
      id: "placed-promotion-level",
      label: "Promotion Level Placement",
      template: "Excellent placement at {{company}} as {{position}}. This represents a {{promotionLevel}} advancement from client's previous role. Salary increase of {{increase}}. Client thrilled with career advancement opportunity.",
      variables: [
        {
          key: "company",
          label: "Company Name",
          required: true,
        },
        {
          key: "position",
          label: "New Position/Title",
          required: true,
        },
        {
          key: "promotionLevel",
          label: "Level of Advancement",
          required: true,
          placeholder: "e.g., one-level promotion, significant step up, director to VP",
        },
        {
          key: "increase",
          label: "Salary Increase",
          required: false,
          placeholder: "e.g., 25%, $20K increase",
        },
      ],
      category: "Positive",
    },
  ],

  // Stage Transition Templates - REMARKETING
  "Move to Remarketing": [
    {
      id: "to-remarketing-no-interviews",
      label: "No Interviews - Strategy Needed",
      template: "Moving to remarketing after {{timeframe}} of marketing with no interview activity. Total submissions: {{submissions}}. Need to reassess target market and adjust strategy for better response.",
      variables: [
        {
          key: "timeframe",
          label: "Marketing Duration",
          required: true,
          placeholder: "e.g., 4 weeks, 2 months",
        },
        {
          key: "submissions",
          label: "Number of Submissions",
          type: "number",
          required: false,
          placeholder: "e.g., 25",
        },
      ],
      category: "Neutral",
    },
    {
      id: "to-remarketing-interviews-no-offers",
      label: "Interviews But No Offers",
      template: "Moving to remarketing. {{interviews}} interviews completed but no offers received. Common feedback: {{feedback}}. Will adjust positioning and target more suitable role levels.",
      variables: [
        {
          key: "interviews",
          label: "Number of Interviews",
          type: "number",
          required: true,
          placeholder: "e.g., 5",
        },
        {
          key: "feedback",
          label: "Interview Feedback",
          required: true,
          placeholder: "e.g., seeking more experience, salary expectations high, skills mismatch",
        },
      ],
      category: "Neutral",
    },
    {
      id: "to-remarketing-market-conditions",
      label: "Market Conditions Changed",
      template: "Moving to remarketing due to {{marketChange}}. Original strategy no longer viable. Will pivot to {{newStrategy}} approach for better results in current market.",
      variables: [
        {
          key: "marketChange",
          label: "Market Change",
          required: true,
          placeholder: "e.g., industry layoffs, hiring freeze, economic downturn, seasonal slowdown",
        },
        {
          key: "newStrategy",
          label: "New Strategy",
          required: true,
          placeholder: "e.g., contract focus, adjacent industries, different geography",
        },
      ],
      category: "Neutral",
    },
    {
      id: "to-remarketing-resume-refresh",
      label: "Resume Refresh Needed",
      template: "Moving to remarketing. Market response indicates resume needs refreshing. Will update to emphasize {{newFocus}} and de-emphasize {{deEmphasize}}. Client agreed to changes.",
      variables: [
        {
          key: "newFocus",
          label: "New Focus Areas",
          required: true,
          placeholder: "e.g., recent projects, technical skills, leadership achievements",
        },
        {
          key: "deEmphasize",
          label: "Areas to De-emphasize",
          required: false,
          placeholder: "e.g., older experience, irrelevant roles",
        },
      ],
      category: "Neutral",
    },
    {
      id: "to-remarketing-broadening-search",
      label: "Broadening Search Criteria",
      template: "Moving to remarketing with broader search criteria. Client now open to {{newOptions}}. This flexibility significantly increases placement opportunities. Restarting with expanded approach.",
      variables: [
        {
          key: "newOptions",
          label: "New Options Client Accepts",
          required: true,
          placeholder: "e.g., contract work, lower level roles, different locations, adjacent industries",
        },
      ],
      category: "Neutral",
    },
  ],

  // Additional common stage transitions
  "Move to Resume": [
    {
      id: "to-resume-qualified-eager",
      label: "Qualified and Eager",
      template: "Client qualified and eager to begin resume process. {{experience}} years of experience in {{field}}. Strong potential for successful placement. Moving to resume preparation stage.",
      variables: [
        {
          key: "experience",
          label: "Years of Experience",
          type: "number",
          required: true,
        },
        {
          key: "field",
          label: "Field/Industry",
          required: true,
        },
      ],
      category: "Positive",
    },
    {
      id: "to-resume-docs-complete",
      label: "All Documentation Complete",
      template: "All sales stage requirements completed successfully. Documentation verified, priority set, and client is ready for resume preparation. Excellent candidate profile.",
      category: "Positive",
    },
    {
      id: "to-resume-fast-track",
      label: "Fast Track Candidate",
      template: "Fast-tracking to resume stage. Client has {{urgency}} and strong background. Priority candidate for quick processing. Resume team notified of timeline urgency.",
      variables: [
        {
          key: "urgency",
          label: "Urgency Reason",
          required: true,
          placeholder: "e.g., current job ending, time-sensitive opportunity, immediate availability",
        },
      ],
      category: "Positive",
    },
    {
      id: "to-resume-high-potential",
      label: "High Potential Candidate",
      template: "Moving to resume stage. Exceptional candidate rated as high priority. Background in {{specialty}} with {{achievements}}. Anticipating strong market response.",
      variables: [
        {
          key: "specialty",
          label: "Specialty/Expertise",
          required: true,
          placeholder: "e.g., enterprise software, healthcare management",
        },
        {
          key: "achievements",
          label: "Key Achievements",
          required: false,
          placeholder: "e.g., award-winning projects, revenue growth",
        },
      ],
      category: "Positive",
    },
    {
      id: "to-resume-career-change-ready",
      label: "Career Change - Prepared",
      template: "Client ready for resume stage. Seeking career transition from {{currentField}} to {{targetField}}. Client well-prepared with relevant {{transferableSkills}}. Strong transition candidate.",
      variables: [
        {
          key: "currentField",
          label: "Current Field",
          required: true,
        },
        {
          key: "targetField",
          label: "Target Field",
          required: true,
        },
        {
          key: "transferableSkills",
          label: "Transferable Skills",
          required: false,
          placeholder: "e.g., project management, leadership, technical skills",
        },
      ],
      category: "Positive",
    },
  ],

  "Move to Marketing": [
    {
      id: "to-marketing-strong-resume",
      label: "Strong Resume - Ready",
      template: "Resume completed and exceptional. Client background in {{field}} with {{yearsExp}} years experience. Strong ATS-optimized resume. Expecting quick placement in current market.",
      variables: [
        {
          key: "field",
          label: "Field/Industry",
          required: true,
        },
        {
          key: "yearsExp",
          label: "Years of Experience",
          type: "number",
          required: true,
        },
      ],
      category: "Positive",
    },
    {
      id: "to-marketing-package-complete",
      label: "Complete Marketing Package",
      template: "Moving to marketing with complete package: professional resume, cover letter, {{additionalDocs}}. All materials approved and ready for active marketing campaign.",
      variables: [
        {
          key: "additionalDocs",
          label: "Additional Documents",
          required: false,
          placeholder: "e.g., LinkedIn profile, portfolio, references",
        },
      ],
      category: "Positive",
    },
    {
      id: "to-marketing-high-demand",
      label: "High Demand Skillset",
      template: "Excellent timing for marketing stage. Client has high-demand skills in {{skills}}. Current market showing strong hiring for {{targetRoles}}. High confidence for quick placement.",
      variables: [
        {
          key: "skills",
          label: "High-Demand Skills",
          required: true,
          placeholder: "e.g., cloud architecture, data science, cybersecurity",
        },
        {
          key: "targetRoles",
          label: "Target Roles",
          required: true,
          placeholder: "e.g., Senior Engineer, Solutions Architect",
        },
      ],
      category: "Positive",
    },
    {
      id: "to-marketing-client-motivated",
      label: "Highly Motivated Client",
      template: "Client ready and highly motivated for active marketing. Available for interviews immediately. Willing to consider {{flexibility}} opportunities. Ideal candidate engagement level.",
      variables: [
        {
          key: "flexibility",
          label: "Flexibility Options",
          required: false,
          placeholder: "e.g., contract, remote, relocation, multiple industries",
        },
      ],
      category: "Positive",
    },
    {
      id: "to-marketing-niche-specialist",
      label: "Niche Specialist Ready",
      template: "Moving to marketing. Client is specialist in {{niche}} with {{certifications}}. Targeted marketing approach planned for specialized roles. Strong placement potential in niche market.",
      variables: [
        {
          key: "niche",
          label: "Niche Specialty",
          required: true,
          placeholder: "e.g., SAP implementation, regulatory compliance, medical devices",
        },
        {
          key: "certifications",
          label: "Relevant Certifications",
          required: false,
          placeholder: "e.g., industry certifications, advanced degrees",
        },
      ],
      category: "Positive",
    },
  ],

  // Special transition action names
  "MarketingToPlacedTransition": [
    {
      id: "marketing-placed-quick",
      label: "Quick Placement Success",
      template: "Successfully placed from marketing in {{timeframe}}! Client accepted offer at {{company}} as {{position}}. Salary: {{salary}}. Excellent match and client very satisfied.",
      variables: [
        {
          key: "timeframe",
          label: "Time to Placement",
          required: true,
          placeholder: "e.g., 2 weeks, 1 month",
        },
        {
          key: "company",
          label: "Company",
          required: true,
        },
        {
          key: "position",
          label: "Position",
          required: true,
        },
        {
          key: "salary",
          label: "Salary/Rate",
          required: false,
        },
      ],
      category: "Positive",
    },
  ],

  "RemarketingToPlacedTransition": [
    {
      id: "remarketing-placed-success",
      label: "Remarketing Success",
      template: "Remarketing strategy successful! New approach of {{strategy}} worked effectively. Client placed at {{company}} as {{position}}. Persistence and strategy adjustment paid off.",
      variables: [
        {
          key: "strategy",
          label: "Successful Strategy",
          required: true,
          placeholder: "e.g., contract focus, broader geography, adjusted seniority level",
        },
        {
          key: "company",
          label: "Company",
          required: true,
        },
        {
          key: "position",
          label: "Position",
          required: true,
        },
      ],
      category: "Positive",
    },
  ],

  "SalesToPlacedTransition": [
    {
      id: "sales-placed-existing",
      label: "Existing Offer - Fast Track",
      template: "Client already had offer in hand from {{company}} when engaging our services. Assisted with {{assistance}}. Client placed as {{position}} starting {{startDate}}.",
      variables: [
        {
          key: "company",
          label: "Company",
          required: true,
        },
        {
          key: "assistance",
          label: "Assistance Provided",
          required: false,
          placeholder: "e.g., negotiation, resume improvement, offer evaluation",
        },
        {
          key: "position",
          label: "Position",
          required: true,
        },
        {
          key: "startDate",
          label: "Start Date",
          type: "date",
          required: false,
        },
      ],
      category: "Positive",
    },
  ],

  "ResumeToPlacedTransition": [
    {
      id: "resume-placed-self",
      label: "Self-Placed During Process",
      template: "Client self-placed during resume preparation stage. Found position independently at {{company}} as {{position}}. Resume work helped client with application. Congratulated client on success.",
      variables: [
        {
          key: "company",
          label: "Company",
          required: true,
        },
        {
          key: "position",
          label: "Position",
          required: true,
        },
      ],
      category: "Positive",
    },
  ],

  "OnHoldToPlacedTransition": [
    {
      id: "onhold-placed-opportunity",
      label: "Opportunity During Hold",
      template: "Client contacted during hold period about perfect opportunity at {{company}}. Client accepted position as {{position}}. Right opportunity at right time. Client grateful for staying in touch.",
      variables: [
        {
          key: "company",
          label: "Company",
          required: true,
        },
        {
          key: "position",
          label: "Position",
          required: true,
        },
      ],
      category: "Positive",
    },
  ],

  "BackedOutToPlacedTransition": [
    {
      id: "backedout-placed-return",
      label: "Client Returned and Placed",
      template: "Client returned after previously backing out. Situation that caused departure resolved: {{resolution}}. Successfully placed at {{company}} as {{position}}. Happy ending after challenging journey.",
      variables: [
        {
          key: "resolution",
          label: "What Changed",
          required: true,
          placeholder: "e.g., other job fell through, personal situation resolved, market improved",
        },
        {
          key: "company",
          label: "Company",
          required: true,
        },
        {
          key: "position",
          label: "Position",
          required: true,
        },
      ],
      category: "Positive",
    },
  ],

  "Move to sales": [
    {
      id: "to-sales-restart-requalify",
      label: "Restart - Requalification Needed",
      template: "Restarting from sales stage. Need to requalify client due to {{reason}}. Will reassess current situation, goals, and service fit.",
      variables: [
        {
          key: "reason",
          label: "Restart Reason",
          required: true,
          placeholder: "e.g., significant time gap, goals changed, new information",
        },
      ],
      category: "Neutral",
    },
  ],
};

// Helper function to get templates for a specific action
export const getTemplatesForAction = (actionType: string): CommentTemplate[] => {
  return COMMENT_TEMPLATES[actionType] || [];
};

// Helper function to get template by ID
export const getTemplateById = (actionType: string, templateId: string): CommentTemplate | undefined => {
  const templates = COMMENT_TEMPLATES[actionType] || [];
  return templates.find(t => t.id === templateId);
};

// Helper function to process template with variables
export const processTemplate = (template: string, values: Record<string, string>): string => {
  let processed = template;
  Object.keys(values).forEach(key => {
    const placeholder = `{{${key}}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), values[key] || '');
  });
  return processed;
};

// Industry-specific dictionary for spell check
export const INDUSTRY_DICTIONARY = [
  // Job-related terms
  "remarketing",
  "upskilling",
  "reskilling",
  "onboarding",
  "offboarding",
  "ats",
  "applicant",

  // Common job titles and roles
  "recruiter",
  "backend",
  "frontend",
  "fullstack",
  "devops",
  "scrum",
  "agile",
  "salesforce",

  // Technical terms
  "linkedin",
  "github",
  "stackoverflow",
  "aws",
  "azure",
  "kubernetes",

  // Common abbreviations
  "cv",
  "kpi",
  "roi",
  "api",
  "saas",
  "b2b",
  "b2c",

  // Process terms
  "pre-screening",
  "post-interview",
  "follow-up",
  "followup",
  "touchpoint",
  "outreach",

  // Certifications
  "pmp",
  "cissp",
  "ccna",
  "mba",
  "cpa",

  // Company/industry
  "startups",
  "fintech",
  "healthtech",
  "edtech",
  "biotech",

  // Work arrangements
  "remote",
  "hybrid",
  "onsite",
  "freelance",
  "w2",
  "1099",
];
