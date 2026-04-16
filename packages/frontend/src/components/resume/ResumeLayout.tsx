import type { ResolvedResume, ResumeTheme, ResumeSection } from '../../lib/types';
import PersonalHeader from './PersonalHeader';
import Summary from './Summary';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import Certifications from './Certifications';
import Languages from './Languages';
import Projects from './Projects';
import Products from './Products';
import References from './References';

interface Props {
  resume: ResolvedResume;
  theme: ResumeTheme;
}

function renderSection(section: ResumeSection, resume: ResolvedResume, theme: ResumeTheme) {
  switch (section) {
    case 'personal':
      return <PersonalHeader key="personal" data={resume.personal} theme={theme} />;
    case 'summary':
      return <Summary key="summary" data={resume.summary} theme={theme} />;
    case 'experience':
      return <Experience key="experience" data={resume.experience} theme={theme} />;
    case 'education':
      return <Education key="education" data={resume.education} theme={theme} />;
    case 'skills':
      return <Skills key="skills" data={resume.skills} theme={theme} />;
    case 'certifications':
      return <Certifications key="certifications" data={resume.certifications} theme={theme} />;
    case 'languages':
      return <Languages key="languages" data={resume.languages} theme={theme} />;
    case 'projects':
      return <Projects key="projects" data={resume.projects} theme={theme} />;
    case 'products':
      return <Products key="products" data={resume.products} theme={theme} />;
    case 'references':
      return <References key="references" data={resume.references} theme={theme} />;
    default:
      return null;
  }
}

export default function ResumeLayout({ resume, theme }: Props) {
  const { sectionOrder, pageMargins } = theme.layout;

  return (
    <div
      className="mx-auto bg-white shadow-lg min-h-[297mm]"
      style={{
        maxWidth: '210mm',
        padding: `${pageMargins.top}px ${pageMargins.right}px ${pageMargins.bottom}px ${pageMargins.left}px`,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
      }}
    >
      {sectionOrder.map((section) => renderSection(section, resume, theme))}
    </div>
  );
}
