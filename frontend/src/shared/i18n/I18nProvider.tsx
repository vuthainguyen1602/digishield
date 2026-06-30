import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { translate, type Lang } from './messages';

const STORAGE_KEY = 'digishield.lang';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /**
   * Apply the language from the signed-in user's profile locale. Only takes
   * effect when the user has NOT made an explicit choice via the switcher
   * (nothing persisted yet), and is not persisted itself — so an explicit pick
   * always wins and the profile is re-applied each session until then.
   */
  applyProfileLocale: (locale: string | null | undefined) => void;
  /** Translate a Vietnamese source string (with optional `{name}` vars). */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function hasStoredChoice(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) != null;
}

function initialLang(): Lang {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  return stored === 'en' ? 'en' : 'vi';
}

/** Normalize a BCP-47 locale (e.g. "en-US", "vi_VN") to a supported Lang. */
function localeToLang(locale: string | null | undefined): Lang {
  return (locale ?? '').toLowerCase().startsWith('en') ? 'en' : 'vi';
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

  const applyProfileLocale = useCallback((locale: string | null | undefined) => {
    if (hasStoredChoice()) return; // an explicit switcher choice always wins
    const next = localeToLang(locale);
    setLangState(next);
    if (typeof document !== 'undefined') document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, applyProfileLocale, t: (key, vars) => translate(lang, key, vars) }),
    [lang, setLang, applyProfileLocale],
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
