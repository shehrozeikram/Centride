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

// Example list of software licenses
const licenses = [
    {
        id: '1',
        title: 'licenses.mit_license_title',
        description: 'licenses.mit_license_description',
        url: 'https://opensource.org/licenses/MIT',
    },
    {
        id: '2',
        title: 'licenses.apache_license_title',
        description: 'licenses.apache_license_description',
        url: 'https://opensource.org/licenses/Apache-2.0',
    },
    {
        id: '3',
        title: 'licenses.gnu_license_title',
        description: 'licenses.gnu_license_description',
        url: 'https://opensource.org/licenses/GPL-3.0',
    },
]

const SoftwareLicenses = () => {
    const { t, i18n } = useTranslation()
    const handleLinkPress = (url) => {
        Linking.openURL(url)
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{t('software_licenses_title')}</Text>
            <Text style={styles.description}>
                {t('software_licenses_description')}
            </Text>
            {licenses.map((license) => (
                <TouchableOpacity
                    key={license.id}
                    style={styles.licenseItem}
                    onPress={() => handleLinkPress(license.url)}>
                    <View style={styles.licenseContent}>
                        <Text style={styles.licenseTitle}>
                            {t(license.title)}
                        </Text>
                        <Text style={styles.licenseDescription}>
                            {t(license.description)}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        // marginTop: '%',
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 20,
        lineHeight: 24,
    },
    licenseItem: {
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        padding: 16,
        elevation: 1, // For Android shadow effect
        shadowColor: '#000', // For iOS shadow effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    licenseContent: {
        flexDirection: 'column',
    },
    licenseTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    licenseDescription: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
})

export default SoftwareLicenses
