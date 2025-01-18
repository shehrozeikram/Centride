import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Style from '../utils/Styles'
import Icon from 'react-native-vector-icons/Ionicons'
import DrawerModal from './DrawerModal'
import { useNavigation } from '@react-navigation/native'
import Color from '../utils/Color'
import DriverDrawer from './DriverDrawer'

const Header = ({
    LeftIcon,
    title,
    onPressLeftIcon,
    isMenuIcon,
    isRightView = true,
    isDriver,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const navigation = useNavigation()
    const toggleDrawer = () => {
        setIsModalVisible(!isModalVisible)
    }
    const handleMenu = () => {
        toggleDrawer()
    }
    return (
        <View style={[Style.flexRow, Style.justifyBetween, Style.alignCenter]}>
            {LeftIcon && (
                <TouchableOpacity onPress={onPressLeftIcon}>
                    <Icon name='arrow-back' size={25} color='#000' />
                </TouchableOpacity>
            )}
            {isMenuIcon && (
                <TouchableOpacity onPress={handleMenu}>
                    <Icon name='menu' size={25} color={Color.white} />
                </TouchableOpacity>
            )}
            <Text style={[Style.fontBold, Style.label, Style.colorBlack]}>
                {title}
            </Text>
            {isRightView && <View style={[styles.rightView]}></View>}
            {isDriver ? (
                <DriverDrawer
                    isVisible={isModalVisible}
                    onClose={toggleDrawer}
                />
            ) : (
                <DrawerModal
                    isVisible={isModalVisible}
                    onClose={toggleDrawer}
                />
            )}
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    rightView: {
        height: 20,
        width: 30,
    },
})
