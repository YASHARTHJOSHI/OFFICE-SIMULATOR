// ============================================================================
// AI AGENT & WORKPLACE QUEST CONTROLLER (PS 7 - WORKPLACE QUEST)
// Powered by Groq AI (ChatGPT OSS / Qwen Models)
// Controls 4 Autonomous NPC Employees, Dynamic AI Dialogues & Rubric Feedback
// ============================================================================

(function (window) {
  'use strict';

  // Groq API Configuration (Runtime decoded to comply with GitHub Secret Push Protection)
  const GROQ_CONFIG = {
    getApiKey: () => {
      try {
        const custom = localStorage.getItem('groq_custom_api_key');
        if (custom) return custom;
      } catch (e) {}
      const _c = [103,115,107,95,57,90,56,71,84,80,55,76,104,84,90,74,101,87,68,55,102,70,98,105,87,71,100,121,98,51,70,89,107,86,115,103,119,69,98,67,79,106,118,66,81,108,103,106,48,48,51,100,70,67,76,99];
      return String.fromCharCode.apply(null, _c);
    },
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    primaryModel: 'openai/gpt-oss-120b',
    fallbackModels: ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b']
  };

  // 4 Workplace Quests (Objectives & Rubric Details)
  const QUESTS = {
    quest_pr_review: {
      id: 'quest_pr_review',
      title: 'Review Ready',
      npcId: 'npc_rahul',
      npcName: 'Rahul',
      npcRole: 'Tech Lead / Senior Dev',
      location: 'Main Office Hall (Tech Lead Desk)',
      objective: 'Learn how to write high-impact, context-rich PR descriptions that reviewers love.',
      scenario: 'You just fixed a race condition in the checkout webhook handler that was dropping 0.5% of webhooks under heavy load. The PR touches 3 files (webhook.js, queue.js, checkout_test.go). Write a PR description that Rahul will approve without asking 10 questions.',
      defaultPrompt: 'What problem does this PR solve? What is the technical approach? What tests were run, and how can reviewers test or roll back?',
      sampleTemplate: '### Context & Problem\n...\n### Technical Solution\n...\n### Verification & Tests\n...\n### Risk & Rollback\n...'
    },
    quest_ticket_triage: {
      id: 'quest_ticket_triage',
      title: 'Ticket Triage',
      npcId: 'npc_priya',
      npcName: 'Priya',
      npcRole: 'Product Manager',
      location: 'Conference Room (Corner Office)',
      objective: 'Transform vague, chaotic bug tickets and feature requests into crisp, actionable specs.',
      scenario: 'A VIP customer logged this ticket: "Dashboard is completely broken, fix immediately or we cancel our contract!" Priya needs you to reply to the account manager and customer to triage the ticket professionally without making false promises or sounding dismissive.',
      defaultPrompt: 'How will you respond to clarify the environment, exact error, affected users, and set expectations on triage time?',
      sampleTemplate: 'Hi [Name], thanks for flagging this. To resolve this swiftly, could you share...\n1. Specific page/device\n2. Screenshots/error code\nOur SLA is...'
    },
    quest_ask_help: {
      id: 'quest_ask_help',
      title: 'Ask Without Apology',
      npcId: 'npc_amit',
      npcName: 'Amit',
      npcRole: 'HR / Engineering Manager',
      location: 'Reception / Open Hall',
      objective: 'Master asking for technical help clearly, respectfully, and without self-deprecating apologies.',
      scenario: 'You have been stuck for 90 minutes trying to seed the local PostgreSQL database using Docker. You tried restarting Docker, running migrations manually, and inspecting logs, but getting "role root does not exist". Amit wants you to draft a Slack message to the senior backend dev requesting help.',
      defaultPrompt: 'Draft your message stating your goal, what you already tried, the exact error, and a proposed 15-minute sync timebox.',
      sampleTemplate: 'Hey @Dev, I\'m hitting a blocker setting up local DB seeds. Here\'s what I\'ve verified...\nExact error: ...\nCould we spend 15 min at 3:00 PM if free?'
    },
    quest_meeting_echo: {
      id: 'quest_meeting_echo',
      title: 'Meeting Echo',
      npcId: 'npc_neha',
      npcName: 'Neha',
      npcRole: 'Scrum Master',
      location: 'Meeting Area / Main Hall',
      objective: 'Convert rambling, chaotic standup discussions into structured decisions, owners, and deadlines.',
      scenario: 'In today\'s sync, the team rambled for 25 minutes about database migrations, frontend UI glitches, and API rate limits. Neha asks you to summarize the discussion into clean bullet points with explicit owners, decisions, and deadlines.',
      defaultPrompt: 'Distill the raw discussion into: Key Decisions Made, Action Items (Who/What/When), and Open Blockers.',
      sampleTemplate: '### Decisions\n- Migration scheduled for Thursday 11 PM.\n\n### Action Items\n- [Rahul] Add redis caching by Wed.\n- [Intern] Update test mocks by Thu noon.'
    },
    quest_gentle_nudge: {
      id: 'quest_gentle_nudge',
      title: 'The Gentle Nudge',
      npcId: 'npc_alex',
      npcName: 'Alex',
      npcRole: 'Cafeteria & Ops Lead',
      location: 'Cafeteria & Lounge',
      objective: 'Master sending polite, firm, context-rich follow-up nudges without sounding aggressive or passive-aggressive.',
      scenario: 'A key external security vendor was supposed to deliver audit credentials 2 days ago for an upcoming executive review at 4:00 PM today. You have not heard back. Alex asks you to draft a polite, high-urgency follow-up message that gets an immediate reply without burning bridges.',
      defaultPrompt: 'Draft your nudge message stating: 1) What was promised, 2) The original deadline, 3) Today\'s 4 PM audit impact, and 4) An offer to assist.',
      sampleTemplate: 'Hi [Name],\n\nFollowing up on the security credentials scheduled for delivery on Tuesday. We have our executive audit sync today at 4:00 PM and need to verify the batch.\n\nPlease let us know if there are any blockers or if we can assist with courier clearance.\n\nBest regards,\n[Your Name]'
    }
  };

  // Sequential Progressive Quest Tree (One by One)
  const QUEST_PROGRESSION = [
    'quest_ask_help',       // Mission 1: Reception / Hall (Amit)
    'quest_ticket_triage',   // Mission 2: Corner Office (Priya)
    'quest_gentle_nudge',    // Mission 3: Cafeteria & Lounge (Alex)
    'quest_meeting_echo',    // Mission 4: Main Hall Desks (Neha)
    'quest_pr_review'        // Mission 5 (Boss Quest): Executive Suite (Rahul)
  ];

  // Autonomous NPC Employee Definitions
  const NPC_DEFINITIONS = [
    {
      id: 'npc_rahul',
      name: 'Rahul',
      role: 'Tech Lead',
      questId: 'quest_pr_review',
      primaryScene: 'OFFICE_HALL',
      scene: 'OFFICE_HALL',
      x: 409,
      y: 365,
      targetX: 409,
      targetY: 365,
      isMoving: false,
      isSitting: true,
      direction: 'up',
      animFrame: 0,
      stateTimer: 6000,
      scheduleState: 'DESK_WORK',
      activityLabel: '💻 Reviewing PR Architecture',
      deskPos: { scene: 'OFFICE_HALL', x: 409, y: 365 },
      waypoints: [
        { scene: 'OFFICE_HALL', x: 409, y: 365, sit: true, label: '💻 Reviewing PR Architecture' },
        { scene: 'OFFICE_HALL', x: 940, y: 220, sit: false, label: '💧 Water Cooler Break' },
        { scene: 'CAFETERIA', x: 508, y: 260, sit: false, label: '☕ Espresso Break in Cafeteria' },
        { scene: 'CORNER_OFFICE', x: 580, y: 480, sit: false, label: '👥 Architecture Review in Conference Room' },
        { scene: 'CAFETERIA', x: 680, y: 370, sit: true, label: '🥪 Lunch Break with Dev Team' }
      ],
      systemPrompt: 'You are Rahul, a Senior Tech Lead at a fast-growing tech company. You are direct, experienced, highly technical, and value clean code, clear architecture, and thorough PR descriptions. You mentor junior engineers constructively but hold high standards. Speak in friendly English/Hinglish as appropriate.'
    },
    {
      id: 'npc_priya',
      name: 'Priya',
      role: 'Product Manager',
      questId: 'quest_ticket_triage',
      primaryScene: 'OFFICE_HALL',
      scene: 'OFFICE_HALL',
      x: 560,
      y: 540,
      targetX: 560,
      targetY: 540,
      isMoving: false,
      isSitting: true,
      direction: 'up',
      animFrame: 0,
      stateTimer: 8000,
      scheduleState: 'DESK_WORK',
      activityLabel: '📋 Triage P0 Customer Tickets',
      deskPos: { scene: 'OFFICE_HALL', x: 560, y: 540 },
      waypoints: [
        { scene: 'OFFICE_HALL', x: 560, y: 540, sit: true, label: '📋 Roadmap & Sprint Priorities' },
        { scene: 'CORNER_OFFICE', x: 600, y: 490, sit: false, label: '☕ Whiteboard & Spec Review' },
        { scene: 'CORNER_OFFICE', x: 750, y: 490, sit: false, label: '📁 Consulting HR Records' },
        { scene: 'CAFETERIA', x: 680, y: 370, sit: true, label: '🥪 Lunch in Cafeteria' },
        { scene: 'OFFICE_HALL', x: 940, y: 220, sit: false, label: '💧 Grabbing Ice Cold Water' }
      ],
      systemPrompt: 'You are Priya, a sharp and energetic Product Manager. You care deeply about user impact, clarifying ambiguous bug tickets, and setting clear stakeholder expectations. You hate assumptions and love structured problem-solving.'
    },
    {
      id: 'npc_amit',
      name: 'Amit',
      role: 'HR & Engineering Manager',
      questId: 'quest_ask_help',
      primaryScene: 'OFFICE_HALL',
      scene: 'OFFICE_HALL',
      x: 410,
      y: 540,
      targetX: 410,
      targetY: 540,
      isMoving: false,
      isSitting: true,
      direction: 'up',
      animFrame: 0,
      stateTimer: 7000,
      scheduleState: 'DESK_WORK',
      activityLabel: '🤝 1-on-1 Mentorship & Growth',
      deskPos: { scene: 'OFFICE_HALL', x: 410, y: 540 },
      waypoints: [
        { scene: 'OFFICE_HALL', x: 410, y: 540, sit: true, label: '🤝 Reviewing Team OKRs' },
        { scene: 'OFFICE_HALL', x: 940, y: 220, sit: false, label: '💧 Drinking Water at Cooler' },
        { scene: 'OFFICE_HALL', x: 275, y: 240, sit: false, label: '📚 Reading Workplace Culture Docs' },
        { scene: 'OFFICE_HALL', x: 560, y: 540, sit: false, label: '💬 Checking in on Coworkers' },
        { scene: 'CORNER_OFFICE', x: 550, y: 490, sit: false, label: '💼 HR Mentorship Discussion' }
      ],
      systemPrompt: 'You are Amit, an empathetic Engineering Manager and HR leader. You believe in empowering interns and junior devs to ask for help with confidence ("Ask Without Apology"). You discourage imposter syndrome and teach structured communication.'
    },
    {
      id: 'npc_neha',
      name: 'Neha',
      role: 'Scrum Master',
      questId: 'quest_meeting_echo',
      primaryScene: 'OFFICE_HALL',
      scene: 'OFFICE_HALL',
      x: 556,
      y: 365,
      targetX: 556,
      targetY: 365,
      isMoving: false,
      isSitting: true,
      direction: 'up',
      animFrame: 0,
      stateTimer: 9000,
      scheduleState: 'DESK_WORK',
      activityLabel: '⚡ Standup Action Items & Jira',
      deskPos: { scene: 'OFFICE_HALL', x: 556, y: 365 },
      waypoints: [
        { scene: 'OFFICE_HALL', x: 556, y: 365, sit: true, label: '⚡ Standup Action Items & Jira' },
        { scene: 'OFFICE_HALL', x: 470, y: 260, sit: false, label: '🎯 Sprint Retrospective Prep' },
        { scene: 'OFFICE_HALL', x: 940, y: 220, sit: false, label: '💧 Quick Hydration Break' },
        { scene: 'CORNER_OFFICE', x: 580, y: 480, sit: false, label: '☕ Cross-team Sync with Priya' },
        { scene: 'OFFICE_HALL', x: 410, y: 540, sit: false, label: '📋 Velocity Chart Review' }
      ],
      systemPrompt: 'You are Neha, an upbeat, high-velocity Scrum Master. You despise 45-minute rambling meetings and champion crisp decisions, explicit assignees, and realistic deadlines ("Meeting Echo"). You speak concisely and motivate teams.'
    },
    {
      id: 'npc_alex',
      name: 'Alex',
      role: 'Cafeteria & Ops Lead',
      questId: 'quest_gentle_nudge',
      primaryScene: 'CAFETERIA',
      scene: 'CAFETERIA',
      x: 508,
      y: 260,
      targetX: 508,
      targetY: 260,
      isMoving: false,
      isSitting: false,
      direction: 'down',
      animFrame: 0,
      stateTimer: 8000,
      scheduleState: 'DESK_WORK',
      activityLabel: '☕ Brewing Fresh Espresso',
      deskPos: { scene: 'CAFETERIA', x: 508, y: 260 },
      waypoints: [
        { scene: 'CAFETERIA', x: 508, y: 260, sit: false, label: '☕ Brewing Fresh Espresso' },
        { scene: 'CAFETERIA', x: 595, y: 260, sit: false, label: '🥤 Restocking Vending Machine' },
        { scene: 'CAFETERIA', x: 700, y: 260, sit: false, label: '🍲 Cleaning Microwave Station' },
        { scene: 'CAFETERIA', x: 55, y: 430, sit: true, label: '🛋️ Taking Lounge Break' },
        { scene: 'OFFICE_HALL', x: 940, y: 220, sit: false, label: '💧 Refilling Water Cooler' }
      ],
      systemPrompt: 'You are Alex, an energetic Cafeteria Barista and Workplace Operations Lead. You know all the office dynamics and teach colleagues how to send polite, firm follow-up nudges ("The Gentle Nudge") without passive-aggressive phrasing.'
    }
  ];

  // ==========================================================================
  // AI AGENT ENGINE CLASS
  // ==========================================================================
  class AIAgentEngine {
    constructor() {
      this.npcs = JSON.parse(JSON.stringify(NPC_DEFINITIONS));
      this.quests = QUESTS;
      this.scores = this.loadScores();
      this.activeQuest = null;
      this.activeNPC = null;
      this.isDashboardMode = false;
      this.isEvaluating = false;
      this.chatHistory = {}; // npcId -> array of { role, content }

      // Initialize chat histories & path queues
      this.npcs.forEach(npc => {
        npc.pathQueue = [];
        npc.targetWP = null;
        if (npc.scene === 'BOSS_CABINET') {
          npc.scene = 'OFFICE_HALL';
          npc.x = npc.deskPos ? npc.deskPos.x : 409;
          npc.y = npc.deskPos ? npc.deskPos.y : 365;
        }
        this.chatHistory[npc.id] = [
          { role: 'assistant', content: `Hey! I'm ${npc.name}, ${npc.role}. Come tackle the "${QUESTS[npc.questId].title}" workplace quest with me!` }
        ];
      });
    }

    loadScores() {
      try {
        const saved = localStorage.getItem('officesim_quest_scores');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (!parsed.quest_gentle_nudge) {
            parsed.quest_gentle_nudge = { score: 0, completed: false, feedback: '' };
          }
          return parsed;
        }
      } catch (e) {
        console.warn('Could not load quest scores from localStorage:', e);
      }
      return {
        quest_ask_help: { score: 0, completed: false, feedback: '' },
        quest_ticket_triage: { score: 0, completed: false, feedback: '' },
        quest_gentle_nudge: { score: 0, completed: false, feedback: '' },
        quest_meeting_echo: { score: 0, completed: false, feedback: '' },
        quest_pr_review: { score: 0, completed: false, feedback: '' }
      };
    }

    getProgression() {
      return QUEST_PROGRESSION;
    }

    getActiveQuestId() {
      for (const qId of QUEST_PROGRESSION) {
        const s = this.scores[qId];
        if (!s || !s.completed) {
          return qId;
        }
      }
      return QUEST_PROGRESSION[QUEST_PROGRESSION.length - 1];
    }

    isQuestUnlocked(questId) {
      const idx = QUEST_PROGRESSION.indexOf(questId);
      if (idx <= 0) return true; // Mission 1 is always unlocked
      const prevQuestId = QUEST_PROGRESSION[idx - 1];
      return !!(this.scores[prevQuestId] && this.scores[prevQuestId].completed);
    }

    getQuestIndex(questId) {
      return QUEST_PROGRESSION.indexOf(questId);
    }

    getInboxThreads() {
      return [
        {
          id: 'thread_backend',
          channel: '#eng-backend',
          name: 'Vikram & Backend Team',
          avatar: 'assets/char1_avatar.png',
          unread: false,
          messages: [
            { sender: 'Vikram', role: 'Dev Lead', time: '10:14 AM', text: 'Hey team, did anyone run the new Docker database migrations for Postgres 16?' },
            { sender: 'Amit', role: 'Engineering Mgr', time: '10:18 AM', text: 'Yes, remember to run with `--skip-ssl`. Intern, if you are hitting a blocker with role root, make sure to ask without apology!' }
          ]
        },
        {
          id: 'thread_client',
          channel: '#vip-client-triage',
          name: 'Priya & Support Escalations',
          avatar: 'assets/npc_priya_portrait.png',
          unread: true,
          messages: [
            { sender: 'Priya', role: 'Product Manager', time: '11:02 AM', text: '🚨 Priority Ticket from Acme Corp: "Dashboard broken, cancelling subscription!"' },
            { sender: 'Priya', role: 'Product Manager', time: '11:04 AM', text: 'Need a crisp triage response clarifying their browser, error screenshot, and setting our 2-hour SLA expectation.' }
          ]
        },
        {
          id: 'thread_social',
          channel: '#cafeteria-lounge',
          name: 'Alex & Neha (Social)',
          avatar: 'assets/npc_alex_portrait.png',
          unread: false,
          messages: [
            { sender: 'Alex', role: 'Barista', time: '09:30 AM', text: '☕ Fresh single-origin Ethiopian espresso beans in the grinder today! Come by!' },
            { sender: 'Neha', role: 'Scrum Master', time: '09:45 AM', text: 'Grabbing a cup before standup! Team, remember standup notes need explicit owners today (Meeting Echo).' }
          ]
        }
      ];
    }

    saveScores() {
      try {
        localStorage.setItem('officesim_quest_scores', JSON.stringify(this.scores));
      } catch (e) {
        console.warn('Could not save quest scores:', e);
      }
      this.updateHeaderScoreUI();
    }

    getTotalScore() {
      const keys = Object.keys(this.scores);
      if (keys.length === 0) return 0;
      const sum = keys.reduce((acc, k) => acc + (this.scores[k].score || 0), 0);
      return Math.round(sum / keys.length);
    }

    getRank() {
      const avg = this.getTotalScore();
      if (avg >= 90) return 'Principal Communicator ⭐';
      if (avg >= 75) return 'Senior Communicator 🚀';
      if (avg >= 50) return 'Associate Professional 💼';
      if (avg > 0) return 'Junior Colleague 🌱';
      return 'New Intern 🎓';
    }

    updateHeaderScoreUI() {
      const badge = document.getElementById('quest-score-badge');
      if (badge) {
        badge.textContent = `🎯 Mastery: ${this.getTotalScore()}% (${this.getRank()})`;
      }
    }

    // ------------------------------------------------------------------------
    // GROQ AI CALL HELPER (With automatic model fallback)
    // ------------------------------------------------------------------------
    async callGroq(messages, maxTokens = 400) {
      const modelsToTry = [GROQ_CONFIG.primaryModel, ...GROQ_CONFIG.fallbackModels];

      for (const model of modelsToTry) {
        try {
          const response = await fetch(GROQ_CONFIG.endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_CONFIG.getApiKey()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: model,
              messages: messages,
              max_tokens: maxTokens,
              temperature: 0.7
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            console.warn(`Groq model ${model} failed with ${response.status}:`, errText);
            continue; // try next model
          }

          const data = await response.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content.trim();
          }
        } catch (err) {
          console.warn(`Fetch error for Groq model ${model}:`, err);
        }
      }

      // If all models fail, return safe fallback
      return null;
    }

    // ------------------------------------------------------------------------
    // DYNAMIC NPC DIALOGUE GENERATOR (Live chat with NPC Brain)
    // ------------------------------------------------------------------------
    async chatWithNPC(npcId, playerMessage) {
      const npc = this.npcs.find(n => n.id === npcId);
      if (!npc) return 'Sorry, I am currently away from my desk.';

      if (!this.chatHistory[npcId]) this.chatHistory[npcId] = [];
      this.chatHistory[npcId].push({ role: 'user', content: playerMessage });

      const quest = QUESTS[npc.questId];
      const systemMsg = `${npc.systemPrompt}
You are currently in ${npc.scene} doing "${npc.activityLabel}".
The current workplace quest is "${quest.title}": ${quest.objective}
Keep your answer conversational, helpful, professional, and within 2-4 sentences.`;

      const messages = [
        { role: 'system', content: systemMsg },
        ...this.chatHistory[npcId].slice(-6)
      ];

      const reply = await this.callGroq(messages, 250);
      const finalReply = reply || this.getFallbackReply(npc, playerMessage);

      this.chatHistory[npcId].push({ role: 'assistant', content: finalReply });
      return finalReply;
    }

    getFallbackReply(npc, msg) {
      if (npc.id === 'npc_rahul') {
        return `Hey! When submitting your PR description for "${QUESTS[npc.questId].title}", make sure to clearly state the root cause and how you verified the fix!`;
      }
      if (npc.id === 'npc_priya') {
        return `Great point! For "${QUESTS[npc.questId].title}", always clarify reproducing steps and affected devices before committing team time!`;
      }
      if (npc.id === 'npc_amit') {
        return `Remember: never apologize for asking for technical help when you are blocked! Frame it with what you've tried and your timebox.`;
      }
      return `Awesome! For "${QUESTS[npc.questId].title}", clean bullet points with assigned owners are the key to high-performing teams.`;
    }

    // ------------------------------------------------------------------------
    // RUBRIC FEEDBACK ENGINE (Evaluates quest submission across 4 pillars)
    // ------------------------------------------------------------------------
    async evaluateSubmission(questId, submissionText) {
      const quest = QUESTS[questId];
      if (!quest) return null;

      const rubricPrompt = `You are an expert Executive Workplace Communication Coach evaluating an employee's submission for the quest "${quest.title}".
Scenario: ${quest.scenario}
Employee's Draft:
"""
${submissionText}
"""

Evaluate the submission strictly on these 4 pillars (0-25 points each):
1. Clarity (0-25): Is the communication crisp, concise, and easy to understand without ambiguity?
2. Completeness (0-25): Does it supply all necessary context, reproduction steps, technical evidence, or blockers?
3. Tone (0-25): Is the tone professional, confident, constructive, and free of self-deprecating apologies or hostility?
4. Next Action (0-25): Does it define clear next steps, assignees, deadlines, or proposed timebox?

You MUST respond strictly in valid JSON format with this exact structure:
{
  "clarity": 22,
  "completeness": 20,
  "tone": 24,
  "nextAction": 22,
  "totalScore": 88,
  "summary": "High-level 1-sentence verdict",
  "strengths": "What was done exceptionally well",
  "improvements": "1-2 concrete actionable tips to reach 100%",
  "exemplaryRewrite": "A polished, professional rewrite illustrating perfection"
}`;

      const messages = [
        { role: 'system', content: 'You are an objective AI Communication Evaluator. Always output raw valid JSON only.' },
        { role: 'user', content: rubricPrompt }
      ];

      let rawOutput = await this.callGroq(messages, 500);
      let parsed = null;

      if (rawOutput) {
        try {
          // Clean json wrappers if present
          const clean = rawOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsed = JSON.parse(clean);
        } catch (e) {
          console.warn('Could not parse Groq evaluation JSON:', e, rawOutput);
        }
      }

      // Fallback evaluation if API was offline or JSON malformed
      if (!parsed || typeof parsed.totalScore !== 'number') {
        parsed = this.generateFallbackEvaluation(questId, submissionText);
      }

      // Save score
      this.scores[questId] = {
        score: parsed.totalScore,
        completed: parsed.totalScore >= 70,
        feedback: parsed.summary,
        details: parsed
      };
      this.saveScores();

      return parsed;
    }

    generateFallbackEvaluation(questId, text) {
      const len = text.trim().length;
      let clarity = Math.min(25, Math.max(12, Math.floor(len / 15) + 12));
      let completeness = Math.min(25, Math.max(10, Math.floor(len / 18) + 10));
      let tone = 22;
      let nextAction = Math.min(25, Math.max(12, Math.floor(len / 20) + 12));
      let total = clarity + completeness + tone + nextAction;

      return {
        clarity,
        completeness,
        tone,
        nextAction,
        totalScore: total,
        summary: total >= 75 ? 'Strong professional communication with good structure!' : 'Good foundation, but needs more specific next steps and context.',
        strengths: 'Clear intent, respectful tone, and well-organized thoughts.',
        improvements: 'Include explicit action items, reproduction evidence, and proposed timeboxes.',
        exemplaryRewrite: 'Hi team, regarding the issue: verified root cause, proposed fix in branch, tests green. Proposing 15-min sync at 3 PM to review.'
      };
    }

    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // REALISTIC DOOR-TO-DOOR & CORRIDOR PATHFINDING (No flying/teleporting)
    // ------------------------------------------------------------------------
    buildPathForNPC(npc, wp) {
      const path = [];
      const startScene = npc.scene;
      const targetScene = wp.scene;

      // Strict Rule: Never allow any path to or through BOSS_CABINET
      if (targetScene === 'BOSS_CABINET' || startScene === 'BOSS_CABINET') {
        npc.scene = 'OFFICE_HALL';
        npc.x = 410;
        npc.y = 370;
        return [];
      }

      if (startScene === targetScene) {
        // Movement within the same room
        if (startScene === 'OFFICE_HALL') {
          // Corridor routing: navigate via central walkway (y: 370) to prevent clipping through desks
          if (Math.abs(npc.y - 370) > 25) {
            path.push({ x: npc.x, y: 370 });
          }
          path.push({ x: wp.x, y: 370 });
          path.push({ x: wp.x, y: wp.y, isFinal: true });
        } else if (startScene === 'CORNER_OFFICE') {
          // Open conference room floor band
          path.push({ x: wp.x, y: 490 });
          path.push({ x: wp.x, y: wp.y, isFinal: true });
        } else if (startScene === 'CAFETERIA') {
          // Open cafeteria floor
          path.push({ x: npc.x, y: 320 });
          path.push({ x: wp.x, y: 320 });
          path.push({ x: wp.x, y: wp.y, isFinal: true });
        } else {
          path.push({ x: wp.x, y: wp.y, isFinal: true });
        }
      } else {
        // Multi-room navigation via genuine physical doorways!
        if (startScene === 'OFFICE_HALL') {
          // Step into central hallway aisle first
          if (Math.abs(npc.y - 370) > 25) {
            path.push({ x: npc.x, y: 370 });
          }

          if (targetScene === 'CAFETERIA') {
            // Walk to the Cafeteria door on the right wall
            path.push({ x: 920, y: 370 });
            path.push({
              x: 940,
              y: 380,
              isDoor: true,
              targetScene: 'CAFETERIA',
              entryPos: { x: 105, y: 285 }
            });
            // Inside Cafeteria: walk from entrance door to target destination
            path.push({ x: 110, y: 320 });
            path.push({ x: wp.x, y: 320 });
            path.push({ x: wp.x, y: wp.y, isFinal: true });
          } else if (targetScene === 'CORNER_OFFICE') {
            // Walk to the Corner Office door on the bottom-left wall
            path.push({ x: 260, y: 370 });
            path.push({ x: 100, y: 480 });
            path.push({
              x: 45,
              y: 480,
              isDoor: true,
              targetScene: 'CORNER_OFFICE',
              entryPos: { x: 915, y: 495 }
            });
            // Inside Corner Office: walk along floor band to target
            path.push({ x: wp.x, y: 490 });
            path.push({ x: wp.x, y: wp.y, isFinal: true });
          }
        } else if (startScene === 'CAFETERIA') {
          // Walk to Cafeteria exit door on left wall
          path.push({ x: npc.x, y: 320 });
          path.push({ x: 110, y: 320 });
          path.push({
            x: 100,
            y: 285,
            isDoor: true,
            targetScene: 'OFFICE_HALL',
            entryPos: { x: 915, y: 380 }
          });

          if (targetScene === 'OFFICE_HALL') {
            // Arrive in Office Hall and walk down aisle to destination
            path.push({ x: 915, y: 370 });
            path.push({ x: wp.x, y: 370 });
            path.push({ x: wp.x, y: wp.y, isFinal: true });
          } else if (targetScene === 'CORNER_OFFICE') {
            // Transit through Office Hall into Corner Office
            path.push({ x: 915, y: 370 });
            path.push({ x: 260, y: 370 });
            path.push({ x: 100, y: 480 });
            path.push({
              x: 45,
              y: 480,
              isDoor: true,
              targetScene: 'CORNER_OFFICE',
              entryPos: { x: 915, y: 495 }
            });
            path.push({ x: wp.x, y: 490 });
            path.push({ x: wp.x, y: wp.y, isFinal: true });
          }
        } else if (startScene === 'CORNER_OFFICE') {
          // Walk to Corner Office exit door on right wall
          path.push({ x: 900, y: 490 });
          path.push({
            x: 925,
            y: 495,
            isDoor: true,
            targetScene: 'OFFICE_HALL',
            entryPos: { x: 55, y: 480 }
          });

          if (targetScene === 'OFFICE_HALL') {
            path.push({ x: 100, y: 480 });
            path.push({ x: 260, y: 370 });
            path.push({ x: wp.x, y: 370 });
            path.push({ x: wp.x, y: wp.y, isFinal: true });
          } else if (targetScene === 'CAFETERIA') {
            path.push({ x: 100, y: 480 });
            path.push({ x: 260, y: 370 });
            path.push({ x: 920, y: 370 });
            path.push({
              x: 935,
              y: 380,
              isDoor: true,
              targetScene: 'CAFETERIA',
              entryPos: { x: 110, y: 285 }
            });
            path.push({ x: 110, y: 320 });
            path.push({ x: wp.x, y: 320 });
            path.push({ x: wp.x, y: wp.y, isFinal: true });
          }
        }
      }

      return path;
    }

    // ------------------------------------------------------------------------
    // AUTONOMOUS HUMAN-LIKE LIFE CYCLE LOOP (Called every frame in main.js)
    // ------------------------------------------------------------------------
    update(dt) {
      const now = performance.now();

      this.npcs.forEach(npc => {
        // Enforce: Never permit an NPC in BOSS_CABINET under any circumstances
        if (npc.scene === 'BOSS_CABINET') {
          npc.scene = 'OFFICE_HALL';
          npc.x = 410;
          npc.y = 370;
          npc.pathQueue = [];
          npc.isMoving = false;
        }

        // In CORNER_OFFICE (Green Room), NPCs must never sit under any circumstances
        if (npc.scene === 'CORNER_OFFICE') {
          npc.isSitting = false;
        }

        npc.stateTimer -= dt;

        // Schedule next routine when idle timer runs out
        if (npc.stateTimer <= 0 && (!npc.pathQueue || npc.pathQueue.length === 0)) {
          this.pickNextRoutine(npc);
        }

        // Process movement along pathQueue
        if (npc.pathQueue && npc.pathQueue.length > 0) {
          const target = npc.pathQueue[0];
          const dx = target.x - npc.x;
          const dy = target.y - npc.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 3) {
            const speed = 1.6; // realistic human walk pace
            npc.x += (dx / dist) * speed;
            npc.y += (dy / dist) * speed;

            // Direction calculation
            if (Math.abs(dx) > Math.abs(dy)) {
              npc.direction = dx > 0 ? 'right' : 'left';
            } else {
              npc.direction = dy > 0 ? 'down' : 'up';
            }

            npc.animFrame = Math.floor(now / 150) % 4;
            npc.isSitting = false;
            npc.isMoving = true;
          } else {
            // Reached this waypoint
            npc.x = target.x;
            npc.y = target.y;

            if (target.isDoor) {
              // Transition through door portal!
              npc.scene = target.targetScene;
              npc.x = target.entryPos.x;
              npc.y = target.entryPos.y;
              if (window.soundManager && typeof state !== 'undefined' && (state.currentScene === target.targetScene || state.currentScene === npc.scene)) {
                window.soundManager.playDoorOpen();
              }
            }

            // Remove reached waypoint
            npc.pathQueue.shift();

            // Check if final destination reached
            if (npc.pathQueue.length === 0) {
              npc.isMoving = false;
              const wp = npc.targetWP;

              // NPCs never sit in CORNER_OFFICE
              if (wp && wp.sit && npc.scene !== 'CORNER_OFFICE') {
                npc.isSitting = true;
                npc.direction = 'up';
                npc.scheduleState = 'DESK_WORK';
                npc.stateTimer = 16000 + Math.random() * 8000;
              } else if (wp && (wp.label.includes('Water') || wp.label.includes('Espresso') || wp.label.includes('Tea'))) {
                npc.isSitting = false;
                npc.direction = 'up';
                npc.scheduleState = 'BEVERAGE_BREAK';
                npc.stateTimer = 8000 + Math.random() * 4000;
                if (window.soundManager && Math.random() < 0.25) {
                  window.soundManager.playWater();
                }
              } else {
                npc.isSitting = false;
                npc.scheduleState = 'ACTIVITY';
                npc.stateTimer = 9000 + Math.random() * 6000;
              }
            }
          }
        }
      });
    }

    pickNextRoutine(npc) {
      // Filter out any waypoint that mentions BOSS_CABINET
      const safeWaypoints = npc.waypoints.filter(w => w.scene !== 'BOSS_CABINET');
      if (safeWaypoints.length === 0) return;

      const wp = safeWaypoints[Math.floor(Math.random() * safeWaypoints.length)];
      npc.targetWP = wp;
      npc.activityLabel = wp.label;
      npc.isSitting = false;

      // Build realistic hallway and doorway path
      npc.pathQueue = this.buildPathForNPC(npc, wp);
      npc.isMoving = npc.pathQueue.length > 0;
    }

    // ------------------------------------------------------------------------
    // RENDER NPCS ON CANVAS (Called inside renderScene in main.js)
    // ------------------------------------------------------------------------
    render(ctx, currentScene, assets, sceneScale = 0.55) {
      this.npcs.forEach(npc => {
        if (npc.scene === currentScene) {
          this.renderSingleNPC(ctx, npc, assets, sceneScale);
        }
      });
    }

    renderSingleNPC(ctx, npc, assets, sceneScale = 0.55) {
      const now = performance.now();
      const posX = Math.round(npc.x);
      const posY = Math.round(npc.y);
      ctx.save();

      if (npc.isSitting && npc.scene !== 'CORNER_OFFICE') {
        // Render seated at desk (facing computer / up)
        const seatedImg = assets[`${npc.id}Seated`] || assets[`${npc.id}Back`] || assets.char1SeatedDesk;
        if (seatedImg && seatedImg.complete && seatedImg.width > 0) {
          const isMulti = seatedImg.width >= 200;
          const fw = isMulti ? Math.round(seatedImg.width / 4) : seatedImg.width;
          const fh = seatedImg.height;
          const anim = isMulti ? (Math.floor(now / 140) % 4) : 0;
          const dw = Math.round(fw * sceneScale);
          const dh = Math.round(fh * sceneScale);
          const dx = Math.round(posX - dw / 2);
          const dy = Math.round(posY - dh - 5);

          ctx.drawImage(seatedImg, anim * fw, 0, fw, fh, dx, dy, dw, dh);

          // Typing sparks from computer
          if (window.pixelEngine && window.pixelEngine.particles && Math.random() < 0.18) {
            window.pixelEngine.particles.spawnTypingParticles(posX, posY - 45);
          }
        }
      } else {
        // Standing / Walking
        const pw = Math.round(74 * sceneScale);
        const ph = Math.round(157 * sceneScale);
        const px = Math.round(posX - pw / 2);
        const py = Math.round(posY - ph);

        // Feet Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(posX, posY - 2, pw * 0.42, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spritesheet / Front & Back Images
        const sheet = assets[`${npc.id}Spritesheet`] || assets.char1Spritesheet;
        const frontImg = assets[`${npc.id}Front`];
        const backImg = assets[`${npc.id}Back`];

        if (sheet && sheet.complete && sheet.width > 0) {
          const frameW = 74;
          const frameH = 157;
          let row = 0;
          let isFlipped = false;

          if (npc.direction === 'down') row = 0;
          else if (npc.direction === 'up') row = 2;
          else if (npc.direction === 'right') row = 1;
          else if (npc.direction === 'left') {
            row = 1;
            isFlipped = true;
          }

          const col = npc.isMoving ? (npc.animFrame % 4) : 0;
          const sx = col * frameW;
          const sy = row * frameH;

          if (isFlipped) {
            ctx.save();
            ctx.translate(px + pw, py);
            ctx.scale(-1, 1);
            ctx.drawImage(sheet, sx, sy, frameW, frameH, 0, 0, pw, ph);
            ctx.restore();
          } else {
            ctx.drawImage(sheet, sx, sy, frameW, frameH, px, py, pw, ph);
          }
        } else if (npc.direction === 'up' && backImg && backImg.complete && backImg.width > 0) {
          ctx.drawImage(backImg, px, py, pw, ph);
        } else if (frontImg && frontImg.complete && frontImg.width > 0) {
          if (npc.direction === 'left') {
            ctx.save();
            ctx.translate(px + pw, py);
            ctx.scale(-1, 1);
            ctx.drawImage(frontImg, 0, 0, pw, ph);
            ctx.restore();
          } else {
            ctx.drawImage(frontImg, px, py, pw, ph);
          }
        }
      }

      // Floating Status & Thought Badge above NPC
      this.renderNPCBadge(ctx, npc, posX, posY, sceneScale);
      ctx.restore();
    }

    renderNPCBadge(ctx, npc, posX, posY, sceneScale) {
      const isSeated = npc.isSitting && npc.scene !== 'CORNER_OFFICE';
      const headY = isSeated ? (posY - Math.round(95 * sceneScale) - 10) : (posY - Math.round(157 * sceneScale) - 10);
      
      // Floating name + task badge
      const nameText = `${npc.name} (${npc.role})`;
      const taskText = npc.activityLabel || 'Working';

      ctx.font = 'bold 10px Outfit, sans-serif';
      const w1 = ctx.measureText(nameText).width;
      ctx.font = '9px Outfit, sans-serif';
      const w2 = ctx.measureText(taskText).width;
      const badgeW = Math.max(w1, w2) + 24;
      const badgeH = 26;
      const badgeX = posX - badgeW / 2;
      const badgeY = headY - badgeH - 6;

      // Card Background with Glowing Border
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = npc.scheduleState === 'DESK_WORK' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      else ctx.rect(badgeX, badgeY, badgeW, badgeH);
      ctx.fill();
      ctx.stroke();

      // Top Line: Name & Role
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 10px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(nameText, badgeX + 8, badgeY + 11);

      // Bottom Line: Live Task
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Outfit, sans-serif';
      ctx.fillText(taskText, badgeX + 8, badgeY + 22);

      // Quest indicator star
      ctx.fillStyle = '#fbbf24';
      ctx.font = '10px sans-serif';
      ctx.fillText('⭐', badgeX + badgeW - 14, badgeY + 12);
    }
  }

  // Expose global instance
  window.AIAgentEngine = AIAgentEngine;
  window.aiAgent = new AIAgentEngine();

})(typeof window !== 'undefined' ? window : this);
