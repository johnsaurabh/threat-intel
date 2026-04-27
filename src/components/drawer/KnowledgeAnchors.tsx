import type { CVE } from '../../../db/schema';
import type { ThemeMode } from '../../../types';

interface Props { cve: CVE; theme: ThemeMode; }

function NoveltyBar({ score, theme }: { score: number; theme: ThemeMode }) {
  const isDark = theme === 'dark';
  const label = score >= 8 ? 'Novel Technique' : score >= 5 ? 'Moderately Novel' : 'Known Pattern';
  const color = score >= 8 ? '#ff4444' : score >= 5 ? '#ff8800' : isDark ? '#8899aa' : '#94a3b8';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '4px', background: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${score * 10}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '11px', color, fontWeight: 600, minWidth: '110px' }}>{label} ({score}/10)</span>
    </div>
  );
}

export default function KnowledgeAnchors({ cve, theme }: Props) {
  const isDark = theme === 'dark';
  const accent      = isDark ? '#ffd700' : '#d97706';
  const mutedColor  = isDark ? '#8899aa' : '#94a3b8';
  const textColor   = isDark ? '#c8d6e5' : '#334155';
  const bgCode      = isDark ? 'rgba(255,215,0,0.04)' : '#fffbeb';
  const borderColor = isDark ? 'rgba(255,215,0,0.12)' : '#fde68a';
  const interviewBg = isDark ? 'rgba(255,215,0,0.06)' : '#fef3c7';
  const interviewBorder = isDark ? 'rgba(255,215,0,0.2)' : '#fcd34d';

  const hasContent = cve.key_concepts?.length || cve.interview_questions?.length || cve.prevention_pattern || cve.novelty_score !== null;
  if (!hasContent) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ color: mutedColor, fontSize: '11px', marginBottom: '8px' }}>$ cat knowledge_anchors.txt</div>
      <div style={{ background: bgCode, border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '14px', fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '12px' }}>

        {cve.key_concepts && cve.key_concepts.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Key Concepts to Understand This</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {cve.key_concepts.map(c => (
                <span key={c} style={{
                  fontSize: '11px',
                  color: textColor,
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                  borderRadius: '2px',
                  padding: '2px 7px',
                }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {cve.interview_questions && cve.interview_questions.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>Interview Questions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cve.interview_questions.map((q, i) => (
                <div key={i} style={{
                  background: interviewBg,
                  border: `1px solid ${interviewBorder}`,
                  borderRadius: '4px',
                  borderLeft: `3px solid ${accent}`,
                  padding: '8px 10px',
                  fontSize: '12px',
                  color: textColor,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: accent, marginRight: '8px', fontWeight: 700 }}>{i + 1}.</span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        )}

        {cve.prevention_pattern && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Prevention Pattern</div>
            <div style={{ color: textColor, lineHeight: 1.6 }}>{cve.prevention_pattern}</div>
          </div>
        )}

        {cve.novelty_score !== null && (
          <div>
            <div style={{ color: accent, fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>Novelty Score</div>
            <NoveltyBar score={cve.novelty_score} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}
