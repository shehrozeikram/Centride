import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Color from '../utils/Color'

const AppDivider = () => {
    return <View style={styles.divider}></View>
}

const styles = StyleSheet.create({
    divider: {
        borderBottomWidth: 0.2,
        borderColor: Color.lightGrey,
        width: '90%',
    },
})

export default AppDivider
