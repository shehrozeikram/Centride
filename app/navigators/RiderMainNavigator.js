import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import RiderNavigator from './RiderNavigator'
import RiderStackNavigator from './RiderStackNavigator'
import AppLoader from '../components/AppLoader'
import { useNavigation } from '@react-navigation/native'

const RiderMainNavigator = () => {
    const navigation = useNavigation()
    const [isLoggedIn, setIsLoggedIn] = useState(null)
    console.log(isLoggedIn)
    useEffect(() => {
        setTimeout(() => {
            setIsLoggedIn(false)
        }, 1000)
    }, [])

    if (isLoggedIn === null) {
        return <AppLoader />
    } else {
        navigation.navigate('RiderRoute')
    }

    return isLoggedIn ? <RiderNavigator /> : <RiderStackNavigator />
}

export default RiderMainNavigator
