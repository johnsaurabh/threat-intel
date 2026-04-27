import type { CVE } from '../../../db/schema';
import type { ThemeMode } from '../../../types';

interface Props { cve: CVE; theme: ThemeMode; }

export default function DefenseDetection({ cve, theme }: Props) {
  const isDark = theme === 'dark';
  const accent      = isDark ? '#00a8ff' : '#2563eb';
  const mutedColor  = isDark ? '#8899aa' : '#94a3b8';
  const textColor   = isDark ? '#c8d6e5' : '#334155';
  const bgCode      = isDark ? 'rgba(0,168,255,0.04)' : '#eff6ff';
  const borderColor = isDark ? 'rgba(0,168,255,0.12)' : '#bfdbfe';

  const hasContent = cve.patch_info || cve.log_signatures;
  if (!hasContent) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ color: mutedColor, fontSize: '11px', marginBottom: '8px' }}>$ cat defense_playbook.txt</div>
      <div style={{ background: bgCode, border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '14px', fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '12px' }}>

        {cve.patch_info && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Patch / Mitigation</div>
            <div style={{ color: textColor, lineHeight: 1.6 }}>{cve.patch_info}</div>
          </div>
        )}

        {cve.log_signatures && (
          <div>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Detection Signatures</div>
            <div style={{
              color: isDark ? '#00ff9f' : '#059669',
              background: isDark ? 'rgba(0,0,0,0.3)' : '#f0fdf4',
              border: `1px solid ${isDark ? 'rgba(0,255,159,0.1)' : '#bbf7d0'}`,
              borderRadius: '4px',
              padding: '10px 12px',
              fontSize: '11px',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>
              {cve.log_signatures}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
