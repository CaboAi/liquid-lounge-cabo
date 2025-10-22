# Scenario Personalization Engine

This guide details how to adapt scenarios to create highly personalized, believable bailout experiences for each user based on their profile, context, and historical patterns.

## Personalization Framework

### User Profile Data Sources

#### Core Profile Elements
```typescript
interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    preferredName: string;
    age: number;
    gender: string;
    relationship_status: string;
  };
  family: {
    spouse_name?: string;
    children: Child[];
    parents: Parent[];
    siblings: Sibling[];
    pets: Pet[];
  };
  professional: {
    job_title: string;
    company_name: string;
    industry: string;
    work_schedule: WorkSchedule;
    boss_name?: string;
    key_colleagues: string[];
  };
  social: {
    best_friend_name?: string;
    roommate_name?: string;
    close_friends: string[];
    social_style: 'introverted' | 'extroverted' | 'mixed';
  };
  preferences: {
    preferred_personas: PersonaType[];
    urgency_comfort_level: 1 | 2 | 3 | 4 | 5;
    communication_style: 'formal' | 'casual' | 'mixed';
    cultural_background: string;
    language_preference: string;
  };
  context: {
    current_location: string;
    home_address: string;
    work_address: string;
    timezone: string;
    local_culture: string;
  };
}
```

#### Historical Pattern Analysis
```typescript
interface UserHistory {
  successful_scenarios: ScenarioRecord[];
  failed_scenarios: ScenarioRecord[];
  preferred_timing: TimePattern[];
  persona_effectiveness: PersonaPerformance[];
  context_preferences: ContextPattern[];
  satisfaction_trends: SatisfactionMetric[];
}
```

## Dynamic Variable System

### Primary Variables
- `{userName}` - User's preferred name/nickname
- `{userFullName}` - Full formal name for professional contexts
- `{familyMember}` - Dynamically selected family member based on scenario
- `{spouseName}` - Spouse/partner name for relationship scenarios
- `{childName}` - Child's name for parenting scenarios
- `{petName}` - Pet name for pet emergency scenarios
- `{workPlace}` - Company name or workplace
- `{bossName}` - Manager/supervisor name
- `{bestFriend}` - Best friend's name for social scenarios
- `{doctorName}` - User's actual doctor name if available

### Contextual Variables
- `{timeContext}` - Time-appropriate urgency language
- `{locationContext}` - Location-specific scenario details
- `{weatherContext}` - Current weather-related elements
- `{trafficContext}` - Traffic/transportation considerations
- `{culturalContext}` - Culturally appropriate references
- `{seasonalContext}` - Seasonal/holiday appropriate elements

### Professional Variables
- `{jobTitle}` - User's actual job title
- `{projectName}` - Work project names from user data
- `{clientName}` - Important client names
- `{colleagueName}` - Colleague names for workplace scenarios
- `{meetingType}` - Appropriate meeting types for user's role
- `{systemName}` - Technical systems user works with

## Personalization Strategies

### 1. Relationship-Based Personalization

#### Family Dynamics
```javascript
// Select family member based on scenario type and user's family structure
function selectFamilyMember(scenarioType, userProfile) {
  switch(scenarioType) {
    case 'medical_emergency':
      return userProfile.family.parents.length > 0 ?
        userProfile.family.parents[0].name :
        userProfile.family.spouse_name || 'a family member';

    case 'childcare':
      return userProfile.family.children.length > 0 ?
        userProfile.family.children[0].name :
        null; // Skip if no children

    case 'elder_care':
      return userProfile.family.parents.find(p => p.age > 65)?.name ||
        'your grandmother';
  }
}
```

#### Professional Relationships
```javascript
// Adapt professional scenarios based on user's actual work context
function personalizeWorkScenario(scenario, userProfile) {
  return scenario
    .replace('{bossName}', userProfile.professional.boss_name || 'your manager')
    .replace('{companyName}', userProfile.professional.company_name)
    .replace('{jobTitle}', userProfile.professional.job_title)
    .replace('{industry}', userProfile.professional.industry);
}
```

### 2. Cultural Adaptation

#### Language and Communication Style
```javascript
const culturalAdaptations = {
  'hispanic': {
    family_emphasis: 'high',
    formality_level: 'medium',
    family_terms: ['mami', 'papi', 'abuela', 'hijo'],
    urgency_expressions: ['¡Necesito que vengas!', 'Es urgente']
  },
  'asian': {
    respect_hierarchy: 'high',
    family_duty: 'high',
    formality_level: 'high',
    elder_priority: 'critical'
  },
  'southern_us': {
    politeness_level: 'high',
    family_terms: ['honey', 'sweetie', 'darlin\''],
    communication_style: 'warm_formal'
  }
};
```

#### Time and Scheduling Cultural Norms
```javascript
function adaptTimingForCulture(scenario, culture, timeOfDay) {
  const culturalNorms = {
    'hispanic': {
      family_dinner_time: '20:00-22:00',
      siesta_consideration: '14:00-16:00',
      late_evening_calls_acceptable: true
    },
    'asian': {
      work_priority_hours: '09:00-18:00',
      family_respect_timing: 'evening_preferred',
      elder_care_priority: 'always'
    }
  };

  // Adapt scenario timing based on cultural expectations
}
```

### 3. Context-Aware Personalization

#### Location-Based Adaptation
```javascript
function addLocationContext(scenario, userLocation, userProfile) {
  const locationAdaptations = {
    'work': {
      appropriate_scenarios: ['professional', 'family_emergency', 'health'],
      persona_types: ['family', 'medical', 'authority'],
      urgency_required: 'medium_to_high'
    },
    'social_gathering': {
      appropriate_scenarios: ['family', 'emergency', 'health'],
      avoid_scenarios: ['work', 'professional'],
      politeness_level: 'high'
    },
    'home': {
      appropriate_scenarios: ['all'],
      formality_level: 'low',
      urgency_flexibility: 'high'
    }
  };
}
```

#### Time-Based Personalization
```javascript
function personalizeForTime(scenario, currentTime, userProfile) {
  const timeAdaptations = {
    'early_morning': {
      scenarios: ['medical_emergency', 'work_crisis', 'safety'],
      justification_required: 'high',
      urgency_level: 'must_be_critical'
    },
    'business_hours': {
      scenarios: ['family', 'medical', 'personal'],
      professional_interruption: 'acceptable',
      formality: 'medium'
    },
    'evening': {
      scenarios: ['family', 'social', 'emergency'],
      casual_tone: 'acceptable',
      urgency_flexibility: 'medium'
    },
    'late_night': {
      scenarios: ['emergency_only'],
      justification_required: 'critical',
      emergency_contacts_only: true
    }
  };
}
```

## Advanced Personalization Techniques

### 1. Historical Pattern Learning

#### Success Pattern Analysis
```javascript
function analyzeSuccessPatterns(userHistory) {
  return {
    most_effective_personas: userHistory.persona_effectiveness
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 3),

    optimal_timing: userHistory.preferred_timing
      .filter(t => t.success_rate > 0.8),

    context_preferences: userHistory.context_preferences
      .filter(c => c.user_satisfaction > 4.0)
  };
}
```

#### Scenario Evolution
```javascript
function evolveScenario(baseScenario, userHistory, currentContext) {
  // Adapt based on what has worked before
  const successfulElements = extractSuccessfulElements(userHistory);

  // Incorporate current context
  const contextualAdaptations = generateContextualAdaptations(currentContext);

  // Combine for personalized scenario
  return combineAdaptations(baseScenario, successfulElements, contextualAdaptations);
}
```

### 2. Emotional Intelligence Integration

#### Relationship Dynamic Modeling
```javascript
const relationshipDynamics = {
  'close_family': {
    communication_style: 'informal',
    emotional_expression: 'high',
    urgency_acceptance: 'immediate',
    formality_level: 'low'
  },
  'professional': {
    communication_style: 'formal',
    emotional_expression: 'controlled',
    urgency_justification: 'required',
    formality_level: 'high'
  },
  'casual_friend': {
    communication_style: 'casual',
    emotional_expression: 'medium',
    favor_asking: 'with_apology',
    reciprocity_expected: true
  }
};
```

#### Emotional Tone Calibration
```javascript
function calibrateEmotionalTone(scenario, relationship, urgencyLevel) {
  const toneModifications = {
    'family_emergency': {
      tone: 'concerned_but_controlled',
      emotion_words: ['worried', 'concerned', 'need help'],
      voice_characteristics: 'slightly_rushed, caring'
    },
    'professional_crisis': {
      tone: 'serious_professional',
      emotion_words: ['urgent', 'critical', 'immediate'],
      voice_characteristics: 'authoritative, time_pressured'
    }
  };
}
```

### 3. Quality Assurance for Personalization

#### Believability Validation
```javascript
function validateBelievability(personalizedScenario, userProfile) {
  const checks = {
    family_member_exists: checkFamilyMemberExists(scenario, userProfile),
    workplace_accuracy: validateWorkplaceDetails(scenario, userProfile),
    cultural_appropriateness: validateCulturalSensitivity(scenario, userProfile),
    timing_logic: validateTimingLogic(scenario, currentContext),
    relationship_consistency: validateRelationshipDynamics(scenario, userProfile)
  };

  return checks.every(check => check === true);
}
```

#### Personalization Quality Score
```javascript
function calculatePersonalizationScore(scenario, userProfile) {
  const scores = {
    name_accuracy: scenario.includes(userProfile.personal.preferredName) ? 20 : 0,
    context_relevance: calculateContextRelevance(scenario, userProfile) * 20,
    cultural_fit: calculateCulturalFit(scenario, userProfile) * 20,
    relationship_authenticity: calculateRelationshipAuth(scenario, userProfile) * 20,
    historical_alignment: calculateHistoricalAlignment(scenario, userProfile) * 20
  };

  return Object.values(scores).reduce((sum, score) => sum + score, 0);
}
```

## Implementation Guidelines

### Data Privacy and Security
- Only collect and use data necessary for personalization
- Encrypt all personal information in storage and transit
- Implement data retention policies (90 days for preference data)
- Allow users to opt out of personalization features
- Provide clear data usage transparency

### Fallback Strategies
- When personalization data is insufficient, use high-quality generic templates
- Maintain template library of non-personalized but effective scenarios
- Implement graceful degradation when personalization systems fail
- Always prioritize scenario quality over personalization completeness

### Testing and Optimization
- A/B test personalized vs. generic scenarios
- Track personalization effectiveness metrics
- Monitor user satisfaction scores for personalized scenarios
- Continuously refine personalization algorithms based on feedback
- Regular review of personalization accuracy and cultural sensitivity

### Performance Considerations
- Cache personalization data for frequently used elements
- Pre-compute common personalization variables
- Implement efficient lookup systems for user profile data
- Balance personalization depth with response time requirements
- Monitor system performance impact of personalization features

Remember: The goal of personalization is to create scenarios so believable and contextually appropriate that they feel like genuine, urgent situations that naturally require the user's immediate attention and departure.