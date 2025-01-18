import React from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Image,
} from 'react-native'
import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Style from '../utils/Styles'

const CustomDrawerContent = (props) => {
    const { switchTo, navigation } = props

    const handleSwitch = () => {
        if (switchTo === 'Driver') {
            // navigation.navigate('DriverApp');
            navigation.navigate('DriverRoute')
        } else {
            // navigation.navigate('RiderApp');
            navigation.navigate('RiderRoute')
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ backgroundColor: '#F5F5F5' }}>
                <TouchableOpacity
                    style={{ padding: 20 }}
                    onPress={() => navigation.navigate('Profile')}>
                    <Image
                        source={require('../assets/driver.png')}
                        style={{
                            height: 80,
                            width: 80,
                            borderRadius: 40,
                            marginBottom: 10,
                        }}></Image>
                    <Text
                        style={[
                            Style.fontMedium,
                            Style.colorGray,
                            Style.labelButton,
                        ]}>
                        Shehroze Ikram
                    </Text>
                </TouchableOpacity>
                <View style={styles.listContainer}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={styles.switchContainer}>
                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={handleSwitch}>
                    <Text
                        style={
                            styles.switchButtonText
                        }>{`Switch to ${switchTo}`}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    switchContainer: {
        padding: 18,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    switchButton: {
        padding: 18,
        backgroundColor: '#fbc12c',
        borderRadius: 5,
    },
    switchButtonText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'black',
    },
    text: {
        fontSize: 18,
        fontFamily: 'Roboto-Medium',
    },
})

export default CustomDrawerContent
