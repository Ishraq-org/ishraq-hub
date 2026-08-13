import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'am';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang: Language) => set({ language: lang }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'en' ? 'am' : 'en' })),
    }),
    {
      name: 'ishraq_language',
    }
  )
);

export default useLanguageStore;
