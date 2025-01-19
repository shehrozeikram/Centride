import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
} from 'react-native'
import Style from '../utils/Styles'
import Spacing from '../components/Spacing'
// import backgroundImage from '../assets/startImage1.jpeg'
import backgroundImage from '../assets/bike_new.png'
import { DRIVER, RIDER, setAppSide } from '../utils/common'
import { useNavigation } from '@react-navigation/native'

const SelectRoleScreen = () => {
    const [selectedRole, setSelectedRole] = useState(null)
    const navigation = useNavigation()

    const handleSelectRole = async (role) => {
        console.log('first', role)
        setSelectedRole(role)
        await setAppSide(role)

        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'RiderStackNavigator',
                    params: { screen: 'Register' },
                },
            ],
        })

        // You can navigate or perform other actions here based on the selected role
    }

    return (
        <View
            // source={backgroundImage}
            style={[Style.container]}>
            <Spacing val={50} />
            <View style={[Style.flex2]}>
                <Image
                    source={backgroundImage}
                    style={styles.imageBackground}
                />
            </View>

            <View style={[Style.alignCenter, Style.justifyEnd, Style.flex1]}>
                <TouchableOpacity
                    style={[
                        styles.optionButton,
                        selectedRole === RIDER && styles.selectedButton,
                    ]}
                    onPress={() => handleSelectRole(RIDER)}>
                    <Text
                        style={[
                            Style.labelButton,
                            Style.fontBold,
                            Style.colorBlack,
                        ]}>
                        Get started as Rider{' '}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.optionButton,
                        selectedRole === DRIVER && styles.selectedButton,
                    ]}
                    onPress={() => handleSelectRole(DRIVER)}>
                    <Text
                        style={[
                            Style.labelButton,
                            Style.fontBold,
                            Style.colorBlack,
                        ]}>
                        Get started as Driver
                    </Text>
                </TouchableOpacity>
            </View>

            <Spacing val={100} />
        </View>
    )
}

const styles = StyleSheet.create({
    imageBackground: {
        objectFit: 'contain',
        height: '100%',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    optionButton: {
        width: '80%',
        padding: 15,
        backgroundColor: '#FBC02D',
        borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: '#FFA000',
    },
    optionText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
})

export default SelectRoleScreen
