"use client";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    common: require("../../../public/locales/en/common.json"),
  },
  ms: {
    common: require("../../../public/locales/ms/common.json"),
  },
  ko: {
    common: require("../../../public/locales/ko/common.json"),
  },
  ja: {
    common: require("../../../public/locales/ja/common.json"),
  },
  "zh-hk": {
    common: require("../../../public/locales/zh-hk/common.json"),
  },
  "zh-cn": {
    common: require("../../../public/locales/zh-cn/common.json"),
  },
};

// Create supportedLngs array from resources keys
const supportedLngs = Object.keys(resources);

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    react: {
      useSuspense: false,
    },
    supportedLngs,
    nonExplicitSupportedLngs: false,
  });

export default i18n;
