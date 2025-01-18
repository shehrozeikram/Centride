import React, { useState } from 'react'
import {
    StyleSheet,
    View,
    FlatList,
    Modal,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

// Comprehensive list of banks in Pakistan
const bankList = [
    { id: '1', name: 'Habib Bank Limited (HBL)', bankCode: 'HBL' },
    { id: '2', name: 'National Bank of Pakistan (NBP)', bankCode: 'NBP' },
    { id: '3', name: 'United Bank Limited (UBL)', bankCode: 'UBL' },
    { id: '4', name: 'MCB Bank Limited', bankCode: 'MCB' },
    { id: '5', name: 'Standard Chartered Bank (SCB)', bankCode: 'SCB' },
    { id: '6', name: 'Bank Alfalah', bankCode: 'BAFL' },
    { id: '7', name: 'Faysal Bank', bankCode: 'FABL' },
    { id: '8', name: 'Bank Islami', bankCode: 'BIPL' },
    { id: '9', name: 'Al Baraka Bank', bankCode: 'ABPL' },
    { id: '10', name: 'Pak Oman Investment Company', bankCode: 'POIC' },
    { id: '11', name: 'Dubai Islamic Bank', bankCode: 'DIB' },
    { id: '12', name: 'First Women Bank', bankCode: 'FWBL' },
    { id: '13', name: 'Samba Bank', bankCode: 'SBL' },
    { id: '14', name: 'Bank of Punjab', bankCode: 'BOP' },
    { id: '15', name: 'Punjab National Bank', bankCode: 'PNB' },
    { id: '16', name: 'Soneri Bank', bankCode: 'SNBL' },
    { id: '17', name: 'Silkbank', bankCode: 'SILK' },
    { id: '18', name: 'Citibank Pakistan', bankCode: 'CITI' },
    { id: '19', name: 'Agricultural Bank of China', bankCode: 'ABC' },
    { id: '20', name: 'Saudi Pak Bank', bankCode: 'SPBL' },
    { id: '21', name: 'Bank Al-Habib', bankCode: 'BAHL' },
    { id: '22', name: 'Union Bank', bankCode: 'UBL' }, // Different Union Bank, code UBL reused
    { id: '23', name: 'Al Baraka Islamic Bank', bankCode: 'ABIB' },
    { id: '24', name: 'Pak Oman Investment Company', bankCode: 'POIC' }, // Same as id 10
    { id: '25', name: 'NIB Bank', bankCode: 'NIB' },
];


const BanksInfoModal = ({ visible, onClose, onSelect, selectedBank }) => {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredBanks = bankList.filter((bank) =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <Modal
            transparent={true}
            animationType='slide'
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Your Bank</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search for a bank...'
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {/* <ScrollView> */}
                    <FlatList
                        data={filteredBanks}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.bankItem}
                                onPress={() => onSelect(item)}
                            >
                                <Text style={styles.bankItemText}>
                                    {item.name}
                                </Text>
                                {selectedBank &&
                                    selectedBank.id === item.id && (
                                        <Ionicons
                                            name='checkmark-circle'
                                            size={20}
                                            color='#4CAF50'
                                        />
                                    )}
                            </TouchableOpacity>
                        )}
                    />
                    {/* </ScrollView> */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        margin: 20,
        borderRadius: 12,
        padding: 20,
        elevation: 10,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    bankItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    bankItemText: {
        fontSize: 16,
        color: '#333',
    },
    closeButton: {
        backgroundColor: '#ff5722',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
})

export default BanksInfoModal
