import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { ResolvedResume, ResumeTheme, Language } from '../../lib/types';
import ResumePdfDocument from './ResumePdfDocument';
import { FileDown, Loader2 } from 'lucide-react';

interface Props {
  resume: ResolvedResume;
  theme: ResumeTheme;
  language: Language;
}

export default function PdfExportButton({ resume, theme, language }: Props) {
  const [generating, setGenerating] = useState(false);

  async function handleExport() {
    setGenerating(true);
    try {
      const doc = <ResumePdfDocument resume={resume} theme={theme} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${theme.name}-${language}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {generating ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <FileDown size={14} />
      )}
      {generating ? 'Generating...' : 'Export PDF'}
    </button>
  );
}
