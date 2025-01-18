import React, { useRef } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'

const OtpInput = ({ onCodeFilled }) => {
    const inputRefs = useRef([])
    const otpValues = useRef(Array(6).fill('')) // Store the values for all OTP inputs

    const handleChangeText = (text, index) => {
        // Set the value for the current input
        otpValues.current[index] = text // Store the input value

        if (text.length === 1) {
            if (index < 5) {
                inputRefs.current[index + 1].focus() // Move to next input
            }
            if (index === 5) {
                onCodeFilled(otpValues.current.join('')) // Pass the complete OTP
            }
        } else if (text.length === 0) {
            if (index > 0) {
                inputRefs.current[index - 1].focus() // Move to previous input
            }
        }
    }

    const renderInputs = () => {
        return Array.from({ length: 6 }).map((_, index) => (
            <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.input}
                keyboardType='number-pad'
                maxLength={1}
                onChangeText={(text) => handleChangeText(text, index)}
                autoFocus={index === 0}
            />
        ))
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputsContainer}>{renderInputs()}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        paddingHorizontal: 10,
    },
    inputsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    input: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 18,
        color: 'black',
    },
})

export default OtpInput
