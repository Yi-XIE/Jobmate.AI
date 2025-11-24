
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  RESUME = 'RESUME',
  RESUME_LIST = 'RESUME_LIST',
  MATCH = 'MATCH',
  INTERVIEW = 'INTERVIEW',
  RADAR = 'RADAR',
  ASSETS = 'ASSETS',
}

export interface StarExperience {
  id: string;
  type?: 'work' | 'campus'; // Distinguish between work and campus experiences
  title: string;
  date: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface MatchResult {
  score: number;
  missingKeywords: string[];
  strengths: string[];
  suggestions: string;
  optimizedSummary?: string;
}

export interface SavedResume {
  id: string;
  title: string;
  date: string;
  preview: string;
  content: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string; // e.g. '学生', '求职者'
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
}

export interface InterviewFeedback {
  id: string;
  date: string;
  type: 'behavioral' | 'technical' | 'pressure';
  score: number; // 0-100
  summary: string;
  strengths: string[];
  improvements: string[];
}
