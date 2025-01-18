// DeleteModal.js
import React, { useState, useEffect } from 'react'
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native'
import Style from '../utils/Styles'
import Color from '../utils/Color'
import { getPassword } from '../utils/common'

const DeleteModal = ({ visible, onClose, onDelete }) => {
    const [accountName, setAccountName] = useState('')

    useEffect(() => {
        // Reset input field when modal becomes visible
        if (visible) {
            setAccountName('')
        }
    }, [visible])

    const handleDelete = async() => {
        const password = await getPassword()
 
        if (accountName === password) {
            // Replace with dynamic account name if needed
            onDelete()
            onClose()
        } else {
            Alert.alert('Error', 'The account name you entered is incorrect.')
        }
    }

    return (
        <Modal transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Confirm Account Deletion</Text>
                    <Text style={styles.description}>
                        Please enter your password to confirm:
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={accountName}
                        onChangeText={setAccountName}
                        placeholder='Enter Password'
                        placeholderTextColor='#999'
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleDelete}
                        >
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker background for focus
    },
    modalContent: {
        width: '90%',
        maxWidth: 350,
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0', // Subtle border for added definition
    },
    title: {
        fontSize: 22,
        color: '#333',
        fontWeight: '700',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 20,
        shadowColor: '#aaa',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    confirmButton: {
        backgroundColor: Color.delete,
    },
    cancelButton: {
        backgroundColor: Color.primary,
    },
    buttonText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '600',
    },
})

export default DeleteModal
