/**
 * I18n Provider component using React Context.
 * Wraps the app to provide translation across all components.
 */
import { createContext, useContext, useCallback, useState } from "react";

import en from "@/locales/en.json";
import zh from "@/locales/zh.json";

const LOCALES = { en, zh };
const STORAGE_KEY = "app_locale";

function resolve(obj, path) {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return null;
    current = current[key];
  }
  return current ?? null;
}

function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}

const I18nContext = createContext(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export default function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "en";
  });

  const currentLocales = LOCALES[locale] || LOCALES.en;

  const t = useCallback(
    (key, params) => {
      const val = resolve(currentLocales, key);
      if (val == null) return key;
      if (typeof val === "string") return interpolate(val, params);
      return val;
    },
    [currentLocales],
  );

  const setLocale = useCallback((newLocale) => {
    if (LOCALES[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  return (
    <I18nContext.Provider
      value={{ t, locale, setLocale, locales: Object.keys(LOCALES) }}
    >
      {children}
    </I18nContext.Provider>
  );
}