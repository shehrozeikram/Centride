import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import RiderRoute from '../router/RiderRouter'
import DriverRoute from '../router/DriverRouter'

const Stack = createNativeStackNavigator()

const MainNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* <Stack.Screen name="RiderApp" component={RiderMainNavigator} /> */}
                {/* <Stack.Screen name="RiderApp" component={RiderNavigator} /> */}
                {/* <Stack.Screen name="DriverApp" component={DriverNavigator} /> */}

                {/* routes */}
                <Stack.Screen name='RiderRoute' component={RiderRoute} />
                <Stack.Screen name='DriverRoute' component={DriverRoute} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default MainNavigator
