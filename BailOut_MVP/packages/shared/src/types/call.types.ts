export interface Call {
  id: string;
  userId: string;
  scenarioId: string;
  scheduledFor: Date;
  triggeredAt: Date;
  completedAt?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled' | 'failed';
  duration?: number; // seconds
  callerType: 'mom' | 'boss' | 'friend' | 'roommate' | 'doctor';
}

export interface TriggerCallRequest {
  scenarioId: string;
  timing: 'immediate' | 'timed';
  delayMinutes?: number;
}

export interface CallHistoryResponse {
  calls: Call[];
  total: number;
  hasMore: boolean;
}