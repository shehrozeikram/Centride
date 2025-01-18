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

// Example image for the screen
const imageUri = 'https://example.com/rate-app-image.jpg' // Replace with your image URL

const RateApp = () => {
    const handleRatePress = () => {
        // Link to the app store or review page
        Linking.openURL(
            'https://play.google.com/store/apps/details?id=co.txy.taxirider',
        )
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Text style={styles.title}>Rate Our App</Text>
            <Text style={styles.description}>
                We hope you’re enjoying our app! Your feedback helps us improve
                and continue providing great experiences. If you love using our
                app, please take a moment to rate us on the App Store or Google
                Play.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleRatePress}>
                <Text style={styles.buttonText}>Rate Now</Text>
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
        alignItems: 'center',
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
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 24,
        marginBottom: 20,
        textAlign: 'center',
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

export default RateApp
