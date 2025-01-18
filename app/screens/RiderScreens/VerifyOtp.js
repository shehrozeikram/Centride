import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Post } from '../../../network/network'

const VerifyOtp = () => {
    const [otpCode, setOtpCode] = useState('')
    const [loading, setLoading] = useState(false)
    const navigation = useNavigation()
    const route = useRoute()

    const { email } = route.params

    const handleVerifyOtp = async () => {
        if (!otpCode) {
            Alert.alert('Error', 'Please enter the OTP code.')
            return
        }

        setLoading(true)

        try {
            const token = await AsyncStorage.getItem('authToken') // Get token from storage

            if (!token) {
                Alert.alert(
                    'Error',
                    'You are not logged in. Please log in to continue.',
                )
                setLoading(false)
                return
            }

            const otpData = {
                action: 'saveUserEmail',
                email: email,
                code: otpCode,
            }

            const response = await Post({
                // endpoint: `${RIDER_BASE_URL}/saveOtp`, // replace with your actual endpoint
                data: otpData,
                headers: {
                    Authorization: `Bearer ${token}`, // Add token to headers
                },
            })

            setLoading(false)

            if (response.ok) {
                navigation.navigate('Email')
                Alert.alert('Success', 'Email verified and saved successfully.')
            } else {
                Alert.alert('Error', 'Failed to save email. Please try again.')
            }
        } catch (error) {
            setLoading(false)
            console.error('Error:', error)
            Alert.alert('Error', 'An error occurred. Please try again.')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Enter OTP Code</Text>
            <TextInput
                style={styles.input}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType='numeric'
            />
            <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerifyOtp}
                disabled={loading}>
                {loading ? (
                    <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                    <Text style={styles.verifyButtonText}>Verify OTP</Text>
                )}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        padding: 16,
        borderRadius: 5,
        fontSize: 16,
        backgroundColor: 'lightgrey',
        marginTop: 10,
        width: '100%',
    },
    verifyButton: {
        backgroundColor: '#FBC02D',
        padding: 15,
        borderRadius: 5,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
})

export default VerifyOtp
