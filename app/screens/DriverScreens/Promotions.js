import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Style from '../../utils/Styles'
import Color from '../../utils/Color'
import Spacing from '../../components/Spacing'
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'

const Promotions = () => {
    const onPress = () => {
        navigation.navigate('ReferralCode')
    }
    const navigation = useNavigation()

    // const onBackPress = () => {
    //     navigation.goBack()
    // }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />

            {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}

            <View style={[Style.flex1, Style.justifyCenter, Style.alignCenter]}>
                <Text style={[Style.fontMedium, Style.label, Style.colorGray]}>
                    You have no active Promotions
                </Text>
            </View>
            <View style={Style.colorOrange}>
                <TouchableOpacity
                    style={[
                        Style.vPadding14,
                        Style.flexRow,
                        Style.colorDriverPromotionsInput,
                    ]}
                    onPress={onPress}>
                    <View style={styles.cashView}>
                        <FontAwesome
                            name='money'
                            size={20}
                            color={Color.white}
                        />
                    </View>
                    <Text style={styles.cashViewText}>Earn more money</Text>
                </TouchableOpacity>
            </View>
            <Spacing val={50} />
        </View>
    )
}

const styles = StyleSheet.create({
    cashView: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: '#FF9700',
        marginLeft: 10,
        marginTop: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cashViewText: {
        marginLeft: 15,
        marginTop: 13,
        fontSize: 17,
    },
    earnMoney: {
        borderRadius: 10,
    },
    textActivePromotions: {
        fontSize: 20,
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '80%',
    },
})

export default Promotions
