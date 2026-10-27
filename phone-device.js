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
        category: 'Database',
        title: 'Benchmark PostgreSQL index hit ratio on telemetry logs',
        description: 'Analyze slow query logs. Create composite BRIN indexes on timestamp and tenant_id.',
        location: 'Dev Pod 1 • Terminal',
        xp: 130,
        completed: false
      },
      {
        id: 'task_v4',
        priority: 'P2',
        category: 'DevOps',
        title: 'Configure distributed tracing with OpenTelemetry',
        description: 'Inject W3C traceparent headers across inter-service gRPC calls for end-to-end latency flamegraphs.',
        location: 'Acme R&D Innovation Hub',
        xp: 110,
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
        category: 'Analytics',
        title: 'Validate OKR telemetry metrics for executive briefing',
        description: 'Audit monthly active developer engagement figures against Grafana production dashboards.',
        location: 'Big Workplace • Telemetry Screen',
        xp: 130,
        completed: false
      },
      {
        id: 'task_n4',
        priority: 'P2',
        category: 'Quality',
        title: 'Audit API SLA breach alert thresholds with SRE team',
        description: 'Calibrate P99 alert thresholds from 250ms to 180ms to catch micro-spikes before customers notice.',
        location: 'Executive Boardroom',
        xp: 105,
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
        category: 'Cryptography',
        title: 'Implement zero-knowledge proof verification endpoint',
        description: 'Deploy zk-SNARK verifier contract to validate audit trail integrity without exposing customer data.',
        location: 'Assigned PC • Terminal',
        xp: 130,
        completed: false
      },
      {
        id: 'task_k4',
        priority: 'P2',
        category: 'Optimization',
        title: 'Profile SIMD vectorization in Rust data pipeline',
        description: 'Utilize AVX-512 intrinsic instructions to accelerate streaming decompression 4.2x.',
        location: 'Intranet Browser • Benchmarks',
        xp: 110,
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
        category: 'Resilience',
        title: 'Implement circuit-breaker pattern in downstream RPC clients',
        description: 'Integrate Exponential backoff and jittered retry policies to prevent thundering herd failure.',
        location: 'Dev Pod 4 • Workstation',
        xp: 130,
        completed: false
      },
      {
        id: 'task_j4',
        priority: 'P2',
        category: 'Database',
        title: 'Design zero-downtime blue/green schema migration',
        description: 'Use expand-and-contract pattern with shadow column triggers for PostgreSQL user table upgrade.',
        location: 'Acme R&D Innovation Hub',
        xp: 110,
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
          priority: 'P2',
          category: 'DevOps',
          title: 'Deploy canary release of Kafka partitioned consumer v2.4',
          description: 'Route 5% of event stream to new consumer group with lag monitoring alerts.',
          location: 'Acme R&D Innovation Hub',
          xp: 115,
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
          priority: 'P2',
          category: 'Infra',
          title: 'Migrate Elasticsearch cluster to OpenSearch 2.11',
          description: 'Execute zero-downtime reindexing pipeline and test vector search kNN embeddings.',
          location: 'Dev Pod 1 • Terminal',
          xp: 120,
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
      this._pushTimeout = null;

      // Character Tasks in Memory
      this.characterTasks = {
        char1: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char1)),
        char2: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char2)),
        char3: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char3)),
        char4: JSON.parse(JSON.stringify(DEFAULT_SWE_TASKS.char4))
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
          <!-- Hand holding phone -->
          <div class="phone-hand-container">
            <div class="phone-hand-left-fingers">
              <div class="hand-finger"></div>
              <div class="hand-finger"></div>
              <div class="hand-finger"></div>
            </div>
            <div class="phone-hand-thumb"></div>
            <div class="phone-hand-cuff"></div>
          </div>

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

              <!-- Scrollable Phone Screen View -->
              <div class="phone-content">
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
                    Groq AI generated 4-5 priority tasks for your engineering role. Click checkboxes to complete tasks and earn XP!
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
      const headerRight = document.querySelector('.header-right');
      if (headerRight && !document.getElementById('btn-phone-toggle')) {
        const btn = document.createElement('button');
        btn.id = 'btn-phone-toggle';
        btn.className = 'btn-pager-toggle';
        btn.title = 'Open Smartphone & Groq AI Tasks (P)';
        btn.innerHTML = `
          <span class="pager-icon">📱</span>
          <span class="pager-label">Phone</span>
          <span class="phone-badge" id="phone-header-badge">4</span>
        `;
        btn.onclick = () => this.toggle();

        const pagerBtn = document.getElementById('btn-open-pager');
        if (pagerBtn && pagerBtn.nextSibling) {
          headerRight.insertBefore(btn, pagerBtn.nextSibling);
        } else {
          headerRight.appendChild(btn);
        }
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
          this.close();
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

      // Close pill click
      const homePill = document.getElementById('phone-home-pill');
      if (homePill) homePill.onclick = () => this.close();

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
          this.close();
          if (typeof window.toggleClassicDashboard === 'function') {
            window.toggleClassicDashboard();
          }
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

      // App button wiring
      const chatBtn = document.getElementById('app-btn-chat');
      if (chatBtn) {
        chatBtn.onclick = () => {
          this.close();
          if (typeof window.togglePagerModal === 'function') {
            window.togglePagerModal();
          }
        };
      }

      const questBtn = document.getElementById('app-btn-quest');
      if (questBtn) {
        questBtn.onclick = () => {
          this.close();
          if (typeof window.toggleClassicDashboard === 'function') {
            window.toggleClassicDashboard();
          }
        };
      }

      const browserBtn = document.getElementById('app-btn-browser');
      if (browserBtn) {
        browserBtn.onclick = () => {
          this.close();
          if (window.pcOS && typeof window.pcOS.open === 'function') {
            window.pcOS.open();
            setTimeout(() => {
              if (typeof window.pcOS.openBrowser === 'function') window.pcOS.openBrowser();
            }, 300);
          } else if (typeof window.showToast === 'function') {
            window.showToast('🌐 Log into your assigned desk PC to access Intranet!');
          }
        };
      }

      const cameraBtn = document.getElementById('app-btn-camera');
      if (cameraBtn) {
        cameraBtn.onclick = () => this.takeSnapshot();
      }

      const terminalBtn = document.getElementById('app-btn-terminal');
      if (terminalBtn) {
        terminalBtn.onclick = () => {
          if (window.soundManager) window.soundManager.playInteract();
          if (typeof window.showToast === 'function') {
            window.showToast('💻 OmniTerminal: Latency 0.8ms • All systems operational');
          }
        };
      }

      const notesBtn = document.getElementById('app-btn-notes');
      if (notesBtn) {
        notesBtn.onclick = () => {
          if (window.soundManager) window.soundManager.playInteract();
          const obj = document.getElementById('objective-text');
          if (typeof window.showToast === 'function') {
            window.showToast(obj ? `📝 Note: ${obj.textContent}` : '📝 Clear daily missions!');
          }
        };
      }

      const musicBtn = document.getElementById('app-btn-music');
      if (musicBtn) {
        musicBtn.onclick = () => {
          if (typeof window.toggleSound === 'function') {
            window.toggleSound();
          }
        };
      }

      const settingsBtn = document.getElementById('app-btn-settings');
      if (settingsBtn) {
        settingsBtn.onclick = () => {
          if (window.pixelEngine && typeof window.pixelEngine.toggleCRT === 'function') {
            const active = window.pixelEngine.toggleCRT();
            if (typeof window.showToast === 'function') {
              window.showToast(active ? '📺 CRT Scanlines: ON' : '📺 CRT Scanlines: OFF');
            }
          }
        };
      }
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
        return parsed.map((item, idx) => ({
          id: item.id || `hr_groq_${sprintNum}_${charId}_${Date.now()}_${idx}`,
          priority: (item.priority && item.priority.toUpperCase()) || (idx === 0 ? 'P0' : 'P1'),
          category: item.category || 'Engineering',
          title: item.title || 'Engineering Task Directive',
          description: item.description || 'Implement assigned ticket according to sprint specifications.',
          location: item.location || 'Assigned Desk PC',
          xp: Number(item.xp) || (160 - idx * 15),
          completed: false
        }));
      }

      throw new Error('Parsed response was not a valid task array');
    }

    renderSweTaskList(charId) {
      const container = document.getElementById('phone-swe-tasks-list');
      if (!container) return;

      const tasks = this.characterTasks[charId] || [];
      if (tasks.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:15px; color:#94a3b8; font-size:0.75rem;">No active tasks. Tap Refresh to ask HR for tasks.</div>`;
        return;
      }

      container.innerHTML = tasks.map((t) => {
        const pClass = (t.priority || 'P1').toLowerCase();
        return `
          <div class="swe-task-card ${t.completed ? 'completed' : ''}" data-task-id="${t.id}">
            <div class="swe-task-header">
              <div class="swe-task-left">
                <div class="swe-task-checkbox ${t.completed ? 'checked' : ''}" data-task-id="${t.id}" title="Toggle Task Completion">
                  ${t.completed ? '✓' : ''}
                </div>
                <div class="swe-task-title">${t.title}</div>
              </div>
            </div>
            <div class="swe-task-badge-row">
              <span class="prio-tag prio-${pClass}">${t.priority || 'P1'}</span>
              <span class="cat-tag">${t.category || 'Tech'}</span>
              <span class="xp-tag">+${t.xp} XP</span>
            </div>
            <div class="swe-task-desc">${t.description}</div>
            <div class="swe-task-loc">📍 ${t.location}</div>
          </div>
        `;
      }).join('');

      // Attach click events to toggle completion
      const cards = container.querySelectorAll('.swe-task-card');
      cards.forEach(card => {
        const taskId = card.getAttribute('data-task-id');
        card.onclick = (e) => {
          this.toggleTaskCompleted(charId, taskId);
        };
      });
    }

    onAllTasksCompleted(charId) {
      if (this._isAssigningTasks) return;
      this._isAssigningTasks = true;

      const currentSprint = this.sprintRound;
      const bonusXp = 300;

      // Award sprint completion milestone bonus
      if (window.state && window.state.player) {
        window.state.player.score = (window.state.player.score || 0) + bonusXp;
        const scoreEl = document.getElementById('stat-score');
        if (scoreEl) scoreEl.textContent = window.state.player.score;
      }
      if (typeof window.addCorporateFunds === 'function') {
        window.addCorporateFunds(600);
      }

      if (typeof window.showToast === 'function') {
        window.showToast(`🏆 SPRINT #${currentSprint} COMPLETED! +${bonusXp} XP Bonus! Amit (HR) is assigning new sprint tasks...`);
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
          window.soundManager.playSuccess();
        } else {
          window.soundManager.playInteract();
        }
      }

      // Award XP Toast
      if (typeof window.showToast === 'function') {
        if (task.completed) {
          window.showToast(`⭐ +${task.xp} XP: Completed "${task.title}"!`);
          // Update game score/XP and corporate funds if player state exists
          if (window.state && window.state.player) {
            window.state.player.score = (window.state.player.score || 0) + task.xp;
            const scoreEl = document.getElementById('stat-score');
            if (scoreEl) scoreEl.textContent = window.state.player.score;
          }
          if (typeof window.addCorporateFunds === 'function') {
            window.addCorporateFunds(task.xp * 2);
          }
        } else {
          window.showToast(`↩️ Marked "${task.title}" as pending.`);
          if (typeof window.addCorporateFunds === 'function') {
            window.addCorporateFunds(-(task.xp * 2));
          }
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
      this.isOpen = false;
      if (!this.overlay) this.overlay = document.getElementById('phone-overlay');
      if (this.overlay) {
        this.overlay.classList.add('hidden');
      }
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
