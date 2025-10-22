# Voice Generator Agent

The specialized AI agent responsible for creating realistic, contextually appropriate voice content for BailOut calls using advanced voice synthesis technology.

## Overview

The Voice Generator Agent transforms scenario scripts into natural-sounding audio that helps users gracefully exit uncomfortable social situations. It manages voice personas, adapts content for different contexts, and ensures high-quality audio delivery through integration with ElevenLabs and PlayHT APIs.

## Key Features

### 🎭 **Persona-Driven Voice Generation**
- Extensive library of caller personas (mom, boss, friend, doctor, etc.)
- Consistent voice characteristics and speech patterns
- Context-aware persona selection
- Emotional tone adaptation based on scenario urgency

### 🔊 **Advanced Voice Synthesis**
- Integration with ElevenLabs and PlayHT APIs
- High-quality audio generation with natural speech patterns
- Real-time voice parameter optimization
- Multiple quality tiers based on subscription level

### 📝 **Intelligent Script Processing**
- Natural language adaptation for spoken delivery
- Context-specific personalization and customization
- Automatic script optimization for target duration
- Speech pattern enhancement for believability

### ⚡ **Performance Optimization**
- Multi-level caching for faster delivery
- Parallel processing for concurrent requests
- Predictive pre-generation of common scenarios
- Intelligent fallback mechanisms for service failures

## How It Works

### 1. Voice Request Reception
The agent receives structured requests from the Call Orchestrator:
```json
{
  "requestId": "uuid",
  "userId": "uuid",
  "scenario": {
    "type": "emergency|professional|social|personal",
    "urgency": "high|medium|low"
  },
  "persona": {
    "role": "mom|boss|friend|doctor",
    "tone": "urgent|concerned|casual"
  },
  "context": {
    "userFirstName": "string",
    "timeOfDay": "morning|afternoon|evening",
    "customization": "object"
  },
  "script": {
    "baseTemplate": "string",
    "targetDuration": "30-90 seconds"
  }
}
```

### 2. Script Processing and Adaptation
Transforms scenario scripts into natural dialogue:
- **Personalization**: Inserts user's name and context-specific details
- **Natural Language Processing**: Adapts text for spoken delivery
- **Emotional Enhancement**: Adds appropriate tone and inflection markers
- **Duration Optimization**: Adjusts content length for target timing

### 3. Voice Persona Selection
Selects optimal voice characteristics:
- **Context Matching**: Aligns persona with scenario and urgency
- **Relationship Mapping**: Matches caller type to user context
- **Quality Tier**: Applies subscription-appropriate voice options
- **Consistency**: Maintains persona characteristics throughout

### 4. Synthesis Parameter Configuration
Optimizes voice generation settings:
- **Stability**: Controls voice consistency (0.7-0.95)
- **Similarity Boost**: Enhances clarity and articulation (0.75-0.85)
- **Style**: Adjusts emotional engagement (0.3-0.7)
- **Speed**: Modifies speaking pace (0.9-1.1)

### 5. Audio Generation and Validation
Creates and verifies voice content:
- **Primary Synthesis**: Uses ElevenLabs API for high-quality generation
- **Quality Validation**: Checks clarity, naturalness, and duration
- **Fallback Processing**: Uses PlayHT or pre-recorded clips if needed
- **Cache Storage**: Stores results for future use

### 6. Delivery and Monitoring
Provides audio content to calling system:
- **CDN Upload**: Fast global delivery through content distribution
- **Metadata Tracking**: Performance metrics and quality scores
- **Error Reporting**: Detailed logging for optimization
- **User Feedback**: Integration with satisfaction monitoring

## Agent Invocation

### When This Agent Is Called

1. **Voice Generation Requests**
   - New bailout call requiring audio content
   - Custom scenario voice generation
   - Voice quality upgrades for premium users

2. **Cache Warming Operations**
   - Pre-generation of popular scenario variations
   - User-specific voice preferences preparation
   - System optimization during low-usage periods

3. **Quality Validation Tasks**
   - Audio quality assessment and verification
   - Voice characteristic consistency checking
   - Performance optimization analysis

### Input Requirements

- **Valid Voice Request**: Structured request from Call Orchestrator
- **User Context**: Name, preferences, subscription tier
- **Scenario Data**: Script template and contextual information
- **Quality Parameters**: Target duration and quality level

## Voice Persona Library

### Family Personas
- **Mom**: Warm, caring, slightly worried (Ages 40-55)
- **Dad**: Authoritative, practical, protective (Ages 45-60)
- **Sibling**: Casual, familiar, supportive (Ages 25-45)

### Professional Personas
- **Boss**: Authoritative, professional, urgent (Ages 35-50)
- **Colleague**: Professional but friendly, collaborative (Ages 30-45)
- **Client**: Professional, demanding, business-focused (Ages 35-55)

### Social Personas
- **Close Friend**: Casual, familiar, supportive (Ages 25-40)
- **Roommate**: Familiar, practical, shared responsibility (Ages 22-35)

### Service Personas
- **Doctor's Office**: Professional, caring, medically focused (Ages 35-55)
- **Babysitter**: Responsible, caring, child-focused (Ages 18-30)

## Configuration

### Voice Synthesis Settings
```json
{
  "primary_provider": "elevenlabs",
  "fallback_provider": "playht",
  "quality_tiers": {
    "free": "standard",
    "premium": "high",
    "enterprise": "premium"
  },
  "cache_strategy": "multi_level",
  "performance_targets": {
    "generation_time_ms": 8000,
    "quality_score": 7.5
  }
}
```

### Persona-Specific Parameters
```json
{
  "mom": {
    "voice_id": "EXAVITQu4vr4xnSDxMaL",
    "stability": 0.85,
    "similarity_boost": 0.80,
    "style": 0.60,
    "speed": 0.95
  },
  "boss": {
    "voice_id": "21m00Tcm4TlvDq8ikWAM",
    "stability": 0.95,
    "similarity_boost": 0.85,
    "style": 0.30,
    "speed": 1.05
  }
}
```

### Caching Configuration
```json
{
  "memory_cache": {
    "max_size_mb": 256,
    "ttl_seconds": 1800
  },
  "redis_cache": {
    "ttl_seconds": 86400,
    "compression": true
  },
  "cdn_cache": {
    "ttl_seconds": 604800,
    "global_distribution": true
  }
}
```

## Error Handling

### Common Failure Scenarios

1. **API Service Failures**
   - **Primary Provider Down**: Automatically switch to fallback provider
   - **Rate Limit Exceeded**: Queue requests and retry with backoff
   - **Invalid Parameters**: Adjust settings and retry generation

2. **Quality Issues**
   - **Poor Audio Quality**: Retry with adjusted synthesis parameters
   - **Duration Mismatch**: Modify script length and regenerate
   - **Persona Inconsistency**: Validate and correct voice characteristics

3. **Content Problems**
   - **Script Too Long**: Automatically truncate and optimize
   - **Pronunciation Errors**: Apply phonetic corrections
   - **Context Mismatch**: Adapt script for better scenario fit

### Fallback Mechanisms
- **Pre-recorded Clips**: High-quality backup audio for emergencies
- **Alternative Providers**: Seamless switching between voice APIs
- **Quality Degradation**: Lower quality vs. complete failure
- **Cache Utilization**: Use similar cached content when appropriate

## Performance Monitoring

### Key Performance Indicators
- **Generation Speed**: Average time from request to delivery
- **Quality Scores**: Automated and user-feedback quality ratings
- **Success Rate**: Percentage of successful voice generations
- **Cache Efficiency**: Hit rates for different caching levels

### Real-time Metrics
- **Active Requests**: Current voice generation queue length
- **API Health**: Status of ElevenLabs and PlayHT services
- **Error Rates**: Failure rates by type and cause
- **Resource Usage**: Memory, CPU, and bandwidth utilization

### Quality Assurance Metrics
- **Clarity Score**: Audio intelligibility rating (1-10)
- **Naturalness Score**: Human-like speech quality (1-10)
- **Emotion Accuracy**: Appropriateness of emotional tone (1-10)
- **Duration Accuracy**: Adherence to target timing (±15%)

## Integration Points

### Upstream Dependencies
- **Call Orchestrator**: Voice generation requests and context
- **User Service**: User preferences and personalization data
- **Subscription Service**: Quality tier and feature access
- **Scenario Service**: Script templates and content library

### Downstream Dependencies
- **ElevenLabs API**: Primary voice synthesis service
- **PlayHT API**: Fallback voice synthesis service
- **Audio Storage**: Cloud storage for generated files
- **CDN Service**: Fast global content delivery

### API Interface
```typescript
interface VoiceGenerationRequest {
  requestId: string;
  userId: string;
  scenario: ScenarioData;
  persona: PersonaConfig;
  context: UserContext;
  script: ScriptTemplate;
  qualityTier: 'free' | 'premium' | 'enterprise';
}

interface VoiceGenerationResponse {
  audioUrl: string;
  duration: number;
  qualityScore: number;
  personaUsed: string;
  cacheHit: boolean;
  generationTime: number;
  metadata: AudioMetadata;
}
```

## Security and Privacy

### Data Protection
- **Encryption**: All audio files encrypted in transit and at rest
- **Access Control**: User-specific content access validation
- **Data Retention**: Automatic cleanup based on retention policies
- **Privacy Compliance**: GDPR and CCPA adherence

### API Security
- **Authentication**: Secure API key management and rotation
- **Rate Limiting**: Prevent abuse and excessive usage
- **Request Validation**: Input sanitization and validation
- **Audit Logging**: Comprehensive request and response tracking

## Development Guidelines

### Code Structure
```
voice-generator/
├── agent.md              # Agent documentation
├── config.json           # Configuration settings
├── prompts/
│   ├── system.md         # System prompt
│   └── voice-profiles.md # Voice persona library
└── README.md             # This file
```

### Testing Strategy
- **Unit Tests**: Individual component functionality
- **Integration Tests**: API provider connectivity and responses
- **Quality Tests**: Audio output validation and scoring
- **Performance Tests**: Load testing and optimization validation

### Quality Assurance
- **Automated Testing**: Continuous quality validation
- **A/B Testing**: Persona and parameter optimization
- **User Feedback**: Satisfaction monitoring and improvement
- **Performance Benchmarking**: Regular optimization assessment

## Future Enhancements

### Planned Features
1. **Voice Cloning**: Custom voices based on user-provided samples
2. **Real-time Synthesis**: Live voice generation during calls
3. **Multi-language Support**: International language and accent support
4. **Emotional AI**: Advanced emotion detection and synthesis

### Advanced Capabilities
1. **Conversation AI**: Dynamic script generation based on real-time context
2. **Personality Modeling**: Consistent persona characteristics across calls
3. **Adaptive Learning**: Improve synthesis based on user feedback patterns
4. **Edge Computing**: Distributed synthesis for reduced latency

### Quality Improvements
1. **Neural Voice Models**: Latest AI voice synthesis technology
2. **Post-processing Enhancement**: Audio quality improvement algorithms
3. **Predictive Generation**: AI-powered pre-generation of likely content
4. **Custom Training**: User-specific voice model fine-tuning

## Support and Troubleshooting

### Common Issues
1. **Slow Generation**: Check API status and cache configuration
2. **Poor Quality**: Review synthesis parameters and quality settings
3. **Cache Misses**: Analyze cache hit rates and warming strategies
4. **API Errors**: Monitor provider status and implement fallbacks

### Debug Mode
Enable detailed logging for troubleshooting:
```json
{
  "debug_mode": true,
  "log_level": "debug",
  "trace_requests": true,
  "quality_analysis": true
}
```

### Performance Optimization
- **Cache Tuning**: Optimize cache sizes and TTL values
- **Parameter Adjustment**: Fine-tune synthesis settings for quality/speed balance
- **Provider Selection**: Choose optimal voice synthesis provider
- **Resource Allocation**: Adjust memory and processing resources

### Contact Information
- **Technical Issues**: voice-tech@bailout.app
- **Quality Problems**: voice-quality@bailout.app
- **Performance Issues**: voice-performance@bailout.app