import type { Language } from '../../lib/types';

interface Props {
  language: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageSwitcher({ language, onChange }: Props) {
  return (
    <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
      <button
        onClick={() => onChange('en')}
        className={`px-3 py-1.5 font-medium transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange('de')}
        className={`px-3 py-1.5 font-medium transition-colors ${
          language === 'de'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        DE
      </button>
    </div>
  );
}
