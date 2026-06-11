import { useState, useEffect } from 'react';
import FinnLogo from './FinnLogo.jsx';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-surface-header)] shadow-[var(--shadow-header)] transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logos & Branding */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <a href="/" className="flex items-center space-x-2">
            <img 
              src={isDark ? "https://cdn.myscheme.in/images/logos/emblem-white.svg" : "https://cdn.myscheme.in/images/logos/emblem-black.svg"} 
              alt="Emblem of India" 
              className="h-8 w-auto sm:h-10 transition-opacity duration-300"
            />
            <div className="h-6 w-px bg-[var(--border-color)]" />
            <FinnLogo className="h-7 w-auto sm:h-8 text-[var(--text-primary)] transition-colors duration-300" />
            <div className="hidden h-6 w-px bg-[var(--border-color)] sm:block" />
            <img 
              src={isDark ? "https://cdn.myscheme.in/images/logos/digital-india-white.svg" : "https://cdn.myscheme.in/images/logos/digital-india-black.svg"} 
              alt="Digital India" 
              className="hidden h-6 w-auto sm:block transition-opacity duration-300"
            />
          </a>
        </div>

        {/* Header Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Language Picker Dropdown */}
          <div className="relative group">
            <button 
              aria-label="Language Selector"
              className="flex items-center space-x-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-card)] px-3 py-1.5 text-sm font-medium hover:border-[var(--color-primary)] transition-all duration-200"
            >
              <svg className="h-4 w-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2.5 2.5 0 002.5-2.5V14a2 2 0 00-2-2h-1.5a3 3 0 01-3-3V7a2 2 0 00-2-2H9.836a6 6 0 00-1.8 1.8z" />
              </svg>
              <span className="hidden sm:inline text-[var(--text-secondary)]">{language}</span>
            </button>
            <div className="absolute right-0 mt-1 hidden w-32 origin-top-right rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-card)] shadow-lg group-hover:block transition-all duration-200">
              <div className="py-1">
                <button 
                  onClick={() => setLanguage('English')} 
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-surface-hover)] ${language === 'English' ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('हिन्दी')} 
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-surface-hover)] ${language === 'हिन्दी' ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-card)] hover:border-[var(--color-primary)] transition-all duration-200"
          >
            {isDark ? (
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 7.072l-.707.707" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500 hover:text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Sign In Button */}
          <button 
            aria-label="Sign In"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition-all duration-200"
          >
            Sign In
          </button>

        </div>
      </div>
    </header>
  );
}
