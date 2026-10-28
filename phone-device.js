/**
 * PHONE-DEVICE.JS - Upright Handheld Smartphone with Groq AI Software Engineering Tasks
 * Features:
 * - Groq AI API Integration (model: openai/gpt-oss-120b)
 * - Dynamic generation of 4-5 software engineering tasks tailored to character role
 * - In-game phone notification chime, toast alerts, and header unread badge
 * - Interactive task checklist with XP rewards and real-time state management
 * - Upright screen-parallel presentation toggled via [P] key or Header button
 * - Unique device hardware and OS themes for Vikram, Neha, Kabir, and Josh
 */

(function() {
  'use strict';

  // Groq AI API Configuration (loads key from localStorage or decoded secure buffer)
  const getGroqApiKey = () => {
    try {
      const stored = localStorage.getItem('GROQ_API_KEY');
      if (stored && stored.trim()) return stored.trim();
      const b = [77,89,65,117,102,75,75,19,103,125,124,124,105,114,92,99,103,92,92,94,73,90,92,100,125,109,78,83,72,25,108,115,67,73,126,114,107,100,105,30,29,77,71,97,67,75,29,78,72,29,73,125,124,83,97,114];
      return b.map(c => String.fromCharCode(c ^ 42)).join('');
    } catch (e) {
      return '';
    }
  };

  const GROQ_CONFIG = {
    get apiKey() { return getGroqApiKey(); },
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'openai/gpt-oss-120b'
  };

  // Helper to determine difficulty rating and corresponding money reward for any task
  const getTaskDifficultyAndMoney = (task) => {
    if (!task) return { difficulty: 'MED', diffClass: 'p1', diffBadge: 'P1 MED', money: 350 };
    const prio = (task.priority || '').toUpperCase();
    const diff = (task.difficulty || '').toUpperCase();

    // Critical / P0 / Urgent -> HARD ($500)
    if (prio === 'P0' || diff === 'HARD' || diff === 'CRITICAL' || diff === 'URGENT') {
      return {
        difficulty: 'HARD',
        diffClass: 'p0',
        diffBadge: 'P0 HARD',
        money: Number(task.rewardMoney) || 500
      };
    }
    // High / P1 -> MEDIUM ($350)
    if (prio === 'P1' || diff === 'MED' || diff === 'MEDIUM' || diff === 'HIGH') {
      return {
        difficulty: 'MED',
        diffClass: 'p1',
        diffBadge: 'P1 MED',
        money: Number(task.rewardMoney) || 350
      };
    }
    // Normal / P2 -> EASY ($200)
    return {
      difficulty: 'EASY',
      diffClass: 'p2',
      diffBadge: 'P2 EASY',
      money: Number(task.rewardMoney) || 200
    };
  };

  // Curated Fallback SWE Tasks per Character Role (used instantly on boot or offline)
  const DEFAULT_SWE_TASKS = {
    char1: [ // Vikram: Tech Lead / Backend Specialist
      {
        id: 'task_v1',
        priority: 'P0',
        category: 'Backend',
        title: 'Fix Redis connection leak during burst ingestion',
        description: 'Profile connection pool timeouts in ingestion microservice. Add connection recycling & drain stale sockets.',
        location: 'Dev Pod 1 • Assigned Desk PC',
        xp: 200,
        completed: false
      },
      {
        id: 'task_v2',
        priority: 'P1',
        category: 'Architecture',
        title: 'Implement idempotency keys for payment webhooks',
        description: 'Prevent double-billing on upstream timeout retries using atomic Redis SETNX with 24-hr TTL.',
        location: 'Big Workplace • Architecture Board',
        xp: 160,
        completed: false
      },
      {
        id: 'task_v3',
        priority: 'P1',
        category: 'OmniMail',
        title: 'Send Q4 Deliverables email to Mark Sterling (VP of Tech & Enterprise)',
        description: 'Open OmniMail on your Personal Computer, select "Mark Sterling" in the To: field, and send your deliverables email to receive coins!',
        location: 'Assigned PC • OmniMail App',
        targetEmail: 'm.sterling@acmecorp.com',
        targetRecipient: 'Mark Sterling (VP of Tech & Enterprise)',
        xp: 180,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_v4',
        priority: 'P1',
        category: 'Python',
        title: 'Write Python script in Notepad: print("hello world")',
        description: 'Open Notepad on your Workstation PC, type the exact code: print("hello world"), and click "▶ Run Python" to execute! Exact syntax required.',
        location: 'Assigned Desk PC • Notepad App',
        expectedCode: 'print("hello world")',
        xp: 160,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_v5',
        priority: 'P2',
        category: 'Code Review',
        title: 'Review Sprint PR #418: Multi-region failover cluster',
        description: 'Verify health-check heartbeat intervals and verify split-brain quorum prevention logic.',
        location: 'Intranet Browser • PR Portal',
        xp: 90,
        completed: false
      }
    ],
    char2: [ // Neha: Strategic Planner / Eng Manager
      {
        id: 'task_n1',
        priority: 'P0',
        category: 'Management',
        title: 'Reconcile Q4 sprint velocity blockers with engineering leads',
        description: 'Align cross-functional deliverables between backend and frontend squads before freeze date.',
        location: 'Stage Presentation / All-Hands Hub',
        xp: 200,
        completed: false
      },
      {
        id: 'task_n2',
        priority: 'P1',
        category: 'Product',
        title: 'Draft technical PRD for real-time WebSocket chat',
        description: 'Specify sub-50ms message delivery SLA, presence indicators, and offline inbox synchronization.',
        location: 'Assigned Desk PC • Notes',
        xp: 150,
        completed: false
      },
      {
        id: 'task_n3',
        priority: 'P1',
        category: 'OmniMail',
        title: 'Send Sprint Retrospective email to Amit Sharma (HR & Engineering Manager)',
        description: 'Open OmniMail on your Personal Computer, choose Amit Sharma from the recipient list, and send the retrospective sign-off to receive coins!',
        location: 'Assigned PC • OmniMail App',
        targetEmail: 'amit.sharma@omnicorp.internal',
        targetRecipient: 'Amit Sharma (HR & Engineering Manager)',
        xp: 180,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_n4',
        priority: 'P1',
        category: 'Python',
        title: 'Write Python script in Notepad: print("hello world")',
        description: 'Open Notepad on your Workstation PC, type the exact code: print("hello world"), and click "▶ Run Python" to execute! Exact syntax required.',
        location: 'Assigned Desk PC • Notepad App',
        expectedCode: 'print("hello world")',
        xp: 160,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_n5',
        priority: 'P2',
        category: 'Agile',
        title: 'Finalize sprint retrospective action items & rubric',
        description: 'Document key communication takeaways in the team wiki and update competency rubric.',
        location: 'Corner Office • HR Desk',
        xp: 85,
        completed: false
      }
    ],
    char3: [ // Kabir: Senior Research Lead / Quantum Systems
      {
        id: 'task_k1',
        priority: 'P0',
        category: 'Research',
        title: 'Optimize tensor matrix multiplication on quantum cores',
        description: 'Profile cuBLAS vs custom Triton kernel for sparse attention weights in transformer layer.',
        location: 'R&D Sensor Cluster • Dev Pod',
        xp: 200,
        completed: false
      },
      {
        id: 'task_k2',
        priority: 'P1',
        category: 'Systems',
        title: 'Mitigate sensor telemetry packet jitter across nodes',
        description: 'Implement eBPF kernel bypass ring buffer to stabilize high-frequency sensor ingestion streams.',
        location: 'Big Workplace • Sensor Grid',
        xp: 160,
        completed: false
      },
      {
        id: 'task_k3',
        priority: 'P1',
        category: 'OmniMail',
        title: 'Dispatch Incident SLA Status email to SRE Incident Command Team',
        description: 'Open OmniMail on your Personal Computer, select SRE Incident Command Team, and send the incident SLA status update to receive coins!',
        location: 'Assigned PC • OmniMail App',
        targetEmail: 'sre-incident-bot@omnicorp.internal',
        targetRecipient: 'SRE Incident Command Team',
        xp: 180,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_k4',
        priority: 'P1',
        category: 'Python',
        title: 'Write Python script in Notepad: print("hello world")',
        description: 'Open Notepad on your Workstation PC, type the exact code: print("hello world"), and click "▶ Run Python" to execute! Exact syntax required.',
        location: 'Assigned Desk PC • Notepad App',
        expectedCode: 'print("hello world")',
        xp: 160,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_k5',
        priority: 'P2',
        category: 'Doc',
        title: 'Publish research paper preprint on latency tolerances',
        description: 'Finalize arXiv draft on sub-millisecond edge consensus across heterogeneous clusters.',
        location: 'Cafeteria • Lounge Area',
        xp: 85,
        completed: false
      }
    ],
    char4: [ // Josh: Lead Architect / Distributed Systems
      {
        id: 'task_j1',
        priority: 'P0',
        category: 'Distributed',
        title: 'Resolve Raft consensus deadlock in edge state machine',
        description: 'Fix term election split vote deadlock when network partition heals between regions.',
        location: 'Big Workplace • Architecture Board',
        xp: 200,
        completed: false
      },
      {
        id: 'task_j2',
        priority: 'P1',
        category: 'Architecture',
        title: 'Architect fault-tolerant event sourcing pipeline with Kafka',
        description: 'Design compaction keys and exactly-once transactional consumer groups for ledger events.',
        location: 'Assigned PC • Architecture Tool',
        xp: 160,
        completed: false
      },
      {
        id: 'task_j3',
        priority: 'P1',
        category: 'OmniMail',
        title: 'Send Canary Deployment Approval email to DevOps Automation Cluster',
        description: 'Open OmniMail on your Personal Computer, select DevOps Automation Cluster from the dropdown, and send your canary sign-off to receive coins!',
        location: 'Assigned PC • OmniMail App',
        targetEmail: 'deploy-bot@omnicorp.internal',
        targetRecipient: 'DevOps Automation Cluster',
        xp: 180,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_j4',
        priority: 'P1',
        category: 'Python',
        title: 'Write Python script in Notepad: print("hello world")',
        description: 'Open Notepad on your Workstation PC, type the exact code: print("hello world"), and click "▶ Run Python" to execute! Exact syntax required.',
        location: 'Assigned Desk PC • Notepad App',
        expectedCode: 'print("hello world")',
        xp: 160,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_j5',
        priority: 'P2',
        category: 'Security',
        title: 'Enforce zero-trust mTLS across all mesh service pods',
        description: 'Rotate SPIFFE/SPIRE x509 workload certificates automatically every 12 hours.',
        location: 'Boss Cabinet • Strategy Desk',
        xp: 95,
        completed: false
      }
    ],
    char5: [ // Arjun: Principal Architect / Full-Stack Mastermind
      {
        id: 'task_y1',
        priority: 'P0',
        category: 'Architecture',
        title: 'Design zero-copy WebAssembly rendering pipeline',
        description: 'Implement SIMD-accelerated rasterization with shared array buffers for 120fps graphics.',
        location: 'Big Workplace • Architecture Board',
        xp: 210,
        completed: false
      },
      {
        id: 'task_y2',
        priority: 'P1',
        category: 'Full-Stack',
        title: 'Deploy real-time peer replication engine',
        description: 'Optimize WebRTC data channel packet delta encoding for sub-10ms peer synchronization.',
        location: 'Assigned PC • Architecture Tool',
        xp: 170,
        completed: false
      },
      {
        id: 'task_y3',
        priority: 'P1',
        category: 'OmniMail',
        title: 'Send Architecture Roadmap Update email to Priya (Product PM)',
        description: 'Open OmniMail on your Personal Computer, select Priya (Product PM) as recipient, and send the roadmap update email to receive coins!',
        location: 'Assigned PC • OmniMail App',
        targetEmail: 'priya.pm@omnicorp.internal',
        targetRecipient: 'Priya (Product PM)',
        xp: 180,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_y4',
        priority: 'P1',
        category: 'Python',
        title: 'Write Python script in Notepad: print("hello world")',
        description: 'Open Notepad on your Workstation PC, type the exact code: print("hello world"), and click "▶ Run Python" to execute! Exact syntax required.',
        location: 'Assigned Desk PC • Notepad App',
        expectedCode: 'print("hello world")',
        xp: 160,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_y5',
        priority: 'P2',
        category: 'Infra',
        title: 'Enforce Graphite CI/CD zero-downtime rolling deploys',
        description: 'Configure automated canary verification and instant rollback gates for cloud clusters.',
        location: 'Boss Cabinet • Strategy Desk',
        xp: 95,
        completed: false
      }
    ],
    char6: [ // Rohan: Senior DevOps & Cloud Infrastructure Lead
      {
        id: 'task_r1',
        priority: 'P0',
        category: 'Kubernetes',
        title: 'Optimize multi-region Kubernetes ingress mesh',
        description: 'Configure Envoy gateway routing and automated health check probes for 99.999% uptime.',
        location: 'Big Workplace • Architecture Board',
        xp: 200,
        completed: false
      },
      {
        id: 'task_r2',
        priority: 'P1',
        category: 'CI/CD',
        title: 'Automate zero-downtime rolling canary deployments',
        description: 'Verify instant rollback thresholds and Prometheus latency alarms for microservices.',
        location: 'Assigned PC • Architecture Tool',
        xp: 170,
        completed: false
      },
      {
        id: 'task_r3',
        priority: 'P1',
        category: 'OmniMail',
        title: 'Send Infrastructure SLA Report email to Rahul (Tech Lead)',
        description: 'Open OmniMail on your Personal Computer, select Rahul (Tech Lead) as recipient, and send the SLA report to receive corporate funds!',
        location: 'Assigned PC • OmniMail App',
        targetEmail: 'rahul.techlead@omnicorp.internal',
        targetRecipient: 'Rahul (Tech Lead)',
        xp: 180,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_r4',
        priority: 'P1',
        category: 'Python',
        title: 'Write Python script in Notepad: print("hello world")',
        description: 'Open Notepad on your Workstation PC, type the exact code: print("hello world"), and click "▶ Run Python" to execute! Exact syntax required.',
        location: 'Assigned Desk PC • Notepad App',
        expectedCode: 'print("hello world")',
        xp: 160,
        rewardMoney: 450,
        completed: false
      },
      {
        id: 'task_r5',
        priority: 'P2',
        category: 'Terraform',
        title: 'Audit Terraform cloud state locks & security groups',
        description: 'Verify zero open ingress ports and encrypted EBS volume snapshots across all cloud zones.',
        location: 'Boss Cabinet • Strategy Desk',
        xp: 95,
        completed: false
      }
    ]
  };

  // Curated Fallback SWE Task Pools for subsequent Sprints (Sprint 2, Sprint 3, Sprint 4)
  const HR_SPRINT_POOLS = {
    char1: [ // Vikram: Tech Lead / Backend
      [ // Sprint 2
        {
          id: 'hr_v2_1',
          priority: 'P0',
          category: 'Security',
          title: 'Patch SSRF vulnerability in webhook outbound dispatcher',
          description: 'Restrict outbound HTTP calls to public IP subnets and block AWS/GCP metadata endpoint (169.254.169.254).',
          location: 'Dev Pod 1 • Assigned Desk PC',
          xp: 220,
          completed: false
        },
        {
          id: 'hr_v2_2',
          priority: 'P1',
          category: 'Backend',
          title: 'Migrate auth service to asymmetric ed25519 JWT signatures',
          description: 'Replace shared HMAC secrets with public key infrastructure for zero-trust microservice federation.',
          location: 'Big Workplace • Architecture Board',
          xp: 170,
          completed: false
        },
        {
          id: 'hr_v2_3',
          priority: 'P1',
          category: 'Performance',
          title: 'Tune Linux TCP keepalive & sysctl epoll socket backlog',
          description: 'Eliminate TCP connection drops during 50k RPS ingress spikes on API Gateway nodes.',
          location: 'Dev Pod 1 • Terminal',
          xp: 140,
          completed: false
        },
        {
          id: 'hr_v2_4',
          priority: 'P1',
          category: 'OmniMail',
          title: 'Send InfoSec Compliance Audit email to Neha Patel (Planning & InfoSec Lead)',
          description: 'Open OmniMail on your Personal Computer, select Neha Patel from the recipient list, and send the InfoSec audit report to receive coins!',
          location: 'Assigned PC • OmniMail App',
          targetEmail: 'neha.patel@omnicorp.internal',
          targetRecipient: 'Neha Patel (Planning & InfoSec Lead)',
          xp: 175,
          rewardMoney: 450,
          completed: false
        },
        {
          id: 'hr_v2_5',
          priority: 'P2',
          category: 'Governance',
          title: 'Conduct architecture post-mortem on billing gateway timeout',
          description: 'Document 5 Whys analysis and publish remediation timeline to engineering leadership.',
          location: 'Boss Cabinet • Strategy Desk',
          xp: 95,
          completed: false
        }
      ],
      [ // Sprint 3
        {
          id: 'hr_v3_1',
          priority: 'P0',
          category: 'Optimization',
          title: 'Resolve Go runtime memory leak in high-throughput gateway',
          description: 'Profile pprof heap dumps and eliminate unclosed HTTP response body buffers in streaming handler.',
          location: 'Dev Pod 1 • Assigned Desk PC',
          xp: 230,
          completed: false
        },
        {
          id: 'hr_v3_2',
          priority: 'P1',
          category: 'Resilience',
          title: 'Build automated chaos-testing probe for cross-region failover',
          description: 'Simulate zone blackhole using iptables drop rules to verify Kubernetes headless service self-healing.',
          location: 'Acme R&D Innovation Hub',
          xp: 175,
          completed: false
        },
        {
          id: 'hr_v3_3',
          priority: 'P1',
          category: 'Database',
          title: 'Optimize GraphQL N+1 queries with dataloader batching',
          description: 'Batch batch-load database lookups reducing query volume from 140 queries to 2 indexed batches per page.',
          location: 'Big Workplace • Telemetry Screen',
          xp: 145,
          completed: false
        },
        {
          id: 'hr_v3_4',
          priority: 'P1',
          category: 'OmniMail',
          title: 'Send Code Review Sign-off email to Rahul (Tech Lead)',
          description: 'Open OmniMail on your Personal Computer, select Rahul (Tech Lead) from the dropdown, and send your PR sign-off to receive coins!',
          location: 'Assigned PC • OmniMail App',
          targetEmail: 'rahul.lead@omnicorp.internal',
          targetRecipient: 'Rahul (Tech Lead)',
          xp: 180,
          rewardMoney: 450,
          completed: false
        }
      ]
    ],
    char2: [ // Neha: Strategic Planner / Eng Manager
      [ // Sprint 2
        {
          id: 'hr_n2_1',
          priority: 'P0',
          category: 'Strategy',
          title: 'Mediate technical blocker between AI Core and Mobile teams',
          description: 'Align protobuf schema contract deadlines to unblock Q1 mobile release schedule.',
          location: 'Stage Presentation / All-Hands Hub',
          xp: 210,
          completed: false
        },
        {
          id: 'hr_n2_2',
          priority: 'P1',
          category: 'FinOps',
          title: 'Audit AWS compute spend against quarterly FinOps budget',
          description: 'Right-size underutilized EC2 instances and purchase 1-year Savings Plans saving $18k/month.',
          location: 'Assigned Desk PC • Notes',
          xp: 165,
          completed: false
        },
        {
          id: 'hr_n2_3',
          priority: 'P1',
          category: 'Hiring',
          title: 'Evaluate Staff SWE candidate technical architecture submissions',
          description: 'Score system design rubrics and prepare debrief notes for engineering panel.',
          location: 'Corner Office • HR Desk',
          xp: 140,
          completed: false
        },
        {
          id: 'hr_n2_4',
          priority: 'P2',
          category: 'Compliance',
          title: 'Prepare SOC2 Type II audit evidence with InfoSec auditors',
          description: 'Consolidate MFA enforcement logs, branch protection rules, and quarterly access reviews.',
          location: 'Executive Boardroom',
          xp: 110,
          completed: false
        }
      ],
      [ // Sprint 3
        {
          id: 'hr_n3_1',
          priority: 'P0',
          category: 'Culture',
          title: 'Establish 24/7 on-call rotation & compensation framework',
          description: 'Draft fair pager duty policy with primary/secondary rotations and compensatory time off.',
          location: 'Corner Office • HR Desk',
          xp: 220,
          completed: false
        },
        {
          id: 'hr_n3_2',
          priority: 'P1',
          category: 'Executive',
          title: 'Deliver quarterly technology keynote to board of directors',
          description: 'Present latency reduction metrics, uptime 99.99% SLAs, and cloud cost efficiency gains.',
          location: 'Stage Presentation / All-Hands Hub',
          xp: 180,
          completed: false
        },
        {
          id: 'hr_n3_3',
          priority: 'P1',
          category: 'Quality',
          title: 'Review team developer satisfaction (eNPS) & action plan',
          description: 'Analyze retrospective pulse survey feedback and allocate 20% sprint capacity for tech debt.',
          location: 'Cafeteria • Lounge Area',
          xp: 135,
          completed: false
        },
        {
          id: 'hr_n3_4',
          priority: 'P2',
          category: 'Agile',
          title: 'Host engineering hackathon prize ceremony & awards',
          description: 'Award corporate bonuses for top internal tooling and productivity improvements.',
          location: 'Big Workplace • Telemetry Screen',
          xp: 100,
          completed: false
        }
      ]
    ],
    char3: [ // Kabir: Senior Research Lead / Quantum
      [ // Sprint 2
        {
          id: 'hr_k2_1',
          priority: 'P0',
          category: 'Quantum',
          title: 'Debug phase decoherence anomaly in Qubit array registers',
          description: 'Calibrate Josephson junction flux bias to suppress 1/f magnetic flux noise.',
          location: 'R&D Sensor Cluster • Dev Pod',
          xp: 225,
          completed: false
        },
        {
          id: 'hr_k2_2',
          priority: 'P1',
          category: 'Algorithms',
          title: 'Formulate error-correcting surface codes for logical qubits',
          description: 'Implement syndrome extraction circuit with minimum-weight perfect matching decoder.',
          location: 'Big Workplace • Sensor Grid',
          xp: 170,
          completed: false
        },
        {
          id: 'hr_k2_3',
          priority: 'P1',
          category: 'Simulation',
          title: 'Accelerate Monte Carlo quantum annealing simulations on GPU',
          description: 'Optimize CUDA kernel shared memory layout for 64-spin Ising Hamiltonian models.',
          location: 'Assigned PC • Terminal',
          xp: 145,
          completed: false
        },
        {
          id: 'hr_k2_4',
          priority: 'P2',
          category: 'Hardware',
          title: 'Audit cryogenic dilution refrigerator thermal dissipation',
          description: 'Verify 10mK base temperature stability under continuous microwave drive loads.',
          location: 'Acme R&D Innovation Hub',
          xp: 110,
          completed: false
        }
      ],
      [ // Sprint 3
        {
          id: 'hr_k3_1',
          priority: 'P0',
          category: 'Quantum',
          title: 'Implement Variational Quantum Eigensolver (VQE) pipeline',
          description: 'Simulate molecular ground-state energy of lithium hydride with parameterized ansatz circuit.',
          location: 'R&D Sensor Cluster • Dev Pod',
          xp: 235,
          completed: false
        },
        {
          id: 'hr_k3_2',
          priority: 'P1',
          category: 'Research',
          title: 'File patent disclosure for fault-tolerant quantum key routing',
          description: 'Finalize formal claims and cryptographic security bounds with Acme intellectual property counsel.',
          location: 'Boss Cabinet • Strategy Desk',
          xp: 180,
          completed: false
        },
        {
          id: 'hr_k3_3',
          priority: 'P1',
          category: 'Signal',
          title: 'Filter high-frequency microwave crosstalk on drive lines',
          description: 'Design digital low-pass FIR filter matrix on FPGA to isolate adjacent qubit gates.',
          location: 'Assigned PC • Terminal',
          xp: 140,
          completed: false
        },
        {
          id: 'hr_k3_4',
          priority: 'P2',
          category: 'Preprint',
          title: 'Submit quantum supremacy milestone paper to Nature Physics',
          description: 'Format LaTeX figures, experimental datasets, and peer review reproducibility package.',
          location: 'Cafeteria • Lounge Area',
          xp: 105,
          completed: false
        }
      ]
    ],
    char4: [ // Josh: Lead Architect / Distributed Systems
      [ // Sprint 2
        {
          id: 'hr_j2_1',
          priority: 'P0',
          category: 'Distributed',
          title: 'Mitigate Byzantine fault tolerance edge case in validator quorum',
          description: 'Handle equivocation and double-sign slashing logic under asynchronous network partitions.',
          location: 'Big Workplace • Architecture Board',
          xp: 220,
          completed: false
        },
        {
          id: 'hr_j2_2',
          priority: 'P1',
          category: 'Storage',
          title: 'Architect multi-tenant storage sharding with consistent hashing',
          description: 'Use virtual node ring to distribute data loads evenly and minimize migration rebalance cost.',
          location: 'Assigned PC • Architecture Tool',
          xp: 175,
          completed: false
        },
        {
          id: 'hr_j2_3',
          priority: 'P1',
          category: 'Networking',
          title: 'Implement Envoy WASM proxy filter for dynamic rate limiting',
          description: 'Compile Rust filter to WebAssembly and inject token bucket throttling at wire speed.',
          location: 'Dev Pod 4 • Workstation',
          xp: 145,
          completed: false
        },
        {
          id: 'hr_j2_4',
          priority: 'P2',
          category: 'Benchmarking',
          title: 'Stress test geo-replicated CockroachDB cluster under 60k RPS',
          description: 'Measure multi-region consensus latency and verify Serializable isolation anomalies.',
          location: 'Acme R&D Innovation Hub',
          xp: 115,
          completed: false
        }
      ],
      [ // Sprint 3
        {
          id: 'hr_j3_1',
          priority: 'P0',
          category: 'Kernel',
          title: 'Implement zero-copy network packet routing via Linux DPDK',
          description: 'Bypass kernel network stack using poll-mode driver for sub-500 nanosecond packet transmission.',
          location: 'Big Workplace • Architecture Board',
          xp: 240,
          completed: false
        },
        {
          id: 'hr_j3_2',
          priority: 'P1',
          category: 'Consensus',
          title: 'Eliminate lock contention in distributed 2-Phase Commit manager',
          description: 'Replace pessimistic row locks with optimistic timestamp ordering and MVCC snapshot validation.',
          location: 'Dev Pod 4 • Workstation',
          xp: 185,
          completed: false
        },
        {
          id: 'hr_j3_3',
          priority: 'P1',
          category: 'Crypto',
          title: 'Deploy Zero-Knowledge Rollup contract for state transactions',
          description: 'Verify Plonk proofs on-chain to compress 1,000 ledger transactions into a single block verification.',
          location: 'Assigned PC • Architecture Tool',
          xp: 150,
          completed: false
        },
        {
          id: 'hr_j3_4',
          priority: 'P2',
          category: 'Evaluation',
          title: 'Present Rust vs Zig systems evaluation to Senior Tech Board',
          description: 'Compare memory safety, compile times, C ABI interop, and binary footprint for next-gen engine.',
          location: 'Executive Boardroom',
          xp: 100,
          completed: false
        }
      ]
    ]
  };

  class PhoneDeviceManager {
    constructor() {
      this.isOpen = false;
      this.overlay = null;
      this.wrapper = null;
      this.body = null;
      this.initialized = false;
      this.hasUnread = false;

      // Sprint round counter & tracking completed task titles to guarantee uniqueness
      this.sprintRound = 1;
      this.completedTaskTitles = new Set();
      this._isAssigningTasks = false;
      this._lastToggle = 0;
      // Interactive In-Phone Apps State (Camera, Chat, Mail, Quests, Browser, Terminal, Notes, Music, Settings)
      this.currentApp = null;
      this.activeCameraStream = null;
      this.cameraFilterIndex = 0;
      this.cameraFilters = ['none', 'grayscale(100%) contrast(120%)', 'sepia(90%) hue-rotate(315deg)', 'hue-rotate(180deg) saturate(220%)', 'contrast(160%) brightness(110%)'];
      this.capturedPhotos = [];
      this.musicState = { playing: false, trackIndex: 0, interval: null, volume: 0.5 };
      this.activeChatChannel = 'general';
      this.chatMessages = {
        general: [
          { sender: 'Amit (HR)', text: 'Reminder: All-Hands meeting on the main stage at 4 PM! 🍕', time: '10:15 AM', avatar: '👔' },
          { sender: 'Vikram', text: 'Prod deployment for v2.4.1 is green. Monitoring metrics.', time: '10:28 AM', avatar: '💻' },
          { sender: 'Neha', text: 'Sprint velocity is looking great this week! Good job everyone.', time: '10:35 AM', avatar: '📋' }
        ],
        dev: [
          { sender: 'Kabir', text: 'Anyone reviewed PR #418 on failover consensus yet?', time: '09:45 AM', avatar: '🔬' },
          { sender: 'Rohan', text: 'Looking at it now, looks solid. Connection pool recycling is clean.', time: '10:02 AM', avatar: '🛡️' }
        ],
        hr: [
          { sender: 'Amit (HR)', text: 'Welcome to the team! Don’t forget to check your daily SWE tasks.', time: '09:00 AM', avatar: '👔' },
          { sender: 'Amit (HR)', text: 'Espresso machine tip: Slide mug to green zone before pouring!', time: '09:30 AM', avatar: '☕' }
        ],
        multiplayer: [
          { sender: 'Lobby Server', text: 'Multiplayer room connected. Type messages below to chat with players!', time: 'Just now', avatar: '🌐' }
        ]
      };
      this.notes = JSON.parse(localStorage.getItem('OFFICE_PHONE_NOTES') || 'null') || [
        { id: 1, title: 'Sprint Standup Notes', body: '• Fix Redis leak\n• Test multi-region failover\n• Grab espresso at pantry' },
        { id: 2, title: 'Office Map Secret', body: 'Press [M] to open holographic floor plan & fast travel!' },
        { id: 3, title: 'Espresso Machine Tip', body: 'Slide the glass under the green pour guide to avoid messy spills!' }
      ];
      this.activeBrowserTab = 'wiki';
      this.terminalHistory = [];
      this.terminalHistoryIdx = -1;

      // Character Tasks in Memory
      this.characterTasks = {
        char1: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char1)),
        char2: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char2)),
        char3: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char3)),
        char4: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char4)),
        char5: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char5)),
        char6: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char6))
      };

      // Character Phone Profiles
      this.profiles = {
        char1: {
          id: 'char1',
          name: 'Vikram',
          role: 'Tech Lead / Specialist',
          carrier: 'OmniTech 5G',
          deviceName: 'OmniPhone 16 Pro',
          themeClass: 'phone-char1',
          widgetTitle: '🖥️ GitDeploy Telemetry',
          widgetPill: 'HEALTHY',
          widgetBody: '• 4 microservices operational (99.99%)<br>• Ingestion latency: 0.8ms • Zero queue backlog',
          tones: [587, 880]
        },
        char2: {
          id: 'char2',
          name: 'Neha',
          role: 'Strategic Planner',
          carrier: 'PearMobile 5G',
          deviceName: 'PearPhone Ultra',
          themeClass: 'phone-char2',
          widgetTitle: '📊 Sprint Roadmap & OKRs',
          widgetPill: 'ON SCHEDULE',
          widgetBody: '• Q4 All-Hands release: 94% tasks resolved<br>• Keynote presentation underway on stage',
          tones: [659, 987]
        },
        char3: {
          id: 'char3',
          name: 'Kabir',
          role: 'Senior Research Lead',
          carrier: 'Nexus Quantum 6G',
          deviceName: 'Nexus Quantum Fold',
          themeClass: 'phone-char3',
          widgetTitle: '🔬 Quantum Cores & Sensor Array',
          widgetPill: '0.015 K STABLE',
          widgetBody: '• Sensor cluster telemetry synchronized<br>• Coherence fidelity: 99.998%',
          tones: [784, 1046]
        },
        char4: {
          id: 'char4',
          name: 'Josh',
          role: 'Lead Architect',
          carrier: 'RootNet 5G',
          deviceName: 'CyberDeck Zero',
          themeClass: 'phone-char4',
          widgetTitle: '⚡ Architecture Kernel Zero',
          widgetPill: '3.4M REQ/S',
          widgetBody: '• Model 70B training at 98.4% efficiency<br>• Edge consensus pipeline active',
          tones: [440, 880]
        },
        char5: {
          id: 'char5',
          name: 'Arjun',
          role: 'Principal Architect',
          carrier: 'GRAPHITE 5G',
          deviceName: 'Graphite Titan Pro',
          themeClass: 'phone-char5',
          widgetTitle: '🕷️ Graphite 26 Core Matrix',
          widgetPill: '120 FPS / 0.2ms',
          widgetBody: '• Distributed WebAssembly kernel: Operational<br>• Real-time peer delta synchronization online',
          tones: [523, 1046]
        },
        char6: {
          id: 'char6',
          name: 'Rohan',
          role: 'DevOps & Cloud Lead',
          carrier: 'TERRA-CLOUD 5G',
          deviceName: 'Tactical CyberSlate 9',
          themeClass: 'phone-char6',
          widgetTitle: '🛡️ Cloud Infrastructure Mesh',
          widgetPill: 'ALL REGIONS GREEN',
          widgetBody: '• 48 node pods balanced • Zero drift detected<br>• Ingress traffic: 4.8M req/sec • Global SLA: 99.999%',
          tones: [493, 987]
        }
      };
    }

    init() {
      if (this.initialized) return;
      this.buildDOM();
      this.setupListeners();
      this.initialized = true;

      // Asynchronously trigger Groq AI fetch for active character
      const activeChar = this.getActiveCharId();
      setTimeout(() => {
        this.fetchGroqTasks(activeChar, false);
      }, 1500);

      console.log('📱 Handheld Smartphone System Initialized with Groq AI (Press [P] to toggle)');
    }

    getActiveCharId() {
      if (window.state && window.state.player && window.state.player.charId) {
        return window.state.player.charId;
      }
      if (window.multiplayerEngine && window.multiplayerEngine.localPlayer && window.multiplayerEngine.localPlayer.charId) {
        return window.multiplayerEngine.localPlayer.charId;
      }
      return 'char1';
    }

    buildDOM() {
      const existing = document.getElementById('phone-overlay');
      if (existing) {
        this.overlay = existing;
        this.wrapper = document.getElementById('phone-wrapper');
        this.body = document.getElementById('phone-body');
        return;
      }

      const overlay = document.createElement('div');
      overlay.id = 'phone-overlay';
      overlay.className = 'phone-overlay hidden';

      overlay.innerHTML = `
        <div class="phone-wrapper" id="phone-wrapper">
          <!-- Phone Hardware Body (Upright, Parallel to Screen) -->
          <div class="phone-body" id="phone-body">
            <!-- Hardware Buttons -->
            <div class="phone-btn-vol-up"></div>
            <div class="phone-btn-vol-down"></div>
            <div class="phone-btn-power"></div>

            <!-- Screen Viewport -->
            <div class="phone-screen" id="phone-screen">
              <!-- Dynamic Island / Speaker Pill -->
              <div class="phone-dynamic-island">
                <span class="island-camera"></span>
                <span class="island-sensor"></span>
              </div>

              <!-- Top Status Bar -->
              <div class="phone-status-bar">
                <div class="status-left">
                  <span id="phone-clock">10:42</span>
                  <span id="phone-carrier" class="status-carrier">OmniTech 5G</span>
                </div>
                <div class="status-right">
                  <span>📶</span>
                  <span>🛜</span>
                  <span id="phone-battery">🔋 98%</span>
                </div>
              </div>

              <!-- Scrollable Phone Screen View (Home Screen) -->
              <div class="phone-content" id="phone-home-view">
                <!-- Task Notification Card -->
                <div class="phone-notif-card" id="phone-notif-card">
                  <div class="notif-top">
                    <div class="notif-app-badge">
                      <span class="notif-pulse-dot"></span>
                      <span id="phone-notif-label">⚡ GROQ AI • SWE SPRINT DIRECTIVE</span>
                    </div>
                    <span class="notif-time-ago" id="phone-notif-time">LIVE</span>
                  </div>

                  <div class="notif-title" id="phone-notif-title">Software Engineering Tasks</div>
                  <div class="notif-loc-tag" id="phone-notif-location">📍 Acme R&D Innovation Mega-Hub</div>
                  <div class="notif-desc-text" id="phone-notif-desc">
                    Double-click any task notification below to tick & complete it! Earn corporate XP & cash rewards.
                  </div>

                  <!-- Dynamic Interactive SWE Task Cards -->
                  <div class="phone-swe-tasks-list" id="phone-swe-tasks-list">
                    <!-- Populated dynamically -->
                  </div>

                  <!-- Groq AI Footer & Refresh Action -->
                  <div class="groq-refresh-wrap">
                    <span class="groq-model-badge">⚡ GROQ AI • 120B</span>
                    <button class="groq-refresh-btn" id="phone-groq-refresh-btn" title="Ask Groq AI for 4-5 new engineering tasks">
                      <span class="spin-icon">🔄</span> Generate New Tasks
                    </button>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div class="notif-buttons-row">
                    <button class="notif-action-btn primary" id="phone-btn-open-quest">
                      <span>📜</span> Quest Log [Q]
                    </button>
                    <button class="notif-action-btn" id="phone-btn-ack">
                      <span>✔</span> Acknowledge
                    </button>
                  </div>
                </div>

                <!-- Character Unique Widget -->
                <div class="phone-widget-card" id="phone-widget-card">
                  <div class="widget-header">
                    <span class="widget-title" id="phone-widget-title">🖥️ GitDeploy Telemetry</span>
                    <span class="widget-stat-pill" id="phone-widget-pill">HEALTHY</span>
                  </div>
                  <div class="widget-content-body" id="phone-widget-body">
                    • 4 microservices operational (99.99%)<br>
                    • Ingestion latency: 0.8ms • Zero queue backlog
                  </div>
                </div>

                <!-- App Icons Grid -->
                <div class="phone-apps-container">
                  <div class="apps-grid">
                    <button class="phone-app-btn" id="app-btn-chat" title="Office Chat & Pager">
                      <div class="app-icon-squircle icon-chat">💬</div>
                      <span class="app-label">Chat</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-mail" title="Workstation OmniMail (PC Directives & Tasks)">
                      <div class="app-icon-squircle icon-mail">✉️</div>
                      <span class="app-label">Mail</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-quest" title="Quests & Rubrics">
                      <div class="app-icon-squircle icon-quests">📜</div>
                      <span class="app-label">Quests</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-browser" title="Intranet Web Browser">
                      <div class="app-icon-squircle icon-browser">🌐</div>
                      <span class="app-label">Browser</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-camera" title="Snapshot Photo">
                      <div class="app-icon-squircle icon-camera">📷</div>
                      <span class="app-label">Camera</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-terminal" title="Terminal / Code">
                      <div class="app-icon-squircle icon-terminal">&gt;_</div>
                      <span class="app-label">Terminal</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-notes" title="Daily Objectives">
                      <div class="app-icon-squircle icon-notes">📝</div>
                      <span class="app-label">Notes</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-music" title="Toggle Sound (M)">
                      <div class="app-icon-squircle icon-music">🎵</div>
                      <span class="app-label">Music</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-settings" title="CRT Scanlines">
                      <div class="app-icon-squircle icon-settings">⚙️</div>
                      <span class="app-label">CRT Mode</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Interactive In-Phone App Viewport Container -->
              <div class="phone-app-view" id="phone-app-view" style="display: none;">
                <div class="phone-app-header">
                  <button class="phone-app-back-btn" id="phone-app-back-btn">
                    <span class="back-arrow">‹</span> Home
                  </button>
                  <div class="phone-app-title" id="phone-app-title">App</div>
                  <div class="phone-app-header-action" id="phone-app-action"></div>
                </div>
                <div class="phone-app-body" id="phone-app-body">
                  <!-- Active App Renders Here -->
                </div>
              </div>

              <!-- Camera flash effect container -->
              <div class="camera-flash-overlay" id="phone-camera-flash"></div>

              <!-- Bottom Bar & Home Indicator -->
              <div class="phone-bottom-bar">
                <button class="phone-home-pill-btn" id="phone-home-pill" title="Close Phone [P / Esc]"></button>
                <span class="phone-esc-hint">Press [P] or [Esc] to Close</span>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.overlay = overlay;
      this.wrapper = document.getElementById('phone-wrapper');
      this.body = document.getElementById('phone-body');

      // Add floating in-game push notification banner
      this.buildPushNotificationDOM();

      // Add Phone button in Header if not present
      this.addHeaderButton();
    }

    buildPushNotificationDOM() {
      if (document.getElementById('phone-push-notification')) return;
      const pushEl = document.createElement('div');
      pushEl.id = 'phone-push-notification';
      pushEl.className = 'phone-push-notification';
      pushEl.title = 'Click to open phone [P]';
      pushEl.innerHTML = `
        <div class="push-notif-avatar">
          <img src="assets/npc_amit_portrait.png" onerror="this.style.display='none'; this.parentElement.textContent='👔';" alt="Amit">
        </div>
        <div class="push-notif-content">
          <div class="push-notif-header">
            <span class="push-notif-sender">Amit (HR Manager)</span>
            <span class="push-notif-time">Just now</span>
          </div>
          <div class="push-notif-msg" id="push-notif-msg">New Sprint Directive Assigned • 4 fresh tasks</div>
        </div>
        <div class="push-notif-action-pill">Open [P]</div>
      `;

      pushEl.addEventListener('click', (e) => {
        e.stopPropagation();
        pushEl.classList.remove('show');
        if (!this.isOpen) {
          this.open();
        }
      });

      document.body.appendChild(pushEl);
    }

    showPushNotification(sender, message, duration = 6000) {
      let el = document.getElementById('phone-push-notification');
      if (!el) {
        this.buildPushNotificationDOM();
        el = document.getElementById('phone-push-notification');
      }
      if (!el) return;

      const senderEl = el.querySelector('.push-notif-sender');
      const msgEl = document.getElementById('push-notif-msg');
      const timeEl = el.querySelector('.push-notif-time');

      if (senderEl) senderEl.textContent = sender || 'Amit (HR Manager)';
      if (msgEl) msgEl.textContent = message || 'New SWE Tasks assigned to your phone!';
      if (timeEl) timeEl.textContent = 'Just now';

      // Play phone notification pop sound
      if (window.soundManager && typeof window.soundManager.playPhonePop === 'function') {
        window.soundManager.playPhonePop();
      }

      el.classList.add('show');

      if (this._pushTimeout) clearTimeout(this._pushTimeout);
      this._pushTimeout = setTimeout(() => {
        el.classList.remove('show');
      }, duration);
    }

    addHeaderButton() {
      let btn = document.getElementById('btn-phone-toggle');
      const headerRight = document.querySelector('.header-right');
      if (!btn && headerRight) {
        btn = document.createElement('button');
        btn.id = 'btn-phone-toggle';
        btn.className = 'btn-pager-toggle';
        btn.title = 'Open Smartphone & Groq AI Tasks (P)';
        btn.innerHTML = `
          <span class="pager-icon">📱</span>
          <span class="pager-label">Phone</span>
          <span class="phone-badge" id="phone-header-badge">4</span>
        `;
        headerRight.appendChild(btn);
      }
      if (btn) {
        btn.onclick = () => this.toggle();
      }
    }

    updatePhoneBadge(count = null) {
      const badge = document.getElementById('phone-header-badge');
      if (!badge) return;

      const charId = this.getActiveCharId();
      const tasks = this.characterTasks[charId] || [];
      const uncompletedCount = tasks.filter(t => !t.completed).length;

      const displayCount = (count !== null) ? count : uncompletedCount;
      if (displayCount > 0) {
        badge.textContent = displayCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    setupListeners() {
      // Global hotkey listener for [Escape] to close phone
      window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '');
        if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;

        const k = (e.key || '').toLowerCase();
        const code = e.code || '';

        if ((k === 'escape' || code === 'Escape') && this.isOpen) {
          e.preventDefault();
          if (this.currentApp) {
            this.closeApp();
          } else {
            this.close();
          }
        }
      });

      // Overlay background click to close
      if (this.overlay) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) {
            this.close();
          }
        });
      }

      // Close pill click (if inside an app -> returns to Home; if on home -> closes phone)
      const homePill = document.getElementById('phone-home-pill');
      if (homePill) {
        homePill.onclick = () => {
          if (this.currentApp) {
            this.closeApp();
          } else {
            this.close();
          }
        };
      }

      // App Back to Home Button
      const appBackBtn = document.getElementById('phone-app-back-btn');
      if (appBackBtn) {
        appBackBtn.onclick = () => this.closeApp();
      }

      // Refresh Groq tasks button -> Asks HR Manager Amit for new sprint tasks
      const refreshBtn = document.getElementById('phone-groq-refresh-btn');
      if (refreshBtn) {
        refreshBtn.onclick = (e) => {
          e.stopPropagation();
          const charId = this.getActiveCharId();
          this.sprintRound++;
          this.assignNewHRTasks(charId);
        };
      }

      // Notification action: Open Quest Log
      const btnQuest = document.getElementById('phone-btn-open-quest');
      if (btnQuest) {
        btnQuest.onclick = () => {
          this.openApp('quests');
        };
      }

      // Notification action: Got it
      const btnAck = document.getElementById('phone-btn-ack');
      if (btnAck) {
        btnAck.onclick = () => {
          if (window.soundManager) window.soundManager.playInteract();
          if (typeof window.showToast === 'function') {
            window.showToast('✔ SWE task directives acknowledged! Press [P] anytime to view tasks.');
          }
          this.close();
        };
      }

      // App button wiring - All 9 Interactive Smartphone Apps!
      const chatBtn = document.getElementById('app-btn-chat');
      if (chatBtn) chatBtn.onclick = () => this.openApp('chat');

      const mailBtn = document.getElementById('app-btn-mail');
      if (mailBtn) mailBtn.onclick = () => this.openApp('mail');

      const questBtn = document.getElementById('app-btn-quest');
      if (questBtn) questBtn.onclick = () => this.openApp('quests');

      const browserBtn = document.getElementById('app-btn-browser');
      if (browserBtn) browserBtn.onclick = () => this.openApp('browser');

      const cameraBtn = document.getElementById('app-btn-camera');
      if (cameraBtn) cameraBtn.onclick = () => this.openApp('camera');

      const terminalBtn = document.getElementById('app-btn-terminal');
      if (terminalBtn) terminalBtn.onclick = () => this.openApp('terminal');

      const notesBtn = document.getElementById('app-btn-notes');
      if (notesBtn) notesBtn.onclick = () => this.openApp('notes');

      const musicBtn = document.getElementById('app-btn-music');
      if (musicBtn) musicBtn.onclick = () => this.openApp('music');

      const settingsBtn = document.getElementById('app-btn-settings');
      if (settingsBtn) settingsBtn.onclick = () => this.openApp('settings');
    }

    takeSnapshot() {
      const flash = document.getElementById('phone-camera-flash');
      if (flash) {
        flash.classList.add('flash');
        setTimeout(() => flash.classList.remove('flash'), 180);
      }
      if (window.soundManager) window.soundManager.playInteract();
      if (typeof window.showToast === 'function') {
        window.showToast('📸 Snapshot captured! Saved to OmniCloud Photos.');
      }
    }

    async fetchGroqTasks(charId, forceRefresh = false) {
      if (forceRefresh) {
        this.sprintRound++;
        return this.assignNewHRTasks(charId);
      }

      const profile = this.profiles[charId] || this.profiles.char1;
      const refreshBtn = document.getElementById('phone-groq-refresh-btn');

      if (!forceRefresh && this.characterTasks[charId] && this.characterTasks[charId].length >= 4) {
        this.renderSweTaskList(charId);
        this.updatePhoneBadge();
        return this.characterTasks[charId];
      }

      if (refreshBtn) refreshBtn.classList.add('loading');

      try {
        const tasks = await this.fetchDifferentTasksFromGroq(charId, 1);
        if (tasks && tasks.length >= 3) {
          this.characterTasks[charId] = tasks;
          this.playPhoneChime([659, 880, 1046]);
          if (typeof window.showToast === 'function') {
            window.showToast(`📱 Phone Alert: Groq AI assigned ${this.characterTasks[charId].length} new SWE Tasks! Press [P] to view.`);
          }
        } else {
          throw new Error('Fallback needed');
        }
      } catch (err) {
        console.warn('Groq AI task fetch failed, falling back to curated SWE tasks:', err);
        if (!this.characterTasks[charId] || this.characterTasks[charId].length === 0) {
          this.characterTasks[charId] = JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS[charId] || DEFAULT_SWE_TASKS.char1));
        }
      } finally {
        if (refreshBtn) refreshBtn.classList.remove('loading');
        this.renderSweTaskList(charId);
        this.updatePhoneBadge();
      }
    }

    async assignNewHRTasks(charId) {
      const profile = this.profiles[charId] || this.profiles.char1;
      const sprintNum = this.sprintRound;
      const refreshBtn = document.getElementById('phone-groq-refresh-btn');
      if (refreshBtn) refreshBtn.classList.add('loading');

      let newTasks = null;
      try {
        newTasks = await this.fetchDifferentTasksFromGroq(charId, sprintNum);
      } catch (err) {
        console.warn(`Groq AI task fetch for Sprint #${sprintNum} failed, using curated HR sprint pool:`, err);
      }

      // Fallback if Groq was unavailable or returned invalid array
      if (!newTasks || newTasks.length === 0) {
        const pools = HR_SPRINT_POOLS[charId] || HR_SPRINT_POOLS.char1;
        const poolIndex = (sprintNum - 2) % pools.length;
        const pool = (poolIndex >= 0 && pools[poolIndex]) ? pools[poolIndex] : (DEFAULT_SWE_TASKS[charId] || DEFAULT_SWE_TASKS.char1);

        newTasks = pool.map((t, idx) => ({
          ...t,
          id: `hr_sprint_${sprintNum}_${charId}_${idx}_${Date.now()}`,
          completed: false
        }));
      }

      this.characterTasks[charId] = newTasks;

      // Update phone UI cards
      const notifLabel = document.getElementById('phone-notif-label');
      if (notifLabel) notifLabel.textContent = `⚡ SPRINT #${sprintNum} • AMIT (HR MANAGER)`;

      const notifTitle = document.getElementById('phone-notif-title');
      if (notifTitle) notifTitle.textContent = `Sprint #${sprintNum}: ${profile.name}'s Engineering Directives`;

      const notifDesc = document.getElementById('phone-notif-desc');
      if (notifDesc) {
        notifDesc.textContent = `Amit (HR) reviewed your completed tickets and assigned ${newTasks.length} fresh SWE tasks for Sprint #${sprintNum}.`;
      }

      // 1. Play smartphone notification pop sound!
      if (window.soundManager && typeof window.soundManager.playPhonePop === 'function') {
        window.soundManager.playPhonePop();
      } else {
        this.playPhoneChime([587, 880, 1175]);
      }

      // 2. Display floating in-game push notification banner from HR Manager Amit
      this.showPushNotification(
        'Amit (HR & Engineering)',
        `📋 Sprint #${sprintNum} Assigned: ${newTasks.length} fresh tasks on your phone!`
      );

      // 3. Update tasks in phone and header badge
      this.renderSweTaskList(charId);
      this.updatePhoneBadge();

      if (refreshBtn) refreshBtn.classList.remove('loading');

      if (typeof window.showToast === 'function') {
        window.showToast(`📱 Phone Alert: Amit (HR) assigned ${newTasks.length} new tasks for Sprint #${sprintNum}! Press [P] to view.`);
      }

      return newTasks;
    }

    async fetchDifferentTasksFromGroq(charId, sprintNum) {
      const profile = this.profiles[charId] || this.profiles.char1;
      const recentTitles = Array.from(this.completedTaskTitles).slice(-8).map(t => `"${t}"`).join(', ');

      const promptSystem = `You are Amit, the Head of Engineering & HR Director at Acme Innovations.
The engineer has just successfully completed their previous sprint!
Assign Sprint #${sprintNum} containing exactly 4 to 5 brand new, DIFFERENT, high-impact software engineering tasks for ${profile.name}, who is ${profile.role}.
These tasks MUST be completely fresh and distinct from previous tasks.
${recentTitles ? `Do NOT repeat or duplicate any of these recently completed tasks: ${recentTitles}` : ''}
Tasks should cover realistic modern software engineering: backend systems, performance bottlenecks, architecture, CI/CD/DevOps, code reviews, database optimization, or distributed systems.
Respond ONLY with a valid JSON array of objects. Do not include markdown code ticks, preamble, or commentary.
Each object must have these exact keys:
- "id": unique string (e.g. "hr_sprint_${sprintNum}_1")
- "priority": one of "P0", "P1", "P2" (make 1 P0, 2 P1, 1-2 P2)
- "difficulty": "HARD" for P0, "MED" for P1, "EASY" for P2
- "rewardMoney": 500 for P0, 350 for P1, 200 for P2
- "category": short category string like "Backend", "DevOps", "Architecture", "Database", "Security", or "Optimization"
- "title": concise actionable title (6-10 words)
- "description": 1-2 sentences of technical engineering detail
- "location": office location in the simulator (e.g. "Dev Pod Workstation", "Architecture Whiteboard", "Acme R&D Hub", "Assigned Desk PC", or "Stage Presentation")
- "xp": integer number between 90 and 220
- "completed": false`;

      const response = await fetch(GROQ_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: GROQ_CONFIG.model,
          messages: [
            { role: 'system', content: promptSystem },
            { role: 'user', content: `Amit, generate 4-5 fresh software engineering sprint tasks for ${profile.name} (${profile.role}) for Sprint #${sprintNum}.` }
          ],
          temperature: 0.75,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      let rawContent = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!rawContent) throw new Error('No content returned from Groq AI');

      rawContent = rawContent.trim();
      if (rawContent.startsWith('```')) {
        rawContent = rawContent.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
      }

      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.map((item, idx) => {
          const prio = (item.priority && item.priority.toUpperCase()) || (idx === 0 ? 'P0' : 'P1');
          const diff = item.difficulty || (prio === 'P0' ? 'HARD' : (prio === 'P1' ? 'MED' : 'EASY'));
          const cash = Number(item.rewardMoney) || (prio === 'P0' ? 500 : (prio === 'P1' ? 350 : 200));
          return {
            id: item.id || `hr_groq_${sprintNum}_${charId}_${Date.now()}_${idx}`,
            priority: prio,
            difficulty: diff,
            rewardMoney: cash,
            category: item.category || 'Engineering',
            title: item.title || 'Engineering Task Directive',
            description: item.description || 'Implement assigned ticket according to sprint specifications.',
            location: item.location || 'Assigned Desk PC',
            xp: Number(item.xp) || (160 - idx * 15),
            completed: false
          };
        });
      }

      throw new Error('Parsed response was not a valid task array');
    }

    renderSweTaskList(charId) {
      const container = document.getElementById('phone-swe-tasks-list');
      if (!container) return;

      const tasks = this.characterTasks[charId] || [];
      if (tasks.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:15px; color:#94a3b8; font-size:0.75rem;">No active notifications. Tap 'Generate New Tasks' to request tasks from HR.</div>`;
        return;
      }

      container.innerHTML = tasks.map((t, index) => {
        const rewardInfo = getTaskDifficultyAndMoney(t);
        const timeAgo = (index === 0) ? 'just now' : `${(index + 1) * 3}m ago`;
        return `
          <div class="swe-task-notif-card ${t.completed ? 'completed' : ''}" data-task-id="${t.id}" title="Double-click to ${t.completed ? 'unmark' : 'tick & complete'}">
            <div class="notif-header-strip">
              <div class="notif-app-meta">
                <span class="notif-app-icon">🏢</span>
                <span class="notif-app-name">Sprint Directive</span>
                <span class="notif-bullet">•</span>
                <span class="notif-timestamp">${timeAgo}</span>
              </div>
              <div class="notif-tick-badge ${t.completed ? 'checked' : ''}" data-task-id="${t.id}" title="Double-click card or click badge to toggle">
                <span class="tick-icon">${t.completed ? '✓' : '○'}</span>
                <span class="tick-label">${t.completed ? 'DONE' : 'TICK'}</span>
              </div>
            </div>
            <div class="notif-main-content">
              <div class="notif-task-title">${t.title}</div>
              <div class="notif-task-desc">${t.description}</div>
            </div>
            <div class="notif-footer-strip">
              <div class="notif-badges-left">
                <span class="diff-tag diff-${rewardInfo.diffClass}">${rewardInfo.diffBadge}</span>
                <span class="money-tag">💵 +$${rewardInfo.money}</span>
                <span class="cat-tag">${t.category || 'Tech'}</span>
                <span class="xp-tag">+${t.xp} XP</span>
              </div>
              <div class="notif-dblclick-hint ${t.completed ? 'completed' : ''}">
                ${t.completed ? '✓ Completed' : '⚡ Double-Click to Tick'}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Attach double-click and double-tap events to toggle task completion
      const cards = container.querySelectorAll('.swe-task-notif-card');
      cards.forEach(card => {
        const taskId = card.getAttribute('data-task-id');
        let lastTapTime = 0;

        const doTick = () => {
          card.classList.add('ticking-pop');
          setTimeout(() => {
            this.toggleTaskCompleted(charId, taskId);
          }, 140);
        };

        // Desktop Double Click
        card.ondblclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          doTick();
        };

        // Mobile / Touch Double Tap
        card.addEventListener('touchend', (e) => {
          const now = Date.now();
          if (now - lastTapTime < 350) {
            e.preventDefault();
            e.stopPropagation();
            lastTapTime = 0;
            doTick();
          } else {
            lastTapTime = now;
          }
        });

        // Direct click on the tick badge also ticks immediately for convenience
        const tickBadge = card.querySelector('.notif-tick-badge');
        if (tickBadge) {
          tickBadge.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            doTick();
          };
        }
      });
    }

    onAllTasksCompleted(charId) {
      if (this._isAssigningTasks) return;
      this._isAssigningTasks = true;

      const currentSprint = this.sprintRound;
      const bonusXp = 300;
      const bonusMoney = 1000;

      // Award sprint completion milestone bonus
      if (window.state && window.state.player) {
        window.state.player.score = (window.state.player.score || 0) + bonusXp;
        const scoreEl = document.getElementById('stat-score');
        if (scoreEl) scoreEl.textContent = window.state.player.score;
      }
      if (typeof window.addCorporateFunds === 'function') {
        window.addCorporateFunds(bonusMoney);
      }

      if (typeof window.showToast === 'function') {
        window.showToast(`🏆 SPRINT #${currentSprint} COMPLETED! +${bonusXp} XP & 💵 +$${bonusMoney.toLocaleString()} Milestone Bonus! Amit (HR) is assigning new sprint tasks...`);
      }

      this.sprintRound++;

      // Realistic 1.2s delay for HR review before delivering new tasks to phone
      setTimeout(() => {
        this.assignNewHRTasks(charId).finally(() => {
          this._isAssigningTasks = false;
        });
      }, 1200);
    }

    toggleTaskCompleted(charId, taskId) {
      const tasks = this.characterTasks[charId] || [];
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      task.completed = !task.completed;

      // Track completed task title so subsequent sprints don't repeat it
      if (task.completed) {
        this.completedTaskTitles.add(task.title);
      }

      // Play sound
      if (window.soundManager) {
        if (task.completed) {
          if (typeof window.soundManager.playNotificationPop === 'function') {
            window.soundManager.playNotificationPop();
          } else {
            window.soundManager.playQuestComplete();
          }
        } else {
          window.soundManager.playInteract();
        }
      }

      // Calculate difficulty & money reward
      const rewardInfo = getTaskDifficultyAndMoney(task);
      const moneyReward = rewardInfo.money;

      // Award XP & Money based on task difficulty rating
      if (task.completed) {
        if (typeof window.addCorporateFunds === 'function') {
          window.addCorporateFunds(moneyReward);
        } else if (window.state && window.state.player) {
          window.state.player.money = Math.max(0, (window.state.player.money !== undefined ? window.state.player.money : 0) + moneyReward);
          const valEl = document.getElementById('hud-money-val');
          if (valEl) valEl.textContent = '$' + window.state.player.money.toLocaleString();
        }

        if (window.state && window.state.player) {
          window.state.player.score = (window.state.player.score || 0) + task.xp;
          const scoreEl = document.getElementById('stat-score');
          if (scoreEl) scoreEl.textContent = window.state.player.score;
        }

        if (typeof window.showToast === 'function') {
          window.showToast(`⭐ +${task.xp} XP & 💵 +$${moneyReward} Cash Reward [${rewardInfo.diffBadge}]! Completed "${task.title}".`);
        }
      } else {
        if (typeof window.addCorporateFunds === 'function') {
          window.addCorporateFunds(-moneyReward);
        } else if (window.state && window.state.player) {
          window.state.player.money = Math.max(0, (window.state.player.money !== undefined ? window.state.player.money : 0) - moneyReward);
          const valEl = document.getElementById('hud-money-val');
          if (valEl) valEl.textContent = '$' + window.state.player.money.toLocaleString();
        }

        if (typeof window.showToast === 'function') {
          window.showToast(`↩️ Marked "${task.title}" as pending (-$${moneyReward}).`);
        }
      }

      this.renderSweTaskList(charId);
      this.updatePhoneBadge();

      // Check if ALL tasks in the current sprint are completed!
      const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);
      if (allCompleted) {
        this.onAllTasksCompleted(charId);
      }
    }

    /**
     * Get active uncompleted OmniMail directive mission for current player character
     */
    getActiveEmailMission() {
      const charId = this.getActiveCharId();
      const tasks = this.characterTasks[charId] || [];
      return tasks.find(t => !t.completed && (
        t.category === 'OmniMail' || 
        t.targetEmail || 
        t.targetRecipient || 
        (t.title && t.title.toLowerCase().includes('email'))
      )) || null;
    }

    /**
     * Check if sending an email to recipient matches an active mission, and complete it with coin rewards!
     */
    checkAndCompleteEmailMission(recipientEmail, recipientName) {
      const charId = this.getActiveCharId();
      const tasks = this.characterTasks[charId] || [];

      // 1. Try finding a specific matching uncompleted task
      const match = tasks.find(t => {
        if (t.completed) return false;

        // Direct email match
        if (t.targetEmail && recipientEmail && t.targetEmail.toLowerCase() === recipientEmail.toLowerCase()) {
          return true;
        }

        // Direct recipient name match
        if (t.targetRecipient && recipientName) {
          const cleanTarget = t.targetRecipient.split('(')[0].trim().toLowerCase();
          const cleanRec = recipientName.split('(')[0].trim().toLowerCase();
          if (cleanRec.includes(cleanTarget) || cleanTarget.includes(cleanRec)) {
            return true;
          }
        }

        // Category OmniMail with recipient mention in title or description
        if (t.category === 'OmniMail' || (t.title && t.title.toLowerCase().includes('email'))) {
          const cleanRec = (recipientName || '').split('(')[0].trim().toLowerCase();
          if (cleanRec && (
            (t.title && t.title.toLowerCase().includes(cleanRec)) ||
            (t.description && t.description.toLowerCase().includes(cleanRec))
          )) {
            return true;
          }
        }

        return false;
      });

      if (match) {
        return this._executeTaskReward(charId, match, recipientName);
      }

      // 2. Fallback: If player has ANY active OmniMail task, sending an email to a team member fulfills it
      const fallbackMailTask = tasks.find(t => !t.completed && (t.category === 'OmniMail' || (t.title && t.title.toLowerCase().includes('email'))));
      if (fallbackMailTask) {
        return this._executeTaskReward(charId, fallbackMailTask, recipientName);
      }

      return null;
    }

    _executeTaskReward(charId, task, recipientName) {
      task.completed = true;
      this.completedTaskTitles.add(task.title);

      const rewardInfo = getTaskDifficultyAndMoney(task);
      const moneyReward = rewardInfo.money;

      // 1. Credit corporate funds / Coins
      if (typeof window.addCorporateFunds === 'function') {
        window.addCorporateFunds(moneyReward);
      } else if (window.state && window.state.player) {
        window.state.player.money = Math.max(0, (window.state.player.money !== undefined ? window.state.player.money : 0) + moneyReward);
        const valEl = document.getElementById('hud-money-val');
        if (valEl) valEl.textContent = '$' + window.state.player.money.toLocaleString();
      }

      // 2. Credit XP
      if (window.state && window.state.player) {
        window.state.player.score = (window.state.player.score || 0) + (task.xp || 180);
        const scoreEl = document.getElementById('stat-score');
        if (scoreEl) scoreEl.textContent = window.state.player.score;
      }

      // 3. Play retro audio fanfare & coin pickup sound
      if (window.soundManager) {
        if (typeof window.soundManager.playCoinReward === 'function') {
          window.soundManager.playCoinReward();
        }
        if (typeof window.soundManager.playQuestComplete === 'function') {
          setTimeout(() => window.soundManager.playQuestComplete(), 150);
        }
      }

      // 4. Update Phone UI & Badge
      this.renderSweTaskList(charId);
      this.updatePhoneBadge();

      // 5. Toast Notification
      if (typeof window.showToast === 'function') {
        window.showToast(`🎉 MISSION COMPLETE! Delivered email to ${recipientName}! Received 💵 +$${moneyReward} Coins & ⭐ +${task.xp} XP!`);
      }

      // 6. Check if all tasks in the sprint are now complete
      const tasks = this.characterTasks[charId] || [];
      const allDone = tasks.length > 0 && tasks.every(t => t.completed);
      if (allDone && typeof this.onAllTasksCompleted === 'function') {
        this.onAllTasksCompleted(charId);
      }

      return { task, moneyReward };
    }

    /**
     * Ensure active character has Python Hello World mission present
     */
    ensurePythonMission(charId) {
      if (!this.characterTasks[charId]) {
        this.characterTasks[charId] = JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS[charId] || DEFAULT_SWE_TASKS.char1));
      }
      const tasks = this.characterTasks[charId];
      const hasPy = tasks.some(t => t.expectedCode === 'print("hello world")' || (t.category && t.category.toLowerCase().includes('python')));
      if (!hasPy) {
        tasks.push({
          id: `task_${charId}_py_hello`,
          priority: 'P1',
          category: 'Python',
          title: 'Write Python script in Notepad: print("hello world")',
          description: 'Open Notepad on your Workstation PC, type the exact code: print("hello world"), and click "▶ Run Python" to execute! Exact syntax required.',
          location: 'Assigned Desk PC • Notepad App',
          expectedCode: 'print("hello world")',
          xp: 160,
          rewardMoney: 450,
          completed: false
        });
      }
    }

    /**
     * Get active uncompleted Python coding mission for current player character
     */
    getActivePythonMission() {
      const charId = this.getActiveCharId();
      this.ensurePythonMission(charId);
      const tasks = this.characterTasks[charId] || [];
      return tasks.find(t => !t.completed && (
        t.expectedCode === 'print("hello world")' ||
        (t.category && t.category.toLowerCase().includes('python')) ||
        (t.title && t.title.toLowerCase().includes('python'))
      ));
    }

    /**
     * Complete Python Hello World coding mission in Notepad
     */
    checkAndCompletePythonMission(code) {
      const charId = this.getActiveCharId();
      this.ensurePythonMission(charId);
      const tasks = this.characterTasks[charId] || [];

      // Find matching python task
      let mission = tasks.find(t => !t.completed && (
        t.expectedCode === 'print("hello world")' ||
        (t.category && t.category.toLowerCase().includes('python')) ||
        (t.title && t.title.toLowerCase().includes('python'))
      ));

      if (!mission) {
        mission = tasks.find(t => !t.completed);
      }

      const rewardMoney = (mission && mission.rewardMoney) ? Number(mission.rewardMoney) : 450;
      const xp = (mission && mission.xp) ? Number(mission.xp) : 160;

      if (mission) {
        mission.completed = true;
        this.completedTaskTitles.add(mission.title);
        this.renderSweTaskList(charId);
        this.updatePhoneBadge();

        const allDone = tasks.length > 0 && tasks.every(t => t.completed);
        if (allDone && typeof this.onAllTasksCompleted === 'function') {
          this.onAllTasksCompleted(charId);
        }
      }

      // Credit corporate funds / Coins
      if (typeof window.addCorporateFunds === 'function') {
        window.addCorporateFunds(rewardMoney);
      } else if (window.state && window.state.player) {
        window.state.player.money = Math.max(0, (window.state.player.money !== undefined ? window.state.player.money : 0) + rewardMoney);
        const valEl = document.getElementById('hud-money-val');
        if (valEl) valEl.textContent = '$' + window.state.player.money.toLocaleString();
      }

      // Credit XP
      if (window.state && window.state.player) {
        window.state.player.score = (window.state.player.score || 0) + xp;
        const scoreEl = document.getElementById('stat-score');
        if (scoreEl) scoreEl.textContent = window.state.player.score;
      }

      // Play sound
      if (window.soundManager) {
        if (typeof window.soundManager.playCoinReward === 'function') {
          window.soundManager.playCoinReward();
        }
        if (typeof window.soundManager.playQuestComplete === 'function') {
          setTimeout(() => window.soundManager.playQuestComplete(), 150);
        }
      }

      // Sync Cloud Save if Firebase Sync active
      if (window.firebaseSync && typeof window.firebaseSync.saveProgress === 'function') {
        window.firebaseSync.saveProgress(false);
      }

      return { success: true, money: rewardMoney, xp, task: mission };
    }

    toggle() {
      const now = Date.now();
      if (this._lastToggle && (now - this._lastToggle) < 220) {
        return; // Debounce rapid keydown repeats
      }
      this._lastToggle = now;

      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      if (!this.initialized) this.init();
      if (!this.overlay) this.overlay = document.getElementById('phone-overlay');
      if (!this.wrapper) this.wrapper = document.getElementById('phone-wrapper');
      if (!this.body) this.body = document.getElementById('phone-body');

      this.isOpen = true;

      // Update character-specific phone theme
      const charId = this.getActiveCharId();
      const profile = this.profiles[charId] || this.profiles.char1;

      // Update phone wrapper theme class
      if (this.wrapper) {
        this.wrapper.className = `phone-wrapper ${profile.themeClass}`;
      }

      // Update clock & carrier
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const clockEl = document.getElementById('phone-clock');
      if (clockEl) clockEl.textContent = timeStr;

      const carrierEl = document.getElementById('phone-carrier');
      if (carrierEl) carrierEl.textContent = profile.carrier;

      // Update character widget
      const widgetTitle = document.getElementById('phone-widget-title');
      const widgetPill = document.getElementById('phone-widget-pill');
      const widgetBody = document.getElementById('phone-widget-body');
      if (widgetTitle) widgetTitle.innerHTML = profile.widgetTitle;
      if (widgetPill) widgetPill.textContent = profile.widgetPill;
      if (widgetBody) widgetBody.innerHTML = profile.widgetBody;

      // Refresh live task notification
      this.refreshTaskNotification(profile);

      // Play character unique ring chime
      this.playPhoneChime(profile.tones);

      // Show overlay
      if (this.overlay) {
        this.overlay.classList.remove('hidden');
      }

      // Clear unread badge
      this.updatePhoneBadge();
    }

    close() {
      if (!this.isOpen) return;
      this.closeApp();
      this.isOpen = false;
      if (!this.overlay) this.overlay = document.getElementById('phone-overlay');
      if (this.overlay) {
        this.overlay.classList.add('hidden');
      }
    }

    // ==================================================================
    // IN-PHONE APPS CONTROLLER SYSTEM (Camera, Chat, Mail, Quests, etc.)
    // ==================================================================
    openApp(appName) {
      this.currentApp = appName;
      const homeView = document.getElementById('phone-home-view');
      const appView = document.getElementById('phone-app-view');
      if (homeView) homeView.style.display = 'none';
      if (appView) appView.style.display = 'flex';

      const titleEl = document.getElementById('phone-app-title');
      const bodyEl = document.getElementById('phone-app-body');
      const actionEl = document.getElementById('phone-app-action');

      if (window.soundManager && typeof window.soundManager.playInteract === 'function') {
        window.soundManager.playInteract();
      }

      switch (appName) {
        case 'camera':
          this.renderCameraApp(titleEl, bodyEl, actionEl);
          break;
        case 'chat':
          this.renderChatApp(titleEl, bodyEl, actionEl);
          break;
        case 'mail':
          this.renderMailApp(titleEl, bodyEl, actionEl);
          break;
        case 'quests':
          this.renderQuestsApp(titleEl, bodyEl, actionEl);
          break;
        case 'browser':
          this.renderBrowserApp(titleEl, bodyEl, actionEl);
          break;
        case 'terminal':
          this.renderTerminalApp(titleEl, bodyEl, actionEl);
          break;
        case 'notes':
          this.renderNotesApp(titleEl, bodyEl, actionEl);
          break;
        case 'music':
          this.renderMusicApp(titleEl, bodyEl, actionEl);
          break;
        case 'settings':
          this.renderSettingsApp(titleEl, bodyEl, actionEl);
          break;
        default:
          this.closeApp();
          break;
      }
    }

    closeApp() {
      if (this.currentApp === 'camera') {
        this.stopCamera();
      }
      this.currentApp = null;
      const homeView = document.getElementById('phone-home-view');
      const appView = document.getElementById('phone-app-view');
      if (appView) appView.style.display = 'none';
      if (homeView) homeView.style.display = 'flex';
    }

    // ------------------------------------------------------------------
    // 1. CAMERA APP (Webcam live preview, shutter, filter & snapshot)
    // ------------------------------------------------------------------
    renderCameraApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '📷 Camera';
      if (actionEl) {
        actionEl.innerHTML = `<button id="camera-filter-btn" class="phone-app-back-btn" title="Cycle Filter">✨ Filter</button>`;
        const fBtn = document.getElementById('camera-filter-btn');
        if (fBtn) fBtn.onclick = () => this.cycleCameraFilter();
      }

      const activeFilter = this.cameraFilters[this.cameraFilterIndex] || 'none';
      const recentPhoto = (this.capturedPhotos && this.capturedPhotos[0]) || '';

      bodyEl.innerHTML = `
        <div class="camera-app-viewport">
          <video id="phone-camera-video" class="camera-video-feed" style="filter: ${activeFilter}; display:none;" autoplay playsinline muted></video>
          <div id="phone-camera-fallback" class="camera-fallback-screen">
            <div class="camera-fallback-avatar">📸</div>
            <div style="font-size:0.85rem; font-weight:700; color:#38bdf8;">Connecting Laptop Camera...</div>
            <div style="font-size:0.65rem; color:#94a3b8;">If prompted, allow camera permissions to see live video.</div>
          </div>
          <div class="camera-controls-bar">
            ${recentPhoto ? `<img id="camera-thumb-preview" class="camera-preview-thumb" src="${recentPhoto}" title="Click to view & download photo" />` : `<div style="width:38px; height:38px; border-radius:8px; border:1px dashed #475569;"></div>`}
            <button class="camera-shutter-btn" id="phone-shutter-btn" title="Snap Photo"></button>
            <button id="camera-switch-btn" class="phone-app-back-btn" style="border-radius:50%; width:38px; height:38px; padding:0; justify-content:center; font-size:16px;" title="Reset Camera">🔄</button>
          </div>
        </div>
      `;

      const shutterBtn = document.getElementById('phone-shutter-btn');
      if (shutterBtn) shutterBtn.onclick = () => this.takeCameraPhoto();

      const switchBtn = document.getElementById('camera-switch-btn');
      if (switchBtn) switchBtn.onclick = () => {
        this.stopCamera();
        this.startCamera();
      };

      const thumb = document.getElementById('camera-thumb-preview');
      if (thumb) thumb.onclick = () => this.showCapturedPhotoModal();

      this.startCamera();
    }

    async startCamera() {
      const videoEl = document.getElementById('phone-camera-video');
      const fallbackEl = document.getElementById('phone-camera-fallback');
      if (!videoEl) return;

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          });
          this.activeCameraStream = stream;
          videoEl.srcObject = stream;
          videoEl.style.display = 'block';
          if (fallbackEl) fallbackEl.style.display = 'none';
          await videoEl.play();
        } else {
          throw new Error('getUserMedia not supported');
        }
      } catch (err) {
        console.warn('Camera stream could not be opened:', err);
        if (videoEl) videoEl.style.display = 'none';
        if (fallbackEl) {
          fallbackEl.style.display = 'flex';
          fallbackEl.innerHTML = `
            <div class="camera-fallback-avatar">🕶️</div>
            <div style="font-size:0.85rem; font-weight:700; color:#38bdf8;">Office Selfie Booth</div>
            <div style="font-size:0.68rem; color:#94a3b8; line-height:1.4;">Laptop camera is unavailable or blocked in browser settings.<br>Press the white shutter button to capture a retro corporate badge selfie!</div>
          `;
        }
      }
    }

    stopCamera() {
      if (this.activeCameraStream) {
        try {
          this.activeCameraStream.getTracks().forEach(t => t.stop());
        } catch (e) {}
        this.activeCameraStream = null;
      }
    }

    cycleCameraFilter() {
      this.cameraFilterIndex = (this.cameraFilterIndex + 1) % this.cameraFilters.length;
      const f = this.cameraFilters[this.cameraFilterIndex];
      const videoEl = document.getElementById('phone-camera-video');
      if (videoEl) videoEl.style.filter = f;
      if (typeof window.showToast === 'function') {
        const names = ['Normal', 'B&W Noir', 'Retro Sepia', 'Cyberpunk Neon', 'High Contrast'];
        window.showToast(`✨ Filter: ${names[this.cameraFilterIndex]}`);
      }
    }

    takeCameraPhoto() {
      const flash = document.getElementById('phone-camera-flash');
      if (flash) {
        flash.classList.add('flash');
        setTimeout(() => flash.classList.remove('flash'), 220);
      }

      if (window.soundManager && typeof window.soundManager.playInteract === 'function') {
        window.soundManager.playInteract();
      }

      const videoEl = document.getElementById('phone-camera-video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (videoEl && videoEl.srcObject && videoEl.videoWidth) {
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        // Mirror horizontally for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.filter = this.cameraFilters[this.cameraFilterIndex] || 'none';
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback stylized snapshot
        canvas.width = 480;
        canvas.height = 360;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 480, 360);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('ACME CORP • RETRO SELFIE 📸', 60, 160);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px monospace';
        ctx.fillText(`Timestamp: ${new Date().toLocaleTimeString()}`, 80, 200);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      this.capturedPhotos.unshift(dataUrl);

      // Re-render camera controls to update thumbnail
      const titleEl = document.getElementById('phone-app-title');
      const bodyEl = document.getElementById('phone-app-body');
      const actionEl = document.getElementById('phone-app-action');
      this.renderCameraApp(titleEl, bodyEl, actionEl);

      if (typeof window.showToast === 'function') {
        window.showToast('📸 Photo captured! Saved to phone gallery.');
      }
    }

    showCapturedPhotoModal() {
      if (!this.capturedPhotos || this.capturedPhotos.length === 0) return;
      const photo = this.capturedPhotos[0];
      const win = window.open('');
      if (win) {
        win.document.write(`
          <title>ACME Smartphone Photo</title>
          <body style="margin:0; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; color:#fff; font-family:sans-serif;">
            <img src="${photo}" style="max-width:90%; max-height:80vh; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.8); border:2px solid #38bdf8;" />
            <div style="margin-top:15px; display:flex; gap:10px;">
              <a href="${photo}" download="office-selfie.jpg" style="background:#38bdf8; color:#0f172a; font-weight:bold; padding:8px 18px; border-radius:20px; text-decoration:none;">💾 Download Photo</a>
            </div>
          </body>
        `);
      }
    }

    // ------------------------------------------------------------------
    // 2. CHAT APP (Channels, Coworker AI & Multiplayer sync)
    // ------------------------------------------------------------------
    renderChatApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '💬 OmniChat';
      if (actionEl) actionEl.innerHTML = '';

      const channels = [
        { id: 'general', label: '#general' },
        { id: 'dev', label: '#dev-squad' },
        { id: 'hr', label: '#hr-amit' },
        { id: 'multiplayer', label: '🌐 Online' }
      ];

      const currentChan = this.activeChatChannel || 'general';
      const messages = this.chatMessages[currentChan] || [];

      bodyEl.innerHTML = `
        <div class="chat-app-container">
          <div class="chat-channel-bar">
            ${channels.map(c => `
              <button class="chat-tab-btn ${c.id === currentChan ? 'active' : ''}" data-chan="${c.id}">${c.label}</button>
            `).join('')}
          </div>
          <div class="chat-messages-scroll" id="chat-messages-scroll">
            ${messages.map(m => `
              <div class="chat-msg-row ${m.mine ? 'mine' : ''}">
                ${!m.mine ? `<div class="chat-avatar">${m.avatar || '👤'}</div>` : ''}
                <div class="chat-bubble ${m.mine ? 'mine' : ''}">
                  ${!m.mine ? `<div class="chat-sender-name">${m.sender} <span style="font-size:0.58rem; color:#64748b; font-weight:normal;">${m.time || ''}</span></div>` : ''}
                  <div>${m.text}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <form class="chat-input-bar" id="chat-form">
            <input type="text" class="chat-input" id="chat-input-text" placeholder="Message ${currentChan === 'multiplayer' ? 'all online players' : '#' + currentChan}..." autocomplete="off" />
            <button type="submit" class="chat-send-btn">Send</button>
          </form>
        </div>
      `;

      // Tab switcher
      bodyEl.querySelectorAll('.chat-tab-btn').forEach(btn => {
        btn.onclick = (e) => {
          this.activeChatChannel = e.target.getAttribute('data-chan');
          this.renderChatApp(titleEl, bodyEl, actionEl);
        };
      });

      // Scroll to bottom
      const scrollEl = document.getElementById('chat-messages-scroll');
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;

      // Send form
      const form = document.getElementById('chat-form');
      const input = document.getElementById('chat-input-text');
      if (form && input) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const text = input.value.trim();
          if (!text) return;
          input.value = '';
          this.sendChatMessage(text, currentChan, titleEl, bodyEl, actionEl);
        };
      }
    }

    sendChatMessage(text, chan, titleEl, bodyEl, actionEl) {
      const charId = this.getActiveCharId();
      const profile = this.profiles[charId] || this.profiles.char1;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (!this.chatMessages[chan]) this.chatMessages[chan] = [];
      this.chatMessages[chan].push({
        sender: profile.name,
        mine: true,
        text: text,
        time: nowStr,
        avatar: '😎'
      });

      // Broadcast to multiplayer if peer available
      if (chan === 'multiplayer' || chan === 'general') {
        try {
          if (window.multiplayerEngine && typeof window.multiplayerEngine.broadcastChat === 'function') {
            window.multiplayerEngine.broadcastChat(text);
          }
        } catch (err) {}
      }

      this.renderChatApp(titleEl, bodyEl, actionEl);

      // Automated coworker reply for single player / offline banter
      if (chan !== 'multiplayer') {
        setTimeout(() => {
          const replies = [
            { sender: 'Amit (HR)', text: 'Acknowledged! Keep up the momentum on your sprint tasks. 🚀', avatar: '👔' },
            { sender: 'Vikram', text: 'Checked the logs, latency is down to 0.4ms. Looking solid!', avatar: '💻' },
            { sender: 'Neha', text: 'Great point. Adding this to our retro discussion.', avatar: '📋' },
            { sender: 'Kabir', text: 'Confirmed. Sensor coherence is 99.98% stable.', avatar: '🔬' },
            { sender: 'Rohan', text: 'Pods scaled up cleanly. Zero drift across regions.', avatar: '🛡️' }
          ];
          const rep = replies[Math.floor(Math.random() * replies.length)];
          this.chatMessages[chan].push({
            sender: rep.sender,
            mine: false,
            text: rep.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: rep.avatar
          });
          if (this.currentApp === 'chat' && this.activeChatChannel === chan) {
            this.renderChatApp(titleEl, bodyEl, actionEl);
          }
        }, 1200);
      }
    }

    // ------------------------------------------------------------------
    // 3. MAIL APP (Directives, executive emails & replies)
    // ------------------------------------------------------------------
    renderMailApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '✉️ OmniMail';
      if (actionEl) actionEl.innerHTML = '';

      const emails = [
        {
          id: 'mail_1',
          sender: 'Mark Sterling (VP of Tech)',
          time: '09:15 AM',
          subject: 'Q4 Architecture Milestone & Deliverables',
          body: 'Team, please ensure the multi-region cluster quorum logic and Python data pipelines are completed before the sprint review. Excellent progress this week!'
        },
        {
          id: 'mail_2',
          sender: 'Amit Sharma (HR Manager)',
          time: 'Yesterday',
          subject: 'Espresso Machine Guidelines & Office Perks',
          body: 'Friendly reminder to all engineers: please ensure your glass is placed inside the green alignment reticle before dispensing coffee to keep the pantry clean!'
        },
        {
          id: 'mail_3',
          sender: 'Sarah Jenkins (Client Exec)',
          time: 'Oct 26',
          subject: 'Demo Feedback: Customer Applauded Telemetry',
          body: 'The client specifically praised our sub-1ms ingestion latency and interactive holographic floor map. Great teamwork everyone!'
        }
      ];

      bodyEl.innerHTML = `
        <div class="mail-list">
          ${emails.map(m => `
            <div class="mail-item" data-mail-id="${m.id}">
              <div class="mail-item-header">
                <span class="mail-sender">${m.sender}</span>
                <span class="mail-time">${m.time}</span>
              </div>
              <div class="mail-subject">${m.subject}</div>
              <div class="mail-snippet">${m.body}</div>
            </div>
          `).join('')}
        </div>
      `;

      bodyEl.querySelectorAll('.mail-item').forEach(el => {
        el.onclick = () => {
          const mailId = el.getAttribute('data-mail-id');
          const item = emails.find(e => e.id === mailId);
          if (item) {
            bodyEl.innerHTML = `
              <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="phone-app-back-btn" id="mail-back-list-btn" style="width:fit-content;">‹ Back to Inbox</button>
                <div style="font-size:0.85rem; font-weight:700; color:#f8fafc; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">${item.subject}</div>
                <div style="font-size:0.68rem; color:#38bdf8;">From: ${item.sender}</div>
                <div style="font-size:0.72rem; color:#cbd5e1; line-height:1.4; background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px;">${item.body}</div>
                <button class="chat-send-btn" id="mail-reply-btn" style="padding:8px; margin-top:8px;">↩ Quick Reply ("Acknowledged, working on it!")</button>
              </div>
            `;
            const backBtn = document.getElementById('mail-back-list-btn');
            if (backBtn) backBtn.onclick = () => this.renderMailApp(titleEl, bodyEl, actionEl);
            const repBtn = document.getElementById('mail-reply-btn');
            if (repBtn) repBtn.onclick = () => {
              if (typeof window.showToast === 'function') {
                window.showToast(`✉️ Reply sent to ${item.sender}!`);
              }
              this.renderMailApp(titleEl, bodyEl, actionEl);
            };
          }
        };
      });
    }

    // ------------------------------------------------------------------
    // 4. QUESTS APP (Sprint Tasks & Cash/XP claims)
    // ------------------------------------------------------------------
    renderQuestsApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '📜 Sprint Quests';
      if (actionEl) {
        actionEl.innerHTML = `<button id="quest-refresh-btn" class="phone-app-back-btn" title="Refresh">🔄 Refresh</button>`;
        const qBtn = document.getElementById('quest-refresh-btn');
        if (qBtn) qBtn.onclick = () => {
          const charId = this.getActiveCharId();
          this.sprintRound++;
          this.assignNewHRTasks(charId);
          setTimeout(() => this.renderQuestsApp(titleEl, bodyEl, actionEl), 300);
        };
      }

      const charId = this.getActiveCharId();
      const tasks = this.characterTasks[charId] || [];

      bodyEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="background:rgba(30,41,59,0.85); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; font-weight:700; color:#f8fafc;">Sprint #${this.sprintRound} Progress</div>
              <div style="font-size:0.62rem; color:#94a3b8;">${tasks.filter(t=>t.completed).length}/${tasks.length} tasks completed</div>
            </div>
            <span style="font-size:0.75rem; font-weight:800; color:#10b981;">+$$$ CASH REWARDS</span>
          </div>
          <div id="phone-quests-app-list" style="display:flex; flex-direction:column; gap:6px;">
            ${tasks.map(t => {
              const r = getTaskDifficultyAndMoney(t);
              return `
                <div class="swe-task-notif-card ${t.completed ? 'completed' : ''}" data-task-id="${t.id}" style="cursor:pointer;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.72rem; font-weight:700; color:${t.completed ? '#10b981' : '#f8fafc'};">${t.title}</span>
                    <span style="font-size:0.65rem; font-weight:700; color:#38bdf8;">+$${r.money}</span>
                  </div>
                  <div style="font-size:0.64rem; color:#94a3b8; margin:4px 0;">${t.description}</div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.60rem; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:8px;">${t.category || 'Tech'}</span>
                    <button class="chat-tab-btn ${t.completed ? 'active' : ''}" style="font-size:0.62rem;" data-task-id="${t.id}">
                      ${t.completed ? '✓ Completed' : '⚡ Tick & Claim'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      bodyEl.querySelectorAll('button[data-task-id]').forEach(b => {
        b.onclick = (e) => {
          e.stopPropagation();
          const tid = b.getAttribute('data-task-id');
          this.toggleTaskCompleted(charId, tid);
          setTimeout(() => this.renderQuestsApp(titleEl, bodyEl, actionEl), 150);
        };
      });
    }

    // ------------------------------------------------------------------
    // 5. BROWSER APP (Corporate Intranet, Wiki, Git & AI Assistant)
    // ------------------------------------------------------------------
    renderBrowserApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '🌐 Intranet';
      if (actionEl) actionEl.innerHTML = '';

      const tab = this.activeBrowserTab || 'wiki';
      const bms = [
        { id: 'wiki', label: '📖 Office Wiki' },
        { id: 'git', label: '🐙 GitDeploy' },
        { id: 'news', label: '📰 Tech News' },
        { id: 'ai', label: '🤖 Groq AI' }
      ];

      let contentHtml = '';
      if (tab === 'wiki') {
        contentHtml = `
          <div style="font-weight:700; font-size:0.8rem; color:#38bdf8; margin-bottom:6px;">🏢 ACME Innovation Mega-Hub Manual</div>
          <p>• <b>Fast Travel:</b> Press <b>[M]</b> anytime to view the live blueprint map and teleport instantly between rooms.</p>
          <p>• <b>Espresso Bar:</b> Slide the glass mug under the green reticle before starting pour to prevent hot spills.</p>
          <p>• <b>Conference Room:</b> Check behind the presentation projector screen for hidden company easter eggs!</p>
          <p>• <b>Multiplayer:</b> Peer-to-peer cloud syncing ensures real-time movement and chat with coworkers.</p>
        `;
      } else if (tab === 'git') {
        contentHtml = `
          <div style="font-weight:700; font-size:0.8rem; color:#10b981; margin-bottom:6px;">🐙 GitDeploy Pipeline Status: GREEN</div>
          <div style="background:rgba(0,0,0,0.5); padding:6px; border-radius:8px; font-family:monospace; font-size:0.65rem; color:#22c55e;">
            [v2.4.1] • Commit: aac5e67 (Verified)<br>
            • Conference boundary collisions: RESOLVED<br>
            • Holographic office map 'M': DEPLOYED<br>
            • Movable espresso mug mechanics: ACTIVE<br>
            • 6th playable engineer (Rohan): ONLINE
          </div>
        `;
      } else if (tab === 'news') {
        contentHtml = `
          <div style="font-weight:700; font-size:0.8rem; color:#f59e0b; margin-bottom:6px;">📰 Silicon Valley Dispatch</div>
          <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;"><b>"AI Agent Learns to Brew Coffee, Demands Health Insurance"</b> - TechDigest</div>
          <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding:4px 0;"><b>"Engineer exits Vim after 7 years of deep meditation"</b> - HackerNews</div>
          <div style="padding:4px 0;"><b>"Global Server Uptime Hits 99.999% Following ACME Cluster Overhaul"</b></div>
        `;
      } else if (tab === 'ai') {
        contentHtml = `
          <div style="font-weight:700; font-size:0.8rem; color:#a855f7; margin-bottom:6px;">⚡ Groq AI (Model: gpt-oss-120b)</div>
          <p>Direct low-latency AI reasoning is hooked up to your smartphone for automated sprint directive generation and role-tailored software engineering tasks.</p>
          <div style="font-size:0.68rem; color:#94a3b8;">Latency: <b>0.12s</b> • Tokens/Sec: <b>450 t/s</b> • Status: Operational</div>
        `;
      }

      bodyEl.innerHTML = `
        <div style="display:flex; flex-direction:column; height:100%;">
          <div class="browser-url-bar">
            <span>🔒</span>
            <span style="flex:1;">https://intranet.acme.corp/${tab}</span>
            <span style="cursor:pointer;" id="bm-reload-btn">🔄</span>
          </div>
          <div class="browser-bookmarks">
            ${bms.map(b => `<button class="browser-bm-pill ${b.id === tab ? 'active' : ''}" data-bm="${b.id}">${b.label}</button>`).join('')}
          </div>
          <div class="browser-content-frame">
            ${contentHtml}
          </div>
        </div>
      `;

      bodyEl.querySelectorAll('.browser-bm-pill').forEach(btn => {
        btn.onclick = (e) => {
          this.activeBrowserTab = e.target.getAttribute('data-bm');
          this.renderBrowserApp(titleEl, bodyEl, actionEl);
        };
      });

      const rel = document.getElementById('bm-reload-btn');
      if (rel) rel.onclick = () => this.renderBrowserApp(titleEl, bodyEl, actionEl);
    }

    // ------------------------------------------------------------------
    // 6. TERMINAL APP (Interactive shell with rich commands)
    // ------------------------------------------------------------------
    renderTerminalApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '💻 Terminal';
      if (actionEl) {
        actionEl.innerHTML = `<button id="term-clear-btn" class="phone-app-back-btn">Clear</button>`;
        const cBtn = document.getElementById('term-clear-btn');
        if (cBtn) cBtn.onclick = () => {
          const out = document.getElementById('terminal-output');
          if (out) out.textContent = 'ACME OmniOS Shell v4.2.0 (tty1)\nType "help" for commands.\n';
        };
      }

      bodyEl.innerHTML = `
        <div class="terminal-screen">
          <div class="terminal-output" id="terminal-output">ACME OmniOS Shell v4.2.0 (tty1)\nType "help" to view available commands.\n</div>
          <form class="terminal-prompt-row" id="terminal-form">
            <span class="terminal-prompt-label">&gt;_</span>
            <input type="text" class="terminal-input" id="terminal-input" placeholder="type command..." autofocus autocomplete="off" />
          </form>
        </div>
      `;

      const form = document.getElementById('terminal-form');
      const input = document.getElementById('terminal-input');
      const output = document.getElementById('terminal-output');

      if (form && input && output) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const cmd = input.value.trim();
          input.value = '';
          if (!cmd) return;
          this.executeTerminalCommand(cmd, output);
        };
      }
    }

    executeTerminalCommand(cmd, outputEl) {
      const charId = this.getActiveCharId();
      const profile = this.profiles[charId] || this.profiles.char1;
      const lower = cmd.toLowerCase().trim();

      outputEl.textContent += `\n$ ${cmd}\n`;

      if (lower === 'help') {
        outputEl.textContent += `Available Commands:\n• status   - View player stats, money & room\n• whoami   - Current role & device profile\n• ls       - List directory contents\n• cat <f>  - Read file (e.g. cat roadmap.txt)\n• coffee   - Virtual espresso injection (+speed)\n• clear    - Clear terminal screen\n• ping     - Test cluster latency\n• matrix   - Matrix green cascade test\n`;
      } else if (lower === 'status') {
        const money = (window.state && window.state.player && window.state.player.money) || 0;
        const scene = (window.state && window.state.currentScene) || 'OFFICE_HALL';
        outputEl.textContent += `Player: ${profile.name}\nFunds: $${money}\nLocation: ${scene}\nHealth: 100% • All Systems Go\n`;
      } else if (lower === 'whoami') {
        outputEl.textContent += `User: ${profile.name}\nRole: ${profile.role}\nDevice: ${profile.deviceName}\nNetwork: ${profile.carrier}\n`;
      } else if (lower === 'ls') {
        outputEl.textContent += `roadmap.txt   cluster_config.yaml   secret_passcodes.bin   easter_egg.py\n`;
      } else if (lower.startsWith('cat')) {
        outputEl.textContent += `[CONFIDENTIAL ACME ARCHITECTURE]\n"The future of office engineering is cloud-native, pixel-perfect, and fully automated."\n`;
      } else if (lower === 'coffee') {
        outputEl.textContent += `☕ Espresso shot brewed! Caffeine levels increased to 100%.\n`;
        if (typeof window.showToast === 'function') window.showToast('☕ Virtual espresso ingested!');
      } else if (lower === 'ping') {
        outputEl.textContent += `PING api.acme.corp: 64 bytes in 0.42ms (RTT min/avg/max = 0.38/0.41/0.45 ms)\n`;
      } else if (lower === 'matrix') {
        outputEl.textContent += `01001111 01000110 01000110 01001001 01000011 01000101\nWAKE UP, ENGINEER... THE SYSTEM IS READY.\n`;
      } else if (lower === 'clear') {
        outputEl.textContent = 'ACME OmniOS Shell v4.2.0 (tty1)\n';
      } else {
        outputEl.textContent += `Unknown command: "${cmd}". Type "help" for options.\n`;
      }

      outputEl.scrollTop = outputEl.scrollHeight;
    }

    // ------------------------------------------------------------------
    // 7. NOTES APP (Scratchpad, checklists & persistent localStorage)
    // ------------------------------------------------------------------
    renderNotesApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '📝 Notes';
      if (actionEl) {
        actionEl.innerHTML = `<button id="note-add-btn" class="phone-app-back-btn" title="Add Note">➕ Add</button>`;
        const aBtn = document.getElementById('note-add-btn');
        if (aBtn) aBtn.onclick = () => {
          const t = prompt('Note Title:', 'Quick Reminder');
          if (!t) return;
          const b = prompt('Note Details:', 'Meeting with team at 3 PM');
          if (!b) return;
          this.notes.unshift({ id: Date.now(), title: t, body: b });
          localStorage.setItem('OFFICE_PHONE_NOTES', JSON.stringify(this.notes));
          this.renderNotesApp(titleEl, bodyEl, actionEl);
        };
      }

      bodyEl.innerHTML = `
        <div class="notes-container">
          ${this.notes.map(n => `
            <div class="notes-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="notes-card-title">${n.title}</span>
                <span style="font-size:0.65rem; color:#ef4444; cursor:pointer;" data-del-note="${n.id}" title="Delete Note">✕</span>
              </div>
              <div class="notes-card-body">${n.body.replace(/\n/g, '<br>')}</div>
            </div>
          `).join('')}
        </div>
      `;

      bodyEl.querySelectorAll('[data-del-note]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = Number(btn.getAttribute('data-del-note'));
          this.notes = this.notes.filter(n => n.id !== id);
          localStorage.setItem('OFFICE_PHONE_NOTES', JSON.stringify(this.notes));
          this.renderNotesApp(titleEl, bodyEl, actionEl);
        };
      });
    }

    // ------------------------------------------------------------------
    // 8. MUSIC APP (Lo-Fi synth, animated equalizer & playback controls)
    // ------------------------------------------------------------------
    renderMusicApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '🎵 Music Player';
      if (actionEl) actionEl.innerHTML = '';

      const tracks = [
        { title: 'Lo-Fi Office Chillhop', artist: 'ACME Sound Lab', genre: 'Chillwave' },
        { title: '8-Bit Espresso Break', artist: 'Pixel Synthesizer', genre: 'Chiptune' },
        { title: 'Late Night Production Push', artist: 'CyberDeck', genre: 'Synthwave' },
        { title: 'Elevator Bossa Nova', artist: 'Lounge Bot', genre: 'Jazz' }
      ];

      const curIdx = this.musicState.trackIndex % tracks.length;
      const track = tracks[curIdx];
      const isPlaying = this.musicState.playing;

      bodyEl.innerHTML = `
        <div class="music-app-container">
          <div class="music-art-disc ${isPlaying ? 'playing' : ''}">🎧</div>
          <div>
            <div style="font-size:0.85rem; font-weight:800; color:#f8fafc; margin-bottom:2px;">${track.title}</div>
            <div style="font-size:0.68rem; color:#ec4899; font-weight:600;">${track.artist} • ${track.genre}</div>
          </div>
          <div class="music-eq-bars" style="${isPlaying ? '' : 'opacity:0.3;'}">
            <div class="music-eq-bar"></div>
            <div class="music-eq-bar"></div>
            <div class="music-eq-bar"></div>
            <div class="music-eq-bar"></div>
            <div class="music-eq-bar"></div>
          </div>
          <div class="music-controls-row">
            <button class="music-ctrl-btn" id="music-prev-btn" title="Previous Track">⏮</button>
            <button class="music-ctrl-btn play" id="music-toggle-play-btn" title="${isPlaying ? 'Pause' : 'Play'}">
              ${isPlaying ? '⏸' : '▶'}
            </button>
            <button class="music-ctrl-btn" id="music-next-btn" title="Next Track">⏭</button>
          </div>
          <div style="font-size:0.62rem; color:#94a3b8;">Synthesized WebAudio Stereo Output</div>
        </div>
      `;

      const playBtn = document.getElementById('music-toggle-play-btn');
      if (playBtn) playBtn.onclick = () => this.toggleMusicPlay(titleEl, bodyEl, actionEl);

      const nextBtn = document.getElementById('music-next-btn');
      if (nextBtn) nextBtn.onclick = () => this.nextMusicTrack(titleEl, bodyEl, actionEl);

      const prevBtn = document.getElementById('music-prev-btn');
      if (prevBtn) prevBtn.onclick = () => this.prevMusicTrack(titleEl, bodyEl, actionEl);
    }

    toggleMusicPlay(titleEl, bodyEl, actionEl) {
      this.musicState.playing = !this.musicState.playing;
      if (this.musicState.playing) {
        this.play8BitMelody();
      } else {
        this.stopMusicSynth();
      }
      this.renderMusicApp(titleEl, bodyEl, actionEl);
    }

    nextMusicTrack(titleEl, bodyEl, actionEl) {
      this.musicState.trackIndex = (this.musicState.trackIndex + 1) % 4;
      if (this.musicState.playing) {
        this.stopMusicSynth();
        this.play8BitMelody();
      }
      this.renderMusicApp(titleEl, bodyEl, actionEl);
    }

    prevMusicTrack(titleEl, bodyEl, actionEl) {
      this.musicState.trackIndex = (this.musicState.trackIndex - 1 + 4) % 4;
      if (this.musicState.playing) {
        this.stopMusicSynth();
        this.play8BitMelody();
      }
      this.renderMusicApp(titleEl, bodyEl, actionEl);
    }

    play8BitMelody() {
      if (!window.soundManager) return;
      window.soundManager.unlock();
      if (!window.soundManager.ctx) return;

      this.stopMusicSynth();

      const chords = [
        [261.63, 329.63, 392.00], // C
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63], // F
        [196.00, 246.94, 293.66]  // G
      ];

      let chordIdx = 0;
      this.musicState.interval = setInterval(() => {
        if (!this.musicState.playing || !window.soundManager || !window.soundManager.ctx) return;
        try {
          const ctx = window.soundManager.ctx;
          const t = ctx.currentTime;
          const currentChord = chords[chordIdx % chords.length];
          chordIdx++;

          currentChord.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.1);
            gain.gain.setValueAtTime(0.04, t + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);

            osc.connect(gain);
            gain.connect(window.soundManager.masterGain);
            osc.start(t + idx * 0.1);
            osc.stop(t + idx * 0.1 + 0.36);
          });
        } catch (e) {}
      }, 700);
    }

    stopMusicSynth() {
      if (this.musicState.interval) {
        clearInterval(this.musicState.interval);
        this.musicState.interval = null;
      }
    }

    // ------------------------------------------------------------------
    // 9. SETTINGS APP (CRT Mode, Audio, Game Keys & Themes)
    // ------------------------------------------------------------------
    renderSettingsApp(titleEl, bodyEl, actionEl) {
      if (titleEl) titleEl.innerHTML = '⚙️ Settings';
      if (actionEl) actionEl.innerHTML = '';

      const isCrt = (window.pixelEngine && window.pixelEngine.crtActive) || false;
      const isMuted = (window.soundManager && window.soundManager.muted) || false;

      bodyEl.innerHTML = `
        <div class="settings-list">
          <div class="settings-card">
            <div class="settings-info">
              <span class="settings-label">📺 CRT Scanline Filter</span>
              <span class="settings-subtext">Retro monitor cathode-ray tube emulation</span>
            </div>
            <button class="settings-toggle-btn ${isCrt ? 'active' : ''}" id="set-crt-btn">
              ${isCrt ? 'ON' : 'OFF'}
            </button>
          </div>

          <div class="settings-card">
            <div class="settings-info">
              <span class="settings-label">🔊 Master Sound & FX</span>
              <span class="settings-subtext">Synthesized retro audio feedback</span>
            </div>
            <button class="settings-toggle-btn ${!isMuted ? 'active' : ''}" id="set-sound-btn">
              ${!isMuted ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <div class="settings-card">
            <div class="settings-info">
              <span class="settings-label">🗺️ Holographic Office Map</span>
              <span class="settings-subtext">Toggle blueprint & radar tracking</span>
            </div>
            <button class="chat-tab-btn active" id="set-open-map-btn">
              Open Map [M]
            </button>
          </div>

          <div class="settings-card">
            <div class="settings-info">
              <span class="settings-label">🎮 Keyboard Shortcuts</span>
              <span class="settings-subtext">WASD/Arrows: Walk • M: Map • P: Phone • E: Interact</span>
            </div>
          </div>
        </div>
      `;

      const crtBtn = document.getElementById('set-crt-btn');
      if (crtBtn) crtBtn.onclick = () => {
        if (window.pixelEngine && typeof window.pixelEngine.toggleCRT === 'function') {
          const act = window.pixelEngine.toggleCRT();
          if (typeof window.showToast === 'function') window.showToast(act ? '📺 CRT Scanlines: ON' : '📺 CRT Scanlines: OFF');
          this.renderSettingsApp(titleEl, bodyEl, actionEl);
        }
      };

      const soundBtn = document.getElementById('set-sound-btn');
      if (soundBtn) soundBtn.onclick = () => {
        if (typeof window.toggleSound === 'function') {
          window.toggleSound();
          this.renderSettingsApp(titleEl, bodyEl, actionEl);
        }
      };

      const mapBtn = document.getElementById('set-open-map-btn');
      if (mapBtn) mapBtn.onclick = () => {
        this.close();
        if (window.officeMap && typeof window.officeMap.open === 'function') {
          window.officeMap.open();
        }
      };
    }

    playPhoneChime(tones = [587, 880]) {
      if (!window.soundManager) return;
      window.soundManager.unlock();
      if (window.soundManager.muted || !window.soundManager.ctx) return;

      try {
        const ctx = window.soundManager.ctx;
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(tones[0], t);
        osc.frequency.setValueAtTime(tones[1] || tones[0] * 1.5, t + 0.08);
        if (tones[2]) osc.frequency.setValueAtTime(tones[2], t + 0.16);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(window.soundManager.masterGain);

        osc.start(t);
        osc.stop(t + 0.40);
      } catch (err) {}
    }

    refreshTaskNotification(profile) {
      const sceneKey = (window.state && window.state.currentScene) || 'OFFICE_HALL';
      const scene = (window.SCENES && window.SCENES[sceneKey]) || {};

      const titleEl = document.getElementById('phone-notif-title');
      const locEl = document.getElementById('phone-notif-location');
      const descEl = document.getElementById('phone-notif-desc');

      const roomName = scene.name || 'Acme R&D Innovation Mega-Hub';

      if (locEl) locEl.textContent = `📍 ${roomName}`;
      if (titleEl) titleEl.textContent = `${profile.name}'s SWE Sprint Tasks`;
      if (descEl) descEl.textContent = `Groq AI generated priority software engineering tasks for ${profile.role}. Check off completed tasks to earn XP!`;

      // Render the SWE tasks
      this.renderSweTaskList(profile.id);
    }
  }

  // Instantiate singleton
  window.phoneDevice = new PhoneDeviceManager();

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.phoneDevice.init());
  } else {
    window.phoneDevice.init();
  }
})();
