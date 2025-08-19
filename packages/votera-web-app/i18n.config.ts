import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import commonEn from './src/locales/en/common.json';
import commonKo from './src/locales/ko/common.json';

// 저장된 언어 설정 가져오기
const savedLanguage = localStorage.getItem('uselang') || 'ko';

export const resources = {
  en: {
    translation: commonEn,
  },
  ko: {
    translation: commonKo,
  },
} as const;

i18n.use(initReactI18next).init({
  lng: savedLanguage, // 저장된 언어로 초기화
  resources,
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  supportedLngs: ['en', 'ko'],
  fallbackLng: 'en',
});

// 언어 변경 함수 추가
export const changeLanguage = (lang: string) => {
  localStorage.setItem('uselang', lang);
  i18n.changeLanguage(lang);
};

export {i18n};
