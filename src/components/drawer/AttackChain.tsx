import type { CVE } from '../../../db/schema';
import type { ThemeMode } from '../../../types';

interface Props { cve: CVE; theme: ThemeMode; onSelectCVE?: (id: string) => void; }

export default function AttackChain({ cve, theme, onSelectCVE }: Props) {
  const isDark = theme === 'dark';
  const accent      = isDark ? '#bf00ff' : '#7c3aed';
  const mutedColor  = isDark ? '#8899aa' : '#94a3b8';
  const textColor   = isDark ? '#c8d6e5' : '#334155';
  const bgCode      = isDark ? 'rgba(191,0,255,0.04)' : '#faf5ff';
  const borderColor = isDark ? 'rgba(191,0,255,0.12)' : '#e9d5ff';

  const hasContent = cve.chaining_potential || cve.similar_cves?.length || cve.mitre_techniques?.length || cve.real_world_incident || cve.exploitation_timeline;
  if (!hasContent) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ color: mutedColor, fontSize: '11px', marginBottom: '8px' }}>$ cat attack_chain.txt</div>
      <div style={{ background: bgCode, border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '14px', fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '12px' }}>

        {cve.chaining_potential && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Chaining Potential</div>
            <div style={{ color: textColor, lineHeight: 1.6 }}>{cve.chaining_potential}</div>
          </div>
        )}

        {cve.mitre_techniques && cve.mitre_techniques.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>MITRE ATT&CK</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {cve.mitre_techniques.map(t => {
                const techId = t.split(' ')[0];
                if (!/^T\d{4}(\.\d{3})?$/.test(techId)) return null;
                return (
                <a
                  key={t}
                  href={`https://attack.mitre.org/techniques/${techId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: accent,
                    fontSize: '11px',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '2px',
                    padding: '2px 7px',
                    textDecoration: 'none',
                    background: isDark ? 'rgba(191,0,255,0.08)' : '#f3e8ff',
                  }}
                >
                  {t}
                </a>
                );
              })}
            </div>
          </div>
        )}

        {cve.similar_cves && cve.similar_cves.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Similar CVEs</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {cve.similar_cves.map(id => (
                <button
                  key={id}
                  onClick={() => onSelectCVE?.(id)}
                  style={{
                    color: isDark ? '#00ff9f' : '#059669',
                    fontSize: '11px',
                    border: `1px solid ${isDark ? 'rgba(0,255,159,0.2)' : '#bbf7d0'}`,
                    borderRadius: '2px',
                    padding: '2px 7px',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}

        {cve.real_world_incident && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Real-World Incident</div>
            <div style={{ color: textColor, lineHeight: 1.6 }}>{cve.real_world_incident}</div>
          </div>
        )}

        {cve.exploitation_timeline && (
          <div>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Exploitation Timeline</div>
            <div style={{ color: textColor, lineHeight: 1.6 }}>{cve.exploitation_timeline}</div>
          </div>
        )}
      </div>
    </div>
  );
}
