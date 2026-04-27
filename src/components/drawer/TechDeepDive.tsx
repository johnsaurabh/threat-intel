import type { CVE } from '../../../db/schema';
import type { ThemeMode } from '../../../types';

interface Props { cve: CVE; theme: ThemeMode; }

function Block({ label, content, theme }: { label: string; content: string; theme: ThemeMode }) {
  const isDark = theme === 'dark';
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ color: isDark ? '#00a8ff' : '#2563eb', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      <div style={{ color: isDark ? '#c8d6e5' : '#334155', fontSize: '12px', lineHeight: 1.6, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
        {content}
      </div>
    </div>
  );
}

export default function TechDeepDive({ cve, theme }: Props) {
  const isDark = theme === 'dark';
  const mutedColor  = isDark ? '#8899aa' : '#94a3b8';
  const bgCode      = isDark ? 'rgba(0,168,255,0.04)' : '#f8fafc';
  const borderColor = isDark ? 'rgba(0,168,255,0.1)' : '#e2e8f0';

  const hasContent = cve.root_cause || cve.attack_narrative || cve.exploit_technique || cve.exploit_prerequisites;
  if (!hasContent) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ color: mutedColor, fontSize: '11px', marginBottom: '8px' }}>$ cat technical_analysis.txt</div>
      <div style={{ background: bgCode, border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '14px' }}>
        {cve.root_cause && <Block label="Root Cause" content={cve.root_cause} theme={theme} />}
        {cve.attack_narrative && <Block label="Attack Narrative" content={cve.attack_narrative} theme={theme} />}
        {cve.exploit_technique && <Block label="Exploit Technique" content={cve.exploit_technique} theme={theme} />}
        {cve.exploit_prerequisites && <Block label="Prerequisites" content={cve.exploit_prerequisites} theme={theme} />}
      </div>
    </div>
  );
}
