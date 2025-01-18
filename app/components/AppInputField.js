import { StyleSheet, Text, View, TextInput } from 'react-native'
import React, { useState } from 'react'
import Color from '../utils/Color'

export default function AppInputField() {
    const { phone, setPhone } = useState('')
    return (
        <View>
            <TextInput
                style={styles.input}
                placeholder='Phone'
                secureTextEntry
                value={phone}
                onChangeText={setPhone}
                autoCorrect={false}
                autoCapitalize='none'
                // keyboardType='phone-pad'
            />
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        height: 60,
        paddingHorizontal: 20,
        borderRadius: 7,
        backgroundColor: Color.inputField,
    },
})
