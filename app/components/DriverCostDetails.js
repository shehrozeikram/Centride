import { StyleSheet, Text, View } from 'react-native'
import React, { memo } from 'react'
import Style from '../utils/Styles'
import AppDivider from './AppDivider'

const DriverCostDetails = ({ leftText, rightText }) => {
    return (
        <View
            style={[
                Style.flexRow,
                Style.alignCenter,
                Style.widthFull,
                Style.flex1,
                Style.justifyBetween,
            ]}
        >
            <Text style={[Style.fontMedium, Style.subLabel, Style.colorBlack]}>
                {leftText}
            </Text>
            <View
                style={[Style.flex1, Style.widthFull, { marginHorizontal: 10 }]}
            >
                <AppDivider />
            </View>
            <Text style={[Style.fontMedium, Style.subLabel, Style.colorBlack]}>
                {rightText}
            </Text>
        </View>
    )
}

export default memo(DriverCostDetails)

const styles = StyleSheet.create({})
