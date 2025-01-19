// import React, { useEffect } from 'react'

// import { NavigationContainer } from '@react-navigation/native'
// import { createNativeStackNavigator } from '@react-navigation/native-stack'
// import RiderRoute from './app/router/RiderRouter'
// import DriverRoute from './app/router/DriverRouter'
// import SplashScreen from './app/screens/splash/SplashScreen'
// import RiderStackNavigator from './app/navigators/RiderStackNavigator'
// import Language from './app/screens/language/Language'
// import OnboardingRouter from './app/router/OnboardingRouter'
// import VerifyOtp from './app/screens/RiderScreens/VerifyOtp'
// import { Provider } from 'react-redux'
// import store from './app/redux/store'
// import SelectRoleScreen from './app/screens/selectRoleScreen'
// import auth from '@react-native-firebase/auth'
// import { firebase } from '@react-native-firebase/app'
// import 'firebase/database'
// import Test from './app/screens/Test'
// import database from '@react-native-firebase/database'
// import messaging from '@react-native-firebase/messaging'
// import OfferModal from './app/modals/OfferModal'
// import DriverOnWay from './app/modals/DriverOnWay'
// import Hello from './app/screens/Hello'
// import Ring from './app/components/Ring'
// import DriverArriveModal from './app/modals/DriverArriveModal'
// import { GestureHandlerRootView } from 'react-native-gesture-handler'

// // Set the background message handler
// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//     console.log('Message handled in the background!', remoteMessage)
// })

// const Stack = createNativeStackNavigator()
// const App = () => {
//     // useEffect(() => {
//     //     // getDatabase()
//     //     requestUserPermission()
//     //     getToken()

//     //     const unsubscribe = messaging().onMessage(async (remoteMessage) => {
//     //         console.log(
//     //             'A new FCM message arrived!',
//     //             JSON.stringify(remoteMessage),
//     //         )
//     //     })

//     //     return unsubscribe
//     // }, [])

//     // const requestUserPermission = async () => {
//     //     const authStatus = await messaging().requestPermission()
//     //     const enabled =
//     //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     //         authStatus === messaging.AuthorizationStatus.PROVISIONAL

//     //     if (enabled) {
//     //         console.log('Authorization status:', authStatus)
//     //     }
//     // }

//     // const getToken = async () => {
//     //     const token = await messaging().getToken()
//     //     console.log('FCM Token:', token)
//     //     // Save this token to your database for the user
//     // }

//     // const getDatabase = async () => {
//     //     try {
//     //         const data = await database()
//     //             .ref('Riders/ridr-1/notf/msg')
//     //             .once('value')
//     //         console.log('===========data=========', data)
//     //     } catch (error) {
//     //         console.log('error')
//     //     }
//     // }

//     return (
//         // <GestureHandlerRootView>
//         //     <Test />
//         // </GestureHandlerRootView>
//         // <Test />
//         // <Hello />
//         // <DriverArriveModal />
//         <Provider store={store}>
//             <NavigationContainer>
//                 <Stack.Navigator
//                     initialRouteName='Splash'
//                     screenOptions={{ headerShown: false }}>
//                     <Stack.Screen name='Splash' component={SplashScreen} />
//                     <Stack.Screen name='RiderRoute' component={RiderRoute} />
//                     <Stack.Screen name='DriverRoute' component={DriverRoute} />
//                     <Stack.Screen
//                         name='RiderStackNavigator'
//                         component={RiderStackNavigator}
//                     />
//                     <Stack.Screen name='Language' component={Language} />
//                     <Stack.Screen
//                         name='OnboardingRouter'
//                         component={OnboardingRouter}
//                     />
//                     <Stack.Screen name='VerifyOtp' component={VerifyOtp} />
//                     {/* <Stack.Screen
//                         name='SelectRoleScreen'
//                         component={SelectRoleScreen}
//                     /> */}
//                 </Stack.Navigator>
//             </NavigationContainer>
//         </Provider>
//     )
// }

// export default App

import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import RiderRoute from './app/router/RiderRouter'
import DriverRoute from './app/router/DriverRouter'
import SplashScreen from './app/screens/splash/SplashScreen'
import RiderStackNavigator from './app/navigators/RiderStackNavigator'
import Language from './app/screens/language/Language'
import OnboardingRouter from './app/router/OnboardingRouter'
import VerifyOtp from './app/screens/RiderScreens/VerifyOtp'
import { Provider } from 'react-redux'
import store from './app/redux/store'
import SelectRoleScreen from './app/screens/selectRoleScreen'
import Test from './app/screens/Test'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// Import i18n (make sure i18next is initialized)
import '././app/localization' // Make sure this imports your i18n.js initialization
import { LogBox } from 'react-native'

// Setup Navigation Stack
const Stack = createNativeStackNavigator()

const App = () => {
    LogBox.ignoreAllLogs()
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName='Splash'
                    screenOptions={{ headerShown: false }}>
                    <Stack.Screen name='Splash' component={SplashScreen} />
                    <Stack.Screen name='RiderRoute' component={RiderRoute} />
                    <Stack.Screen name='DriverRoute' component={DriverRoute} />
                    <Stack.Screen
                        name='RiderStackNavigator'
                        component={RiderStackNavigator}
                    />
                    <Stack.Screen name='Language' component={Language} />
                    <Stack.Screen
                        name='OnboardingRouter'
                        component={OnboardingRouter}
                    />
                    <Stack.Screen name='VerifyOtp' component={VerifyOtp} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    )
}

export default App
