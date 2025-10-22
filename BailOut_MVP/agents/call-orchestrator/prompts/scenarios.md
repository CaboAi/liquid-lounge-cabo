# BailOut Scenarios Library

A comprehensive collection of bailout scenarios organized by category, urgency level, and subscription tier. Each scenario includes context triggers, caller personas, and script frameworks.

## Emergency Scenarios (High Urgency)

### Medical Emergency
**Trigger Context**: Immediate escape needed, high stress situation
**Caller Persona**: Family member, close friend, or healthcare provider
**Subscription Tier**: All tiers
**Estimated Duration**: 30-45 seconds

**Script Framework**:
```
"Hi [USER_NAME], I'm sorry to interrupt but I need you right away.
[FAMILY_MEMBER] is at the hospital and they're asking for you specifically.
Can you come as soon as possible? I know you're busy but this is really urgent."
```

**Customization Variables**:
- Family member name (spouse, parent, sibling)
- Hospital name (if location known)
- Severity level (urgent vs critical)
- Transportation offer (I can pick you up)

### Family Crisis
**Trigger Context**: Social situation requiring immediate exit
**Caller Persona**: Parent, spouse, or close relative
**Subscription Tier**: All tiers
**Estimated Duration**: 45-60 seconds

**Script Framework**:
```
"[USER_NAME], I really hate to call you but we have a situation at home.
[SPECIFIC_ISSUE] and I need you here right now. I know you're in the middle
of something but this can't wait. How quickly can you get home?"
```

**Issue Variations**:
- Plumbing emergency (water everywhere)
- Security system triggered
- Pet emergency (injured or escaped)
- Childcare emergency (babysitter canceled)

### Work Emergency
**Trigger Context**: Professional settings, urgent business matter
**Caller Persona**: Boss, colleague, or client
**Subscription Tier**: Premium and Enterprise
**Estimated Duration**: 60-90 seconds

**Script Framework**:
```
"[USER_NAME], I'm really sorry to interrupt your [TIME_CONTEXT] but we have
a critical situation with [CLIENT/PROJECT]. The [SPECIFIC_ISSUE] and they're
specifically asking for you. Can you get back to the office/join a call immediately?"
```

## Professional Scenarios (Medium Urgency)

### Boss Summons
**Trigger Context**: Work hours, office environment
**Caller Persona**: Direct supervisor or senior executive
**Subscription Tier**: All tiers
**Estimated Duration**: 45-60 seconds

**Script Framework**:
```
"Hi [USER_NAME], sorry to track you down. We've got an urgent client meeting
that just came up and I need you here ASAP. The [CLIENT_NAME] situation has
escalated and you're the only one who knows the details. How soon can you be here?"
```

### Client Emergency
**Trigger Context**: Any time, professional urgency
**Caller Persona**: Important client or colleague
**Subscription Tier**: Premium and Enterprise
**Estimated Duration**: 60-75 seconds

**Script Framework**:
```
"[USER_NAME], this is [CALLER_NAME] from [COMPANY]. We've got a major issue
with [PROJECT/SERVICE] and it's affecting our operations. I know it's [TIME_CONTEXT]
but can you help us resolve this? We really need your expertise right now."
```

### Meeting Reschedule
**Trigger Context**: Social or professional commitment conflict
**Caller Persona**: Assistant or colleague
**Subscription Tier**: All tiers
**Estimated Duration**: 30-45 seconds

**Script Framework**:
```
"Hi [USER_NAME], I'm calling about your [TIME] meeting with [PERSON/COMPANY].
They've had to move it up to right now due to a scheduling conflict.
Can you make it over here? They're waiting for you."
```

## Social Scenarios (Low-Medium Urgency)

### Friend in Need
**Trigger Context**: Social gatherings, casual events
**Caller Persona**: Close friend or family member
**Subscription Tier**: All tiers
**Estimated Duration**: 45-60 seconds

**Script Framework**:
```
"Hey [USER_NAME], I really hate to bother you but I'm in a bit of a situation
and could really use your help. My [CAR/SITUATION] and I'm kind of stranded.
Could you possibly come help me out? I know you're busy but I'm a bit stuck."
```

### Transportation Issue
**Trigger Context**: Evening events, social situations
**Caller Persona**: Family member or friend
**Subscription Tier**: All tiers
**Estimated Duration**: 30-45 seconds

**Script Framework**:
```
"[USER_NAME], my car just broke down and I'm supposed to pick up [FAMILY_MEMBER]
from [LOCATION] in 20 minutes. Could you possibly leave where you are and help me?
I'm really sorry to ask but I don't have anyone else to call."
```

### Babysitter Emergency
**Trigger Context**: Evening social events, parents
**Caller Persona**: Babysitter or childcare provider
**Subscription Tier**: Premium and Enterprise
**Estimated Duration**: 45-60 seconds

**Script Framework**:
```
"Hi [USER_NAME], this is [BABYSITTER_NAME]. I'm so sorry to call but [CHILD_NAME]
is running a fever and seems pretty uncomfortable. I think you should come home
and check on them. They're asking for you specifically."
```

## Personal Scenarios (Low Urgency)

### Not Feeling Well
**Trigger Context**: Social events, gradual exit strategy
**Caller Persona**: Family member or close friend
**Subscription Tier**: All tiers
**Estimated Duration**: 30-45 seconds

**Script Framework**:
```
"Hi [USER_NAME], I know you're out but I'm getting worried about you.
You mentioned you weren't feeling great earlier. Maybe you should come home
and rest? I can come pick you up if you need a ride."
```

### Early Morning Commitment
**Trigger Context**: Late evening events
**Caller Persona**: Family member or friend
**Subscription Tier**: All tiers
**Estimated Duration**: 30-40 seconds

**Script Framework**:
```
"Hey [USER_NAME], just wanted to remind you about your early [COMMITMENT] tomorrow.
You mentioned wanting to get home at a reasonable time to be ready.
Should I expect you soon?"
```

### Pet Emergency (Minor)
**Trigger Context**: Animal lovers, social events
**Caller Persona**: Family member or pet sitter
**Subscription Tier**: Premium and Enterprise
**Estimated Duration**: 45-60 seconds

**Script Framework**:
```
"[USER_NAME], I don't want to alarm you but [PET_NAME] seems a bit off tonight.
Nothing serious but they're not eating and seem uncomfortable.
You know them best - could you come check on them?"
```

## Custom Scenarios (Enterprise Tier)

### Personalized Crisis
**Trigger Context**: User-defined situations
**Caller Persona**: User-selected relationship
**Subscription Tier**: Enterprise only
**Estimated Duration**: Variable

**Framework Template**:
```
"[USER_NAME], [CUSTOM_OPENING]. [SPECIFIC_SITUATION_DESCRIPTION].
[URGENCY_EXPLANATION] and [ACTION_REQUEST]. [CLOSING_STATEMENT]."
```

**Customization Options**:
- Caller name and relationship
- Specific situation details
- Urgency level and language
- Personal details and context
- Duration and complexity

## Scenario Selection Algorithm

### Context Factors
1. **Time of Day**
   - 9 AM - 5 PM: Professional scenarios preferred
   - 6 PM - 10 PM: Social/family scenarios
   - 10 PM - 9 AM: Emergency scenarios only

2. **Location Type**
   - Office/workplace: Professional scenarios
   - Restaurant/bar: Social scenarios
   - Home: Personal/family scenarios
   - Unknown: Generic scenarios

3. **User History**
   - Recent scenario usage (avoid repetition)
   - Success rate by scenario type
   - User feedback and ratings

4. **Subscription Tier**
   - Free: Basic scenarios with limited customization
   - Premium: Full library with voice options
   - Enterprise: Custom scenarios with AI personalization

### Selection Priority Matrix

| Context | Emergency | Professional | Social | Personal |
|---------|-----------|--------------|--------|----------|
| Work Hours + Office | 0.2 | 0.8 | 0.1 | 0.1 |
| Work Hours + Social | 0.3 | 0.4 | 0.6 | 0.2 |
| Evening + Social | 0.2 | 0.1 | 0.8 | 0.3 |
| Evening + Home | 0.3 | 0.1 | 0.4 | 0.7 |
| Late Night | 0.9 | 0.1 | 0.2 | 0.3 |

## Voice Persona Mapping

### Emergency Scenarios
- **Medical**: Concerned family member, healthcare worker
- **Family**: Worried parent, anxious spouse
- **Work**: Stressed colleague, urgent supervisor

### Professional Scenarios
- **Boss**: Authoritative but respectful supervisor
- **Client**: Important business contact, concerned customer
- **Colleague**: Professional peer, project teammate

### Social Scenarios
- **Friend**: Casual buddy, close companion
- **Family**: Caring relative, supportive family member
- **Service**: Babysitter, pet sitter, service provider

### Personal Scenarios
- **Family**: Loving family member, caring friend
- **Healthcare**: Doctor's office, appointment reminder
- **Service**: Delivery person, appointment confirmation

## Localization and Cultural Adaptation

### Regional Variations
- **Business Culture**: Adapt formality levels by region
- **Family Dynamics**: Adjust family scenarios by cultural norms
- **Emergency Response**: Align with local emergency protocols
- **Language Patterns**: Use region-appropriate speech patterns

### Holiday and Event Awareness
- **Business Holidays**: Adjust professional scenario likelihood
- **Cultural Events**: Incorporate relevant cultural context
- **Seasonal Factors**: Weather-related emergencies by season
- **Local Events**: Factor in known local events or situations

## Performance Metrics

### Scenario Effectiveness
- **Believability Score**: User feedback on realism (1-10)
- **Success Rate**: Percentage of successful exits
- **User Satisfaction**: Post-call experience rating
- **Repeat Usage**: Frequency of scenario reuse

### Optimization Targets
- **Response Time**: < 2 seconds for scenario selection
- **Context Accuracy**: > 95% appropriate scenario matching
- **User Satisfaction**: > 4.5/5 average rating
- **Scenario Diversity**: Prevent overuse of any single scenario

## Continuous Improvement

### Learning Mechanisms
- **User Feedback Integration**: Incorporate ratings and comments
- **Success Pattern Analysis**: Identify most effective scenarios
- **Context Learning**: Improve context-scenario matching
- **Personalization Enhancement**: Adapt to individual user patterns

### A/B Testing Framework
- **Scenario Variants**: Test different versions of popular scenarios
- **Persona Selection**: Optimize voice persona assignments
- **Timing Variations**: Test different urgency levels
- **Customization Impact**: Measure value of personalization features