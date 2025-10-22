# Trigger Keywords and Safe Words Library

A comprehensive collection of keywords, phrases, and safe words used by the Trigger Detector Agent to identify and validate bailout requests across different communication channels and urgency levels.

## Emergency Keywords (High Urgency)

### Primary Emergency Phrases
**Confidence Boost**: +0.3 | **Urgency Level**: Critical | **Bypass Rate Limits**: Yes

#### Direct Emergency Calls
- **"bailout now"** - Immediate extraction request
- **"emergency exit"** - Urgent situation requiring immediate help
- **"SOS bailout"** - Critical distress signal
- **"help me out now"** - Direct plea for immediate assistance
- **"emergency call needed"** - Urgent communication requirement
- **"urgent bailout"** - Time-sensitive extraction request

#### Crisis Indicators
- **"get me out"** - Direct extraction request
- **"need rescue"** - Help-seeking behavior
- **"trapped here"** - Indication of inability to leave
- **"can't leave"** - Constraint acknowledgment
- **"unsafe situation"** - Direct safety concern
- **"feeling threatened"** - Personal safety at risk

#### Panic Signals
- **"help immediately"** - Urgent assistance request
- **"emergency help"** - Crisis assistance needed
- **"rescue me"** - Direct rescue request
- **"urgent assistance"** - Time-critical help needed
- **"immediate extraction"** - Professional-style emergency request

### Secondary Emergency Indicators
**Confidence Boost**: +0.2 | **Urgency Level**: High | **Context Dependent**: Yes

#### Stress Signals
- **"really uncomfortable"** - Significant discomfort indication
- **"need to leave now"** - Urgent departure requirement
- **"this is bad"** - Negative situation assessment
- **"getting worse"** - Escalating situation
- **"can't handle this"** - Overwhelm indication
- **"need backup"** - Support request

#### Safety Concerns
- **"don't feel safe"** - Personal safety concern
- **"bad situation"** - Negative context assessment
- **"need help fast"** - Urgent assistance request
- **"getting scared"** - Fear indication
- **"uncomfortable here"** - Location-based discomfort

## Professional Keywords (Medium-High Urgency)

### Work Emergency Phrases
**Confidence Boost**: +0.2 | **Context**: Business hours + work location

#### Client Crises
- **"client emergency"** - Business relationship crisis
- **"customer crisis"** - Service emergency situation
- **"urgent meeting"** - Time-critical business requirement
- **"boss calling"** - Authority figure summoning
- **"work crisis"** - Professional emergency
- **"business urgent"** - Commercial priority situation

#### Deadline Pressures
- **"deadline crisis"** - Time-sensitive work pressure
- **"project emergency"** - Task-related crisis
- **"urgent deadline"** - Time-critical deliverable
- **"client demanding"** - External pressure situation
- **"work emergency"** - Professional crisis
- **"office crisis"** - Workplace emergency

#### Professional Obligations
- **"important call"** - High-priority communication
- **"urgent conference"** - Critical business meeting
- **"client needs me"** - Professional responsibility
- **"work summons"** - Professional obligation
- **"business emergency"** - Commercial crisis

### Meeting and Conference Triggers
**Context**: Business hours | **Confidence Boost**: +0.15

- **"emergency meeting"** - Urgent business gathering
- **"urgent conference"** - Critical business discussion
- **"board meeting now"** - Executive-level urgency
- **"client calling"** - Important business contact
- **"supervisor needs me"** - Management request

## Social Keywords (Medium Urgency)

### Casual Exit Phrases
**Confidence Boost**: +0.1 | **Context**: Social settings

#### Friend and Family Assistance
- **"save me"** - Casual rescue request
- **"rescue call"** - Friendly assistance request
- **"phone excuse"** - Explanation-seeking behavior
- **"bail me out"** - Casual extraction request
- **"help escape"** - Friendly departure assistance
- **"need exit"** - Departure requirement
- **"call me out"** - Communication-based exit strategy

#### Social Discomfort
- **"awkward situation"** - Social discomfort indication
- **"uncomfortable conversation"** - Dialogue-related discomfort
- **"need excuse"** - Justification requirement
- **"social rescue"** - Group setting assistance
- **"party escape"** - Event departure assistance
- **"dinner rescue"** - Meal-related exit strategy

#### Transportation and Logistics
- **"ride emergency"** - Transportation crisis
- **"car trouble"** - Vehicle-related issue
- **"transportation issue"** - Movement problem
- **"need pickup"** - Transport assistance request
- **"stranded here"** - Mobility constraint
- **"ride needed"** - Transportation requirement

### Family Obligation Triggers
**Context**: Any time | **Relationship**: Family

- **"family emergency"** - Household crisis
- **"mom needs me"** - Maternal request
- **"dad calling"** - Paternal summons
- **"family obligation"** - Household responsibility
- **"home emergency"** - Domestic crisis
- **"sibling crisis"** - Family member emergency

## Personal Keywords (Low-Medium Urgency)

### Health and Wellness
**Confidence Boost**: +0.05 | **Context**: Health-related

#### Physical Discomfort
- **"not feeling well"** - Health concern indication
- **"feeling sick"** - Illness indication
- **"headache coming"** - Physical discomfort onset
- **"need rest"** - Recovery requirement
- **"exhausted"** - Fatigue indication
- **"under weather"** - Mild illness indication

#### Mental Health
- **"feeling overwhelmed"** - Mental stress indication
- **"need space"** - Personal boundary requirement
- **"too much stress"** - Stress level concern
- **"anxiety rising"** - Mental health concern
- **"need quiet"** - Environmental requirement

### Routine Obligations
**Context**: Personal schedules | **Urgency**: Low

- **"early morning"** - Schedule-based departure
- **"long day tomorrow"** - Preparation requirement
- **"prior commitment"** - Existing obligation
- **"promised someone"** - Personal commitment
- **"prior plans"** - Existing arrangements
- **"early start"** - Schedule consideration

## Custom User Keywords

### Personalized Safe Words
**User Configurable**: Yes | **Max Custom Phrases**: 10 | **Confidence Required**: 0.95

#### Code Word Categories
```json
{
  "emergency_codes": {
    "max_phrases": 3,
    "examples": ["red alert", "code red", "family crisis"],
    "urgency_level": "critical",
    "bypass_validation": true
  },
  "casual_codes": {
    "max_phrases": 5,
    "examples": ["pizza delivery", "dog walker", "appointment"],
    "urgency_level": "medium",
    "context_required": false
  },
  "professional_codes": {
    "max_phrases": 3,
    "examples": ["board meeting", "client call", "urgent deadline"],
    "urgency_level": "high",
    "business_hours_only": true
  }
}
```

### Relationship-Specific Phrases
**Context**: Caller persona matching

```json
{
  "family_codes": {
    "mom_phrases": ["mom emergency", "home situation", "family issue"],
    "dad_phrases": ["dad needs help", "car emergency", "house problem"],
    "sibling_phrases": ["brother crisis", "sister emergency", "family drama"]
  },
  "work_codes": {
    "boss_phrases": ["supervisor urgent", "management meeting", "client crisis"],
    "colleague_phrases": ["team emergency", "project crisis", "deadline issue"]
  },
  "friend_codes": {
    "casual_phrases": ["buddy rescue", "friend emergency", "social save"],
    "urgent_phrases": ["friend crisis", "party emergency", "social rescue"]
  }
}
```

## Keyword Processing Rules

### Confidence Scoring Algorithm
```python
def calculate_keyword_confidence(detected_phrase, context):
    base_confidence = phrase_library[detected_phrase].base_confidence

    # Apply confidence boosts
    confidence = base_confidence + phrase_library[detected_phrase].confidence_boost

    # Context modifiers
    if context.matches(phrase_library[detected_phrase].preferred_context):
        confidence += 0.1

    # User history modifiers
    if user_history.successful_with_phrase(detected_phrase):
        confidence += 0.05

    # Temporal modifiers
    if context.time_appropriate_for_phrase(detected_phrase):
        confidence += 0.05

    # Multiple keyword detection
    if multiple_keywords_detected():
        confidence += 0.1

    return min(confidence, 1.0)  # Cap at 1.0
```

### Multi-Language Support

#### Spanish Keywords
**Language Code**: es-ES | **Confidence Threshold**: 0.80

##### Emergency Phrases
- **"ayuda urgente"** - Urgent help
- **"emergencia ahora"** - Emergency now
- **"necesito salir"** - Need to leave
- **"situación peligrosa"** - Dangerous situation
- **"auxilio"** - Help/assistance

##### Professional Phrases
- **"crisis de trabajo"** - Work crisis
- **"reunión urgente"** - Urgent meeting
- **"cliente urgente"** - Urgent client
- **"jefe me llama"** - Boss is calling

##### Social Phrases
- **"rescátame"** - Rescue me
- **"situación incómoda"** - Uncomfortable situation
- **"necesito excusa"** - Need excuse

#### Phrase Pattern Matching

##### Contextual Variations
```regex
# Emergency patterns with flexibility
r"(bailout|rescue|help|save)\s+(me|us)\s+(now|immediately|urgent)"

# Professional urgency patterns
r"(client|boss|work|meeting)\s+(emergency|crisis|urgent|calling)"

# Social assistance patterns
r"(awkward|uncomfortable|trapped)\s+(situation|conversation|here)"

# Family obligation patterns
r"(family|mom|dad|home)\s+(emergency|crisis|needs|calling)"
```

##### Fuzzy Matching Rules
- **Typo Tolerance**: Up to 2 character differences for phrases >6 characters
- **Abbreviation Recognition**: "emerg" → "emergency", "urg" → "urgent"
- **Synonym Detection**: "help" ↔ "assist", "urgent" ↔ "immediate"
- **Context Clues**: Consider surrounding words for meaning clarification

## Voice Processing Enhancements

### Stress Pattern Detection
**Integration**: Voice analysis + keyword detection

#### Vocal Stress Indicators
- **Elevated Pitch**: +15% from baseline
- **Faster Speech Rate**: +20% from normal pace
- **Voice Trembling**: Frequency variation >5Hz
- **Breathing Pattern**: Irregular or rapid breathing
- **Volume Changes**: Sudden increases or whispers

#### Stress Level Scoring
```python
def calculate_voice_stress(audio_features):
    stress_score = 0.0

    if audio_features.pitch_elevation > 0.15:
        stress_score += 0.2

    if audio_features.speech_rate_increase > 0.20:
        stress_score += 0.2

    if audio_features.voice_trembling > 5:
        stress_score += 0.3

    if audio_features.breathing_irregular:
        stress_score += 0.15

    if audio_features.volume_inconsistent:
        stress_score += 0.15

    return min(stress_score, 1.0)
```

### Background Noise Analysis
**Purpose**: Context awareness and signal validation

#### Environmental Audio Cues
- **Crowd Noise**: Social setting indication
- **Traffic Sounds**: Transportation/street context
- **Music/Entertainment**: Social event context
- **Office Ambiance**: Professional setting
- **Domestic Sounds**: Home environment
- **Silence/Isolation**: Potential risk indicator

#### Noise Impact on Detection
```python
def adjust_confidence_for_noise(base_confidence, noise_analysis):
    if noise_analysis.type == "crowd_noise":
        # Social setting supports social keywords
        if keyword_type == "social":
            return base_confidence + 0.1

    elif noise_analysis.type == "office_ambiance":
        # Professional setting supports work keywords
        if keyword_type == "professional":
            return base_confidence + 0.1

    elif noise_analysis.level > 0.7:
        # High noise reduces confidence
        return base_confidence - 0.2

    return base_confidence
```

## Text Message Processing

### SMS Keyword Detection
**Channel**: Text messages | **Authentication**: Sender verification required

#### Message Context Analysis
```python
def analyze_text_message(message, sender, conversation_history):
    # Keyword detection
    keywords_found = detect_keywords(message.content)

    # Sender relationship analysis
    sender_relationship = contacts.get_relationship(sender)

    # Conversation context
    conversation_sentiment = analyze_sentiment(conversation_history)

    # Urgency indicators
    urgency_markers = detect_urgency_markers(message)

    return TriggerAnalysis(
        keywords=keywords_found,
        sender_trust=sender_relationship.trust_level,
        context_urgency=conversation_sentiment.urgency,
        time_sensitivity=urgency_markers.immediate
    )
```

#### Text-Specific Keywords
- **"SOS"** - Universal distress signal
- **"911"** - Emergency indicator (context dependent)
- **"HELP"** - All caps indicates urgency
- **Multiple exclamation marks** - Emotional intensity
- **Repeated messages** - Urgency indication
- **Time stamps** - "NOW", "ASAP", "URGENT"

### Social Media Integration
**Status**: Future enhancement | **Privacy**: Opt-in only

#### Potential Triggers
- Check-in locations with distress keywords
- Status updates indicating discomfort
- Tagged photos in concerning contexts
- Direct messages with trigger phrases
- Story posts with help requests

## Continuous Learning and Optimization

### Keyword Effectiveness Tracking
```json
{
  "keyword_performance": {
    "bailout_now": {
      "usage_count": 1247,
      "success_rate": 0.92,
      "false_positive_rate": 0.03,
      "user_satisfaction": 4.6
    },
    "emergency_exit": {
      "usage_count": 893,
      "success_rate": 0.89,
      "false_positive_rate": 0.05,
      "user_satisfaction": 4.4
    }
  }
}
```

### Adaptive Threshold Management
- **User-Specific Learning**: Adjust thresholds based on individual patterns
- **Temporal Adaptation**: Modify sensitivity based on time-of-day patterns
- **Context Optimization**: Improve accuracy based on location and situation
- **Feedback Integration**: Incorporate user satisfaction to refine detection

### Emerging Pattern Detection
- **New Phrase Recognition**: Identify commonly used but unrecognized phrases
- **Slang Evolution**: Adapt to changing language patterns
- **Cultural Variations**: Incorporate regional and cultural language differences
- **Generational Differences**: Account for age-related communication styles

This keyword library serves as the foundation for accurate trigger detection while maintaining the flexibility to adapt to individual user needs and evolving communication patterns. Regular updates and user feedback ensure the system remains effective and relevant for all BailOut users.