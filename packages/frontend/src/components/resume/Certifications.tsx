import type { ResolvedCertificationEntry, ResumeTheme } from '../../lib/types';

interface Props {
  data: ResolvedCertificationEntry[];
  theme: ResumeTheme;
}

export default function Certifications({ data, theme }: Props) {
  if (!data.length) return null;

  return (
    <section className="mb-4">
      <h2
        className="text-lg font-bold mb-2 pb-1 border-b"
        style={{
          color: theme.colors.heading,
          borderColor: theme.colors.primary,
          fontFamily: theme.fonts.heading,
        }}
      >
        Certifications
      </h2>
      <div className="space-y-1">
        {data.map((cert) => (
          <div key={cert.id} className="flex items-baseline justify-between">
            <div className="text-sm">
              {cert.url ? (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                  style={{ color: theme.colors.heading }}
                >
                  {cert.name}
                </a>
              ) : (
                <span className="font-medium" style={{ color: theme.colors.heading }}>
                  {cert.name}
                </span>
              )}
              <span style={{ color: theme.colors.secondary }}> — {cert.issuer}</span>
            </div>
            <span className="text-xs shrink-0" style={{ color: theme.colors.secondary }}>
              {cert.date}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
