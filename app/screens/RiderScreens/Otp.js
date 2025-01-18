import React, { useEffect, useState } from 'react'
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native'
import messaging from '@react-native-firebase/messaging'
import OtpInput from '../../components/OtpInput'
import Color from '../../utils/Color'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import { Post } from '../../network/network'
import { useNavigation, useRoute } from '@react-navigation/native'
import database from '@react-native-firebase/database'
import {
    DRIVER,
    RIDER,
    getAppSide,
    getSessionId,
    saveOtp,
    savePhone,
    setSessionId,
} from '../../utils/common'
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/userSlice'
import { DRIVER_BASE_URL, RIDER_BASE_URL } from '../../utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useTranslation } from 'react-i18next'

function Otp() {
    const { t, i18n } = useTranslation()
    const navigation = useNavigation()
    const [otp, setOtp] = useState('') // State to store OTP
    const [routeValues, setRouteValues] = useState({}) // State to store route values
    const [phone, setPhone] = useState('') // State to store phone
    const [name, setName] = useState('')
    const route = useRoute()
    const dispatch = useDispatch()
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        handleRoute()
    }, [route?.params])

    console.log('route.params otp ===', route?.params)

    const handleRoute = () => {
        if (route?.params) {
            setRouteValues(route.params.secondResponse)
            setPhone(route.params.secondResponse.phone_num)
            setName(route.params.secondResponse.user_firstname)
        }
    }

    const handleCodeFilled = async (code) => {
        console.log('Entered OTP:', code) // Log the entered OTP
        setOtp(code) // Set the OTP state

        // Verify the OTP and wait for the result
        const verificationResponse = await verifyOTP(code)

        // Only proceed to login if verification is successful
        if (verificationResponse && verificationResponse?.success === 1) {
            console.log('OTP verification successful, proceeding to login.')
            const appSide = await getAppSide()
            await saveOtp(code)
            if (routeValues?.exists === 1) {
                if (appSide === DRIVER) {
                    await handleLoginDriver(code) // Pass the OTP directly to handleLogin
                } else {
                    await handleLoginRider(code) // Pass the OTP directly to handleLogin
                }
            } else {
                navigation.navigate('OnboardingRouter', {
                    screen: 'GetStartedScreen',
                    params: routeValues,
                })
            }
        }
    }

    const verifyOTP = async (code) => {
        if (!code) {
            Alert.alert('Error', 'Please enter a valid OTP code.')
            return
        }

        const phoneRaw = routeValues?.phone_num_inp.replace(/^0/, '') // Clean up the phone number
        const phoneFormatted = `+92${phoneRaw}` // Properly format the phone number

        const data = {
            action: 'verifyOTPCode',
            phone: phoneFormatted,
            code: code,
        }

        try {
            const response = await Post({ data })
            console.log('=====OTP RES====', response)
            return response // Return the response to handle it later
        } catch (error) {
            Alert.alert('Error', 'Your OTP is incorrect. Please try again.')
        }
    }
    const handleLoginDriver = async (otp) => {
        console.log('driver')
        console.log('OTP being sent for login:', otp) // Log the OTP being used

        const appSide = await getAppSide()
        const action = 'driverLogin'

        // Clean up the phone number by removing leading zero if present
        const phoneRaw = routeValues?.phone_num_inp.startsWith('0')
            ? routeValues.phone_num_inp.slice(1) // Remove leading zero
            : routeValues.phone_num_inp // Keep the number as is if no leading zero

        const phoneFormatted = `${phoneRaw}` // Ensure proper formatting

        const body = new URLSearchParams({
            action: action,
            phone: phoneFormatted, // Use formatted phone number without country code
            phone_formatted: phoneFormatted, // Ensure consistent formatting
            otp_code: otp, // Include the OTP
            country_dial_code: '92', // Use country_dial_code as you mentioned
            display_lang: 'en',
            timezone: 'Asia/Karachi',
            platform: Platform.OS,
            fb_user_details: null,
        }).toString()

        // console.log('===Request Body for Login===', body) // Log the request body

        const sess_id = await getSessionId()
        const endUrl = `${DRIVER_BASE_URL}?sess_id=${sess_id}`

        try {
            const response = await fetch(endUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body,
            })

            const data = await response.json()
            // console.log('========Response Data======', data) // Log the response data

            if (data.profileinfo.success === 1) {
                console.log(data, 'Login successful')
                await setSessionId(data?.sess_id)
                await savePhone(routeValues?.phone_num_nat)
                dispatch(setUser(data?.profileinfo))
                appSide === RIDER
                    ? navigation.reset({
                          index: 0,
                          routes: [{ name: 'RiderRoute' }],
                      })
                    : navigation.reset({
                          index: 0,
                          routes: [{ name: 'DriverRoute' }],
                      })

                Alert.alert('Success')
                updatePushNotificationToken()
            } else {
                console.error('Error in login:', data) // Log detailed error response
                Alert.alert(
                    'Error',
                    `Failed to login: ${data.error || 'Unknown error'}.`,
                )
            }
        } catch (error) {
            console.error('Request failed:', error)
            Alert.alert('Error', 'An error occurred. Please try again.')
        }
    }

    const handleLoginRider = async (otp) => {
        const appSide = await getAppSide()
        const action = 'userLogin'
        const body = new URLSearchParams({
            action: action,
            phone: routeValues?.phone_num_inp,
            phone_formatted: `${routeValues?.phone_num_nat}`, // Adjust formatting as needed
            // password: password,
            otp_code: otp,
            country_call_code: '92',
            display_lang: 'en',
            timezone: 'Asia/Karachi',
            platform: Platform.OS,
        }).toString()
        const sess_id = await getSessionId()

        const url = `${RIDER_BASE_URL}?sess_id=${sess_id}` // Add sess_id to the URL

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body,
            })

            const data = await response.json()
            console.log('========data log in======', data?.sess_id)

            if (data.loggedin === 1) {
                console.log(
                    data.fb_conf,
                    '===============Login successful================',
                )
                await setSessionId(data?.sess_id)

                await savePhone(routeValues?.phone_num_nat)

                dispatch(setUser(data?.profileinfo))

                updatePushNotificationToken()

                if (data.fb_conf) {
                    init_fb_rtdb(data.fb_conf, data.profileinfo.userid)
                }

                appSide === RIDER
                    ? navigation.reset({
                          index: 0,
                          routes: [{ name: 'RiderRoute' }],
                      })
                    : navigation.reset({
                          index: 0,
                          routes: [{ name: 'DriverRoute' }],
                      })
            } else {
                console.error('Error in login:', data)
                Alert.alert(
                    'Error',
                    'Failed to login. Please check your credentials and try again.',
                )
            }
        } catch (error) {
            console.error('Request failed:', error)
            Alert.alert('Error', 'An error occurred. Please try again.')
        }
    }

    const updatePushNotificationToken = async () => {
        try {
            const token = await messaging().getToken()

            if (!token) {
                setRetryCount((prev) => prev + 1)
                if (retryCount < 3) {
                    setTimeout(updatePushNotificationToken, 20000) // Retry after 20 seconds
                } else {
                    setRetryCount(0)
                }
                return
            }

            const post_data = { action: 'updatePushNotificationToken', token }

            const response = await Post({ data: post_data })
            console.log(
                'Push notification token updated successfully:',
                response,
            )
        } catch (error) {
            console.error('Failed to update push notification token:', error)
            setRetryCount((prev) => prev + 1)
            if (retryCount < 3) {
                setTimeout(updatePushNotificationToken, 20000) // Retry after 20 seconds
            } else {
                setRetryCount(0)
            }
        }
    }

    const init_fb_rtdb = (config, user_id) => {
        // if (!firebase.apps.length) {
        //     firebase.initializeApp(config)
        // }

        console.log('=============firoooooo=====================')

        const db = database()
        const message_ref = db.ref(`Riders/ridr-${user_id}/notf`)

        message_ref.on('value', (snapshot) => {
            const data = snapshot.val()
            if (data == null) return
            if (!(data.hasOwnProperty('msg') && data.hasOwnProperty('msg_t')))
                return

            let last_msg_time_id = AsyncStorage.getItem('fb_last_recvd')
            if (last_msg_time_id != null && data.msg_t == last_msg_time_id)
                return

            AsyncStorage.setItem('fb_last_recvd', data?.msg_t?.toString())
            let current_local_timestamp = Math.floor(Date.now() / 1000) // seconds

            if (current_local_timestamp - 5 > data.msg_t) return

            let message = data.msg
            if (
                message.hasOwnProperty('booking_id') &&
                message.hasOwnProperty('action')
            ) {
                handleNotification(message)
            }
        })
    }

    const handleNotification = (message) => {
        switch (message.action) {
            case 'driver-assigned':
                driver_assigned_notify(message)
                break
            case 'driver-bid-notify':
                driver_bid_notify(message)
                break
            case 'driver-arrived':
                driver_arrived_notify(message)
                break
            case 'customer-onride':
                customer_onride_notify(message)
                break
            case 'driver-complete':
                driver_complete_notify(message)
                break
            case 'driver-cancelled':
                driver_cancelled_notify(message)
                break
            case 'chat-message':
                driver_chat_msg_notify(message)
                break
            case 'app-message':
                app_message(message)
                break
        }
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' ? 80 : 40} />
            <Text style={[Style.fontBold, Style.heading22, Style.colorBlack]}>
                {t('welcome_back')} {name}
                {/* Welcome back {name} */}
            </Text>
            <Spacing val={16} />
            <Text style={[Style.fontMedium, Style.label, Style.colorGray]}>
                {t('code_message')} {phone}
                {/* Enter the code sent to you at {phone} */}
            </Text>
            {/* <Spacing val={10} />
            <Text style={[Style.fontMedium, Style.label, Style.colorBlack]}>
                Demo OTP: 123456
            </Text> */}
            <Spacing val={60} />
            <OtpInput style={styles.otpInput} onCodeFilled={handleCodeFilled} />
            <Spacing val={20} />
            <Text style={[Style.fontSemiBold, Style.label]}>
                {t('resend_code')}: 30
                {/* Resend Code: 30 */}
            </Text>
            <Spacing val={10} />
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('LoginWithPassword', { routeValues })
                }>
                <Text
                    style={[
                        Style.fontRegular,
                        Style.subLabel,
                        Style.colorBlack,
                    ]}>
                    {t('login_with_password')}
                    {/* Log in with password */}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.background,
    },
    otpInput: {
        // Customize OTP input styling if needed
    },
})

export default Otp
