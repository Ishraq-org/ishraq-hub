import useLanguageStore from '../store/languageStore';
import { en, TranslationKeys } from '../strings/en';
import { am } from '../strings/am';

export const useT = () => {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();

  const t = (key: TranslationKeys): string => {
    const dictionary = language === 'am' ? am : en;
    return dictionary[key] || en[key] || key;
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
};

export default useT;
