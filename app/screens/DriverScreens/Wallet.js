import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Alert,
    TextInput,
} from 'react-native'
import Color from '../../utils/Color'
import AppButton from '../../components/AppButton'
import AppInputField from '../../components/AppInputField'
import { useNavigation } from '@react-navigation/native'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import Header from '../../components/Header'
import { Post } from '../../network/network'

const Wallet = () => {
    useEffect(() => {
        getBalance()
    }, [])

    const [balance, setBalance] = useState(null) // State for wallet balance
    const [loading, setLoading] = useState(true) // State for loading indicator
    const [error, setError] = useState(null) // State for error handling
    const [selectedReward, setSelectedReward] = useState(0) // State for selected reward
    const rewards = [0, 100, 200, 500] // Reward amounts
    const [withDraw, setWithDraw] = useState('')
    const navigation = useNavigation()

    const onBackPress = () => {
        navigation.goBack()
    }

    const getBalance = () => {
        // Sb Se pehly Body
        const currentBalanceData = {
            action: 'getwalletinfo',
        }
        // phr Post se call kro body ko
        Post({
            data: currentBalanceData,
        })
            .then((response) => {
                console.log('response', response.wallet_amt)
                setBalance(response.wallet_amt)
            })
            .catch((error) => {
                console.log('error', error)
            })
    }

    const handleWalletWithdrawal = () => {
        const withDrawalAmount = {
            action: 'walletwithdraw',
            amount: 10,
        }

        Post({
            data: withDrawalAmount,
        })
            .then((response) => {
                console.log('response of wallet', response)
                // setWithDraw(withDraw)
                Alert.alert('Withdraw Amount', withDraw)
            })
            .catch((error) => {
                console.log('error', error)
            })
    }

    return (
        <View style={[Style.container]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <View style={[Style.hPaddingSixteen]}>
                {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}
            </View>
            <Spacing val={20} />
            {/* Main container above the ScrollView */}
            <View style={styles.mainContainer}>
                <Text>BALANCE</Text>
                <Text>FUNDING</Text>
                <Text>TRANSACTIONS</Text>
            </View>

            {/* ScrollView containing 3 views */}
            <ScrollView style={[Style.flex1]}>
                <View style={[Style.alignCenter, Style.flex1]}>
                    <View style={styles.viewContainer1}>
                        <View style={styles.currentBalanceContainer}>
                            <Text style={styles.currentBalanceText1}>
                                Current Balance
                            </Text>
                            <Text style={styles.currentBalanceText2}>
                                Rs{balance !== null ? balance : 0}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.viewContainer2}>
                        <Spacing val={20} />
                        <Text style={styles.rewardPointsText1}>
                            Wallet Withdrawal
                        </Text>
                        <View style={styles.inputView}>
                            <AppInputField />
                        </View>
                        <Spacing val={20} />
                        <View style={styles.buttonView}>
                            <AppButton
                                onPress={handleWalletWithdrawal}
                                name='Pay'
                            />
                        </View>
                    </View>

                    <View style={styles.viewContainer3}>
                        <Text style={styles.fundWalletText}>Fund Wallet</Text>
                        <View style={styles.inputView}>
                            <AppInputField />
                        </View>

                        <View style={styles.rewardDriverContainer}>
                            {rewards.map((reward, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.rewardDriver,
                                        selectedReward === reward &&
                                            styles.rewardDriverSelected,
                                    ]}
                                    onPress={() => setSelectedReward(reward)}>
                                    <Text style={styles.rewardDriverNumber}>
                                        {reward}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Spacing val={20} />
                        <View style={styles.buttonView}>
                            <AppButton
                                onPress={() => console.log('pressed')}
                                name='Redeem Points'
                            />
                        </View>
                        <Spacing val={20} />
                    </View>
                </View>
                <Spacing val={300} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonView: {
        width: '90%',
        // marginTop: 25,
        // marginLeft: 35,
    },
    container: {
        flex: 1,
        backgroundColor: Color.background,
        marginTop: '22%',
    },
    currentBalanceContainer: {
        marginLeft: '-60%',
    },
    currentBalanceText1: {
        fontWeight: '600',
    },
    currentBalanceText2: {
        fontSize: 30,
        fontWeight: '600',
    },
    fundWalletText: {
        marginTop: '5%',
        marginLeft: '-60%',
        fontWeight: '600',
    },
    inputView: {
        width: '100%',
        // paddingHorizontal: 40,
        marginTop: 50,
    },
    // Main container with row layout
    mainContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        elevation: 20,
        height: '8%',
        width: '100%',
        alignItems: 'center',
        backgroundColor: Color.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    rewardPointsContainer: {
        // marginTop: '10%',
        fontWeight: '600',
    },
    rewardPointsText1: {
        marginLeft: '-60%',
        fontWeight: '600',
    },
    rewardPointsText2: {
        fontSize: 30,
        marginTop: 50,
    },
    // ScrollView container style
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: Color.background,
    },

    // View container inside ScrollView
    viewContainer1: {
        height: '30%',
        width: '90%',
        backgroundColor: '#C0C0C0',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        paddingHorizontal: 10,
        paddingHorizontal: 10,
    },
    viewContainer2: {
        height: '35%',
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        paddingHorizontal: 10,
        paddingHorizontal: 10,
    },
    viewContainer3: {
        // height: '48%',
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        paddingHorizontal: 15,
        paddingHorizontal: 10,
    },
    rewardDriverContainer: {
        flexDirection: 'row',
        marginTop: 25,
        width: '90%',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    rewardDriver: {
        width: 85,
        height: 40,
        backgroundColor: '#E1E1E1',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rewardDriverSelected: {
        backgroundColor: '#49B5C1', // Change to the color of the 0 view
    },
    rewardDriverNumber: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default Wallet
