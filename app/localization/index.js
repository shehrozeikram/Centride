// import i18n from 'i18next'
// import { initReactI18next } from 'react-i18next'
// import english from './en'
// import arabic from './ar'
// import urdu from './ur'
// import { I18nManager } from 'react-native'

// const resources = {
//     ...english,
//     ...arabic,
//     ...urdu
// }

// i18n.use(initReactI18next).init({
//     resources,
//     lng: I18nManager.isRTL ? 'ar' : 'en', //it will be selected language ok
//     fallbackLng: 'en',
//     interpolation: {
//         escapeValue: false,
//     },
//     compatibilityJSON: 'v3',
// })

// export default i18n

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import english from './en'
import arabic from './ar'
import urdu from './ur'
import chinese from './ch'
import { I18nManager } from 'react-native'

const resources = {
    en: { translation: english.en.translation },
    ur: { translation: urdu.ur.translation },
    ar: { translation: arabic.ar.translation },
    ch: { translation: chinese.ch.translation },
}

i18n.use(initReactI18next).init({
    resources,
    lng: I18nManager.isRTL ? 'ur' : 'en', // Default to urdu if RTL, otherwise English
    fallbackLng: 'en', // Fallback language if translation is not available in the selected language
    interpolation: {
        escapeValue: false, // Not needed for React Native
    },
    compatibilityJSON: 'v3', // Ensure compatibility with older i18next versions
})

export default i18n
