export enum SubscriptionTier {
  FREE = 'Free',
  BASIC = 'Basic',
  PREMIUM = 'Premium'
}

export interface User {
  id: string;
  name: string;
  email: string;
  tier: SubscriptionTier;
  credits: number;
  lastReset: string; // ISO Date
  onboardingCompleted: boolean;
  stats: {
    assessments: number;
    icebreakers: number;
    prompts: number;
    questions: number;
  };
}

export interface Icebreaker {
  id: string;
  tone: string;
  emoji: string;
  message_text: string;
  why_it_works: string;
  follow_up: string;
  character_count: number;
  interest_category: string;
  copyable: boolean;
  saveable: boolean;
}

export interface SavedIcebreaker extends Icebreaker {
  savedAt: number; // Timestamp
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const CREDIT_COSTS = {
  ASSESSMENT_FIRST: 0,
  ASSESSMENT_RETRY: 2,
  PROMPT_ANALYZER: 1,
  ICEBREAKER: 0.25,
  AMA_QUESTION: 0.5,
};

export const WEEKLY_CREDITS = {
  [SubscriptionTier.FREE]: 3,
  [SubscriptionTier.BASIC]: 5,
  [SubscriptionTier.PREMIUM]: 9999,
};