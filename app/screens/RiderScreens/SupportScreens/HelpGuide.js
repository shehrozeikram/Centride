import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native'

import { useTranslation } from 'react-i18next'

// Replace with the path to your image
const imageUri = 'https://example.com/your-image.jpg'

const HelpGuide = () => {
    const { t, i18n } = useTranslation()
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Text style={styles.title}>{t('help_guide_title')}</Text>
            <Text style={styles.description}>{t('help_guide_text')}</Text>
            {/* <TouchableOpacity
                style={styles.button}
                onPress={() => alert('Button Pressed!')}
            >
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity> */}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: '-44%',
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#FBC12C',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default HelpGuide
