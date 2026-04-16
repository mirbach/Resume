import type { ResolvedSkillCategory, ResumeTheme } from '../../lib/types';

interface Props {
  data: ResolvedSkillCategory[];
  theme: ResumeTheme;
}

export default function Skills({ data, theme }: Props) {
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
        Skills
      </h2>
      <div className="space-y-2">
        {data.map((cat) => (
          <div key={cat.id}>
            <h3
              className="text-sm font-semibold"
              style={{ color: theme.colors.heading }}
            >
              {cat.category}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {cat.items.map((item, i) => (
                <span
                  key={i}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: theme.colors.primary + '15',
                    color: theme.colors.primary,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
