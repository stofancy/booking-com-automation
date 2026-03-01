# Architecture Rethink - From Parser to Agent

**Date**: 2026-03-01 23:15 GMT+8  
**Status**: PAUSED - ARCHITECTURE CHANGE REQUIRED

---

## ❌ Current Architecture (WRONG)

```
User Query → Regex Parser → Structured Data → Search
                    ❌
            Too rigid, no conversation, no LLM
```

### Problems:
- ❌ Requires specific query format
- ❌ Fails on ambiguity ("work days next month")
- ❌ No natural conversation
- ❌ No clarification dialog
- ❌ No context memory
- ❌ Not using LLM capabilities

### Example Failure:
```
User: "Find hotels in Xi'an, work days next month, 1 guest under 350/night"
Parser: ❌ Error: Check-in date required
```

---

## ✅ Required Architecture (RIGHT)

```
User Query → OpenClaw Agent (LLM) → Natural Conversation
                    ↓
            Clarify & Gather Info
                    ↓
            Enough Info? → Call Skill → Search → Results
                    ↑
            Need More Info? → Ask Naturally
```

### Benefits:
- ✅ Natural, human-like conversation
- ✅ Handles ambiguity gracefully
- ✅ Asks clarifying questions
- ✅ Remembers context
- ✅ Uses LLM for understanding
- ✅ True travel agent experience

### Example Success:
```
User: "I need a hotel in Xi'an next month"

Agent: "I'd be happy to help you find hotels in Xi'an! 
        To search for the best options, could you tell me:
        1. What specific dates in April?
        2. How many guests?
        3. Any budget or location preferences?"

User: "April 1-5, just me, under 350/night near airport"

Agent: "Perfect! Let me search for hotels in Xi'an near the airport 
        for April 1-5, 1 guest, under $350/night..."

[Agent calls booking-com-automation skill]
[Skill returns results]

Agent: "I found 5 great options near Xi'an airport! 
        The best value is Hôtel XYZ at $280/night with 9.2 rating.
        Would you like to see details or book it?"
```

---

## 🎯 New Components Needed

### 1. OpenClaw Travel Agent
**Location**: `agents/travel-agent/`

**Capabilities**:
- Natural language understanding (LLM)
- Conversation state management
- Intent extraction
- Clarification dialog
- Context memory
- Skill orchestration

**Files**:
```
agents/travel-agent/
├── agent.md              # Agent definition & personality
├── conversation-state.js # State management
├── intent-extractor.js   # LLM-based intent extraction
├── clarification.js      # Natural clarification dialog
└── context-memory.js     # Conversation memory
```

### 2. Skill as Tool
**Current**: `skills/booking-com-automation/` ✅ (keep as-is)

**Role**: Pure execution tool called by agent
- Receives structured data from agent
- Executes search/booking
- Returns results to agent

### 3. Agent-Skill Interface
**New**: Define how agent calls skill

```javascript
// Agent calls skill with structured data
const results = await skill.search({
  destination: "Xi'an",
  checkIn: "2026-04-01",
  checkOut: "2026-04-05",
  adults: 1,
  budget: { amount: 350, currency: 'USD' },
  nearAirport: true
});
```

---

## 📋 Implementation Plan

### Phase 1: Create Travel Agent (4-6 hours)
1. Define agent personality & behavior
2. Implement conversation state manager
3. Create LLM intent extractor
4. Build clarification dialog system
5. Add context memory

### Phase 2: Agent-Skill Integration (2-3 hours)
1. Define skill calling interface
2. Implement skill invocation
3. Handle results & present to user
4. Error handling & retry

### Phase 3: Testing & Refinement (2-3 hours)
1. Test conversation flows
2. Test edge cases
3. Refine prompts
4. Performance optimization

**Total**: 8-12 hours

---

## 🚀 Next Session Instructions

### To Continue This Project:

1. **Read This Document**: `ARCHITECTURE-RETHINK.md`

2. **Understand the Shift**:
   - OLD: Parser-based skill (rigid)
   - NEW: LLM-based agent (conversational)

3. **Start With**:
   ```bash
   cd ~/.openclaw/workspace/skills/booking-com-automation
   
   # Read existing work
   cat SESSION-SUMMARY.md
   cat PROJECT-STATUS.md
   
   # Create agent directory
   mkdir -p agents/travel-agent
   
   # Start building agent
   code agents/travel-agent/agent.md
   ```

4. **Key Files to Create**:
   - `agents/travel-agent/agent.md` - Agent definition
   - `agents/travel-agent/conversation-state.js` - State management
   - `agents/travel-agent/intent-extractor.js` - LLM extraction
   - `agents/travel-agent/clarification.js` - Dialog system

5. **Keep Existing**:
   - `skills/booking-com-automation/` - Keep as skill tool
   - All tests - Still valid for skill
   - All scripts - Still work

---

## 📊 Current Work Status

### ✅ Completed (Keep)
- 6 sprints of skill development
- 360 passing tests
- Live site verification
- All extraction logic
- All browser automation

### ❌ Deprecated (Replace)
- Regex-based parser
- Rigid query requirements
- No conversation support

### 🆕 Needed (Build)
- OpenClaw travel agent
- Conversation management
- LLM intent extraction
- Clarification dialog
- Context memory

---

## 🎯 Success Criteria

New architecture is complete when:

```
✅ User can say: "I need a hotel somewhere warm next month"
✅ Agent asks: "Where would you like to go? What dates? Budget?"
✅ User responds: "Maybe Thailand, April 10-15, under $200"
✅ Agent confirms: "Great! Let me search Bangkok hotels..."
✅ Agent calls skill with structured data
✅ Skill returns results
✅ Agent presents: "Found 5 hotels! Best is XYZ..."
✅ Natural conversation throughout
```

---

## 📞 Handoff Notes

**Previous Work**: All preserved in `skills/booking-com-automation/`  
**New Direction**: Agent-based conversation  
**Starting Point**: Create `agents/travel-agent/`  
**Goal**: Natural travel assistant experience  

---

**Session End**: 2026-03-01 23:15 GMT+8  
**Next Session**: Start agent development  
**Status**: READY FOR ARCHITECTURE CHANGE
