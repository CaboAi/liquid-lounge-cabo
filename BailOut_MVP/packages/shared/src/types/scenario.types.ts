export interface Scenario {
  id: string;
  userId?: string; // null for default scenarios
  title: string;
  description: string;
  callerType: 'mom' | 'boss' | 'friend' | 'roommate' | 'doctor';
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
  customMessage?: string;
  isDefault: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface CreateScenarioRequest {
  title: string;
  description: string;
  callerType: 'mom' | 'boss' | 'friend' | 'roommate' | 'doctor';
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
  customMessage?: string;
}

export interface UpdateScenarioRequest extends Partial<CreateScenarioRequest> {
  isFavorite?: boolean;
}

export type CallerType = 'mom' | 'boss' | 'friend' | 'roommate' | 'doctor';

export const CALLER_ICONS: Record<CallerType, string> = {
  mom: '👩‍👧‍👦',
  boss: '👔',
  friend: '👥',
  roommate: '🏠',
  doctor: '🩺'
};

export const DEFAULT_SCENARIOS: Omit<Scenario, 'id' | 'userId' | 'isFavorite' | 'usageCount' | 'createdAt'>[] = [
  {
    title: 'Emergency - Family Issue',
    description: 'Mom calling about urgent family matter',
    callerType: 'mom',
    urgencyLevel: 5,
    isDefault: true,
    customMessage: 'Hi honey, I need you to come home right away. There\'s a family emergency and I really need your help.'
  },
  {
    title: 'Work Call - Boss Needs You',
    description: 'Boss calling about urgent work issue',
    callerType: 'boss',
    urgencyLevel: 4,
    isDefault: true,
    customMessage: 'Hi, this is [Boss Name]. I need you to come in immediately. We have a critical situation that requires your attention.'
  },
  {
    title: 'Sick Pet Emergency',
    description: 'Friend calling about pet emergency',
    callerType: 'friend',
    urgencyLevel: 4,
    isDefault: true,
    customMessage: 'Hey, I really need your help. My dog is sick and I need to get to the emergency vet right now. Can you come with me?'
  },
  {
    title: 'Friend Needs Help',
    description: 'Friend calling for urgent assistance',
    callerType: 'friend',
    urgencyLevel: 3,
    isDefault: true,
    customMessage: 'Hey, I\'m really sorry to bother you but I\'m in a situation and I really need your help right now.'
  },
  {
    title: 'Doctor Callback',
    description: 'Doctor calling with test results',
    callerType: 'doctor',
    urgencyLevel: 3,
    isDefault: true,
    customMessage: 'Hello, this is Dr. [Name] from [Clinic]. I need to speak with you about your recent test results. Please call me back as soon as possible.'
  },
  {
    title: 'Car Trouble',
    description: 'Roommate calling about car emergency',
    callerType: 'roommate',
    urgencyLevel: 2,
    isDefault: true,
    customMessage: 'Hey, my car broke down and I\'m stranded. Can you come pick me up? I really need your help getting home.'
  }
];