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
    Image,
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import Style from '../../../utils/Styles'
import Spacing from '../../../components/Spacing'
import Header from '../../../components/Header'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getSessionId } from '../../../utils/common'
import { Post } from '../../../network/network'
import RNFS from 'react-native-fs' // To read file as base64
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../../../redux/userSlice'
import { useTranslation } from 'react-i18next'

const EditProfile = () => {
    const { t } = useTranslation() // Translation hook
    const user = useSelector((state) => state.user?.user)
    const [firstName, setName] = useState(user?.firstname)
    const [lastName, setEmail] = useState(user?.lastname)
    const [phone, setPhone] = useState(user?.phone)
    const [sessionID, setSessionId] = useState('')
    const [profileImage, setProfileImage] = useState(null)
    const [saveProfileImage, setSaveProfileImage] = useState(null)
    const [sessionIdForParams, setSessionIdForParams] = useState(false)
    const dispatch = useDispatch()

    // Load profile image from AsyncStorage
    const loadProfileImage = async () => {
        try {
            const storedImage = await AsyncStorage.getItem('profileImage')
            if (storedImage !== null) {
                setProfileImage(storedImage)
            }
        } catch (error) {
            console.error('Error loading profile image: ', error)
        }
    }

    // Load profile image and session ID on mount
    useEffect(() => {
        loadProfileImage()
    }, [])

    const pickImage = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
        })
            .then(async (image) => {
                console.log('===image ====', image)
                const imagePath = image.path
                setProfileImage(imagePath)
                setSaveProfileImage(imagePath)
                await handleImageUpdate(imagePath)
            })
            .catch((error) => {
                console.log('Error picking image: ', error)
            })
    }

    const handleImageUpdate = async (imagePath) => {
        const base64Image = await RNFS.readFile(imagePath, 'base64')
        const photoData = {
            action: 'updateUserPhoto',
            photo: `data:image/jpeg;base64,${base64Image}`, // Base64 string
        }
        console.log('base64Image==========>', photoData)

        // Update user photo
        Post({
            data: photoData,
        })
            .then((response) => {
                console.log('======IMAGE-UPDATE====', response)
                const updateUser = { ...user, photo: response?.photo_url }
                console.log('updateReduxData', updateUser)

                dispatch(setUser(updateUser))
            })
            .catch((error) => {
                console.log('======IMAGE-UPDATE ERROR====', error)
            })
    }

    const handleSave = async () => {
        if (!firstName || !lastName || !phone) {
            Alert.alert(t('error'), t('session_id_not_found'))
            return
        }

        try {
            const profileData = {
                action: 'updateProfile',
                firstname: firstName,
                lastname: lastName,
            }

            Post({
                data: profileData,
            })
                .then((response) => {
                    const updateUser = {
                        ...user,
                        firstname: firstName,
                        lastname: lastName,
                    }

                    dispatch(setUser(updateUser))
                    console.log(
                        '================UPDATE_RESPONS========================',
                        response,
                    )

                    Alert.alert(
                        t('profile_saved'),
                        t('profile_updated_successfully'),
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

    const navigation = useNavigation()
    const onBackPress = () => {
        navigation.goBack()
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <Header LeftIcon={true} onPressLeftIcon={onBackPress} />
            <ScrollView style={[Style.flex1]}>
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        {user ? (
                            <Image
                                source={{ uri: user?.photo ?? profileImage }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.placeholderImage} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>{t('first_name')}</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={(text) => setName(text)}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>{t('last_name')}</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={(text) => setEmail(text)}
                        keyboardType='email-address'
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>{t('phone')}</Text>
                    <TextInput
                        editable={false}
                        style={styles.input}
                        value={phone}
                        onChangeText={(text) => setPhone(text)}
                        keyboardType='phone-pad'
                    />
                </View>

                <Text>{t('phone_number_notice')}</Text>

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

export default EditProfile
