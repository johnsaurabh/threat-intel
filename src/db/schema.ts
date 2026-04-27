export type TierLevel = 0 | 1 | 2 | 3 | 4;
export type Difficulty = 'script-kiddie' | 'skilled' | 'nation-state';

export const ECOSYSTEMS = [
  'Windows', 'Linux Kernel', 'Browser', 'Cloud', 'Network Infra',
  'Enterprise Software', 'Open Source', 'Mobile', 'Container/K8s', 'OT/ICS',
] as const;
export type Ecosystem = typeof ECOSYSTEMS[number];

export const VULN_TYPES = [
  'RCE', 'LPE', 'Auth Bypass', 'Memory Corruption', 'Injection',
  'Deserialization', 'SSRF', 'Crypto', 'Supply Chain', 'Logic Flaw',
] as const;
export type VulnType = typeof VULN_TYPES[number];

export interface CVE {
  id: string;
  cve_id: string;
  cvss_score: number | null;
  epss_score: number | null;
  tier: TierLevel;
  in_kev: boolean;
  affected_software: string | null;
  affected_versions: string | null;
  ecosystem: string | null;
  vuln_type: string | null;
  days_since_disclosure: number | null;
  poc_available: boolean;
  threat_actors: string[] | null;
  difficulty: Difficulty | null;
  // enrichment — populated by Lambda pipeline, may be null
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
  novelty_score: number | null;
  chaining_potential: string | null;
  hall_of_fame: boolean;
  hof_category: string | null;
  created_at: string;
  updated_at: string;
}
