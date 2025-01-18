import React from 'react'

import { createNativeStackNavigator } from '@react-navigation/native-stack'

import GetStartedScreen from '../onboarding/GetStartedScreen'
import AddNameScreen from '../onboarding/AddNameScreen'
import CreatePasswordScreen from '../onboarding/CreatePasswordScreen'
import AlmostDone from '../onboarding/AlmostDone'
import VehicleDetails from '../onboarding/VehicleDetails'

const Stack = createNativeStackNavigator()

const OnboardingRouter = () => {
    return (
        <Stack.Navigator
            initialRouteName='GetStartedScreen'
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                name='GetStartedScreen'
                component={GetStartedScreen}
            />
            <Stack.Screen name='AddNameScreen' component={AddNameScreen} />
            <Stack.Screen
                name='CreatePasswordScreen'
                component={CreatePasswordScreen}
            />
            <Stack.Screen name='AlmostDone' component={AlmostDone} />
            <Stack.Screen name='VehicleDetails' component={VehicleDetails} />
        </Stack.Navigator>
    )
}

export default OnboardingRouter
