import type { BilingualText } from '../../../lib/types';
import BilingualField from '../BilingualField';

interface Props {
  data: BilingualText;
  onChange: (data: BilingualText) => void;
}

export default function SummaryForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
      <BilingualField
        label="Summary"
        value={data}
        onChange={onChange}
        multiline
        rows={5}
        placeholder={{
          en: 'A brief professional summary highlighting your key strengths...',
          de: 'Eine kurze berufliche Zusammenfassung Ihrer wichtigsten Stärken...',
        }}
      />
    </div>
  );
}
