import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import Header from '../../../components/Header'
import Style from '../../../utils/Styles'
import { Post } from '../../../network/network'
import { stripHtmlTags } from '../../../utils/common'

const MyReferrals = () => {
    const [referrals, setReferrals] = useState('')

    useEffect(() => {
        getReferrals()
    }, [])

    const navigation = useNavigation()

    // const onBackPress = () => {
    //     navigation.goBack()
    // }

    const getReferrals = () => {
        const body = {
            action: 'getreferralsdata',
        }
        Post({
            data: body,
        })
            .then((response) => {
                const referralData = response.referrals_data
                setReferrals(stripHtmlTags(referralData))
                console.log('response', response.referrals_data)
            })
            .catch((error) => {
                console.log('error', error)
            })
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}

            <View style={[Style.alignCenter, Style.justifyCenter, Style.flex1]}>
                <Text style={styles.text}>
                    {referrals !== 'null' && referrals !== '' ? referrals : ''}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: '20%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
    },
    textContainer: {
        width: '85%',
        marginTop: '70%',
    },
})

export default MyReferrals
