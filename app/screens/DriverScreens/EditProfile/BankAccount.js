import React, { useState } from 'react'
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native'
import BanksInfoModal from '../../../modals/BanksInfoModal'
import Color from '../../../utils/Color'
import { Post } from '../../../network/network'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../../../redux/userSlice'

const BankAccount = () => {
    const user = useSelector((state) => state?.user?.user)
    const [accountName, setAccountName] = useState(user?.bank_acc_holder_name)
    const [accountNumber, setAccountNumber] = useState(user?.bank_acc_num)
    const [selectedBank, setSelectedBank] = useState({
        name: user?.bank_name,
        bankCode: user?.bank_code,
    })
    const [modalVisible, setModalVisible] = useState(false)
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const handleBankSelect = (bank) => {
        console.log('bank', bank)
        setSelectedBank(bank)
        setModalVisible(false)
    }

    const handleSubmit = () => {
        if (!accountName || !accountNumber || !selectedBank) {
            Alert.alert('Error', 'Please fill in all fields.')
            return
        }
        const body = new URLSearchParams({
            action: 'updateBankDetails',
            acc_name: accountName,
            acc_num: accountNumber,
            bank_name: selectedBank?.name,
            bank_code: selectedBank?.bankCode,
        }).toString()
        Post({ data: body })
            .then((response) => {
                const userData = {
                    ...user,
                    bank_acc_holder_name: accountName,
                    bank_acc_num: accountNumber,
                    bank_name: selectedBank?.name,
                    bank_code: selectedBank?.bankCode,
                }
                dispatch(setUser(userData))
                console.log('=======CAR UPDATE=======', response)
                Alert.alert('Success', 'Bank account information saved!')

                navigation.goBack()
            })
            .catch((error) => {
                console.log('error', error)
                Alert('Error', 'Car update error')
            })
    }

    return (
        <View style={styles.container}>
            <Text style={styles.infoText}>
                Valid bank account information is required for payment of your
                earnings.
            </Text>

            <TextInput
                style={styles.input}
                placeholder='Account Name'
                value={accountName}
                onChangeText={setAccountName}
            />

            <TextInput
                style={styles.input}
                placeholder='Account Number'
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType='numeric'
            />

            <TouchableOpacity
                style={styles.input}
                onPress={() => setModalVisible(true)}>
                <Text style={styles.selectBankText}>
                    {selectedBank ? selectedBank.name : 'Select Bank'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>

            {/* Bank Selection Modal */}
            <BanksInfoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={handleBankSelect}
                selectedBank={selectedBank}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        // marginTop: 80,
    },
    infoText: {
        marginBottom: 20,
        fontSize: 16,
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 20,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectBankText: {
        flex: 1,
        color: '#555',
    },
    submitButton: {
        backgroundColor: Color.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default BankAccount
