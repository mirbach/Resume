import { useState, useEffect, useCallback, useRef } from 'react';
import type { ResumeData, ResumeTheme, Language } from './lib/types';
import { getResume, saveResume, getTheme } from './lib/api';
import { resolveResume } from './lib/resolve';
import ResumeEditor from './components/editor/ResumeEditor';
import ResumeLayout from './components/resume/ResumeLayout';
import LanguageSwitcher from './components/toolbar/LanguageSwitcher';
import ThemeSelector from './components/toolbar/ThemeSelector';
import ThemeEditor from './components/editor/theme/ThemeEditor';
import PdfExportButton from './components/pdf/PdfExportButton';
import SettingsPage from './components/SettingsPage';
import { Save, CheckCircle, AlertCircle, Loader2, Palette, Settings } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [theme, setTheme] = useState<ResumeTheme | null>(null);
  const [themeName, setThemeName] = useState('default');
  const [language, setLanguage] = useState<Language>('en');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Load initial data
  useEffect(() => {
    Promise.all([getResume(), getTheme('default')])
      .then(([resume, themeData]) => {
        setResumeData(resume);
        setTheme(themeData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load theme when selection changes
  useEffect(() => {
    getTheme(themeName)
      .then(setTheme)
      .catch(console.error);
  }, [themeName]);

  // Auto-save with debounce
  const handleResumeChange = useCallback(
    (data: ResumeData) => {
      setResumeData(data);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        setSaveStatus('saving');
        saveResume(data)
          .then(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
          })
          .catch(() => {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
          });
      }, 1000);
    },
    []
  );

  if (loading || !resumeData || !theme) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const resolved = resolveResume(resumeData, language);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">Resume Builder</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-gray-500">
                <Loader2 size={14} className="animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle size={14} /> Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle size={14} /> Save failed
              </span>
            )}
            {saveStatus === 'idle' && (
              <button
                onClick={() => {
                  setSaveStatus('saving');
                  saveResume(resumeData)
                    .then(() => {
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus('idle'), 2000);
                    })
                    .catch(() => {
                      setSaveStatus('error');
                      setTimeout(() => setSaveStatus('idle'), 3000);
                    });
                }}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <Save size={14} /> Save
              </button>
            )}
          </div>
          <ThemeSelector value={themeName} onChange={setThemeName} />
          <button
            onClick={() => setShowThemeEditor(true)}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Palette size={14} /> Edit Theme
          </button>
          <LanguageSwitcher language={language} onChange={setLanguage} />
          <PdfExportButton resume={resolved} theme={theme} language={language} />
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {showSettings ? (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <SettingsPage onClose={() => setShowSettings(false)} />
        </div>
      ) : (
      <>
      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="w-1/2 border-r border-gray-200 overflow-hidden">
          <ResumeEditor data={resumeData} onChange={handleResumeChange} />
        </div>

        {/* Preview */}
        <div className="w-1/2 overflow-y-auto p-6 bg-gray-200">
          <ResumeLayout resume={resolved} theme={theme} />
        </div>
      </div>

      {/* Theme Editor Modal */}
      {showThemeEditor && (
        <ThemeEditor
          currentTheme={themeName}
          onThemeChange={(name) => {
            setThemeName(name);
            setShowThemeEditor(false);
          }}
          onClose={() => setShowThemeEditor(false)}
        />
      )}
      </>
      )}
    </div>
  );
}
