import { Alert, Image, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Style from '../utils/Styles'
import { useNavigation, useRoute } from '@react-navigation/native'
import OnBoardingScreenLoader from './component/OnboardingLoader'
import Spacing from '../components/Spacing'
import AppButton from '../components/AppButton'
import { InputMode } from 'react-native-paper/lib/typescript/components/TextInput/Adornment/enums'
import InputField from '../components/InputField'
import Header from '../components/Header'
import { DRIVER, getAppSide } from '../utils/common'

const AddNameScreen = () => {
    const navigation = useNavigation()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
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
    const onPresButtom = async () => {
        if (!firstName || !lastName) {
            Alert.alert('Enter Name')
            return
        }
        const data = { ...routeValues, firstName, lastName }
        const appSide = await getAppSide()

        appSide === DRIVER
            ? navigation.navigate('VehicleDetails',{data})
            : navigation.navigate('CreatePasswordScreen', { data })
    }
    const onBackPress = () => {
        navigation.goBack()
    }
    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <Header LeftIcon={true} onPressLeftIcon={onBackPress} />
            <Spacing val={25} />
            <View style={[Style.widthFull]}>
                <OnBoardingScreenLoader position={[0, 1]} />
            </View>

            <Spacing val={30} />
            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                What is your name?
            </Text>
            <Spacing val={10} />
            <Text style={[Style.fontMedium, Style.label14, Style.colorBlack]}>
                Let us Know the name you want us to use when reffering to you.
            </Text>

            <View style={[Style.justifyStart, Style.flex1]}>
                <Spacing val={30} />
                <InputField
                    value={firstName}
                    onChangeText={setFirstName}
                    error={''}
                    label={'First Name'}
                    placeholder={'First Name'}
                />
                <Spacing val={10} />
                <InputField
                    value={lastName}
                    onChangeText={setLastName}
                    error={''}
                    label={'Last Name'}
                    placeholder={'Last Name'}
                />
            </View>
            <View style={[Style.flex1, Style.justifyEnd]}>
                <AppButton onPress={onPresButtom} name={'Continue'} />
                <Spacing val={30} />
            </View>
        </View>
    )
}

export default AddNameScreen

const styles = StyleSheet.create({
    image: {
        width: 100,
        height: 100,
        borderRadius: 55,
    },
})
