import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native'

import { useTranslation } from 'react-i18next'

// Define translation keys for the Privacy Policy content
const privacyPolicyTextKey = {
    title: 'privacy_policy_title',
    intro: 'privacy_policy_intro',
    dataCollection: 'privacy_policy_data_collection',
    useOfData: 'privacy_policy_use_of_data',
    dataProtection: 'privacy_policy_data_protection',
    yourRights: 'privacy_policy_your_rights',
    changes: 'privacy_policy_changes',
    contact: 'privacy_policy_contact',
}

const PrivacyPolicy = () => {
    const { t, i18n } = useTranslation()

    const handleContactPress = () => {
        Linking.openURL('https://txy.co/privacy-policy/')
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Use translation key for title */}
            <Text style={styles.title}>{t(privacyPolicyTextKey.title)}</Text>

            {/* Use translation keys for sections */}
            <Text style={styles.description}>
                {t(privacyPolicyTextKey.intro)}
            </Text>

            <Text style={styles.description}>
                {t(privacyPolicyTextKey.dataCollection)}
            </Text>
            <Text style={styles.description}>
                {t(privacyPolicyTextKey.useOfData)}
            </Text>
            <Text style={styles.description}>
                {t(privacyPolicyTextKey.dataProtection)}
            </Text>
            <Text style={styles.description}>
                {t(privacyPolicyTextKey.yourRights)}
            </Text>
            <Text style={styles.description}>
                {t(privacyPolicyTextKey.changes)}
            </Text>

            <Text style={styles.description}>
                {t(privacyPolicyTextKey.contact)}
            </Text>

            <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContactPress}>
                <Text style={styles.contactButtonText}>{t('contact_us')}</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 24,
        marginBottom: 10,
    },
    contactButton: {
        backgroundColor: '#FBC12C',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default PrivacyPolicy
