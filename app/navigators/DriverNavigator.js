import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome' // FontAwesome import
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Entypo from 'react-native-vector-icons/Entypo'
import { createDrawerNavigator } from '@react-navigation/drawer'
import CustomDrawerContent from '../components/CustomDrawerContent' // Custom drawer content
import DriverMap from '../screens/DriverScreens/DriverMap'
import Earnings from '../screens/DriverScreens/Earnings'
import Trips from '../screens/DriverScreens/Trips'
import Wallet from '../screens/DriverScreens/Wallet'
import Notifications from '../screens/DriverScreens/Notifications'
import CallForHelp from '../screens/DriverScreens/CallForHelp'
import Support from '../screens/DriverScreens/Support'
import Promotions from '../screens/DriverScreens/Promotions'
import ReferralCode from '../screens/DriverScreens/Referrals/ReferralCode'
import MyReferrals from '../screens/DriverScreens/Referrals/MyReferrals'
import Email from '../screens/DriverScreens/EditProfile/Email'

const Drawer = createDrawerNavigator()

const DriverNavigator = ({ navigation }) => {
    return (
        <Drawer.Navigator
            initialRouteName='DriverMap'
            drawerContent={(props) => (
                <CustomDrawerContent {...props} switchTo='Rider' />
            )}
            screenOptions={{
                drawerActiveBackgroundColor: '#FBC12C',
                drawerActiveTintColor: '#fff',
                drawerLabelStyle: {
                    fontSize: 18,
                },
                headerTransparent: true,
                headerTitle: '',
            }}>
            <Drawer.Screen
                name='DriverMap'
                component={DriverMap}
                options={{ drawerItemStyle: { height: 0 } }}
            />

            <Drawer.Screen
                name='Trips'
                component={Trips}
                options={({ navigation }) => ({
                    headerShown: true,
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome name='map' size={size} color='#03C5C2' />
                    ),
                    headerTransparent: true,
                    headerTitle: '',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon
                                name='arrow-back'
                                size={25}
                                color='#000'
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Drawer.Screen
                name='Wallet'
                component={Wallet}
                options={{
                    headerShown: true,
                    drawerIcon: ({ color, size }) => (
                        <Entypo name='wallet' size={size} color='#A68667' />
                    ),
                    headerTransparent: true,
                    headerTitle: 'Wallet',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('DriverMap')}>
                            <Icon
                                name='arrow-back'
                                size={25}
                                color='#000'
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Drawer.Screen
                name='Earnings'
                component={Earnings}
                options={{
                    headerShown: true,
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome name='gift' size={size} color='#EE5C5D' />
                    ),
                    headerTransparent: true,
                    headerTitle: 'Earnings',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('DriverMap')}>
                            <Icon
                                name='arrow-back'
                                size={25}
                                color='#000'
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Drawer.Screen
                name='Promotions'
                component={Promotions}
                options={({ navigation }) => ({
                    headerShown: true,
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome name='money' size={size} color='#5BA954' />
                    ),
                    headerTransparent: true,
                    headerTitle: 'Promotions',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('DriverMap')}>
                            <Icon
                                name='arrow-back'
                                size={25}
                                color='#000'
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                })}
            />

            <Drawer.Screen
                name='MyReferrals'
                component={MyReferrals}
                options={({ navigation }) => ({
                    headerShown: true,
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome5
                            name='users'
                            size={size}
                            color='#617D8B'
                        />
                    ),
                    headerTransparent: true,
                    headerTitle: 'My Referrals',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('DriverMap')}>
                            <Icon
                                name='arrow-back'
                                size={25}
                                color='#000'
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                })}
            />

            {/* <Drawer.Screen
                name='Notifications'
                component={Notifications}
                options={{
                    headerTransparent: true,
                    headerTitle: '',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('DriverMap')}>
                            <Icon
                                name='arrow-back'
                                size={25}
                                color='#000'
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons
                            name='notifications'
                            size={size}
                            color='#9F6DB5'
                        />
                    ),
                }}
            /> */}
            <Drawer.Screen
                name='CallForHelp'
                component={CallForHelp}
                options={{
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name='call' size={size} color='#73E175' />
                    ),
                }}
            />

            <Drawer.Screen
                name='Support'
                component={Support}
                options={({ navigation }) => ({
                    headerShown: true,
                    drawerIcon: ({ color, size }) => (
                        <FontAwesome
                            name='info-circle'
                            size={size}
                            color='#42A3F2'
                        />
                    ),
                    headerTransparent: true,
                    headerTitle: 'Support',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon
                                name='arrow-back'
                                size={25}
                                color='#000'
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                })}
            />

            {/* <DriverDrawer.Screen name="Earnings" component={EarningsScreen} /> */}

            {/* Add more screens as needed */}
        </Drawer.Navigator>
    )
}

export default DriverNavigator
