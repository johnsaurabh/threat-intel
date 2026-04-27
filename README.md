<div align="center">

# Threat Intel Feed

**Personal CVE intelligence system — built for security engineers, not news readers.**

[![Live](https://img.shields.io/badge/Live-johnsaurabh.com%2Fthreat--intel-00ff9f?style=flat-square)](https://johnsaurabh.com/threat-intel)
[![Stack](https://img.shields.io/badge/Stack-React%20·%20TypeScript%20·%20Supabase-0A66C2?style=flat-square)](https://github.com/johnsaurabh/threat-intel)
[![Part of](https://img.shields.io/badge/Part%20of-personal--os-bf00ff?style=flat-square)](https://github.com/johnsaurabh/personal-os)

</div>

---

## What This Is

Most CVE feeds are noise. The NVD dumps hundreds of entries a day. Aggregators rank by CVSS alone, which is a bad signal — a CVSS 10 in OT/ICS firmware is not the same threat as a CVSS 10 in a widely-deployed web server with a public PoC and active KEV listing.

This is a personal threat intelligence interface built around a 5-tier classification system, real EPSS scores, CISA KEV tracking, PoC availability, and an AI enrichment pipeline that generates attack narratives, MITRE ATT&CK mappings, interview-style questions, and novelty scores per CVE — automatically.

It's the feed I actually use to stay current on the vulnerability landscape.

**Live at [johnsaurabh.com/threat-intel](https://johnsaurabh.com/threat-intel)**

---

## Features

### Tiered Classification
CVEs are classified into 5 tiers, not ranked by CVSS alone:

| Tier | Label | Signal |
|------|-------|--------|
| T0 | CRITICAL | Active exploitation confirmed |
| T1 | HIGH | Exploit available or CISA KEV listed |
| T2 | ELEVATED | High CVSS + high EPSS score |
| T3 | WATCH | Research value, no active exploitation |
| T4 | MONITOR | Low signal, context-dependent |

T0 CVEs trigger a red border pulse across the entire interface. You notice.

### Live Feed + Hall of Fame
Two tabs. The **Live Feed** is the current threat landscape — updated by a Lambda pipeline, auto-refreshed in the UI every 5 minutes on tab focus. The **Hall of Fame** is a curated set of historically significant CVEs organized by category: RCE, Memory Corruption, Auth Bypass, Crypto & Network, Supply Chain, Injection, LPE. These are the CVEs worth understanding deeply — EternalBlue, Log4Shell, Heartbleed, and their successors.

### AI Enrichment Pipeline
Each CVE is enriched by a Lambda pipeline that populates:
- **Attack Narrative** — plain-language explanation of how exploitation works
- **Root Cause** — the underlying vulnerability class and why it exists
- **Exploit Technique** — the specific mechanism (e.g. heap spray, type confusion, UAF)
- **MITRE ATT&CK Techniques** — clickable links to the MITRE technique pages
- **Similar CVEs** — related vulnerabilities worth cross-referencing (clickable, loads the related CVE inline)
- **Real-World Incidents** — documented cases where this was exploited in the wild
- **Exploitation Timeline** — from disclosure to weaponized exploit
- **Patch / Mitigation** — what to do about it
- **Detection Signatures** — log patterns and SIEM rules for catching active exploitation
- **Interview Questions** — the questions this CVE would generate in a security engineering interview
- **Key Concepts** — prerequisite knowledge to understand the vulnerability
- **Prevention Pattern** — the architectural fix, not just the patch
- **Novelty Score** — 1–10 rating of how novel the technique is (vs known exploitation patterns)
- **Chaining Potential** — what other vulnerabilities this chains well with

### Study Queue
Every CVE has a toggle — mark it as studied. State is persisted in localStorage, private to your browser. The stat bar tracks studied / total. When every CVE in a tier is studied, the count turns green.

### Filter System
- **Full-text search** across CVE ID, affected software, and metadata
- **Tier filter** — multi-select, show only T0+T1 if that's all you have time for
- **Ecosystem filter** — Windows, Linux Kernel, Browser, Cloud, Network Infra, Enterprise Software, Open Source, Mobile, Container/K8s, OT/ICS
- **Vulnerability type filter** — RCE, LPE, Auth Bypass, Memory Corruption, Injection, Deserialization, SSRF, Crypto, Supply Chain, Logic Flaw
- **KEV only** — show only confirmed exploited vulnerabilities
- **Unstudied only** — show only what you haven't reviewed yet
- Active filters render as removable chips below the filter bar

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DATA PIPELINE                         │
│                                                          │
│  NVD / CISA KEV / EPSS API                              │
│       │                                                  │
│  Lambda (ingestion) → Supabase (cves table)             │
│       │                                                  │
│  Lambda (enrichment) → Claude API → Supabase (update)   │
└────────────────────────┬────────────────────────────────┘
                         │ Supabase JS client
┌────────────────────────▼────────────────────────────────┐
│                    REACT FRONTEND                        │
│                                                          │
│  ThreatIntelPage                                         │
│  ├── StatBar          (total, studied, KEV, critical)   │
│  ├── TabBar           (Live Feed / Hall of Fame)         │
│  ├── FilterBar        (search, tier, ecosystem, type)   │
│  ├── TierSection[]    (collapsible T0–T4 groups)        │
│  │   └── CVECard[]   (per-CVE row with badges)          │
│  └── CVEDrawer        (slide-out detail panel)           │
│      ├── IntelCard    (CVSS, EPSS, KEV, PoC, actors)   │
│      ├── TechDeepDive (root cause, narrative, exploit)  │
│      ├── AttackChain  (MITRE, similar CVEs, incidents)  │
│      ├── DefenseDetection (patch, detection sigs)       │
│      └── KnowledgeAnchors (interview Qs, novelty)      │
└─────────────────────────────────────────────────────────┘
```

### Data Model

The `CVE` type covers both raw feed data and AI-enriched fields:

```typescript
interface CVE {
  // Identity
  id: string;
  cve_id: string;                  // e.g. "CVE-2024-12345"

  // Scoring
  cvss_score: number | null;
  epss_score: number | null;       // 0–1, probability of exploitation in 30 days
  tier: 0 | 1 | 2 | 3 | 4;

  // Flags
  in_kev: boolean;                 // CISA Known Exploited Vulnerabilities
  poc_available: boolean;

  // Classification
  affected_software: string | null;
  affected_versions: string | null;
  ecosystem: Ecosystem | null;
  vuln_type: VulnType | null;
  days_since_disclosure: number | null;
  difficulty: 'script-kiddie' | 'skilled' | 'nation-state' | null;
  threat_actors: string[] | null;

  // AI Enrichment (populated by Lambda pipeline)
  attack_narrative: string | null;
  root_cause: string | null;
  exploit_technique: string | null;
  exploit_prerequisites: string | null;
  mitre_techniques: string[] | null;
  similar_cves: string[] | null;
  real_world_incident: string | null;
  exploitation_timeline: string | null;
  patch_info: string | null;
  log_signatures: string | null;
  interview_questions: string[] | null;
  key_concepts: string[] | null;
  prevention_pattern: string | null;
  novelty_score: number | null;    // 1–10
  chaining_potential: string | null;

  // Hall of Fame
  hall_of_fame: boolean;
  hof_category: string | null;
}
```

### Key Implementation Details

**Auto-refresh on visibility.** The `useCVEFeed` hook listens for `visibilitychange` events. When you tab back in after 5+ minutes, it silently re-fetches. No polling, no timers.

**Drawer animation.** The feed column animates its right margin when the drawer opens, using Framer Motion's spring physics — the feed doesn't snap, it shifts. On mobile the drawer slides up as a full-screen sheet with a backdrop.

**Study queue in localStorage.** No backend for study state — it's private by definition. `useStudyQueue` serializes a `Set<string>` to localStorage under `jsb_study_queue`. Works across refreshes, zero server cost.

**Filter chips.** The `FilterBar` maintains a derived `activeChips` array from the current filter state. Each chip has its own `onRemove` handler — removing a tier chip removes only that tier, not all filters.

**Novelty scoring.** `KnowledgeAnchors` renders a `NoveltyBar` — a simple progress-bar visualization of the AI-assigned novelty score. Color transitions at 5 (orange) and 8 (red) for novel vs known techniques.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Data client | Supabase JS SDK |
| Enrichment pipeline | AWS Lambda + Claude API |
| Feed sources | NVD, CISA KEV, EPSS API |
| Styling | Inline styles (theme-consistent with personal-os) |

---

## Source Structure

```
src/
├── pages/
│   └── ThreatIntelPage.tsx      # Main page: layout, tab state, drawer coordination
├── components/
│   ├── CVECard.tsx              # Per-CVE row: ID, badges, CVSS/EPSS, studied toggle
│   ├── CVEDrawer.tsx            # Slide-out panel: header + 5 sub-components
│   ├── FilterBar.tsx            # Search + multi-select filters + active chips
│   ├── StatBar.tsx              # Live counts: total, studied, KEV, critical
│   ├── TierSection.tsx          # Collapsible tier group with progress tracking
│   └── drawer/
│       ├── IntelCard.tsx        # Basic intel: scores, flags, actors, disclosure age
│       ├── TechDeepDive.tsx     # Technical: root cause, narrative, exploit technique
│       ├── AttackChain.tsx      # MITRE ATT&CK, similar CVEs, incidents, timeline
│       ├── DefenseDetection.tsx # Patch info + detection signatures
│       └── KnowledgeAnchors.tsx # Interview Qs, key concepts, novelty score
├── hooks/
│   ├── useCVEFeed.ts            # Supabase query + auto-refresh on tab focus
│   ├── useCVEHallOfFame.ts      # Hall of Fame query (hall_of_fame = true)
│   ├── useFilterState.ts        # Filter state + applyFilters logic
│   └── useStudyQueue.ts         # localStorage-backed Set<string>
├── db/
│   ├── schema.ts                # CVE type, TierLevel, ECOSYSTEMS, VULN_TYPES
│   └── client.ts                # Supabase client (reads from env vars)
└── utils/
    └── time.ts                  # formatAge: days_since_disclosure → "3d ago"
```

---

## Part of personal-os

This is extracted from [johnsaurabh/personal-os](https://github.com/johnsaurabh/personal-os) — a macOS-style portfolio built as a full React application. The threat intel feed is one of two dedicated sub-pages accessible from the main OS dock.

The full personal OS is live at [johnsaurabh.com](https://johnsaurabh.com).

---

<div align="center">
  <sub>Built by <a href="https://github.com/johnsaurabh">johnsaurabh</a> · Live at <a href="https://johnsaurabh.com/threat-intel">johnsaurabh.com/threat-intel</a></sub>
</div>
