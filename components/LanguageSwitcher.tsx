import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  current: Language;
  onChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ current, onChange }) => {
  return (
    <div className="absolute top-4 right-5 flex gap-2 bg-slate-50 p-1.5 rounded-md z-10">
      {(['de', 'en', 'ro'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={(e) => { e.preventDefault(); onChange(lang); }}
          className={`
            px-2 py-1 text-sm font-bold rounded transition-colors
            ${current === lang ? 'bg-[#4DBCE9] text-white' : 'text-slate-400 hover:text-slate-700'}
          `}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;