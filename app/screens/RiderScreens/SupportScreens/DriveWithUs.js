import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Linking,
} from 'react-native'

import { useTranslation } from 'react-i18next'

// Example image for the screen
const imageUri = 'https://example.com/your-image.jpg' // Replace with your image URL

const DriveWithUs = () => {
    const { t, i18n } = useTranslation()
    const handleApplyPress = () => {
        // Handle the apply button press
        Linking.openURL(
            'https://play.google.com/store/apps/details?id=co.txy.taxidriverlight',
        ) // Replace with your application URL
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Text style={styles.title}>{t('drive_with_us_title')}</Text>
            <Text style={styles.description}>
                {t('drive_with_us_description')}
            </Text>
            <Text style={styles.subTitle}>{t('why_drive_with_us')}</Text>
            <Text style={styles.bulletPoint}>
                {t('drive_with_us_bullet_1')}
            </Text>
            <Text style={styles.bulletPoint}>
                {t('drive_with_us_bullet_2')}
            </Text>
            <Text style={styles.bulletPoint}>
                {t('drive_with_us_bullet_3')}
            </Text>
            <Text style={styles.bulletPoint}>
                {t('drive_with_us_bullet_4')}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleApplyPress}>
                <Text style={styles.buttonText}>
                    {t('drive_with_us_button')}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: '-44%',
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
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
        color: '#555',
        lineHeight: 24,
        marginBottom: 20,
    },
    subTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    bulletPoint: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#FBC12C',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default DriveWithUs
