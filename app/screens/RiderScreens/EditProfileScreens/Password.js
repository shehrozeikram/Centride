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
import { useTranslation } from 'react-i18next'

const Password = () => {
    const { t } = useTranslation() // Translation hook
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
            Alert.alert(t('error'), t('enter_password'))
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
                        t('profile_saved'),
                        t('password_updated_successfully'),
                    )
                    navigation.navigate('Profile')
                })
                .catch((error) => {
                    console.log('=====error save profile=====', error)
                    Alert.alert(t('error'), t('profile_not_updated'))
                })
        } catch (error) {
            console.error('Error saving profile:', error)
            Alert.alert(t('error'), t('failed_save_profile'))
        }
    }

    const onBackPress = () => {
        navigation.goBack()
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <Header LeftIcon={true} onPressLeftIcon={onBackPress} />
            <ScrollView style={[Style.flex1]}>
                <Spacing val={35} />
                <View style={styles.formGroup}>
                    <Text>{t('password_instruction')}</Text>
                    <Text style={styles.label}>{t('password')}</Text>
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
                    <Text style={styles.saveButtonText}>{t('save')}</Text>
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

export default Password
