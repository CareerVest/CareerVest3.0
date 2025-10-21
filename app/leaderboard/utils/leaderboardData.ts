// Leaderboard Data Utilities - Dummy Data for Wireframe
// This file contains all types and dummy data for the gamified leaderboard system

export type AchievementType =
  | "TopSales"
  | "TopRecruiter"
  | "TopResumeWriter"
  | "RevenueKing"
  | "PlacementMaster"
  | "QualityChampion"
  | "SpeedDemon"
  | "ClientFavorite"
  | "TeamPlayer"
  | "Milestone10"
  | "Milestone50"
  | "Milestone100"
  | "PerfectStreak"
  | "RisingRookie"
  | "ConsistentPerformer";

export type LeaderboardCategory = "Sales" | "Recruiter" | "ResumeWriter" | "Overall";
export type TimePeriod = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "AllTime";

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  color: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  points: number;
  dateEarned?: Date;
  isUnlocked: boolean;
}

export interface EmployeeRanking {
  employeeId: string;
  employeeName: string;
  role: string;
  rank: number;
  previousRank?: number;
  score: number;
  metric: string;
  trend: "up" | "down" | "same";
  avatar?: string;
  badges: AchievementType[];
  streak: number;
  level: number;
  progressToNextLevel: number;
}

export interface LeaderboardData {
  category: LeaderboardCategory;
  period: TimePeriod;
  lastUpdated: Date;
  rankings: EmployeeRanking[];
  topThree: EmployeeRanking[];
}

export interface EmployeeTarget {
  targetType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progress: number;
  status: "OnTrack" | "AtRisk" | "Exceeded" | "Behind";
  daysRemaining: number;
}

export interface PersonalStats {
  employeeId: string;
  employeeName: string;
  role: string;
  currentRank: number;
  totalEmployees: number;
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  achievements: Achievement[];
  targets: EmployeeTarget[];
  recentWins: string[];
  motivationalQuote: string;
}

export interface CompanyAnnouncement {
  id: string;
  type: "Winner" | "Milestone" | "Challenge" | "Celebration";
  title: string;
  message: string;
  employeeName?: string;
  employeeRole?: string;
  icon: string;
  color: string;
  date: Date;
  isActive: boolean;
}

// Achievement Definitions
export const achievementDefinitions: Record<AchievementType, Omit<Achievement, 'id' | 'dateEarned' | 'isUnlocked'>> = {
  TopSales: {
    type: "TopSales",
    title: "Sales Champion",
    description: "Top sales performer of the month",
    icon: "👑",
    color: "from-yellow-400 to-orange-500",
    rarity: "Legendary",
    points: 1000
  },
  TopRecruiter: {
    type: "TopRecruiter",
    title: "Recruitment Master",
    description: "Most placements this month",
    icon: "🎯",
    color: "from-blue-400 to-purple-500",
    rarity: "Legendary",
    points: 1000
  },
  TopResumeWriter: {
    type: "TopResumeWriter",
    title: "Resume Artisan",
    description: "Highest quality resumes delivered",
    icon: "✍️",
    color: "from-green-400 to-teal-500",
    rarity: "Legendary",
    points: 1000
  },
  RevenueKing: {
    type: "RevenueKing",
    title: "Revenue King/Queen",
    description: "Generated over $100K in revenue",
    icon: "💰",
    color: "from-emerald-400 to-green-600",
    rarity: "Epic",
    points: 750
  },
  PlacementMaster: {
    type: "PlacementMaster",
    title: "Placement Master",
    description: "20+ successful placements",
    icon: "🏆",
    color: "from-purple-400 to-pink-500",
    rarity: "Epic",
    points: 750
  },
  QualityChampion: {
    type: "QualityChampion",
    title: "Quality Champion",
    description: "Maintained 95%+ quality score",
    icon: "⭐",
    color: "from-yellow-300 to-amber-500",
    rarity: "Rare",
    points: 500
  },
  SpeedDemon: {
    type: "SpeedDemon",
    title: "Speed Demon",
    description: "Fastest average turnaround time",
    icon: "⚡",
    color: "from-cyan-400 to-blue-500",
    rarity: "Rare",
    points: 500
  },
  ClientFavorite: {
    type: "ClientFavorite",
    title: "Client Favorite",
    description: "Highest client satisfaction ratings",
    icon: "❤️",
    color: "from-pink-400 to-rose-500",
    rarity: "Rare",
    points: 500
  },
  TeamPlayer: {
    type: "TeamPlayer",
    title: "Team Player",
    description: "Helped 5+ colleagues this month",
    icon: "🤝",
    color: "from-indigo-400 to-purple-500",
    rarity: "Common",
    points: 250
  },
  Milestone10: {
    type: "Milestone10",
    title: "Getting Started",
    description: "First 10 successful completions",
    icon: "🌱",
    color: "from-green-300 to-emerald-400",
    rarity: "Common",
    points: 100
  },
  Milestone50: {
    type: "Milestone50",
    title: "Rising Star",
    description: "50 successful completions",
    icon: "🌟",
    color: "from-yellow-400 to-orange-400",
    rarity: "Rare",
    points: 500
  },
  Milestone100: {
    type: "Milestone100",
    title: "Century Club",
    description: "100 successful completions",
    icon: "💯",
    color: "from-purple-500 to-pink-600",
    rarity: "Epic",
    points: 1000
  },
  PerfectStreak: {
    type: "PerfectStreak",
    title: "Perfect Streak",
    description: "7 consecutive days hitting targets",
    icon: "🔥",
    color: "from-orange-500 to-red-600",
    rarity: "Epic",
    points: 800
  },
  RisingRookie: {
    type: "RisingRookie",
    title: "Rising Rookie",
    description: "New hire exceeding expectations",
    icon: "🚀",
    color: "from-blue-400 to-cyan-500",
    rarity: "Rare",
    points: 600
  },
  ConsistentPerformer: {
    type: "ConsistentPerformer",
    title: "Consistent Performer",
    description: "Met targets 3 months in a row",
    icon: "📈",
    color: "from-teal-400 to-green-500",
    rarity: "Rare",
    points: 500
  }
};

// Motivational Quotes
export const motivationalQuotes = [
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown" }
];

// Get daily motivational quote (rotates based on day of year)
export const getDailyQuote = (): { text: string; author: string } => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
};

// Dummy Data: Sales Leaderboard
export const getSalesLeaderboard = (period: TimePeriod = "Monthly"): LeaderboardData => {
  const rankings: EmployeeRanking[] = [
    {
      employeeId: "EMP001",
      employeeName: "Sarah Mitchell",
      role: "Sales_Executive",
      rank: 1,
      previousRank: 2,
      score: 145000,
      metric: "$145K Revenue",
      trend: "up",
      badges: ["TopSales", "RevenueKing", "ClientFavorite"],
      streak: 12,
      level: 15,
      progressToNextLevel: 75
    },
    {
      employeeId: "EMP002",
      employeeName: "David Chen",
      role: "Sales_Executive",
      rank: 2,
      previousRank: 1,
      score: 138500,
      metric: "$138.5K Revenue",
      trend: "down",
      badges: ["ConsistentPerformer", "Milestone100"],
      streak: 8,
      level: 14,
      progressToNextLevel: 45
    },
    {
      employeeId: "EMP003",
      employeeName: "Emily Rodriguez",
      role: "Sales_Executive",
      rank: 3,
      previousRank: 4,
      score: 127000,
      metric: "$127K Revenue",
      trend: "up",
      badges: ["RisingRookie", "ClientFavorite"],
      streak: 5,
      level: 12,
      progressToNextLevel: 60
    },
    {
      employeeId: "EMP004",
      employeeName: "Michael Thompson",
      role: "Sales_Executive",
      rank: 4,
      previousRank: 3,
      score: 119000,
      metric: "$119K Revenue",
      trend: "down",
      badges: ["Milestone50", "TeamPlayer"],
      streak: 3,
      level: 11,
      progressToNextLevel: 30
    },
    {
      employeeId: "EMP005",
      employeeName: "Jessica Park",
      role: "Sales_Executive",
      rank: 5,
      previousRank: 6,
      score: 112000,
      metric: "$112K Revenue",
      trend: "up",
      badges: ["ConsistentPerformer"],
      streak: 4,
      level: 10,
      progressToNextLevel: 50
    },
    {
      employeeId: "EMP006",
      employeeName: "Robert Kim",
      role: "Sales_Executive",
      rank: 6,
      previousRank: 5,
      score: 98000,
      metric: "$98K Revenue",
      trend: "down",
      badges: ["TeamPlayer"],
      streak: 2,
      level: 9,
      progressToNextLevel: 20
    }
  ];

  return {
    category: "Sales",
    period,
    lastUpdated: new Date(),
    rankings,
    topThree: rankings.slice(0, 3)
  };
};

// Dummy Data: Recruiter Leaderboard
export const getRecruiterLeaderboard = (period: TimePeriod = "Monthly"): LeaderboardData => {
  const rankings: EmployeeRanking[] = [
    {
      employeeId: "EMP007",
      employeeName: "Amanda Foster",
      role: "Recruiter",
      rank: 1,
      previousRank: 3,
      score: 28,
      metric: "28 Placements",
      trend: "up",
      badges: ["TopRecruiter", "PlacementMaster", "PerfectStreak"],
      streak: 15,
      level: 18,
      progressToNextLevel: 85
    },
    {
      employeeId: "EMP008",
      employeeName: "James Wilson",
      role: "Recruiter",
      rank: 2,
      previousRank: 1,
      score: 26,
      metric: "26 Placements",
      trend: "down",
      badges: ["ConsistentPerformer", "Milestone100"],
      streak: 10,
      level: 16,
      progressToNextLevel: 55
    },
    {
      employeeId: "EMP009",
      employeeName: "Maria Garcia",
      role: "Recruiter",
      rank: 3,
      previousRank: 2,
      score: 24,
      metric: "24 Placements",
      trend: "down",
      badges: ["SpeedDemon", "ClientFavorite"],
      streak: 7,
      level: 15,
      progressToNextLevel: 70
    },
    {
      employeeId: "EMP010",
      employeeName: "Chris Anderson",
      role: "Recruiter",
      rank: 4,
      previousRank: 5,
      score: 22,
      metric: "22 Placements",
      trend: "up",
      badges: ["RisingRookie", "TeamPlayer"],
      streak: 6,
      level: 13,
      progressToNextLevel: 40
    },
    {
      employeeId: "EMP011",
      employeeName: "Lisa Nguyen",
      role: "Recruiter",
      rank: 5,
      previousRank: 4,
      score: 20,
      metric: "20 Placements",
      trend: "down",
      badges: ["Milestone50"],
      streak: 4,
      level: 12,
      progressToNextLevel: 35
    },
    {
      employeeId: "EMP012",
      employeeName: "Kevin Brown",
      role: "Recruiter",
      rank: 6,
      previousRank: 6,
      score: 18,
      metric: "18 Placements",
      trend: "same",
      badges: ["TeamPlayer"],
      streak: 3,
      level: 10,
      progressToNextLevel: 25
    },
    {
      employeeId: "EMP013",
      employeeName: "Rachel Adams",
      role: "Recruiter",
      rank: 7,
      previousRank: 8,
      score: 16,
      metric: "16 Placements",
      trend: "up",
      badges: ["RisingRookie"],
      streak: 2,
      level: 8,
      progressToNextLevel: 60
    },
    {
      employeeId: "EMP014",
      employeeName: "Daniel Lee",
      role: "Recruiter",
      rank: 8,
      previousRank: 7,
      score: 14,
      metric: "14 Placements",
      trend: "down",
      badges: ["Milestone10"],
      streak: 1,
      level: 7,
      progressToNextLevel: 15
    }
  ];

  return {
    category: "Recruiter",
    period,
    lastUpdated: new Date(),
    rankings,
    topThree: rankings.slice(0, 3)
  };
};

// Dummy Data: Resume Writer Leaderboard
export const getResumeWriterLeaderboard = (period: TimePeriod = "Monthly"): LeaderboardData => {
  const rankings: EmployeeRanking[] = [
    {
      employeeId: "EMP015",
      employeeName: "Olivia Martinez",
      role: "Resume_Writer",
      rank: 1,
      previousRank: 1,
      score: 98,
      metric: "98% Quality Score",
      trend: "same",
      badges: ["TopResumeWriter", "QualityChampion", "PerfectStreak"],
      streak: 20,
      level: 20,
      progressToNextLevel: 90
    },
    {
      employeeId: "EMP016",
      employeeName: "Nathan Scott",
      role: "Resume_Writer",
      rank: 2,
      previousRank: 3,
      score: 96,
      metric: "96% Quality Score",
      trend: "up",
      badges: ["SpeedDemon", "ConsistentPerformer"],
      streak: 14,
      level: 17,
      progressToNextLevel: 65
    },
    {
      employeeId: "EMP017",
      employeeName: "Sophia Taylor",
      role: "Resume_Writer",
      rank: 3,
      previousRank: 2,
      score: 94,
      metric: "94% Quality Score",
      trend: "down",
      badges: ["ClientFavorite", "Milestone100"],
      streak: 11,
      level: 16,
      progressToNextLevel: 50
    },
    {
      employeeId: "EMP018",
      employeeName: "Ethan White",
      role: "Resume_Writer",
      rank: 4,
      previousRank: 4,
      score: 92,
      metric: "92% Quality Score",
      trend: "same",
      badges: ["Milestone50", "TeamPlayer"],
      streak: 8,
      level: 14,
      progressToNextLevel: 40
    },
    {
      employeeId: "EMP019",
      employeeName: "Isabella Clark",
      role: "Resume_Writer",
      rank: 5,
      previousRank: 6,
      score: 90,
      metric: "90% Quality Score",
      trend: "up",
      badges: ["RisingRookie"],
      streak: 5,
      level: 11,
      progressToNextLevel: 55
    }
  ];

  return {
    category: "ResumeWriter",
    period,
    lastUpdated: new Date(),
    rankings,
    topThree: rankings.slice(0, 3)
  };
};

// Dummy Data: Overall Company Leaderboard
export const getOverallLeaderboard = (period: TimePeriod = "Monthly"): LeaderboardData => {
  const salesTop = getSalesLeaderboard(period).topThree;
  const recruiterTop = getRecruiterLeaderboard(period).topThree;
  const resumeTop = getResumeWriterLeaderboard(period).topThree;

  const allRankings = [
    ...salesTop.map(r => ({ ...r, score: r.score / 1000 })), // Normalize sales revenue
    ...recruiterTop,
    ...resumeTop
  ].sort((a, b) => b.score - a.score);

  return {
    category: "Overall",
    period,
    lastUpdated: new Date(),
    rankings: allRankings,
    topThree: allRankings.slice(0, 3)
  };
};

// Dummy Data: Company Announcements
export const getCompanyAnnouncements = (): CompanyAnnouncement[] => {
  return [
    {
      id: "ANN001",
      type: "Winner",
      title: "🏆 Sales Champion of the Month",
      message: "Congratulations to Sarah Mitchell for generating $145K in revenue this month!",
      employeeName: "Sarah Mitchell",
      employeeRole: "Sales Executive",
      icon: "👑",
      color: "from-yellow-400 to-orange-500",
      date: new Date(),
      isActive: true
    },
    {
      id: "ANN002",
      type: "Winner",
      title: "🎯 Top Recruiter Award",
      message: "Amanda Foster leads with 28 successful placements this month. Outstanding work!",
      employeeName: "Amanda Foster",
      employeeRole: "Recruiter",
      icon: "🎯",
      color: "from-blue-400 to-purple-500",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isActive: true
    },
    {
      id: "ANN003",
      type: "Winner",
      title: "✍️ Resume Quality Excellence",
      message: "Olivia Martinez maintains a perfect 98% quality score. Keep up the amazing work!",
      employeeName: "Olivia Martinez",
      employeeRole: "Resume Writer",
      icon: "⭐",
      color: "from-green-400 to-teal-500",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      isActive: true
    },
    {
      id: "ANN004",
      type: "Milestone",
      title: "💯 Century Club Member",
      message: "David Chen just completed his 100th successful client enrollment!",
      employeeName: "David Chen",
      employeeRole: "Sales Executive",
      icon: "💯",
      color: "from-purple-500 to-pink-600",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      isActive: true
    },
    {
      id: "ANN005",
      type: "Challenge",
      title: "🔥 Weekly Challenge Active",
      message: "Team challenge: Reach 50 combined placements this week. Current: 38/50",
      icon: "🚀",
      color: "from-orange-400 to-red-500",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      isActive: true
    }
  ];
};

// Dummy Data: Personal Stats for Current User
export const getPersonalStats = (employeeId: string = "EMP007"): PersonalStats => {
  // Using Amanda Foster (Top Recruiter) as example
  return {
    employeeId,
    employeeName: "Amanda Foster",
    role: "Recruiter",
    currentRank: 1,
    totalEmployees: 19,
    level: 18,
    totalPoints: 8750,
    pointsToNextLevel: 250,
    achievements: [
      { id: "A1", ...achievementDefinitions.TopRecruiter, dateEarned: new Date(), isUnlocked: true },
      { id: "A2", ...achievementDefinitions.PlacementMaster, dateEarned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), isUnlocked: true },
      { id: "A3", ...achievementDefinitions.PerfectStreak, dateEarned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), isUnlocked: true },
      { id: "A4", ...achievementDefinitions.Milestone100, dateEarned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), isUnlocked: true },
      { id: "A5", ...achievementDefinitions.ConsistentPerformer, dateEarned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), isUnlocked: true },
      { id: "A6", ...achievementDefinitions.TeamPlayer, dateEarned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), isUnlocked: true },
      { id: "A7", ...achievementDefinitions.Milestone50, dateEarned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), isUnlocked: true },
      { id: "A8", ...achievementDefinitions.Milestone10, dateEarned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180), isUnlocked: true },
      { id: "A9", ...achievementDefinitions.RisingRookie, dateEarned: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200), isUnlocked: true },
      // Locked achievements
      { id: "A10", ...achievementDefinitions.TopSales, isUnlocked: false },
      { id: "A11", ...achievementDefinitions.TopResumeWriter, isUnlocked: false },
      { id: "A12", ...achievementDefinitions.RevenueKing, isUnlocked: false },
      { id: "A13", ...achievementDefinitions.QualityChampion, isUnlocked: false },
      { id: "A14", ...achievementDefinitions.SpeedDemon, isUnlocked: false },
      { id: "A15", ...achievementDefinitions.ClientFavorite, isUnlocked: false }
    ],
    targets: [
      {
        targetType: "Monthly Placements",
        targetValue: 25,
        currentValue: 28,
        unit: "placements",
        progress: 112,
        status: "Exceeded",
        daysRemaining: 5
      },
      {
        targetType: "Interview Success Rate",
        targetValue: 65,
        currentValue: 72,
        unit: "%",
        progress: 111,
        status: "Exceeded",
        daysRemaining: 5
      },
      {
        targetType: "Client Satisfaction",
        targetValue: 4.5,
        currentValue: 4.8,
        unit: "/5",
        progress: 107,
        status: "Exceeded",
        daysRemaining: 5
      }
    ],
    recentWins: [
      "🎯 Achieved #1 Recruiter ranking",
      "🔥 15-day perfect streak",
      "💼 28 placements this month (Target: 25)",
      "⭐ 4.8/5 client satisfaction rating",
      "🏆 Earned 'Placement Master' badge"
    ],
    motivationalQuote: getDailyQuote().text
  };
};
