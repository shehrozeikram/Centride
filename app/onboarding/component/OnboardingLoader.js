import React from 'react'
import { View, StyleSheet } from 'react-native'
import Color from '../../utils/Color'

const OnBoardingScreenLoader = ({ position }) => {
    const views = [0, 1, 2, 3]

    return (
        <View style={Style.container}>
            {views.map((index) => {
                return position.includes(index) ? (
                    <View key={index} style={Style.currentview} />
                ) : (
                    <View key={index} style={Style.viewstyle} />
                )
            })}
        </View>
    )
}

const Style = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    currentview: {
        width: 90,
        height: 6,
        backgroundColor: Color.primary,
        marginStart: 2,
        gap: 10,
        borderRadius: 10,
        flex: 1,
    },
    viewstyle: {
        marginStart: 2,
        width: 90,
        height: 6,
        backgroundColor: Color.lightGrey,
        opacity: 0.5,
        borderRadius: 10,
        flex: 1,
    },
})

export default OnBoardingScreenLoader
