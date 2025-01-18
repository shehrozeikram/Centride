import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import Style from '../utils/Styles'
import Spacing from '../components/Spacing'
import OnBoardingScreenLoader from './component/OnboardingLoader'
import AppButton from '../components/AppButton'
import { useNavigation, useRoute } from '@react-navigation/native'
import Header from '../components/Header'
import { pickImage } from '../utils/common'

const GetStartedScreen = () => {
    const navigation = useNavigation()
    const [profileImage, setProfileImage] = useState(null)
    const [routeValues, setRouteValues] = useState('') // State to store OTP
    const [phone, setPhone] = useState('') // State to store OTP
    const route = useRoute()

    // const { phone, sess_id } = route.params // Extract phone and sess_id from navigation params
    useEffect(() => {
        handleRoute()
    }, [route?.params])
    // Function to handle OTP submission
    const handleRoute = () => {
        console.log('route?.params', route?.params)
        if (route?.params) {
            setRouteValues(route?.params)
        }
    }
    const onPresButtom = () => {
        if (profileImage) {
            const data = { profileImage, ...routeValues }
            console.log('data', data)
            navigation.navigate('AddNameScreen', { data })
        } else {
            return
        }
    }
    const onBackPress = () => {
        navigation.goBack()
    }
    const getImage = async () => {
        const imagePath = await pickImage()
        console.log('======imagePath======>>>>>', imagePath)
        setProfileImage(imagePath?.path)
    }
    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <Header LeftIcon={true} onPressLeftIcon={onBackPress} />
            <Spacing val={25} />
            <View style={[Style.widthFull]}>
                <OnBoardingScreenLoader position={[0]} />
            </View>

            <Spacing val={30} />
            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                Get Started
            </Text>
            <Spacing val={10} />
            <Text style={[Style.fontMedium, Style.label14, Style.colorBlack]}>
                Add a clear picture of yourself so the driver can easily
                recoganise you.
            </Text>
            {/* <Spacing val={50} /> */}
            <TouchableOpacity
                onPress={getImage}
                style={[Style.alignCenter, Style.justifyEnd, Style.flex1]}
            >
                <Image
                    source={
                        profileImage
                            ? { uri: profileImage }
                            : require('../assets/driver.png')
                    }
                    style={styles.image}
                />
            </TouchableOpacity>
            <View style={[Style.flex1, Style.justifyEnd]}>
                <AppButton onPress={onPresButtom} name={'Continue'} />
                <Spacing val={30} />
            </View>
        </View>
    )
}

export default GetStartedScreen

const styles = StyleSheet.create({
    image: {
        width: 100,
        height: 100,
        borderRadius: 55,
    },
})
