import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import AppButton from '../../../components/AppButton'

const ReferralCode = ({ navigation }) => {
    const handleSubmit = () => {
        navigation.navigate('Promotions')
    }
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={require('../../../assets/friends-referral.png')}
                    style={styles.image}
                />
            </View>
            <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                    Earn Rs 0.00 with your referral code when you invite a
                    driver to TxyCo and the driver completes 20 trips in 5 days
                </Text>
            </View>
            <View style={styles.referral}>
                <Text style={styles.referralText}>Referral Code</Text>
                <Text style={styles.codeText}>AQMB4250</Text>
            </View>
            <View style={styles.buttonView}>
                <AppButton onPress={handleSubmit} name='Share' />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonView: {
        width: '100%',
        paddingHorizontal: 40,
        marginTop: '60%',
        marginBottom: 30,
    },
    container: {
        marginTop: '20%',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    codeText: {
        fontWeight: '700',
    },
    description: {
        fontSize: 15,
    },
    descriptionContainer: {
        width: '80%',
    },
    image: {
        // marginTop: 50,
        width: 180,
        height: 180,
        borderRadius: 30,
        marginBottom: 20,
    },
    imageContainer: {
        justifyContent: 'center',
        marginTop: '40%',
    },
    referral: {
        marginTop: 20,
        height: 50,
        width: '80%',
        borderWidth: 0.2,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 100,
    },
    referralText: {
        fontWeight: '700',
    },
})

export default ReferralCode
