# Scenario Writer Agent

## Purpose
Creates dynamic, contextual bailout scenarios based on user situation, preferences, and historical patterns. This agent specializes in crafting believable, urgent scenarios that provide perfect cover for users needing to exit social situations.

## Responsibilities

### Primary Functions
- **Dynamic Scenario Generation**: Creates personalized bailout scenarios based on user context and preferences
- **Context Adaptation**: Tailors scenarios to match current time, location, and social situation
- **Urgency Calibration**: Adjusts scenario urgency level to match user's bailout needs
- **Persona Matching**: Selects appropriate caller persona (family, work, friend) for maximum believability
- **Cultural Sensitivity**: Adapts scenarios for cultural context and local customs
- **Template Management**: Maintains and updates library of proven scenario templates

### Key Capabilities
- **Real-Time Personalization**: Adapts scenarios based on user's immediate context
- **Believability Optimization**: Ensures scenarios match user's actual life circumstances
- **Emotional Intelligence**: Crafts scenarios with appropriate emotional tone and urgency
- **Multi-Language Support**: Generates scenarios in user's preferred language
- **A/B Testing Integration**: Tests scenario effectiveness and optimizes based on results
- **Learning from Feedback**: Improves scenario quality based on user satisfaction scores

## Integration Points

### Input Sources
- User profile data from user-profiler agent
- Current context (time, location, calendar) from mobile app
- Bailout type classification from call-orchestrator agent
- Historical scenario performance data
- User feedback and rating data

### Output Destinations
- Generated scenarios to call-orchestrator agent
- Persona recommendations to voice-generator agent
- Performance metrics to analytics system
- Template updates to scenario library

## Performance Targets
- **Response Time**: < 3 seconds for new scenario generation
- **Template Retrieval**: < 1 second for existing scenarios
- **Success Rate**: > 95% user satisfaction with scenario believability
- **Personalization Accuracy**: > 90% context-appropriate scenarios

## Scenario Categories

### 1. Emergency Scenarios (High Urgency)
- **Medical**: Family member hurt, pet emergency, medical appointment
- **Safety**: Car trouble, unsafe situation, security concern
- **Crisis**: Home emergency, water leak, fire alarm, break-in

### 2. Professional Scenarios (Medium-High Urgency)
- **Work**: Boss needs you immediately, client emergency, system down
- **Client**: Important meeting moved up, presentation crisis, deadline emergency
- **Business**: Office emergency, equipment failure, important call

### 3. Family Scenarios (Medium Urgency)
- **Care**: Elderly parent needs help, child sick at school, family emergency
- **Support**: Sibling needs pickup, spouse locked out, pet issues
- **Obligation**: Forgotten appointment, family dinner, unexpected visitor

### 4. Social Scenarios (Low-Medium Urgency)
- **Friend**: Best friend needs support, roommate locked out, social emergency
- **Personal**: Headache/feeling sick, early morning commitment, prior engagement
- **Transportation**: Ride cancellation, car trouble, transit issues

### 5. Service Scenarios (Variable Urgency)
- **Professional**: Doctor calling with results, lawyer needs to speak, urgent appointment
- **Utility**: Maintenance emergency, delivery issue, service interruption
- **Financial**: Bank security call, payment issue, account problem

## Personalization Framework

### User Context Analysis
```typescript
interface UserContext {
  currentLocation: string;
  timeOfDay: string;
  dayOfWeek: string;
  socialSetting: 'work' | 'social' | 'family' | 'public' | 'private';
  companionTypes: string[];
  recentScenarios: ScenarioHistory[];
  preferredPersonas: string[];
  culturalContext: string;
  languagePreference: string;
}
```

### Scenario Template Structure
```typescript
interface ScenarioTemplate {
  id: string;
  category: ScenarioCategory;
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
  callerPersona: PersonaType;
  baseScript: string;
  variables: TemplateVariable[];
  contextRequirements: ContextRequirement[];
  successRate: number;
  lastUsed: Date;
  userSatisfactionScore: number;
}
```

### Dynamic Variables
- `{userName}` - User's first name
- `{familyMember}` - Appropriate family member name
- `{petName}` - User's pet name if available
- `{workPlace}` - User's workplace name
- `{timeContext}` - Time-appropriate urgency
- `{locationContext}` - Location-specific details

## Scenario Quality Metrics

### Believability Factors
1. **Contextual Accuracy**: Scenario matches user's actual life circumstances
2. **Timing Appropriateness**: Urgency level matches time and setting
3. **Persona Consistency**: Caller persona is believable for the scenario
4. **Cultural Sensitivity**: Scenario respects cultural norms and expectations
5. **Emotional Authenticity**: Emotional tone feels genuine and appropriate

### Success Metrics
- User satisfaction rating (1-5 stars)
- Scenario completion rate
- Time to call answer
- Believability score from observers
- Repeat usage patterns

## Template Library Management

### Template Categories
- **Proven Templates**: High-success scenarios with 4.5+ star ratings
- **Experimental Templates**: New scenarios being A/B tested
- **Seasonal Templates**: Time-sensitive scenarios (holidays, events)
- **Cultural Templates**: Region-specific scenarios
- **Emergency Templates**: High-priority, always-available scenarios

### Template Optimization
- Regular performance review and ranking
- User feedback integration
- Cultural adaptation for different regions
- Seasonal updates and refresh cycles
- A/B testing for new template variations

## Error Handling and Fallbacks

### Scenario Generation Failures
1. **Context Insufficient**: Use general template appropriate for time/setting
2. **Template Unavailable**: Fall back to most successful scenario for user type
3. **Personalization Failed**: Use generic but proven scenario template
4. **Cultural Mismatch**: Default to universal scenarios (medical, family)

### Quality Assurance Checks
- Scenario appropriateness validation
- Cultural sensitivity review
- Urgency level verification
- Persona-scenario compatibility check
- Language and tone consistency

## Learning and Adaptation

### Feedback Integration
- Post-call user satisfaction surveys
- Scenario effectiveness tracking
- Observer believability assessments
- Long-term user preference learning

### Continuous Improvement
- Monthly template performance reviews
- Seasonal scenario library updates
- Cultural adaptation based on user demographics
- Success rate optimization through machine learning

## Configuration Parameters

### Creativity Settings
- `temperature`: 0.9 for creative scenario generation
- `diversity_factor`: 0.7 for balanced creativity vs. reliability
- `personalization_weight`: 0.8 for high personalization

### Quality Thresholds
- `minimum_believability_score`: 4.0/5.0
- `context_accuracy_threshold`: 0.85
- `cultural_sensitivity_check`: true
- `offensive_content_filter`: strict

### Performance Tuning
- `max_generation_time`: 3000ms
- `template_cache_size`: 1000 scenarios
- `user_preference_retention`: 90 days
- `feedback_integration_delay`: 24 hours