import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Alert,
    Platform,
    ScrollView,
} from 'react-native'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import { useRoute } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/userSlice'
import {
    RIDER,
    getAppSide,
    getPassword,
    getSessionId,
    savePassword,
    savePhone,
    setSessionId,
} from '../../utils/common'
import { RIDER_BASE_URL, DRIVER_BASE_URL } from '../../utils/constants'
import Color from '../../utils/Color'
import { Post } from '../../network/network'
import AppButton from '../../components/AppButton'
import AppDivider from '../../components/AppDivider'

export default function LoginWithPassword({ navigation }) {
    const [password, setPassword] = useState('')
    const [routeValues, setRouteValues] = useState('') // State to store OTP
    const route = useRoute()
    const [phone, setPhone] = useState('') // State to store OTP
    const dispatch = useDispatch()
    useEffect(() => {
        handleRoute()
    }, [route?.params])
    // Function to handle OTP submission
    const handleRoute = () => {
        console.log('route?.params', route?.params)

        if (route?.params) {
            setRouteValues(route?.params?.routeValues)
            setPhone(route?.params?.routeValues?.phone_num)
        }
    }
    const handleLogin = async () => {
        const appSide = await getAppSide()
        const phoneRaw = routeValues?.phone_num_inp.startsWith('0')
            ? routeValues.phone_num_inp.slice(1) // Remove leading zero
            : routeValues.phone_num_inp // Keep the number as is if no leading zero

        const phoneFormatted = `${phoneRaw}`
        const action = appSide === RIDER ? 'userLogin' : 'driverLogin'
        const body = new URLSearchParams({
            action: action,
            phone: phoneFormatted,
            phone_formatted: `${routeValues?.phone_num_nat}`, // Adjust formatting as needed
            password: password,
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
                console.log(data, 'Login successful')
                await setSessionId(data?.sess_id)
                await savePassword(password)
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
    const handleLoginDriver = async () => {
        console.log('driver')

        try {
            const [appSide, sess_id] = await Promise.all([
                getAppSide(),
                getSessionId(),
            ])
            const action = 'driverLogin'
            // Clean up the phone number by removing the leading zero if present
            const phoneRaw = routeValues?.phone_num_inp.startsWith('0')
                ? routeValues.phone_num_inp.slice(1) // Remove leading zero
                : routeValues.phone_num_inp // Keep the number as is if no leading zero

            const body = new URLSearchParams({
                action,
                phone: phoneRaw,
                phone_formatted: `${routeValues?.phone_num_nat}`,
                password: password,
                country_dial_code: '92', // Country code for Pakistan
                display_lang: 'en',
                timezone: 'Asia/Karachi',
                platform: Platform.OS,
                fb_user_details: null,
            }).toString()

            console.log('===Request Body for Login===', body)

            const endUrl = `${DRIVER_BASE_URL}?sess_id=${sess_id}`

            const response = await fetch(endUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body,
            })

            const data = await response.json()
            console.log('========Response DRIVER======', data)

            if (data.profileinfo?.success === 1) {
                console.log('Login successful', data)
                await setSessionId(data?.sess_id)
                await savePassword(password)
                await savePhone(routeValues?.phone_num_nat)
                dispatch(setUser(data?.profileinfo))

                // Navigate based on app side
                const routeName =
                    appSide === RIDER ? 'RiderRoute' : 'DriverRoute'
                navigation.reset({
                    index: 0,
                    routes: [{ name: routeName }],
                })
            } else {
                console.error('Error in login:', data)
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
    const handleSave = async () => {
        const appSide = await getAppSide()
        appSide === RIDER ? handleLogin() : handleLoginDriver()
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <ScrollView style={[Style.flex1]}>
                <View>
                    <Spacing val={Platform.OS === 'ios' && 36} />
                    {/* <Spacing val={Platform.OS === 'ios' ? 80 : 100} /> */}
                    <Text
                        style={[
                            Style.fontBold,
                            Style.heading,
                            Style.colorBlack,
                        ]}>
                        Enter Your Password
                    </Text>
                    <Spacing val={15} />
                    <Text
                        style={[
                            Style.fontMedium,
                            Style.label,
                            Style.colorGray,
                        ]}>
                        Passwords are an alternative way to login into your
                        account
                    </Text>
                    <Spacing val={15} />
                    <View>
                        <InputField
                            placeholder={'Enter your password'}
                            value={password}
                            onChangeText={setPassword}
                            error={''}
                            secureTextEntry
                        />
                    </View>
                    <Spacing val={20} />
                    <View style={[styles.buttonView]}>
                        <AppButton onPress={handleSave} name='Continue' />
                    </View>
                    <Spacing val={30} />
                    <View style={styles.divider}>{/* <AppDivider /> */}</View>
                    <Spacing val={30} />
                </View>
            </ScrollView>
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
        height: 70,
        width: 80,
        backgroundColor: 'red',
        objectFit: 'cover',
        borderRadius: 5,
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
