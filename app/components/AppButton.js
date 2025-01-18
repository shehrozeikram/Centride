import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import Color from '../utils/Color'
import Style from '../utils/Styles'

const AppButton = ({ onPress, name, disable = false }) => {
    return (
        <TouchableOpacity
            disabled={disable}
            style={styles.button}
            onPress={onPress}>
            <Text style={[Style.label, Style.fontBold, Style.colorWhite]}>
                {name}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Color.primary,
        borderRadius: 35,
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 10,
        shadowColor: Color.black,
        shadowOffset: {
            height: 4,
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 0.45,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
})

export default AppButton
