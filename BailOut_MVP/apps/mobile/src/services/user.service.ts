import {
  User,
  UpdateProfileRequest,
  VoicePreferences,
  CallerIdSettings,
  NotificationPreferences,
  DeleteAccountRequest,
  UserProfile,
} from '@bailout/shared/types';

class UserService {
  private apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

  // Get user profile
  async getProfile(): Promise<{ success: boolean; data?: UserProfile; error?: { message: string } }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock user profile data
      const userProfile: UserProfile = {
        id: 'user_123',
        phoneNumber: '+1 555 123-4567',
        name: 'John Doe',
        email: 'john.doe@example.com',
        isVerified: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        voicePreferences: {
          defaultCallerType: 'mom',
          voiceGender: 'female',
          accent: 'us',
          callDurationMinutes: 2,
          voiceSpeed: 1.0,
          voiceStability: 0.75,
        },
        callerIdSettings: {
          defaultContactName: 'Mom',
          defaultPhoneNumber: '(555) 123-4567',
          useRandomNumbers: false,
          showAsUnknown: false,
        },
        notificationPreferences: {
          callReminders: true,
          subscriptionUpdates: true,
          tipsAndTricks: false,
          pushNotifications: true,
          emailNotifications: false,
        },
      };

      return {
        success: true,
        data: userProfile,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: { message: 'Failed to load profile' },
      };
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<{ success: boolean; data?: User; error?: { message: string } }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.apiUrl}/api/user/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${accessToken}`,
      //   },
      //   body: JSON.stringify(data),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock success response
      const updatedUser: User = {
        id: 'user_123',
        phoneNumber: '+15551234567',
        name: data.name || 'John Doe',
        email: data.email,
        createdAt: new Date('2024-01-15'),
        verifiedAt: new Date('2024-01-15'),
        profileSettings: {
          voicePreferences: {
            preferredVoiceId: 'voice_123',
            preferredPersona: 'family_mom',
            voiceSpeed: 1.0,
            voiceStability: 0.75,
            voiceSimilarity: 0.8,
          },
          callerIdDefaults: {
            defaultCallerName: 'Mom',
            useRandomNumbers: false,
            emergencyContactName: 'Emergency Contact',
          },
          notifications: {
            smsNotifications: true,
            emailNotifications: false,
            pushNotifications: true,
            callReminders: true,
            subscriptionUpdates: true,
          },
          privacy: {
            shareUsageData: true,
            allowLocationTracking: false,
            emergencyLocationSharing: true,
            dataRetentionDays: 90,
            consentLevel: 'standard',
          },
        },
        subscriptionTier: 'free',
        callsRemaining: 3,
        isActive: true,
        updatedAt: new Date(),
      };

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: { message: 'Failed to update profile' },
      };
    }
  }

  // Update voice preferences
  async updateVoicePreferences(prefs: Partial<VoicePreferences>): Promise<{ success: boolean; error?: { message: string } }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      return { success: true };
    } catch (error) {
      console.error('Update voice preferences error:', error);
      return {
        success: false,
        error: { message: 'Failed to update voice preferences' },
      };
    }
  }

  // Update caller ID settings
  async updateCallerIdSettings(settings: Partial<CallerIdSettings>): Promise<{ success: boolean; error?: { message: string } }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      return { success: true };
    } catch (error) {
      console.error('Update caller ID settings error:', error);
      return {
        success: false,
        error: { message: 'Failed to update caller ID settings' },
      };
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<{ success: boolean; error?: { message: string } }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 600));

      return { success: true };
    } catch (error) {
      console.error('Update notification preferences error:', error);
      return {
        success: false,
        error: { message: 'Failed to update notification preferences' },
      };
    }
  }

  // Delete user account
  async deleteAccount(request: DeleteAccountRequest): Promise<{ success: boolean; error?: { message: string } }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Validate phone number confirmation
      if (request.confirmPhoneNumber !== '+15551234567') {
        return {
          success: false,
          error: { message: 'Phone number confirmation does not match' },
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        error: { message: 'Failed to delete account' },
      };
    }
  }

  // Preview voice with current settings
  async previewVoice(preferences: VoicePreferences): Promise<{ success: boolean; audioUrl?: string; error?: { message: string } }> {
    try {
      // TODO: Replace with actual voice generation API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock audio URL
      const audioUrl = 'https://example.com/voice-preview.mp3';

      return {
        success: true,
        audioUrl,
      };
    } catch (error) {
      console.error('Voice preview error:', error);
      return {
        success: false,
        error: { message: 'Failed to generate voice preview' },
      };
    }
  }

  // Get usage statistics
  async getUsageStats(): Promise<{
    success: boolean;
    data?: {
      totalCalls: number;
      callsThisMonth: number;
      averageCallDuration: number;
      favoriteScenarios: string[];
    };
    error?: { message: string };
  }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 400));

      return {
        success: true,
        data: {
          totalCalls: 47,
          callsThisMonth: 3,
          averageCallDuration: 125, // seconds
          favoriteScenarios: ['Emergency - Family Issue', 'Work Call - Boss Needs You'],
        },
      };
    } catch (error) {
      console.error('Get usage stats error:', error);
      return {
        success: false,
        error: { message: 'Failed to load usage statistics' },
      };
    }
  }

  // Export user data
  async exportData(): Promise<{ success: boolean; downloadUrl?: string; error?: { message: string } }> {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        success: true,
        downloadUrl: 'https://example.com/user-data-export.zip',
      };
    } catch (error) {
      console.error('Export data error:', error);
      return {
        success: false,
        error: { message: 'Failed to export user data' },
      };
    }
  }
}

export const userService = new UserService();
export default userService;