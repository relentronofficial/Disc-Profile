import { Question, Section, DiscProfile } from "@/types";

export const SECTIONS: Section[] = [
  { label: "Section 1 — Everyday Reactions & Inner World", range: [1, 5] },
  { label: "Section 2 — How You Handle People & Conflict", range: [6, 10] },
  { label: "Section 3 — Business Instinct & Emotional Recovery", range: [11, 15] },
  { label: "Section 4 — Risk, Recognition & Your Vision", range: [16, 20] },
];

export const QUESTIONS: Question[] = [
  {
    id: 1,
    section: 1,
    tag: "DAILY LIFE · MORNING ROUTINE",
    text: "It is 7 AM. You have a full day ahead. What does your morning look like?",
    instruction: "Don't overthink — just pick what feels most natural to you.",
    status: 'active',
    options: {
      A: { text: "I have a quiet routine — tea, a walk maybe. I like to ease into the day peacefully.", disc: "S" },
      B: { text: "I scroll through my phone, reply to messages, and catch up with people I care about.", disc: "I" },
      C: { text: "I am already working. I check yesterday's results and plan my moves for today.", disc: "D" },
      D: { text: "I review my schedule and to-do list to make sure everything is organised before I start.", disc: "C" }
    },
  },
  {
    id: 2,
    section: 1,
    tag: "PEOPLE & RELATIONSHIPS · A FRIEND IN TROUBLE",
    text: "Your close friend calls you upset — their business is struggling badly. What do you do first?",
    instruction: "There is no correct answer here — just go with your gut.",
    status: 'active',
    options: {
      A: { text: "I ask questions to understand exactly what went wrong before suggesting anything.", disc: "C" },
      B: { text: "I sit with them, let them talk it out fully, and just be present without rushing.", disc: "S" },
      C: { text: "I immediately start listing things they should fix and push them to act now.", disc: "D" },
      D: { text: "I listen, empathise, then start energising them — 'You've got this, let's go!'", disc: "I" }
    },
  },
  {
    id: 3,
    section: 1,
    tag: "EVERYDAY STRESS · TRAFFIC JAM",
    text: "You are stuck in Chennai traffic and already 20 minutes late to an important meeting. Your reaction?",
    instruction: "Be honest — what actually goes through your mind?",
    status: 'active',
    options: {
      A: { text: "I feel anxious but stay calm — I focus on breathing and arriving safely.", disc: "S" },
      B: { text: "I mentally plan what I will say when I arrive to explain clearly and professionally.", disc: "C" },
      C: { text: "I text the person something warm or funny so they do not feel bad waiting.", disc: "I" },
      D: { text: "I am frustrated and I call ahead immediately to take control of the situation.", disc: "D" }
    },
  },
  {
    id: 4,
    section: 1,
    tag: "MONEY & RISK · A NEW OPPORTUNITY",
    text: "Someone offers you a business deal — good potential but some risk. You have not thought about it before. What happens inside you?",
    instruction: "Notice your inner reaction, not what you think you should feel.",
    status: 'active',
    options: {
      A: { text: "Scepticism — I want to see the numbers, the plan, and the downside risk.", disc: "C" },
      B: { text: "Curiosity and buzz — I want to tell someone about it and talk it through.", disc: "I" },
      C: { text: "Caution — I want to think about how it affects my current stability first.", disc: "S" },
      D: { text: "Immediate excitement — I am already thinking about how to make it work.", disc: "D" }
    },
  },
  {
    id: 5,
    section: 1,
    tag: "SELF-IMAGE · HOW OTHERS SEE YOU",
    text: "If your closest friends described you in one word, which of these is most likely?",
    instruction: "Ask yourself honestly — not who you want to be, but who you actually are right now.",
    status: 'active',
    options: {
      A: { text: "Driven — they know I always find a way to get what I want.", disc: "D" },
      B: { text: "Reliable — they know I will always be there when it matters.", disc: "S" },
      C: { text: "Thorough — I never miss a detail and I think before I speak.", disc: "C" },
      D: { text: "Fun — I am the one who brings energy and makes things interesting.", disc: "I" }
    },
  },
  {
    id: 6,
    section: 2,
    tag: "LEARNING & GROWTH · WATCHING SOMEONE FAIL",
    text: "You watch a fellow entrepreneur make a mistake you can clearly see. What do you do?",
    instruction: "Go with what you would naturally do, not what is polite.",
    status: 'active',
    options: {
      A: { text: "I wait until they are ready to hear it — I do not want to discourage them.", disc: "S" },
      B: { text: "I share my experience enthusiastically and try to uplift them.", disc: "I" },
      C: { text: "I share a structured observation only if they ask — I do not want to overstep.", disc: "C" },
      D: { text: "I tell them directly — wasting time on a wrong path is worse than a hard truth.", disc: "D" }
    },
  },
  {
    id: 7,
    section: 2,
    tag: "CONFLICT · AN ARGUMENT",
    text: "You disagree with someone during a group discussion. The tension is visible. What do you do?",
    instruction: "This reveals a lot — be honest with yourself.",
    status: 'active',
    options: {
      A: { text: "I hold my ground. I do not back down unless I see clear proof I am wrong.", disc: "D" },
      B: { text: "I soften my position to keep the peace, even if I still partly disagree.", disc: "S" },
      C: { text: "I try to defuse it with humour or energy — I hate heavy tension.", disc: "I" },
      D: { text: "I ask everyone to pause and look at the facts objectively before continuing.", disc: "C" }
    },
  },
  {
    id: 8,
    section: 2,
    tag: "DAILY LIFE · UNEXPECTED FREE TIME",
    text: "You suddenly have an unexpected free afternoon with nothing planned. What do you do?",
    instruction: "Your unplanned moments reveal your true nature.",
    status: 'active',
    options: {
      A: { text: "I rest, watch something I enjoy, or spend quiet time with family.", disc: "S" },
      B: { text: "I call someone or head somewhere social — I do not enjoy being alone for long.", disc: "I" },
      C: { text: "I organise something I have been putting off — my files, plans, or notes.", disc: "C" },
      D: { text: "I fill it immediately — there is always something productive I can do.", disc: "D" }
    },
  },
  {
    id: 9,
    section: 2,
    tag: "MONEY & RISK · SPENDING ON YOURSELF",
    text: "You have just had a good month financially. How do you treat yourself?",
    instruction: "Your relationship with money tells a lot about your mindset.",
    status: 'active',
    options: {
      A: { text: "I allocate it carefully — some saved, some invested, expenses tracked.", disc: "C" },
      B: { text: "I reinvest it straight away — more growth, more resources, more momentum.", disc: "D" },
      C: { text: "I celebrate with people I love — a dinner, a trip, something memorable.", disc: "I" },
      D: { text: "I save most of it — security first, comfort later.", disc: "S" }
    },
  },
  {
    id: 10,
    section: 2,
    tag: "SELF-IMAGE · YOUR DEEPEST FEAR",
    text: "Deep down, what scares you the most in life?",
    instruction: "The most honest question in this assessment. Go with your gut — do not filter.",
    status: 'active',
    options: {
      A: { text: "Being ordinary. Leaving no mark. Having lived without real impact.", disc: "D" },
      B: { text: "Being forgotten. Losing the people and connections that make life meaningful.", disc: "I" },
      C: { text: "Making a serious mistake I could have prevented if I had been more careful.", disc: "C" },
      D: { text: "Losing stability. Not being able to provide safety for my family.", disc: "S" }
    },
  },
  {
    id: 11,
    section: 3,
    tag: "BUSINESS INSTINCT · A SLOW MONTH",
    text: "Your business has a slow month — fewer enquiries, less revenue. What goes through your mind first?",
    instruction: "Your first reaction — not your plan — is what we are looking at.",
    status: 'active',
    options: {
      A: { text: "I go through my data to figure out exactly where the drop came from.", disc: "C" },
      B: { text: "Worry — then I reach out to people in my network to find what I am missing.", disc: "I" },
      C: { text: "Anxiety — but I hold steady and trust that things will stabilise.", disc: "S" },
      D: { text: "Anger at myself — then immediate action. I will not wait for things to improve.", disc: "D" }
    },
  },
  {
    id: 12,
    section: 3,
    tag: "PEOPLE & RELATIONSHIPS · MEETING SOMEONE IMPRESSIVE",
    text: "You meet someone impressive at a business event — smarter and more successful than you. What do you feel?",
    instruction: "Your emotional reaction reveals your inner world.",
    status: 'active',
    options: {
      A: { text: "Warmth and respect — I admire them without feeling threatened.", disc: "S" },
      B: { text: "Genuine excitement — I want to connect with them and learn their story.", disc: "I" },
      C: { text: "Curiosity — I want to understand exactly how they built what they built.", disc: "C" },
      D: { text: "Competitive energy — I want to reach their level or surpass them.", disc: "D" }
    },
  },
  {
    id: 13,
    section: 3,
    tag: "LEARNING & GROWTH · MAKING A MISTAKE",
    text: "You make a significant mistake in your business — a bad decision that costs you money or a client. How do you process it?",
    instruction: "This is about emotional recovery, not strategy.",
    status: 'active',
    options: {
      A: { text: "I move on fast — I feel it briefly, then I am already on the next move.", disc: "D" },
      B: { text: "I analyse it thoroughly — I need to understand every factor before I can move on.", disc: "C" },
      C: { text: "I carry it quietly for a while — it takes time for me to let things go.", disc: "S" },
      D: { text: "I talk about it with someone I trust — getting it out helps me heal.", disc: "I" }
    },
  },
  {
    id: 14,
    section: 3,
    tag: "DAILY LIFE · LEARNING STYLE",
    text: "You want to learn something new for your business. What feels most natural?",
    instruction: "How you learn reflects how you think.",
    status: 'active',
    options: {
      A: { text: "Watch a short video, pick the key insight, and try it immediately.", disc: "D" },
      B: { text: "Go through a full course at my own pace, no rush.", disc: "S" },
      C: { text: "Read articles, take notes, cross-reference — I want depth, not just surface.", disc: "C" },
      D: { text: "Join a live session or community — learning is better with others.", disc: "I" }
    },
  },
  {
    id: 15,
    section: 3,
    tag: "CONFLICT · SAYING NO",
    text: "A client asks for something outside your scope — extra work, no extra pay. What do you do?",
    instruction: "This reveals how you protect your boundaries.",
    status: 'active',
    options: {
      A: { text: "I check my agreement and communicate my policy clearly and professionally.", disc: "C" },
      B: { text: "I likely do it this time — I hate disappointing someone I care about.", disc: "S" },
      C: { text: "I say no clearly and immediately — my time and energy are non-negotiable.", disc: "D" },
      D: { text: "I try to redirect warmly — I want them happy but I also want to keep the relationship.", disc: "I" }
    },
  },
  {
    id: 16,
    section: 4,
    tag: "BUSINESS INSTINCT · SPOTTING A GAP",
    text: "You notice a gap in the market — something nobody in your area is doing well. What happens next?",
    instruction: "Do you act, talk, wait, or plan?",
    status: 'active',
    options: {
      A: { text: "I get excited and start telling people — testing the idea out loud.", disc: "I" },
      B: { text: "I research it systematically — competition, margins, demand — before I commit.", disc: "C" },
      C: { text: "I am already mentally calculating how to enter that market as fast as possible.", disc: "D" },
      D: { text: "I observe it carefully for a while before deciding to do anything.", disc: "S" }
    },
  },
  {
    id: 17,
    section: 4,
    tag: "SELF-IMAGE · BEING PRAISED",
    text: "Someone publicly praises your work in a group setting. How do you feel inside?",
    instruction: "Your relationship with recognition is deeply personal.",
    status: 'active',
    options: {
      A: { text: "Pleased, but I immediately wonder if it is accurate and well-founded.", disc: "C" },
      B: { text: "Genuinely happy — I love being acknowledged and I will return the energy.", disc: "I" },
      C: { text: "Grateful but a little uncomfortable — I prefer private appreciation.", disc: "S" },
      D: { text: "Good — but only if the results actually earned it. Empty praise means nothing.", disc: "D" }
    },
  },
  {
    id: 18,
    section: 4,
    tag: "MONEY & RISK · A BIG INVESTMENT",
    text: "You are considering spending Rs. 50,000 on a business tool or course. You are not 100% sure it will work. What do you do?",
    instruction: "Notice what you feel, not just what you calculate.",
    status: 'active',
    options: {
      A: { text: "If it could accelerate results, I pay and move — hesitation is the real cost.", disc: "D" },
      B: { text: "I wait until I feel more certain — I do not like financial uncertainty.", disc: "S" },
      C: { text: "I research reviews, ROI data, and alternatives before committing.", disc: "C" },
      D: { text: "I ask people who have tried it, get their vibe, then decide based on trust.", disc: "I" }
    },
  },
  {
    id: 19,
    section: 4,
    tag: "PEOPLE & RELATIONSHIPS · LEADING A GROUP",
    text: "You are part of a group project and nobody is stepping up to lead. What do you do?",
    instruction: "Leadership instinct shows up without thinking.",
    status: 'active',
    options: {
      A: { text: "I support whoever is willing to lead — I work well in the background.", disc: "S" },
      B: { text: "I suggest a clear process and structure before anyone moves.", disc: "C" },
      C: { text: "I naturally step in and start directing — someone has to do it.", disc: "D" },
      D: { text: "I start energising the group, get everyone talking and motivated.", disc: "I" }
    },
  },
  {
    id: 20,
    section: 4,
    tag: "BUSINESS INSTINCT · YOUR ENDGAME",
    text: "Five years from now — your business is going well. Close your eyes. What does that picture actually look like?",
    instruction: "This is about your heart, not your strategy. What truly matters to you?",
    status: 'active',
    options: {
      A: { text: "I have a community of people whose lives I have genuinely changed. They love what I do.", disc: "I" },
      B: { text: "My family is secure, my business is stable, and I sleep well at night.", disc: "S" },
      C: { text: "I am the dominant player in my space. People know my name and respect what I built.", disc: "D" },
      D: { text: "Everything runs like clockwork — my systems are so good the business almost runs itself.", disc: "C" }
    },
  },
];

export const EMPLOYEE_QUESTIONS: Question[] = [
  {
    "id": 21,
    "section": 1,
    "tag": "TEAMWORK · A TEAMMATE NEEDS HELP",
    "text": "It is 9 AM on a regular working day. The team is settling in. What do you do first?",
    "instruction": "Pick what you naturally do — not what you feel you should do.",
    "status": "active",
    options: {
      A: {
        "text": "I quietly settle in, review my to-do list, and ease into my first task at a steady pace.",
        "disc": "S"
      },
      B: {
        "text": "I check targets, open tasks, and immediately start working on the most important one.",
        "disc": "D"
      },
      C: {
        "text": "I review yesterday&apos;s progress notes and plan today carefully before starting anything.",
        "disc": "C"
      },
      D: {
        "text": "I say good morning to teammates, catch up briefly, then open my work.",
        "disc": "I"
      }
    }
  },
  {
    "id": 22,
    "section": 1,
    "tag": "COMMUNICATION · A TEAM MEETING",
    "text": "A colleague is struggling with a task and asks for your help during a busy time. What do you do?",
    "instruction": "Be honest — what actually happens, not what looks best.",
    "status": "active",
    options: {
      A: {
        "text": "colleague is struggling with a task and asks for your help during a busy time. What do you do?",
        "disc": "D"
      },
      B: {
        "text": "I ask a few clarifying questions first so I understand the problem properly before helping.",
        "disc": "C"
      },
      C: {
        "text": "I pause my work and help them fully — I would not leave someone stuck.",
        "disc": "S"
      },
      D: {
        "text": "I sit with them, help enthusiastically, and make sure they feel supported before leaving.",
        "disc": "I"
      }
    }
  },
  {
    "id": 23,
    "section": 1,
    "tag": "WORK STYLE · RECEIVING A NEW TASK",
    "text": "Your team has a weekly meeting. How do you typically participate?",
    "instruction": "Think about your last few meetings — what is your honest pattern",
    "status": "active",
    options: {
      A: {
        "text": "I come prepared with points, I speak up directly, and I try to keep the meeting focused.",
        "disc": "D"
      },
      B: {
        "text": "I enjoy the discussion, contribute ideas, and often help lighten the mood when things get serious.",
        "disc": "I"
      },
      C: {
        "text": "I come with notes, reference data or past decisions, and speak when I have something precise to add.",
        "disc": "C"
      },
      D: {
        "text": "I listen more than I speak. I share my thoughts when I am directly asked or when I am sure.",
        "disc": "S"
      }
    }
  },
  {
    "id": 24,
    "section": 1,
    "tag": "DAILY WORK · WORKING INDEPENDENTLY VS TOGETHER",
    "text": "Your manager assigns you a new task with a tight deadline. You have not done this before. How do you respond?",
    "instruction": "Your first internal reaction — not your professional answer to the manager.",
    "status": "active",
    options: {
      A: {
        "text": "I feel some anxiety, but I take it step by step and focus on not letting anyone down.",
        "disc": "S"
      },
      B: {
        "text": "I start immediately. I will figure it out as I go — I work best under pressure.",
        "disc": "D"
      },
      C: {
        "text": "I ask if anyone on the team has done it before and can give me a quick walkthrough.",
        "disc": "I"
      },
      D: {
        "text": "I take 15 minutes to read everything available before I touch the task.",
        "disc": "C"
      }
    }
  },
  {
    "id": 25,
    "section": 1,
    "tag": "STRESS · A DIFFICULT DAY AT WORK",
    "text": "For a full working day, which would you prefer?",
    "instruction": "Be honest about what energises you, not what looks more professional.",
    "status": "active",
    options: {
      A: {
        "text": "Working alone on a high-priority project with clear targets — no interruptions.",
        "disc": "D"
      },
      B: {
        "text": "Deep focus work with structured check-ins at defined points — alone but accountable.",
        "disc": "C"
      },
      C: {
        "text": "Quietly working alongside the team — present but not constantly interacting.",
        "disc": "S"
      },
      D: {
        "text": "A mix of meetings, collaboration, and team energy throughout the day.",
        "disc": "I"
      }
    }
  },
  {
    "id": 26,
    "section": 1,
    "tag": "FEEDBACK · RECEIVING CRITICISM",
    "text": "You are having a genuinely difficult day — things are not going right. What do you do?",
    "instruction": "Notice your honest coping pattern, not your ideal response.",
    "status": "active",
    options: {
      A: {
        "text": "I talk to a teammate or friend — getting it out loud helps me reset.",
        "disc": "I"
      },
      B: {
        "text": "I take it quietly, do not show it much, and focus on getting through the day safely.",
        "disc": "S"
      },
      C: {
        "text": "I step back, identify exactly what went wrong, and make a structured plan to fix it.",
        "disc": "C"
      },
      D: {
        "text": "I push through and work harder. I do not slow down until the problem is solved.",
        "disc": "D"
      }
    }
  },
  {
    "id": 27,
    "section": 1,
    "tag": "IMAGE · HOW YOUR TEAMMATES SEE YOU",
    "text": "Your manager gives you critical feedback on your work in front of the team. How do you feel and what do you do?",
    "instruction": "Your real internal experience — not your professional face.",
    "status": "active",
    options: {
      A: {
        "text": "I listen, accept what is valid, and immediately think about how to fix it and move on.",
        "disc": "D"
      },
      B: {
        "text": "I feel hurt but try not to show it — I focus on the relationship and keeping things warm.",
        "disc": "I"
      },
      C: {
        "text": "I feel it deeply, take it home with me, and process it slowly before I can respond fully.",
        "disc": "S"
      },
      D: {
        "text": "I want to understand exactly what was wrong and why — I need the full picture before I can act.",
        "disc": "C"
      }
    }
  },
  {
    "id": 28,
    "section": 1,
    "tag": "CONFLICT · A DISAGREEMENT WITH A COLLEAGUE",
    "text": "If your closest colleague had to describe you to a new team member, which would they most likely say?",
    "instruction": "Ask yourself what they would honestly say, not what you would want them to say.",
    "status": "active",
    options: {
      A: {
        "text": "Careful — they think it through and always know what they are talking about.",
        "disc": "C"
      },
      B: {
        "text": "Dependable — always shows up and never lets anyone down.",
        "disc": "S"
      },
      C: {
        "text": "Positive — the one who keeps the team&apos;s energy up.",
        "disc": "I"
      },
      D: {
        "text": "Determined — when they want something done, they want it.",
        "disc": "D"
      }
    }
  },
  {
    "id": 29,
    "section": 2,
    "tag": "PRESSURE · A HIGH",
    "text": "You and a colleague strongly disagree about how to complete a shared task. Neither of you is backing down. What happens?",
    "instruction": "This reveals how you handle tension — be honest.",
    "status": "active",
    options: {
      A: {
        "text": "I try to find common ground and keep the conversation warm — I hate unnecessary conflict.",
        "disc": "I"
      },
      B: {
        "text": "I suggest we pause, look at the facts together, and decide based on what the data supports.",
        "disc": "C"
      },
      C: {
        "text": "I soften my position to maintain the relationship, even if I still privately disagree.",
        "disc": "S"
      },
      D: {
        "text": "I hold my position. I will only change my view if I see clear evidence that I am wrong.",
        "disc": "D"
      }
    }
  },
  {
    "id": 30,
    "section": 2,
    "tag": "PEOPLE · A STRUGGLING COLLEAGUE",
    "text": "The team is under intense deadline pressure. Two hours left. Not everything will be done. What do you do?",
    "instruction": "What actually happens inside you — and what do you actually do",
    "status": "active",
    options: {
      A: {
        "text": "I rally the team, keep morale up, and push everyone forward with energy and encouragement.",
        "disc": "I"
      },
      B: {
        "text": "I take charge, cut non-essentials, and make fast decisions to deliver the most important things.",
        "disc": "D"
      },
      C: {
        "text": "I stay calm, keep doing my part, and trust that if we all hold steady we will get through.",
        "disc": "S"
      },
      D: {
        "text": "I quickly assess what is left, prioritise what matters most, and communicate the plan clearly.",
        "disc": "C"
      }
    }
  },
  {
    "id": 31,
    "section": 2,
    "tag": "FEEDBACK · GIVING DIFFICULT FEEDBACK",
    "text": "You notice a colleague has been quiet, less engaged, and seems to be struggling. Nobody else has mentioned it. What do you do?",
    "instruction": "What would you naturally do — not what the company expects.",
    "status": "active",
    options: {
      A: {
        "text": "I approach them privately, check in warmly, and genuinely try to understand what is going on.",
        "disc": "I"
      },
      B: {
        "text": "I make sure to include them more, invite them for tea or lunch, and let them know I am there.",
        "disc": "S"
      },
      C: {
        "text": "I probably focus on my own work unless it is directly affecting team output.",
        "disc": "D"
      },
      D: {
        "text": "I observe for a few more days to understand the pattern before deciding whether to say something.",
        "disc": "C"
      }
    }
  },
  {
    "id": 32,
    "section": 2,
    "tag": "RECOGNITION · BEING PUBLICLY PRAISED",
    "text": "You notice a teammate making a repeated mistake that is affecting the team&apos;s work. What do you do?",
    "instruction": "Your natural reaction — not the &apos;correct&apos; HR answer.",
    "status": "active",
    options: {
      A: {
        "text": "I tell them directly and quickly — it is kinder than letting it continue.",
        "disc": "D"
      },
      B: {
        "text": "I document the pattern first, then share specific examples so the feedback is clear and undeniable.",
        "disc": "C"
      },
      C: {
        "text": "I wait for the right moment and the right words — I would rather take longer than hurt them.",
        "disc": "S"
      },
      D: {
        "text": "I bring it up gently and frame it positively — I want them to improve without feeling attacked.",
        "disc": "I"
      }
    }
  },
  {
    "id": 33,
    "section": 2,
    "tag": "WORK STYLE · UNEXPECTED CHANGE",
    "text": "At the team&apos;s monthly review, your manager praises your work in front of everyone. How do you feel?",
    "instruction": "Your genuine internal experience.",
    "status": "active",
    options: {
      A: {
        "text": "Satisfied — if it was earned. Praise without results means nothing to me.",
        "disc": "D"
      },
      B: {
        "text": "Genuinely happy and energised — I love that the team sees it and I will return the energy.",
        "disc": "I"
      },
      C: {
        "text": "Pleased, but I immediately wonder if every detail they mentioned was actually accurate.",
        "disc": "C"
      },
      D: {
        "text": "Grateful but slightly uncomfortable — I prefer private appreciation over public attention.",
        "disc": "S"
      }
    }
  },
  {
    "id": 34,
    "section": 2,
    "tag": "LEADERSHIP · NOBODY IS STEPPING UP",
    "text": "The management announces a significant change to how your team works — new process, new structure, new roles. Your immediate reaction?",
    "instruction": "Your honest inner response, before the professional one.",
    "status": "active",
    options: {
      A: {
        "text": "I ask detailed questions immediately — I want to understand the reasoning and the implications fully.",
        "disc": "C"
      },
      B: {
        "text": "I think about how to position myself well in the new structure and what advantage I can take.",
        "disc": "D"
      },
      C: {
        "text": "I talk to teammates about how they feel and help everyone process the change together.",
        "disc": "I"
      },
      D: {
        "text": "I feel unsettled — I need time to absorb it before I can be enthusiastic about it.",
        "disc": "S"
      }
    }
  },
  {
    "id": 35,
    "section": 2,
    "tag": "BOUNDARIES · BEING ASKED TO DO MORE THAN YOUR JOB",
    "text": "Your team is given a project and nobody naturally steps forward to lead it. What do you do?",
    "instruction": "Leadership instinct shows up without thinking — what happens in you",
    "status": "active",
    options: {
      A: {
        "text": "I try to get the energy going, encourage someone else to lead, and support them fully.",
        "disc": "I"
      },
      B: {
        "text": "I step forward. Someone has to, and I am not comfortable watching things drift.",
        "disc": "D"
      },
      C: {
        "text": "I suggest a process: clarify the scope first, then decide who is best placed to lead.",
        "disc": "C"
      },
      D: {
        "text": "I wait to see if someone else steps up — I am comfortable supporting more than leading.",
        "disc": "S"
      }
    }
  },
  {
    "id": 36,
    "section": 2,
    "tag": "LEARNING · NEW SKILL OR TRAINING",
    "text": "A senior colleague asks you to help with something outside your job scope — and it will take significant time. What do you do?",
    "instruction": "How you really respond, not how you should.",
    "status": "active",
    options: {
      A: {
        "text": "I check my current workload and responsibilities first, then respond with a clear position.",
        "disc": "C"
      },
      B: {
        "text": "I likely say yes — I find it very difficult to disappoint someone who is asking sincerely.",
        "disc": "S"
      },
      C: {
        "text": "senior colleague asks you to help with something outside your job scope — and it will take significant time. What do you do? How you really respond, not how you should. A   I assess if it is worth my time and either agree quickly or say no clearly — no long discussion.",
        "disc": "D"
      },
      D: {
        "text": "I try to help because I like supporting people — but I make it warm, not transactional.",
        "disc": "I"
      }
    }
  },
  {
    "id": 37,
    "section": 3,
    "tag": "MISTAKES · WHEN YOU GET SOMETHING WRONG",
    "text": "Tamil Business Tribe gives you access to a new training programme relevant to your role. How do you approach it?",
    "instruction": "How you actually engage with learning — not how you feel you should.",
    "status": "active",
    options: {
      A: {
        "text": "I enjoy it most if it is live or with others — I learn better in an interactive environment.",
        "disc": "I"
      },
      B: {
        "text": "I skim quickly for the most actionable insights and apply them immediately.",
        "disc": "D"
      },
      C: {
        "text": "I go through it at my own pace, without rushing, making sure I absorb each part fully.",
        "disc": "S"
      },
      D: {
        "text": "I take structured notes, look up supporting material, and want to understand the full context.",
        "disc": "C"
      }
    }
  },
  {
    "id": 38,
    "section": 3,
    "tag": "GOALS · YOUR AMBITION AT WORK",
    "text": "You make a mistake at work that causes a visible problem for the team. How do you process it?",
    "instruction": "This is about emotional experience, not just what you do externally.",
    "status": "active",
    options: {
      A: {
        "text": "I carry it for a while. It sits with me until I feel certain it has been fully resolved.",
        "disc": "S"
      },
      B: {
        "text": "I talk to someone I trust about it — getting it out helps me process and move forward.",
        "disc": "I"
      },
      C: {
        "text": "I acknowledge it fast, fix what I can, and move on — I do not dwell.",
        "disc": "D"
      },
      D: {
        "text": "I go back through every step to understand exactly what caused it before I can truly let it go.",
        "disc": "C"
      }
    }
  },
  {
    "id": 39,
    "section": 3,
    "tag": "CREATIVITY · SOLVING A PROBLEM",
    "text": "What drives you most when it comes to your work at Tamil Business Tribe?",
    "instruction": "What actually motivates you — not what sounds most professional.",
    "status": "active",
    options: {
      A: {
        "text": "Achieving results, hitting targets, and being recognised as someone who gets things done.",
        "disc": "D"
      },
      B: {
        "text": "Stability, a consistent rhythm, and knowing that my contribution is trusted and valued.",
        "disc": "S"
      },
      C: {
        "text": "Building great relationships and being part of a team that genuinely enjoys working together.",
        "disc": "I"
      },
      D: {
        "text": "Producing excellent, accurate work that I am proud of and that meets a high standard.",
        "disc": "C"
      }
    }
  },
  {
    "id": 40,
    "section": 3,
    "tag": "INITIATIVE · SPOTTING SOMETHING THAT COULD BE IMPROVED",
    "text": "Your team faces a problem nobody has a ready answer for. How do you engage?",
    "instruction": "What your natural problem-solving style looks like.",
    "status": "active",
    options: {
      A: {
        "text": "I research how similar problems have been solved elsewhere before proposing anything.",
        "disc": "C"
      },
      B: {
        "text": "I brainstorm out loud with the team — the best ideas come from open conversation.",
        "disc": "I"
      },
      C: {
        "text": "I jump in with the fastest viable option — we can refine as we go.",
        "disc": "D"
      },
      D: {
        "text": "I take my time to think before contributing — I want to suggest something that actually works.",
        "disc": "S"
      }
    }
  },
  {
    "id": 41,
    "section": 3,
    "tag": "WORKLOAD · HANDLING TOO MUCH AT ONCE",
    "text": "You notice that a regular process at Tamil Business Tribe could be done better. Nobody has asked you to fix it. What do you do?",
    "instruction": "Do you act, suggest, wait, or analyse",
    "status": "active",
    options: {
      A: {
        "text": "I raise it with the team in a casual way — test the idea and build some excitement before formalising it.",
        "disc": "I"
      },
      B: {
        "text": "I document the current process, map the improvement, and present it with a clear proposal.",
        "disc": "C"
      },
      C: {
        "text": "I address it directly — I cannot watch something be done inefficiently without doing something about it.",
        "disc": "D"
      },
      D: {
        "text": "I mention it to my manager and wait for their direction before changing anything.",
        "disc": "S"
      }
    }
  },
  {
    "id": 42,
    "section": 3,
    "tag": "REFLECTION · YOUR BIGGEST PROFESSIONAL FEAR",
    "text": "You have more on your plate than you can realistically finish this week. What happens?",
    "instruction": "Your honest response — not your ideal professional response.",
    "status": "active",
    options: {
      A: {
        "text": "I feel the weight of it but I stay steady and try not to show others how stretched I am.",
        "disc": "S"
      },
      B: {
        "text": "I talk to my manager or team — I want to problem-solve it together rather than struggle alone.",
        "disc": "I"
      },
      C: {
        "text": "I prioritise hard, cut what is not critical, and push through. I will deliver what matters.",
        "disc": "D"
      },
      D: {
        "text": "I make a detailed list, estimate time for each task, and communicate clearly what is realistic.",
        "disc": "C"
      }
    }
  },
  {
    "id": 43,
    "section": 3,
    "tag": "VALUES · WHAT MATTERS MOST TO YOU AT WORK",
    "text": "Thinking honestly about your professional life — what worries you most?",
    "instruction": "Go with what genuinely sits in you, not what sounds humble or ambitious.",
    "status": "active",
    options: {
      A: {
        "text": "Losing good relationships at work. The team dynamic breaking down.",
        "disc": "I"
      },
      B: {
        "text": "Not achieving enough.",
        "disc": "D"
      },
      C: {
        "text": "Losing the stability and security of a role I know and do well.",
        "disc": "S"
      },
      D: {
        "text": "Making a serious error that undermines trust in my quality of work.",
        "disc": "C"
      }
    }
  },
  {
    "id": 44,
    "section": 4,
    "tag": "FUTURE · YOUR DREAM ROLE IN",
    "text": "If you had to choose just one, which matters most to you in your work environment?",
    "instruction": "Your gut answer — not the answer that sounds most balanced.",
    "status": "active",
    options: {
      A: {
        "text": "Connection — a team that genuinely cares about each other and has fun together.",
        "disc": "I"
      },
      B: {
        "text": "Harmony — a team where people are kind, consistent, and nobody feels left behind.",
        "disc": "S"
      },
      C: {
        "text": "Results — a team that produces real outcomes and does not make excuses.",
        "disc": "D"
      },
      D: {
        "text": "Excellence — a team that does things properly, with quality and attention to detail.",
        "disc": "C"
      }
    }
  },
  {
    "id": 45,
    "section": 4,
    "tag": "CULTURE · HOW YOU DEFINE A GREAT WORKPLACE",
    "text": "Three years from now, if things go well at Tamil Business Tribe, what does your professional life look like?",
    "instruction": "What genuinely excites you — not what sounds most strategic.",
    "status": "active",
    options: {
      A: {
        "text": "I have a stable, respected role where I do what I do well and am genuinely valued for it.",
        "disc": "S"
      },
      B: {
        "text": "I have deep expertise in my area and I am the person others come to when they need it done right.",
        "disc": "C"
      },
      C: {
        "text": "I am deeply embedded in the culture, trusted by everyone, and a key connector across teams.",
        "disc": "I"
      },
      D: {
        "text": "I am leading a team, driving key results, and my impact is clearly visible in the organisation.",
        "disc": "D"
      }
    }
  },
  {
    "id": 46,
    "section": 4,
    "tag": "CONTRIBUTION · HOW YOU ADD VALUE TO THE TEAM",
    "text": "What does a great workplace feel like to you?",
    "instruction": "Your honest definition — not the one from a job description.",
    "status": "active",
    options: {
      A: {
        "text": "Fast-moving, ambitious, where effort is rewarded and people are held accountable.",
        "disc": "D"
      },
      B: {
        "text": "Stable and trustworthy — clear expectations, fair treatment, and no unnecessary drama.",
        "disc": "S"
      },
      C: {
        "text": "Warm, social, where people genuinely enjoy each other and feel seen as human beings.",
        "disc": "I"
      },
      D: {
        "text": "Organised and professional — high standards, clear processes, and work done properly.",
        "disc": "C"
      }
    }
  },
  {
    "id": 47,
    "section": 4,
    "tag": "LOYALTY · WHEN THINGS ARE HARD",
    "text": "In which of these ways do you feel you add the most value to Tamil Business Tribe?",
    "instruction": "What you genuinely believe — based on how you are, not how you wish to be.",
    "status": "active",
    options: {
      A: {
        "text": "I raise the standard. I bring quality, accuracy, and thoroughness that others rely on.",
        "disc": "C"
      },
      B: {
        "text": "I energise the team. I bring positivity, ideas, and human connection to the work.",
        "disc": "I"
      },
      C: {
        "text": "I drive things. When something needs to get done, I make it happen.",
        "disc": "D"
      },
      D: {
        "text": "I hold the team together. I am consistent, dependable, and always there when needed.",
        "disc": "S"
      }
    }
  },
  {
    "id": 48,
    "section": 4,
    "tag": "IDENTITY · HOW YOU SEE YOURSELF AS A PROFESSIONAL",
    "text": "Tamil Business Tribe goes through a genuinely difficult period — team stress, resource constraints, uncertain future. What describes you best?",
    "instruction": "What you actually do when organisations face difficulty.",
    "status": "active",
    options: {
      A: {
        "text": "I stay close to the team, keep morale up, and make sure people feel connected and seen.",
        "disc": "I"
      },
      B: {
        "text": "I stay quiet, stay steady, and keep showing up — reliability is my contribution in hard times.",
        "disc": "S"
      },
      C: {
        "text": "I look for what I can control, make fast decisions, and stay focused on outcomes.",
        "disc": "D"
      },
      D: {
        "text": "I try to understand the full situation clearly before deciding how to respond or what to do.",
        "disc": "C"
      }
    }
  },
  {
    "id": 49,
    "section": 4,
    "tag": "FINAL REFLECTION · YOUR HONEST ANSWER",
    "text": "When you think about the kind of professional you are becoming, which of these resonates most deeply?",
    "instruction": "Not who you aspire to be — who you actually are right now.",
    "status": "active",
    options: {
      A: {
        "text": "A person who connects. People remember how they felt working with me.",
        "disc": "I"
      },
      B: {
        "text": "A person who gets results. Determined, focused, and not easily derailed.",
        "disc": "D"
      },
      C: {
        "text": "A person who is thorough. I do not cut corners and I do not let things slip.",
        "disc": "C"
      },
      D: {
        "text": "A person who is trusted. I am the one people count on when it matters.",
        "disc": "S"
      }
    }
  },
  {
    "id": 50,
    "section": 4,
    "tag": "·  HR &",
    "text": "Close your eyes for a moment. You have just been told you did an exceptional job — that Tamil Business Tribe is genuinely better because of you. What specifically did you do?",
    "instruction": "Your deepest answer. The one that comes before you have time to think.",
    "status": "active",
    options: {
      A: {
        "text": "I was there. Consistently, quietly, dependably — people trusted me with what mattered.",
        "disc": "S"
      },
      B: {
        "text": "I delivered results nobody else thought were possible. I moved fast and I made things happen.",
        "disc": "D"
      },
      C: {
        "text": "I built relationships and a culture where people felt genuinely seen, heard, and motivated.",
        "disc": "I"
      },
      D: {
        "text": "I built something excellent. Every detail was right. The quality speaks for itself.",
        "disc": "C"
      }
    }
  }
];

export const DISC_PROFILES: Record<string, DiscProfile> = {
  D: {
    letter: "D",
    name: "Dominant",
    nickname: "The Fire Starter",
    color: "#c94c4c",
    dimColor: "rgba(201,76,76,0.12)",
    edge: "You take action when others are still thinking. That gap between decision and execution is your advantage over 90% of entrepreneurs.",
    pattern: "You carry urgency like oxygen. Slowing down feels like dying. You process pain quickly and move on — sometimes too quickly to learn from it.",
    watch: "You move so fast that you sometimes break trust — with your team, your clients, and yourself. Your biggest enemy is not the market. It is the version of you that burns bridges while building empires.",
    prescription: "Your weapon is boldness — but boldness without consistency is just noise. Pick one offer, one audience, one message. Do it every single day for 90 days. Tamil Business Tribe will help you build the system that matches your speed without losing your people.",
    traits: {
      summary: "High initiative, result-oriented, and naturally takes control of situations.",
      communication: "Direct, brief, and focuses on 'what' rather than 'how'.",
      decisionMaking: "Fast and decisive, often prioritizing speed over consensus.",
      stressResponse: "Becomes demanding or blunt under pressure.",
      leadership: "Commanding and goal-driven, expects results quickly.",
      growth: "Learning to listen more and valuing the process as much as the outcome.",
    },
  },
  I: {
    letter: "I",
    name: "Influential",
    nickname: "The Heartbeat",
    color: "#c9a84c",
    dimColor: "rgba(201,168,76,0.12)",
    edge: "You can build audiences that competitors cannot buy with money. Loyalty follows your energy, your warmth, and your story.",
    pattern: "You think out loud. Connection charges you completely. Loneliness drains you faster than anything else. You feel everything — highs and lows — more intensely than most.",
    watch: "You start ten things and finish three. Your emotional highs and lows affect your business consistency in ways you may not realise. The clients who love you most are often waiting on follow-ups you forgot about.",
    prescription: "Your weapon is storytelling — but stories need a system behind them. Build one content schedule, one WhatsApp follow-up sequence, and one referral ask you give every happy client. Tamil Business Tribe will help you systematise what you already do naturally.",
    traits: {
      summary: "Enthusiastic, optimistic, and highly skilled at building relationships.",
      communication: "Expressive, persuasive, and focuses on people and emotions.",
      decisionMaking: "Influenced by gut feeling and the impact on people.",
      stressResponse: "May become overly emotional or disorganized under pressure.",
      leadership: "Inspiring and democratic, leads through motivation.",
      growth: "Focusing on follow-through and organizational consistency.",
    },
  },
  S: {
    letter: "S",
    name: "Steady",
    nickname: "The Quiet Root",
    color: "#4cad7a",
    dimColor: "rgba(76,173,122,0.12)",
    edge: "Client retention is your superpower. People stay with you for years because they trust you at a level that goes beyond the product or service.",
    pattern: "You carry other people's weight quietly and without complaint. Peace matters to you more than most people around you realise. You recover slowly from disappointment.",
    watch: "You are likely underpricing yourself and over-delivering without being asked. You say yes when you mean no. You wait to be invited when you should be leading.",
    prescription: "Your weapon is referrals — but you need to ask for them out loud. Set a rule: after every positive client interaction, ask for one referral. Just one. Tamil Business Tribe will help you build the confidence and the script to ask without feeling like you are imposing.",
    traits: {
      summary: "Patient, reliable, and deeply committed to group harmony.",
      communication: "Gentle, listening-oriented, and prefers calm environments.",
      decisionMaking: "Methodical and slow, seeks security and consensus.",
      stressResponse: "May become passive or resistant to change when stressed.",
      leadership: "Supportive and collaborative, a true servant leader.",
      growth: "Learning to set boundaries and take decisive risks.",
    },
  },
  C: {
    letter: "C",
    name: "Conscientious",
    nickname: "The Architect",
    color: "#4c82c9",
    dimColor: "rgba(76,130,201,0.12)",
    edge: "You build things that actually work. No corners cut, no promises broken, no shortcuts that come back to hurt you later.",
    pattern: "You need to understand things fully before you can trust them. That depth is both your greatest gift and your most persistent barrier. You are harder on yourself than anyone else ever is.",
    watch: "You are probably sitting on ideas, products, or offers that are 80% ready but have not launched because they are not 100% perfect yet. Perfection is procrastination wearing a professional mask.",
    prescription: "Your weapon is authority content — detailed, accurate, educational posts that make people trust you before they ever meet you. But set one rule: if something is 70% ready, it launches. Tamil Business Tribe will push you to execute, not just plan.",
    traits: {
      summary: "Analytical, precise, and high standard for quality and accuracy.",
      communication: "Fact-based, detailed, and prefers written clarity.",
      decisionMaking: "Evidence-driven, needs all data before committing.",
      stressResponse: "Becomes overly critical or withdrawn under pressure.",
      leadership: "Quality-focused and structured, leads through expertise.",
      growth: "Learning that 'done is better than perfect' and trusting intuition.",
    },
  },
};

export const BLEND_TITLES: Record<string, string> = {
  "DI": "The Dynamic Achiever",
  "ID": "The Charismatic Leader",
  "DS": "The Practical Driving Force",
  "SD": "The Reliable Strategist",
  "DC": "The Strategic Executor",
  "CD": "The Precise Architect",
  "IS": "The Compassionate Connector",
  "SI": "The Supportive Energizer",
  "IC": "The Persuasive Analyst",
  "CI": "The Systematic Communicator",
  "SC": "The Quality-Focused Partner",
  "CS": "The Detail-Oriented Anchor",
  "Balanced": "The Adaptive All-Rounder"
};
