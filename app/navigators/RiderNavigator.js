import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome' // FontAwesome import
import Ionicons from 'react-native-vector-icons/Ionicons'
import { createDrawerNavigator } from '@react-navigation/drawer'
import CustomDrawerContent from '../components/CustomDrawerContent' // Custom drawer content
import RiderMapScreen from '../screens/RiderScreens/RiderMap'
import Trips from '../screens/RiderScreens/Trips'
import Wallet from '../screens/RiderScreens/Wallet'
import DropOffLocation from '../screens/RiderScreens/DropOffLocation'
import Promotions from '../screens/RiderScreens/Promotions'
import Notifications from '../screens/RiderScreens/Notifications'
import CallForHelp from '../screens/RiderScreens/CallForHelp'
import Support from '../screens/RiderScreens/Support'
import HelpGuide from '../screens/RiderScreens/SupportScreens/HelpGuide'
import RideCompleted from '../screens/RiderScreens/RideCompleted'
import AboutTxyCo from '../screens/RiderScreens/SupportScreens/AboutTxyCo'
import CustomerServiceChat from '../screens/RiderScreens/SupportScreens/CustomerServiceChat'
import DriveWithUs from '../screens/RiderScreens/SupportScreens/DriveWithUs'
import PrivacyPolicy from '../screens/RiderScreens/SupportScreens/PrivacyPolicy'
import SoftwareLicenses from '../screens/RiderScreens/SupportScreens/SoftwareLicenses'
import RateApp from '../screens/RiderScreens/SupportScreens/RateApp'
import EditProfile from '../screens/RiderScreens/EditProfileScreens/EditProfile'
import Documents from '../screens/RiderScreens/EditProfileScreens/Documents'
import Email from '../screens/RiderScreens/EditProfileScreens/Email'
import Password from '../screens/RiderScreens/EditProfileScreens/Password'
import Language from '../screens/RiderScreens/EditProfileScreens/Language'
import Profile from '../screens/RiderScreens/Profile'

const Drawer = createDrawerNavigator()

// const RiderNavigator = ({ navigation }) => {
//     return (
//         <Drawer.Navigator
//             initialRouteName='RiderMap'
//             drawerContent={(props) => (
//                 <CustomDrawerContent {...props} switchTo='Driver' />
//             )}
//             screenOptions={{
//                 drawerActiveBackgroundColor: '#FBC12C',
//                 drawerActiveTintColor: '#fff',
//                 drawerLabelStyle: {
//                     fontSize: 18,
//                 },
//                 headerTransparent: true,
//                 headerTitle: '',
//             }}>
//             {/* <Drawer.Screen
//                 name='RiderMap'
//                 component={RiderMapScreen}
//                 options={{ drawerItemStyle: { height: 0 } }}
//             />
//             <Drawer.Screen
//                 name='Profile'
//                 component={Profile}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Profile',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('RiderMap')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='Trips'
//                 component={Trips}
//                 options={({ navigation }) => ({
//                     headerShown: true,
//                     drawerIcon: ({ color, size }) => (
//                         <FontAwesome name='map' size={size} color='#03C5C2' />
//                     ),
//                     headerTransparent: true,
//                     headerTitle: 'Trips',
//                     headerLeft: () => (
//                         <TouchableOpacity onPress={() => navigation.goBack()}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />

//             <Drawer.Screen
//                 name='Promotions'
//                 component={Promotions}
//                 options={({ navigation }) => ({
//                     headerShown: true,
//                     drawerIcon: ({ color, size }) => (
//                         <FontAwesome name='gift' size={size} color='#EE5C5D' />
//                     ),
//                     headerTransparent: true,
//                     headerTitle: 'Promo Discounts',
//                     headerLeft: () => (
//                         <TouchableOpacity onPress={() => navigation.goBack()}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='Notifications'
//                 component={Notifications}
//                 options={({ navigation }) => ({
//                     headerShown: true,
//                     drawerIcon: ({ color, size }) => (
//                         <Ionicons
//                             name='notifications'
//                             size={size}
//                             color='#9F6DB5'
//                         />
//                     ),
//                     headerTransparent: true,
//                     headerTitle: 'Notifications',
//                     headerLeft: () => (
//                         <TouchableOpacity onPress={() => navigation.goBack()}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='CallForHelp'
//                 component={CallForHelp}
//                 options={({ navigation }) => ({
//                     headerShown: true,
//                     drawerIcon: ({ color, size }) => (
//                         <Ionicons name='call' size={size} color='#73E175' />
//                     ),
//                     headerTransparent: true,
//                     headerTitle: 'Call For Help',
//                     headerLeft: () => (
//                         <TouchableOpacity onPress={() => navigation.goBack()}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='Support'
//                 component={Support}
//                 options={({ navigation }) => ({
//                     headerShown: true,
//                     drawerIcon: ({ color, size }) => (
//                         <FontAwesome
//                             name='info-circle'
//                             size={size}
//                             color='#42A3F2'
//                         />
//                     ),
//                     headerTransparent: true,
//                     headerTitle: 'Support',
//                     headerLeft: () => (
//                         <TouchableOpacity onPress={() => navigation.goBack()}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='RideCompleted'
//                 component={RideCompleted}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: '',
//                     headerLeft: () => (
//                         <TouchableOpacity onPress={() => navigation.goBack()}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             /> */}
//             {/* <Drawer.Screen
//                 name='DropOffLocation'
//                 component={DropOffLocation}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Drop Off Location',
//                     headerLeft: () => (
//                         <TouchableOpacity onPress={() => navigation.goBack()}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             /> */}

//             {/* Support Screens */}
//             {/* <Drawer.Screen
//                 name='AboutTxyCo'
//                 component={AboutTxyCo}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'About TxyCo',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Support')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='HelpGuide'
//                 component={HelpGuide}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Help Guide',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Support')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='CustomerServiceChat'
//                 component={CustomerServiceChat}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Customer Chat',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Support')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='DriveWithUs'
//                 component={DriveWithUs}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Drive With Us',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Support')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='PrivacyPolicy'
//                 component={PrivacyPolicy}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Privacy Policy',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Support')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='RateApp'
//                 component={RateApp}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Rate App',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Support')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='EditProfile'
//                 component={EditProfile}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Edit Profile',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Profile')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='Documents'
//                 component={Documents}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Documents',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Profile')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='Email'
//                 component={Email}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Emails',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Profile')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             />
//             <Drawer.Screen
//                 name='Password'
//                 component={Password}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Password',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Profile')}>
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             /> */}
//             {/* <Drawer.Screen
//                 name='Language'
//                 component={Language}
//                 options={({ navigation }) => ({
//                     drawerItemStyle: { height: 0 },
//                     headerShown: true,
//                     headerTransparent: true,
//                     headerTitle: 'Language',
//                     headerLeft: () => (
//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Profile')}
//                         >
//                             <Icon
//                                 name='arrow-back'
//                                 size={25}
//                                 color='#000'
//                                 style={{ marginLeft: 10 }}
//                             />
//                         </TouchableOpacity>
//                     ),
//                 })}
//             /> */}
//             {/* Add more screens as needed */}
//         </Drawer.Navigator>
//     )
// }

// export default RiderNavigator
