import { useNavigation } from '@react-navigation/native'
import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Style from '../../../utils/Styles'
import Spacing from '../../../components/Spacing'
import Header from '../../../components/Header'
import { Post } from '../../../network/network'

import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../../../redux/userSlice'

const Email = () => {
    const user = useSelector((state) => state.user?.user)
    const [email, setEmail] = useState(user?.email) // Initialize email with user email
    const dispatch = useDispatch()
    const navigation = useNavigation()

    // Fetch the stored email and password when the component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('userEmail')
                if (storedEmail) {
                    setEmail(storedEmail) // Set email from AsyncStorage if available
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }

        fetchUserData()
    }, [])

    const handleSave = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email.')
            return
        }

        try {
            const profileData = {
                action: 'verifyUserEmail',
                email: email,
            }

            Post({
                data: profileData,
            })
                .then(async (response) => {
                    const updateUser = {
                        ...user,
                        email: email,
                    }

                    dispatch(setUser(updateUser))

                    Alert.alert(
                        'Email Saved',
                        'Your Email has been updated successfully.',
                    )
                    navigation.navigate('Profile')
                })
                .catch((error) => {
                    console.log('=====error save profile=====', error)
                    Alert.alert('Error', 'Your email was not updated.')
                })
        } catch (error) {
            console.error('Error saving email:', error)
            Alert.alert('Error', 'Failed to save email. Please try again.')
        }
    }

    const onBackPress = () => {
        navigation.goBack()
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}
            <ScrollView style={[Style.flex1]}>
                <Spacing val={35} />
                <View style={styles.formGroup}>
                    <Text>You can edit your email and password below.</Text>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email} // Show the current email
                        onChangeText={(text) => setEmail(text)} // Update the email as user types
                        keyboardType='email-address'
                        autoCapitalize='none'
                    />
                </View>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: '20%',
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        marginTop: 10,
        padding: 16,
        borderRadius: 5,
        fontSize: 16,
        backgroundColor: 'lightgrey',
    },
    saveButton: {
        backgroundColor: '#FBC02D',
        padding: 15,
        borderRadius: 5,
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
})

export default Email
