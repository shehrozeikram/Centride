import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native'

import { useTranslation } from 'react-i18next'

// Example company image
const imageUri = 'https://example.com/your-company-image.jpg' // Replace with your image URL

const AboutTxyCo = () => {
    const { t, i18n } = useTranslation()
    const handleContactPress = () => {
        Linking.openURL('https://txy.co/service-plus/')
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Text style={styles.title}>{t('about_txyco_title')}</Text>
            <Text style={styles.description}>
                {t('about_txyco_description')}
            </Text>
            <Text style={styles.sectionTitle}>
                {t('about_txyco_our_mission')}
            </Text>
            <Text style={styles.sectionContent}>
                {t('about_txyco_our_mission_description')}
            </Text>
            <Text style={styles.sectionTitle}>
                {t('about_txyco_our_values')}
            </Text>
            <Text style={styles.sectionContent}>
                {t('about_txyco_value_innovation')}
                {'\n'}
                {t('about_txyco_value_integrity')}
                {'\n'}
                {t('about_txyco_value_collaboration')}
                {'\n'}
                {t('about_txyco_value_excellence')}
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={handleContactPress}>
                <Text style={styles.buttonText}>
                    {t('about_txyco_contact_us')}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: '-40%',
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    sectionContent: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#FBC12C',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default AboutTxyCo
