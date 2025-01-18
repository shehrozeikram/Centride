import React, { useEffect, useState } from 'react'
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert, // For displaying alerts
} from 'react-native'
import AppButton from '../../components/AppButton'
import AppDivider from '../../components/AppDivider'
import Color from '../../utils/Color'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import InputField from '../../components/InputField'
import Icon from 'react-native-vector-icons/Ionicons'
import countries from '../../utils/countries'
import CountrySelectorModal from '../../modals/CountryModal'
import { Post } from '../../network/network'
import { RIDER_BASE_URL } from '../../utils/constants'
import {
    RIDER,
    deleteSessionId,
    getAppSide,
    getPassword,
    setSessionId,
} from '../../utils/common'

import { useTranslation } from 'react-i18next'

const logo = require('../../assets/logo.png')

export default function Register({ navigation }) {
    const { t, i18n } = useTranslation()
    const [phone, setPhone] = useState('')
    const [country, setCountry] = useState(countries[1])
    const [isModalVisible, setModalVisible] = useState(false)
    const [sessionIdForParams, setSessionIdForParams] = useState(false)
    const validatePhoneNumber = (phone) => {
        // Remove non-digit characters
        const cleanedPhone = phone.replace(/\D/g, '')
        return cleanedPhone.length >= 10
    }
    useEffect(() => {
        // deleteSessionId()
        syncServer()
        getSession()
    }, [])
    const syncServer = () => {
        const body = new URLSearchParams({
            action: 'syncservertime',
        }).toString()

        Post({ data: body })
            .then((response) => {})
            .catch((error) => {
                console.log('error', error)
            })
    }
    const getSession = async () => {
        const appSide = await getAppSide()
        const firstData = {
            action:
                appSide === RIDER
                    ? 'checkLoginStatus'
                    : 'checkDriverLoginStatus',
            timezone: 'Asia/Karachi',
            platform: Platform.OS,
            display_lang: 'en',
        }
        Post({
            data: firstData,
        })
            .then((firstResponse) => {
                // const jsonData = JSON.stringify(firstResponse);
                // console.log('=====First Response:====', firstResponse?.sess_id)

                const sess_id = firstResponse.sess_id
                setSessionIdForParams(sess_id) //useState
                setSessionId(sess_id) //async
            })

            .catch((error) => {
                console.error('Error:', error)
                Alert.alert('Error', 'An error occurred. Please try again.')
            })
    }
    const onPress = async () => {
        if (!validatePhoneNumber(phone)) {
            Alert.alert(
                'Invalid Phone Number',
                'Please enter a valid phone number.',
            )
            return
        }
        const pass = await getPassword()
        const secondData = {
            action: 'userPhoneNumberValidate',
            phone: phone,
            country_dial_code: '92',
            country_code: 'Pk',
            user_pwd: pass, // try remove and then check
        }

        Post({ data: secondData })
            .then((secondResponse) => {
                if (secondResponse) {
                    navigation.navigate('Otp', { secondResponse })
                } else {
                    Alert('Error', 'Your Otp service is incorrect!')
                }
            })
            .catch((error) => {
                console.error('Error:', error)
                Alert.alert(
                    'Error',
                    'An error occurred in register. Please try again.',
                )
            })
    }
    const handleSelectCountry = (selectedCountry) => {
        setCountry(selectedCountry)
    }

    const handleLanguage = () => {
        navigation.navigate('Language')
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <ScrollView style={[Style.flex1]}>
                <View>
                    <Spacing val={Platform.OS === 'ios' ? 36 : 16} />
                    {/* <Spacing val={15} /> */}
                    <Image
                        source={logo}
                        style={styles.image}
                        resizeMode='contain'
                    />
                    <Spacing val={Platform.OS === 'ios' ? 80 : 100} />
                    <Text
                        style={[
                            Style.fontBold,
                            Style.heading,
                            Style.colorBlack,
                        ]}>
                        {t('sign_in')}
                        {/* Sign in */}
                    </Text>
                    <Spacing val={15} />
                    <Text
                        style={[
                            Style.fontMedium,
                            Style.label,
                            Style.colorGray,
                        ]}>
                        {t('sign_in_text')}
                        {/* Enter your phone number. We will send an SMS code to
                        verify your number */}
                    </Text>
                    <Spacing val={15} />
                    <View>
                        <InputField
                            placeholder={'Phone'}
                            value={phone}
                            onChangeText={setPhone}
                            keyboard={'phone-pad'}
                            error={''}
                            isRegisterScreen={true}
                            countryCode={`${country?.flag} ${country?.dial_code}`}
                            onPressCountry={() => setModalVisible(true)}
                        />
                    </View>
                    <Spacing val={20} />
                    <View style={[styles.buttonView]}>
                        <AppButton onPress={onPress} name={t('continue')} />
                    </View>
                    <Spacing val={30} />
                    <View style={styles.divider}>
                        <AppDivider />
                    </View>
                    <Spacing val={30} />
                    <TouchableOpacity
                        onPress={handleLanguage}
                        style={[Style.flexRow, Style.gap12, styles.language]}>
                        <Icon name='globe' size={24} color={Color.primary} />
                        <Text
                            style={[
                                Style.fontMedium,
                                Style.label,
                                Style.colorBlack,
                            ]}>
                            English
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={[styles.bottomTextView]}>
                <Text
                    style={[
                        Style.fontMedium,
                        Style.colorGray,
                        Style.label14,
                        Style.textCenter,
                    ]}>
                    {t('bottom_register_text')}
                    {/* By proceeding to log in or register for our service you
                    accept Our Terms of Service and Privacy Policy. Learn
                    More... */}
                </Text>
            </View>
            <Spacing val={30} />
            <CountrySelectorModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                countries={countries}
                onSelect={handleSelectCountry}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    divider: {
        height: 1,
        backgroundColor: Color.lightGrey,
        width: '80%',
        alignSelf: 'center',
    },
    image: {
        height: 80,
        width: 90,
        // backgroundColor: 'red',
        // objectFit: 'cover',
        // borderRadius: 5,
    },
    language: {
        width: '40%',
        borderWidth: 0.4,
        borderRadius: 25,
        alignSelf: 'center',
        paddingVertical: Platform.OS === 'ios' ? 10 : 5,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    buttonView: {
        width: '100%',
    },
    bottomTextView: {
        alignSelf: 'flex-end',
        width: '100%',
    },
})
