import { Alert, Platform, StyleSheet, View, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import AppLoader from '../../components/AppLoader'
import GetLocation from 'react-native-get-location'
import {
    DRIVER,
    RIDER,
    deletePassword,
    deletePhone,
    deleteSessionId,
    getAppSide,
    getOtp,
    getPassword,
    getPhone,
    getSessionId,
    savePassword,
    setAppSide,
    setSessionId,
} from '../../utils/common'
import { DRIVER_BASE_URL, RIDER_BASE_URL } from '../../utils/constants'
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/userSlice'
const SplashScreen = () => {
    const navigation = useNavigation()
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const dispatch = useDispatch()
    const isFocused = useIsFocused()

    useEffect(() => {
        // Set the status bar to be translucent, allowing the map to go under it.
        StatusBar.setTranslucent(true)
        StatusBar.setBackgroundColor('transparent')
    }, [])

    useEffect(() => {
        // Fetch the location on component mount

        getLocation()
        // Simulate a splash screen delay and then navigate accordingly
        const splashTimeout = setTimeout(() => {
            handleRoute()
            // handleLogin()
        }, 2000)

        // Clear timeout if component unmounts before timeout completes
        return () => clearTimeout(splashTimeout)
    }, [isFocused])

    // const handleRoute = async () => {
    //     try {
    //         // navigation.reset({
    //         //     index: 0,
    //         //     routes: [{ name: 'OnboardingRouter' }],
    //         // })
    //         // return
    //         // you can un comment thee above lines if you want to check the onBoarding routes

    //         const appSide = await getAppSide()
    //         const sess_id = await getSessionId()
    //         const password = await getPassword()
    //         const phone = await getPhone()

    //         if (!phone) {
    //             Alert.alert('Please Login')
    //             console.log('here it comes')
    //             navigation.reset({
    //                 index: 0,
    //                 routes: [{ name: 'RiderStackNavigator' }],
    //             })
    //             return
    //         }
    //         setIsLoggedIn(false) // Mark user as not logged in

    //         // Check if appSide is null, undefined, or valid
    //         if (isLoggedIn) {

    //             if (appSide === RIDER && sess_id && phone) {
    //                 console.log('appSide====if', appSide)
    //                 handleLogin(password, phone)
    //                 // navigation.reset({
    //                 //     index: 0,
    //                 //     routes: [{ name: 'RiderRoute' }],
    //                 // })
    //             } else if (appSide && sess_id) {

    //                 console.log('appSide=====else', appSide)
    //                 handleLoginDriver(password, phone)
    //                 // navigation.reset({
    //                 //     index: 0,
    //                 //     routes: [{ name: 'DriverRoute' }],
    //                 // })
    //             } else {
    //                 // Handle when appSide is null or undefined
    //                 console.log('appSide=====null', appSide)
    //                 navigation.reset({
    //                     index: 0,
    //                     routes: [{ name: 'RiderStackNavigator' }],
    //                 })
    //             }
    //         } else {
    //             // When not logged in, always go to RiderStackNavigator
    //             console.log('appSide=====notLoggedIn', appSide)
    //             navigation.reset({
    //                 index: 0,
    //                 routes: [{ name: 'RiderStackNavigator' }],
    //             })
    //         }
    //     } catch (error) {
    //         console.error('Error in handleRoute:', error)
    //         // As a fallback, navigate to RiderStackNavigator if there's an error
    //         navigation.reset({
    //             index: 0,
    //             routes: [{ name: 'RiderStackNavigator' }],
    //         })
    //     }
    // }

    const handleRoute = async () => {
        try {
            // Parallel async operations to improve performance
            const [appSide, sess_id, password, phone] = await Promise.all([
                getAppSide(),
                getSessionId(),
                getPassword(),
                getPhone(),
            ])

            if (!phone) {
                Alert.alert('Please Login')
                console.log(
                    'No phone found, redirecting to RiderStackNavigator',
                )
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'RiderStackNavigator' }],
                })
                return
            }

            setIsLoggedIn(false) // Mark user as not logged in

            // Early return if not logged in
            if (!isLoggedIn) {
                console.log(
                    'User not logged in, redirecting to RiderStackNavigator',
                )
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'RiderStackNavigator' }],
                })
                return
            }

            // Handle different scenarios based on appSide, sess_id, and phone
            if (appSide === RIDER && sess_id && phone) {
                console.log('Rider login path')
                await handleLogin(password, phone)
                // Uncomment the navigation reset below if needed
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: 'RiderRoute' }],
                // });
            } else if (appSide === DRIVER && sess_id) {
                console.log('Driver login path')
                await handleLoginDriver(password, phone)
                // Uncomment the navigation reset below if needed
            } else {
                console.log(
                    'Invalid or missing appSide, redirecting to RiderStackNavigator',
                )
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'RiderStackNavigator' }],
                })
            }
        } catch (error) {
            console.error('Error in handleRoute:', error)
            navigation.reset({
                index: 0,
                routes: [{ name: 'RiderStackNavigator' }],
            })
        }
    }

    const handleLogin = async (password, phone) => {
        console.log('password', password)
        const phoneWithoutZero = phone.slice(1)
        if (password) {
            const body = new URLSearchParams({
                action: 'userLogin',
                phone: phoneWithoutZero,
                phone_formatted: phone, // Adjust formatting as needed
                password: password,
                country_call_code: '92',
                display_lang: 'en',
                timezone: 'Asia/Karachi',
                platform: Platform.OS,
            }).toString()
            console.log('=========body======', body)
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
                console.log('========profileinfo======', data?.profileinfo)

                if (data.loggedin === 1) {
                    console.log(data, 'Login successful')
                    await setSessionId(data?.sess_id)

                    dispatch(setUser(data?.profileinfo))

                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'RiderRoute' }],
                    })
                } else {
                    console.error('Error in login:', data)

                    deletePassword()
                    deletePhone()
                    dispatch(setUser(null))
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'RiderStackNavigator' }],
                    })
                    Alert.alert(
                        'Error',
                        'Failed to login. Please check your credentials and try again.',
                    )
                }
            } catch (error) {
                deletePassword()
                deletePhone()
                dispatch(setUser(null))
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'RiderStackNavigator' }],
                })
                console.error('Request failed:', error)
                Alert.alert('Error', 'An error occurred. Please try again.')
            }
        } else {
            const otp = await getOtp()
            const body = new URLSearchParams({
                action: 'userLogin',
                phone: phoneWithoutZero,
                phone_formatted: phone, // Adjust formatting as needed

                otp_code: otp,
                country_call_code: '92',
                display_lang: 'en',
                timezone: 'Asia/Karachi',
                platform: Platform.OS,
            }).toString()
            // console.log('=========body======', body)
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
                // console.log('========profileinfo======', data?.profileinfo)

                if (data.loggedin === 1) {
                    console.log(data, 'Login successful')
                    await setSessionId(data?.sess_id)

                    dispatch(setUser(data?.profileinfo))

                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'RiderRoute' }],
                    })
                } else {
                    console.error('Error in login:', data)

                    deletePassword()
                    deletePhone()
                    dispatch(setUser(null))
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'RiderStackNavigator' }],
                    })
                    Alert.alert(
                        'Error',
                        'Failed to login. Please check your credentials and try again.',
                    )
                }
            } catch (error) {
                deletePassword()
                deletePhone()
                dispatch(setUser(null))
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'RiderStackNavigator' }],
                })
                console.error('Request failed:', error)
                Alert.alert('Error', 'An error occurred. Please try again.')
            }
        }
    }

    const handleLoginDriver = async (password, phone) => {
        // console.log('driver')
        if (password) {
            try {
                const [appSide, sess_id] = await Promise.all([
                    getAppSide(),
                    getSessionId(),
                ])
                const action = 'driverLogin'

                // Clean up the phone number by removing the leading zero if present
                const phoneFormatted = phone.startsWith('0')
                    ? phone.slice(1)
                    : phone

                const body = new URLSearchParams({
                    action,
                    phone: phoneFormatted,
                    phone_formatted: phoneFormatted,
                    password: password,

                    country_dial_code: '92', // Country code for Pakistan
                    display_lang: 'en',
                    timezone: 'Asia/Karachi',
                    platform: Platform.OS,
                    fb_user_details: null,
                }).toString()

                // console.log('===Request Body for Login===', body)

                const endUrl = `${DRIVER_BASE_URL}?sess_id=${sess_id}`

                const response = await fetch(endUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body,
                })

                const data = await response.json()
                // console.log('========Response DRIVER======', data)

                if (data.profileinfo?.success === 1) {
                    console.log('Login successful', data)
                    await setSessionId(data?.sess_id)
                    dispatch(setUser(data.profileinfo))
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
        } else {
            try {
                const [appSide, sess_id, otp_code] = await Promise.all([
                    getAppSide(),
                    getSessionId(),
                    getOtp(),
                ])
                const action = 'driverLogin'

                // Clean up the phone number by removing the leading zero if present
                const phoneFormatted = phone.startsWith('0')
                    ? phone.slice(1)
                    : phone

                const body = new URLSearchParams({
                    action,
                    phone: phoneFormatted,
                    phone_formatted: phoneFormatted,
                    otp_code: otp_code,
                    // otp_code: '123456',
                    country_dial_code: '92', // Country code for Pakistan
                    display_lang: 'en',
                    timezone: 'Asia/Karachi',
                    platform: Platform.OS,
                    fb_user_details: null,
                }).toString()

                // console.log('===Request Body for Login===', body)

                const endUrl = `${DRIVER_BASE_URL}?sess_id=${sess_id}`

                const response = await fetch(endUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body,
                })

                const data = await response.json()
                console.log('========Response DRIVER1======', data)

                if (data.profileinfo?.success === 1) {
                    console.log('Login successful', data)
                    await setSessionId(data?.sess_id)
                    dispatch(setUser(data.profileinfo))
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
    }

    const getLocation = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
        })
            .then((location) => {
                // console.log('Location:', location)
            })
            .catch((error) => {
                console.log('Location Error:', error.code, error.message)
            })
    }

    return <AppLoader />
}

export default SplashScreen

const styles = StyleSheet.create({})
