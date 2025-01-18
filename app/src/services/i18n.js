import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import en from '../locales/en.json'
import ur from '../locales/ur.json'

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback) => {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage')
        callback(savedLanguage || 'en')
    },
    init: () => {},
    cacheUserLanguage: async (language) => {
        await AsyncStorage.setItem('selectedLanguage', language)
    },
}

i18n.use(languageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ur: { translation: ur },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
