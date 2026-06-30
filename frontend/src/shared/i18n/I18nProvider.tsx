import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { translate, type Lang } from './messages';

const STORAGE_KEY = 'digishield.lang';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a Vietnamese source string (with optional `{name}` vars). */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function initialLang(): Lang {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  return stored === 'en' ? 'en' : 'vi';
}

/** Provides the current language + translator. Persists the choice. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore storage failures */
    }
    if (typeof document !== 'undefined') document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the translator and current language. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}

/** Shorthand: just the `t` function. */
export function useT(): I18nContextValue['t'] {
  return useI18n().t;
}
