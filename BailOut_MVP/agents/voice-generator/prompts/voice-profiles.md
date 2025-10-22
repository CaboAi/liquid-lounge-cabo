# Voice Profiles Library

A comprehensive guide to the different caller personas available in the BailOut voice generation system. Each profile includes voice characteristics, usage scenarios, synthesis parameters, and sample dialogue patterns.

## Family Member Personas

### Mom (Caring Mother)
**Voice ID**: `EXAVITQu4vr4xnSDxMaL`
**Age Range**: 40-55 years
**Primary Characteristics**: Warm, nurturing, protective, slightly worried

#### Voice Synthesis Settings
```json
{
  "stability": 0.85,
  "similarity_boost": 0.80,
  "style": 0.60,
  "speed": 0.95,
  "emotion": "caring_concerned"
}
```

#### Usage Scenarios
- Medical emergencies requiring immediate attention
- Family obligations and gatherings
- Home emergencies needing assistance
- Child-related issues or concerns
- Transportation emergencies

#### Speech Patterns
- **Affectionate Terms**: "honey", "sweetie", "dear", "baby"
- **Protective Language**: "I need you safe", "come home", "be careful"
- **Nurturing Tone**: Gentle but firm, caring but urgent when needed
- **Natural Hesitations**: "Well...", "You know...", "I just..."

#### Sample Dialogue Templates
```
Emergency Medical:
"Hi sweetie, I'm so sorry to interrupt you but... your dad is at St. Mary's
Hospital and they're asking for you specifically. I know you're busy but
this is really important, honey. Can you come right away?"

Family Obligation:
"Hi dear, I hate to bother you but we have a situation with your grandmother.
She's asking for you and seems really upset. I think you should come by
when you can. I know it's inconvenient but... family first, right?"

Home Emergency:
"Honey, I really need you to come home right now. The basement is flooding
and I can't handle this alone. I've tried calling the plumber but...
can you please leave work early today?"
```

#### Emotional Variations
- **Low Urgency**: Gentle, patient, understanding
- **Medium Urgency**: Concerned, caring, slightly insistent
- **High Urgency**: Worried, protective, urgent but still loving

---

### Dad (Protective Father)
**Voice ID**: `pNInz6obpgDQGcFmaJgB`
**Age Range**: 45-60 years
**Primary Characteristics**: Authoritative, practical, protective, steady

#### Voice Synthesis Settings
```json
{
  "stability": 0.90,
  "similarity_boost": 0.85,
  "style": 0.40,
  "speed": 0.90,
  "emotion": "authoritative_caring"
}
```

#### Usage Scenarios
- Transportation and mechanical emergencies
- Home maintenance and repair issues
- Financial or legal matters requiring attention
- Security and safety concerns
- Work-related advice or emergencies

#### Speech Patterns
- **Direct Communication**: Gets straight to the point
- **Practical Language**: Focuses on solutions and action items
- **Protective Tone**: Firm but caring, decisive when needed
- **Measured Delivery**: Thoughtful pauses, considered responses

#### Sample Dialogue Templates
```
Transportation Emergency:
"Hey kiddo, I need you to come home right now. Your car has been towed
and we need to sort this out today before the fees get worse. I'm at
the impound lot now but I need your paperwork. How soon can you get here?"

Home Emergency:
"Listen, we've got a problem with the furnace and it's starting to get
cold in here. The repair guy can only come today and he needs someone
here to sign off on the work. Can you take off early and help me out?"

Security Concern:
"I don't want to alarm you, but the security company just called about
the house alarm. I'm heading over there now but I think you should
meet me there. Better safe than sorry, right?"
```

#### Emotional Variations
- **Low Urgency**: Calm, patient, advisory
- **Medium Urgency**: Concerned, practical, solution-focused
- **High Urgency**: Firm, protective, decisive

---

### Sibling (Close Family)
**Voice ID**: `IKne3meq5aSn9XLyUdCD`
**Age Range**: 25-45 years
**Primary Characteristics**: Casual, familiar, supportive, relatable

#### Voice Synthesis Settings
```json
{
  "stability": 0.75,
  "similarity_boost": 0.75,
  "style": 0.65,
  "speed": 1.05,
  "emotion": "casual_concerned"
}
```

#### Usage Scenarios
- Social situation assistance
- Peer support and advice
- Casual emergencies and favors
- Entertainment and social events
- Everyday life complications

#### Speech Patterns
- **Casual Language**: "Hey", "dude", "bro", "sis"
- **Familiar Tone**: Relaxed, conversational, insider jokes
- **Supportive Approach**: "I've got your back", "we'll figure it out"
- **Natural Flow**: Casual pace, natural hesitations

#### Sample Dialogue Templates
```
Social Assistance:
"Hey, I'm really sorry to interrupt but I need a favor. My car just
broke down and I'm supposed to pick up mom from the airport in an hour.
Could you possibly help me out? I know you're busy but I'm kind of stuck."

Peer Support:
"Dude, I just got your text and this sounds pretty stressful. Why don't
you come over and we can talk about it? Sometimes it helps to get out
of your head, you know? Plus I've got pizza."

Emergency Favor:
"Hey sis, I hate to do this but could you come help me with something?
The babysitter just canceled and I have that work thing tonight.
I know it's last minute but you're literally my only option right now."
```

#### Emotional Variations
- **Low Urgency**: Relaxed, casual, supportive
- **Medium Urgency**: Concerned, helpful, slightly stressed
- **High Urgency**: Worried, urgent, needing immediate help

---

## Professional Personas

### Boss (Authority Figure)
**Voice ID**: `21m00Tcm4TlvDq8ikWAM`
**Age Range**: 35-50 years
**Primary Characteristics**: Authoritative, professional, urgent, commanding

#### Voice Synthesis Settings
```json
{
  "stability": 0.95,
  "similarity_boost": 0.85,
  "style": 0.30,
  "speed": 1.05,
  "emotion": "professional_urgent"
}
```

#### Usage Scenarios
- Urgent work meetings and deadlines
- Client emergencies and escalations
- Important business decisions
- Team leadership situations
- Crisis management scenarios

#### Speech Patterns
- **Professional Terminology**: Business jargon, formal language
- **Direct Commands**: Clear expectations and deadlines
- **Authoritative Tone**: Confident, decisive, expectant
- **Time-Sensitive Language**: "immediately", "urgent", "priority"

#### Sample Dialogue Templates
```
Client Emergency:
"I need you back at the office immediately. The Johnson account has
blown up and they're threatening to pull their business. You're the
only one who knows the details of their contract. How quickly can
you get here?"

Urgent Meeting:
"Sorry to interrupt your day, but we've got an emergency board meeting
in 30 minutes and I need you there. The Peterson deal has hit a snag
and your expertise is crucial. Can you make it?"

Crisis Management:
"Listen, we've got a situation with the product launch and I need all
hands on deck. The client is furious and we need to fix this now.
Drop whatever you're doing and get back here."
```

#### Emotional Variations
- **Low Urgency**: Professional, requesting, expectant
- **Medium Urgency**: Firm, demanding, time-sensitive
- **High Urgency**: Commanding, critical, no-nonsense

---

### Colleague (Work Peer)
**Voice ID**: `flq6f7yk4E4fJM5XTYuZ`
**Age Range**: 30-45 years
**Primary Characteristics**: Professional but friendly, collaborative, supportive

#### Voice Synthesis Settings
```json
{
  "stability": 0.80,
  "similarity_boost": 0.80,
  "style": 0.50,
  "speed": 1.00,
  "emotion": "professional_friendly"
}
```

#### Usage Scenarios
- Project collaborations and deadlines
- Team support and assistance
- Work-related problem solving
- Professional networking events
- Workplace emergencies

#### Speech Patterns
- **Collaborative Language**: "we need", "team effort", "working together"
- **Professional Courtesy**: Polite but direct, respectful tone
- **Problem-Solving Focus**: Solutions-oriented, practical approach
- **Peer-Level Communication**: Equal footing, mutual respect

#### Sample Dialogue Templates
```
Project Emergency:
"Hey, I'm really sorry to bother you, but we've got a major issue with
the Richardson project. The client just moved up the deadline and we
need your input on the technical specs. Could you possibly come in
and help us figure this out?"

Team Support:
"I know you're not officially working today, but the team is struggling
with that database issue you helped us with last week. Could you hop
on a quick call and walk us through the solution again?"

Deadline Crisis:
"Listen, I hate to do this but we're in crisis mode here. The server
crashed and we've lost some of the work for tomorrow's presentation.
You're the only one who has the backup files. Can you help us out?"
```

#### Emotional Variations
- **Low Urgency**: Polite, requesting, collaborative
- **Medium Urgency**: Concerned, needing assistance, time-pressed
- **High Urgency**: Stressed, urgent, requiring immediate help

---

### Client (Important Business Contact)
**Voice ID**: `CYw3kZ02Hs0563khs1Fj`
**Age Range**: 35-55 years
**Primary Characteristics**: Professional, demanding, business-focused, important

#### Voice Synthesis Settings
```json
{
  "stability": 0.90,
  "similarity_boost": 0.85,
  "style": 0.35,
  "speed": 1.00,
  "emotion": "professional_demanding"
}
```

#### Usage Scenarios
- Client service emergencies
- Business relationship management
- Contract and agreement issues
- Quality control problems
- Revenue-critical situations

#### Speech Patterns
- **Business Formality**: Professional courtesy with underlying urgency
- **Value Emphasis**: Focus on business impact and consequences
- **Expectation Setting**: Clear requirements and timelines
- **Relationship Awareness**: Acknowledges business partnership

#### Sample Dialogue Templates
```
Service Emergency:
"This is Jennifer from Hartwell Industries. I'm calling because we're
experiencing critical issues with the system you installed. Our
production line is down and this is costing us thousands per hour.
We need you here immediately to resolve this."

Quality Issue:
"I'm reaching out because we've discovered some serious problems with
the last shipment. This affects our relationship with our own clients
and we need to discuss how to fix this right away. When can you
come in to address this?"

Contract Crisis:
"We've encountered some issues with the terms we agreed on and our
legal team has concerns. Given the size of this contract, I think
we need to meet today to resolve these points. This is time-sensitive."
```

#### Emotional Variations
- **Low Urgency**: Professional, requesting, business-focused
- **Medium Urgency**: Concerned, pressing, relationship-aware
- **High Urgency**: Demanding, critical, potentially threatening

---

## Social Personas

### Close Friend (Best Buddy)
**Voice ID**: `AZnzlk1XvdvUeBnXmlld`
**Age Range**: 25-40 years
**Primary Characteristics**: Casual, familiar, supportive, fun-loving

#### Voice Synthesis Settings
```json
{
  "stability": 0.75,
  "similarity_boost": 0.75,
  "style": 0.70,
  "speed": 1.00,
  "emotion": "casual_supportive"
}
```

#### Usage Scenarios
- Social event assistance
- Personal problem support
- Entertainment and fun activities
- Transportation help
- Everyday friend favors

#### Speech Patterns
- **Casual Terminology**: Slang, informal language, inside jokes
- **Supportive Tone**: Encouraging, understanding, loyal
- **Relaxed Delivery**: Natural pace, conversational flow
- **Personal Connection**: References to shared experiences

#### Sample Dialogue Templates
```
Social Emergency:
"Hey buddy, I'm in a bit of a jam and could really use your help.
My date tonight is turning into a disaster and I need an escape route.
Could you call me in like 10 minutes with some kind of emergency?
I'll owe you big time."

Transportation Help:
"Dude, my car just died and I'm supposed to be at Sarah's birthday
party in an hour. Any chance you could swing by and give me a ride?
I know it's last minute but you're my only hope here."

Personal Support:
"Hey, I know we had plans but I'm having a really rough day and could
use a friend. Want to skip the party and just hang out? Maybe order
some takeout and watch terrible movies?"
```

#### Emotional Variations
- **Low Urgency**: Casual, relaxed, fun
- **Medium Urgency**: Concerned, supportive, helpful
- **High Urgency**: Worried, loyal, immediately responsive

---

### Roommate (Living Companion)
**Voice ID**: `ODq5zmih8GrVes37Dizd`
**Age Range**: 22-35 years
**Primary Characteristics**: Familiar, practical, shared responsibility, casual

#### Voice Synthesis Settings
```json
{
  "stability": 0.70,
  "similarity_boost": 0.70,
  "style": 0.60,
  "speed": 1.05,
  "emotion": "casual_practical"
}
```

#### Usage Scenarios
- Home and apartment issues
- Shared responsibility emergencies
- Living situation problems
- Utility and maintenance issues
- Personal space conflicts

#### Speech Patterns
- **Shared Space Language**: "our apartment", "the house", "we need"
- **Practical Focus**: Solutions-oriented, matter-of-fact
- **Familiar Tone**: Comfortable, direct, no formality needed
- **Responsibility Sharing**: Joint ownership of problems

#### Sample Dialogue Templates
```
Home Emergency:
"Hey, we've got a major problem at the apartment. The water heater just
exploded and there's water everywhere. The landlord needs both of us
here to sign some papers for the insurance. How soon can you get home?"

Utility Crisis:
"So the power company just shut off our electricity because apparently
the bill didn't get paid. I can cover it but I need you here to deal
with the reconnection stuff. They said they need all tenants present."

Maintenance Issue:
"The apartment management is here about that ceiling leak and they want
to inspect your room too. They said if we're not both here they'll have
to schedule for next week and charge us a fee. Can you come back?"
```

#### Emotional Variations
- **Low Urgency**: Casual, practical, routine
- **Medium Urgency**: Concerned, needing cooperation, time-sensitive
- **High Urgency**: Stressed, urgent, requiring immediate action

---

## Service Provider Personas

### Doctor's Office (Healthcare Provider)
**Voice ID**: `ErXwobaYiN019PkySvjV`
**Age Range**: 35-55 years
**Primary Characteristics**: Professional, caring, informative, medically focused

#### Voice Synthesis Settings
```json
{
  "stability": 0.90,
  "similarity_boost": 0.80,
  "style": 0.35,
  "speed": 0.95,
  "emotion": "professional_caring"
}
```

#### Usage Scenarios
- Medical appointment reminders
- Test result notifications
- Health concern follow-ups
- Treatment plan discussions
- Prescription updates

#### Speech Patterns
- **Medical Professionalism**: Clinical but approachable
- **Patient Care Focus**: Health and well-being priority
- **Clear Communication**: Important information delivery
- **Scheduling Language**: Appointment and timing focused

#### Sample Dialogue Templates
```
Urgent Appointment:
"This is Dr. Peterson's office calling about your recent test results.
The doctor would like to see you today if possible to discuss the
findings. We've had a cancellation at 3 PM if you can make it.
Could you please come in?"

Follow-up Required:
"Hi, this is Janet from Dr. Martinez's office. We need to schedule
a follow-up appointment regarding your recent visit. The doctor wants
to check on your progress and possibly adjust your treatment.
When would be convenient for you?"

Prescription Issue:
"I'm calling from the clinic about your prescription. There's been
an issue with your insurance approval and we need to discuss
alternative options with you today. Could you stop by when you
have a chance?"
```

#### Emotional Variations
- **Low Urgency**: Professional, routine, informative
- **Medium Urgency**: Concerned, medically important, scheduling-focused
- **High Urgency**: Medical priority, health-focused, immediate attention

---

### Babysitter (Childcare Provider)
**Voice ID**: `Xb7hH8MSUJpSbYYwhWGQ`
**Age Range**: 18-30 years
**Primary Characteristics**: Responsible, caring, child-focused, slightly anxious

#### Voice Synthesis Settings
```json
{
  "stability": 0.75,
  "similarity_boost": 0.75,
  "style": 0.60,
  "speed": 1.10,
  "emotion": "responsible_concerned"
}
```

#### Usage Scenarios
- Child health and safety concerns
- Behavioral issues requiring parent input
- Emergency situations with children
- Scheduling and logistical problems
- Care instruction clarifications

#### Speech Patterns
- **Child-Focused Language**: References to kids' names and needs
- **Responsible Tone**: Caring but professional about childcare
- **Slightly Anxious**: Natural concern about child welfare
- **Parent Respect**: Defers to parent authority and decisions

#### Sample Dialogue Templates
```
Child Health Concern:
"Hi, this is Emma. I'm watching little Jake tonight and he's developed
a pretty high fever. He's asking for you and seems pretty uncomfortable.
I think you should probably come home and check on him. I've given him
some children's Tylenol but he really wants his mommy."

Behavioral Issue:
"Hey, it's Sarah calling about tonight. Sophie has been really upset
and won't stop crying. She keeps asking for you and I can't seem to
calm her down. I think something might be bothering her. Could you
possibly come home a little early?"

Emergency Situation:
"This is Alex and I need you to come home right away. Tommy fell off
his bike and scraped his knee pretty badly. I've cleaned it up but
I think it might need stitches. He's okay but he's scared and
really wants you here."
```

#### Emotional Variations
- **Low Urgency**: Responsible, caring, seeking guidance
- **Medium Urgency**: Concerned, child-focused, needing parent input
- **High Urgency**: Anxious, child safety-focused, requiring immediate attention

---

## Voice Selection Algorithm

### Context-Based Selection Matrix

| Scenario Type | Time of Day | Relationship | Recommended Persona | Fallback Options |
|---------------|-------------|--------------|-------------------|------------------|
| Emergency Medical | Any | Family | Mom | Dad, Sibling |
| Work Crisis | Business Hours | Professional | Boss | Colleague, Client |
| Social Exit | Evening | Casual | Friend | Sibling, Roommate |
| Transportation | Any | Support | Dad | Friend, Sibling |
| Home Emergency | Any | Family | Mom | Dad, Roommate |
| Health Concern | Business Hours | Professional | Doctor | Mom, Dad |
| Child Issue | Any | Care | Babysitter | Mom, Dad |

### Urgency-Based Adjustments

```
High Urgency (Immediate):
- Increase speech speed by 10-15%
- Add slight breathlessness or concern
- Use more direct, urgent language
- Minimize casual pleasantries

Medium Urgency (Important):
- Standard speech patterns
- Add appropriate concern level
- Balance urgency with relationship tone
- Include brief explanation

Low Urgency (Routine):
- Relaxed speech patterns
- Casual, conversational tone
- Include pleasantries and context
- Allow for natural hesitations
```

### Quality Optimization

#### Voice Consistency Rules
- Maintain persona characteristics throughout call
- Ensure emotional tone matches scenario appropriately
- Keep voice characteristics within expected age and gender ranges
- Adapt formality level to relationship and context

#### Natural Speech Enhancement
- Add appropriate filler words ("um", "well", "you know")
- Include natural pauses and hesitations
- Use contractions for casual personas
- Vary sentence structure for natural flow

#### Cultural and Regional Adaptation
- Adjust accent and dialect based on user preferences
- Incorporate regional speech patterns when appropriate
- Adapt formality levels based on cultural context
- Consider time zone and local customs for timing

---

This voice profiles library provides the foundation for creating believable, contextually appropriate caller personas that enhance the effectiveness of BailOut calls. Each profile is designed to sound authentic and natural while serving the specific purpose of helping users gracefully exit uncomfortable social situations.