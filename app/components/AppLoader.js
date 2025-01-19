import React from 'react'
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native'

const AppLoader = () => {
    return (
        <View style={styles.container}>
            <Image
                resizeMode='contain'
                style={styles.logoPic}
                source={require('../assets/bike_new.png')}
            />
            {/* <ActivityIndicator size='large' color='#0000ff' /> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FCEA00',
    },
    text: {
        marginTop: 10,
        fontSize: 18,
        color: '#333',
    },
    logoPic: {
        width: 180,
        height: 180,
    },
})

export default AppLoader
