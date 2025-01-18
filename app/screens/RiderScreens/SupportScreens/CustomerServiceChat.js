import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Linking,
    ScrollView,
} from 'react-native'

import { useTranslation } from 'react-i18next'

// Example customer service image
const imageUri = 'https://example.com/customer-service-image.jpg' // Replace with your image URL

const CustomerServiceChat = () => {
    const { t, i18n } = useTranslation()
    const handleChatPress = () => {
        // Link to your customer service chat application or URL
        Linking.openURL('https://txy.co/contact-us/')
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Text style={styles.title}>{t('customer_service_chat_title')}</Text>
            <Text style={styles.description}>
                {t('customer_service_chat_text')}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleChatPress}>
                <Text style={styles.buttonText}>
                    {t('customer_service_chat_button')}
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
        backgroundColor: '#ffffff',
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
        color: '#333333',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 24,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#FBC12C',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default CustomerServiceChat
