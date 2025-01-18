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
import Color from '../utils/Color'
import Header from '../components/Header'
import { getPassword, savePassword } from '../utils/common'

const CreatePasswordScreen = () => {
    const navigation = useNavigation()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [rememberPassword, setRememberPassword] = useState(false) // State for checkbox
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
        if (!password || !confirmPassword) {
            Alert.alert('Enter Password')
            return
        }
        if (!rememberPassword) {
            Alert.alert('Check Remember Password')
            return
        }
        const data = { ...routeValues, password }
        savePassword(password)

        navigation.navigate('AlmostDone', { data })
    }

    const toggleCheckbox = () => {
        setRememberPassword(!rememberPassword)
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
                <OnBoardingScreenLoader position={[0, 1, 2]} />
            </View>

            <Spacing val={30} />
            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                Create a Password
            </Text>
            <Spacing val={10} />
            <Text style={[Style.fontMedium, Style.label14, Style.colorBlack]}>
                Passwords are an alternative way to log into your account.
            </Text>

            <View style={[Style.justifyStart, Style.flex1]}>
                <Spacing val={30} />
                <InputField
                    value={password}
                    onChangeText={setPassword}
                    error={''}
                    label={'Password'}
                    placeholder={'Password'}
                />
                <Spacing val={10} />
                <InputField
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    error={''}
                    label={'Confirm Password'}
                    placeholder={'Confirm Password'}
                />
                {/* Checkbox section */}
                <Spacing val={20} />
                <TouchableOpacity
                    onPress={toggleCheckbox}
                    style={styles.checkboxContainer}
                >
                    <View
                        style={[
                            styles.checkbox,
                            rememberPassword && styles.checkboxChecked,
                        ]}
                    />
                    <Text
                        style={[
                            Style.label14,
                            Style.colorBlack,
                            styles.checkboxText,
                            Style.fontMedium,
                        ]}
                    >
                        Remember my password on this device.
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={[Style.flex1, Style.justifyEnd]}>
                <AppButton onPress={onPressButton} name={'Continue'} />
                <Spacing val={30} />
            </View>
        </View>
    )
}

export default CreatePasswordScreen

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderColor: Color.primary, // Border color for checkbox
        backgroundColor: 'transparent', // Unchecked state background
    },
    checkboxChecked: {
        backgroundColor: Color.primary, // Checked state background
        borderRadius: 5,
        width: 24,
        height: 24,
    },
    checkboxText: {
        marginLeft: 8,
    },
})
