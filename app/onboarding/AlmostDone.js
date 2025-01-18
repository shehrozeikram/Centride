import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import Style from '../utils/Styles'
import { useNavigation, useRoute } from '@react-navigation/native'
import OnBoardingScreenLoader from './component/OnboardingLoader'
import Spacing from '../components/Spacing'
import AppButton from '../components/AppButton'
import InputField from '../components/InputField'
import Header from '../components/Header'
import {
    RIDER,
    convertToBase64,
    getAppSide,
    getOtp,
    getPassword,
    getSessionId,
    savePassword,
    savePhone,
    setSessionId,
} from '../utils/common'
import { Post } from '../network/network'
import { RIDER_BASE_URL } from '../utils/constants'
const AlmostDone = () => {
    const navigation = useNavigation()
    const [refferralCode, setRefferralCode] = useState('')
    const [routeValues, setRouteValues] = useState('') // State to store OTP
    const route = useRoute()

    // const { phone, sess_id } = route.params // Extract phone and sess_id from navigation params
    useEffect(() => {
        handleRoute()
    }, [route?.params])
    // Function to handle OTP submission
    const handleRoute = () => {
        console.log('======route?.params====', route?.params)
        if (route?.params) {
            setRouteValues(route?.params?.data)
        }
    }
    const onPressButton = async () => {
        const appSide = await getAppSide()
        appSide === RIDER ? registerUser() : registerDriver()
    }
    const registerUser = async () => {
        try {
            // Read image from the given path and convert it to base64
            const base64Image = await convertToBase64(routeValues?.profileImage)
            const otpCode = await getOtp()
            // Prepare the registration data in the same format as your CURL request
            const registrationData = {
                action: 'registerUser',
                'reg_data[profile_photo]': `data:image/jpeg;base64,${base64Image}`,
                'reg_data[referral]': refferralCode,
                'reg_data[firstname]': routeValues?.firstName,
                'reg_data[lastname]': routeValues?.lastName,
                'reg_data[country_dial_code]': routeValues?.country_dial_code,
                'reg_data[phone]': routeValues?.phone_num_inp,
                'reg_data[otp_code]': otpCode, //change after implement
                'reg_data[password]': routeValues?.password,
            }

            // Call the Post function (with optional session ID if required)
            const response = await Post({
                data: registrationData,
            })
            console.log(
                'routeValues?.phone_num_nat',
                routeValues?.phone_num_nat,
            )
            await savePhone(routeValues?.phone_num_nat)
            await savePassword(routeValues?.password)

            console.log('=======Register User Response:============', response)

            return navigation.navigate('Register')
        } catch (error) {
            navigation.navigate('Splash')
            console.error('Error registering user:', error)
            throw error
        }
    }
    const registerDriver = async () => {
        try {
            // Read image from the given path and convert it to base64
            const base64Image = await convertToBase64(routeValues?.profileImage)
            const otp = await getOtp()
            // Prepare the registration data in the same format as your CURL request
            const registrationData = {
                action: 'registerUser',
                'reg_data[profile_photo]': `data:image/jpeg;base64,${base64Image}`,
                'reg_data[referral]': refferralCode,
                'reg_data[firstname]': routeValues?.firstName,
                'reg_data[lastname]': routeValues?.lastName,
                'reg_data[country_dial_code]': routeValues?.country_dial_code,
                'reg_data[phone]': routeValues?.phone_num_inp,
                'reg_data[otp_code]': otp,
                'reg_data[password]': routeValues?.password,
                'reg_data[operation_city]': routeValues?.operationalCity,
                'reg_data[car_type]': routeValues?.operationalCity,
                'reg_data[car_model]': routeValues?.vehicleModle,
                'reg_data[car_year]': route?.vehicleModleYear,
                'reg_data[car_plate_num]': routeValues?.vehiclePlateNumber,
                'reg_data[car_color]': routeValues?.vehicleColor,
            }

            const response = await Post({
                data: registrationData,
            })

            await savePhone(routeValues?.phone_num_nat)
            await savePassword(routeValues?.password)

            return navigation.navigate('Register')
        } catch (error) {
            navigation.navigate('Splash')
            console.error('Error registering user:', error)
            throw error
        }
    }
    // const handleLogin = async () => {
    //     // Construct the request body for the API call
    //     const phoneNumber = routeValues?.phone_num_inp
    //     const updatedPhoneNumber = phoneNumber.startsWith('0')
    //         ? phoneNumber.slice(1)
    //         : phoneNumber

    //     const body = new URLSearchParams({
    //         action: 'userLogin',
    //         phone: updatedPhoneNumber,
    //         phone_formatted: `${routeValues?.phone_num_nat}`, // Adjust formatting as needed
    //         password: routeValues?.password,
    //         // otp_code: '123456',
    //         country_call_code: '92',
    //         display_lang: 'en',
    //         timezone: 'Asia/Karachi',
    //         platform: Platform.OS,
    //     }).toString()
    //     const sess_id = await getSessionId()
    //     console.log('body', body, 'sess_id', sess_id)

    //     const url = `${RIDER_BASE_URL}?sess_id=${sess_id}` // Add sess_id to the URL

    //     try {
    //         const response = await fetch(url, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/x-www-form-urlencoded',
    //             },
    //             body: body,
    //         })

    //         const data = await response.json()

    //         if (data.loggedin === 1) {
    //             console.log(data, 'Login successful')
    //             await setSessionId(data?.sess_id)

    //             navigation.navigate('Register')
    //         } else {
    //             navigation.navigate('Splash')
    //             console.error('Error in login:', data)
    //             Alert.alert(
    //                 'Error',
    //                 'Failed to login. Please check your credentials and try again.',
    //             )
    //         }
    //     } catch (error) {
    //         navigation.navigate('Splash')
    //         console.error('Request failed:', error)
    //         Alert.alert('Error', 'An error occurred. Please try again.')
    //     }
    // }
    const onBackPress = () => {
        navigation.goBack()
    }
    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <Header LeftIcon={true} onPressLeftIcon={onBackPress} />
            <Spacing val={25} />
            <View style={[Style.widthFull]}>
                <OnBoardingScreenLoader position={[0, 1, 2, 3]} />
            </View>

            <Spacing val={30} />
            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                Almost Done...
            </Text>
            <Spacing val={10} />
            <Text style={[Style.fontMedium, Style.label14, Style.colorBlack]}>
                Got a referral code? Enter it below to qualify for some discount
                on your next ride.
            </Text>

            <View style={[Style.justifyStart, Style.flex1]}>
                <Spacing val={30} />
                <InputField
                    value={refferralCode}
                    onChangeText={setRefferralCode}
                    error={''}
                    label={'Referral Code'}
                    placeholder={'Referral Cod'}
                />
                <Spacing val={10} />
            </View>

            <View style={[Style.flex1, Style.justifyEnd]}>
                <AppButton onPress={onPressButton} name={'Continue'} />
                <Spacing val={30} />
            </View>
        </View>
    )
}

export default AlmostDone

const styles = StyleSheet.create({})
