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

const Password = () => {
    const user = useSelector((state) => state.user?.user)
    const [password, setPassword] = useState(user?.password)
    const dispatch = useDispatch()
    const navigation = useNavigation()

    // Fetch the stored password when the component mounts
    useEffect(() => {
        const fetchPassword = async () => {
            try {
                const storedPassword =
                    await AsyncStorage.getItem('userPassword')
                if (storedPassword) {
                    setPassword(storedPassword) // Set password from AsyncStorage
                }
            } catch (error) {
                console.error('Error fetching password:', error)
            }
        }

        fetchPassword()
    }, [])

    const handleSave = async () => {
        if (!password) {
            Alert.alert('Error', 'Please enter your password.')
            return
        }

        try {
            const profileData = {
                action: 'saveUserPwd',
                password: password,
            }

            Post({
                data: profileData,
            })
                .then(async (response) => {
                    const updateUser = {
                        ...user,
                        password: password,
                    }

                    dispatch(setUser(updateUser))

                    // Save the password to AsyncStorage
                    await AsyncStorage.setItem('userPassword', password)

                    console.log(
                        '================UPDATE_RESPONS========================',
                        response,
                    )

                    Alert.alert(
                        'Password Saved',
                        'Your Password has been updated successfully.',
                    )
                    navigation.navigate('Profile')
                })
                .catch((error) => {
                    console.log('=====error save profile=====', error)
                    Alert.alert('Error', 'Your password not updated')
                })
        } catch (error) {
            console.error('Error saving password:', error)
            Alert.alert('Error', 'Failed to save password. Please try again.')
        }
    }

    // const onBackPress = () => {
    //     navigation.goBack()
    // }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}
            <ScrollView style={[Style.flex1]}>
                <Spacing val={35} />
                <View style={styles.formGroup}>
                    <Text>
                        Passwords are another way to login into your account
                    </Text>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        keyboardType='default'
                        secureTextEntry
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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ccc',
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

export default Password
