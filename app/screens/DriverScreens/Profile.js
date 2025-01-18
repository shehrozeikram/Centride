// import React, { useState } from 'react'
// import {
//     StyleSheet,
//     View,
//     Text,
//     TouchableOpacity,
//     Image,
//     FlatList,
//     ScrollView,
//     Alert,
// } from 'react-native'
// import { Rating } from 'react-native-ratings'
// import AppDivider from '../../components/AppDivider'
// import FontAwesome from 'react-native-vector-icons/FontAwesome'
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
// import Ionicons from 'react-native-vector-icons/Ionicons'
// import Entypo from 'react-native-vector-icons/Entypo'
// import Style from '../../utils/Styles'
// import Spacing from '../../components/Spacing'
// import Header from '../../components/Header'
// import Color from '../../utils/Color'
// import { useNavigation } from '@react-navigation/native'
// import {
//     deleteAppSide,
//     deletePassword,
//     deletePhone,
//     deleteSessionId,
// } from '../../utils/common'
// import { getSessionId } from '../../utils/common'
// import { Post } from '../../network/network'
// import { useDispatch, useSelector } from 'react-redux'
// import { setUser } from '../../redux/userSlice'
// import { UrlTile } from 'react-native-maps'
// import AsyncStorage from '@react-native-async-storage/async-storage'

// const Profile = ({ navigation }) => {
//     const [rating, setRating] = useState(0)
//     const user = useSelector((state) => state.user?.user)

//     const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
//     const [sessionID, setSessionId] = useState('')
//     const dispatch = useDispatch()

//     const handleLogout = async () => {
//         try {
//             const sess_id = await getSessionId()
//             const logoutData = { action: 'driverLogout' }

//             Post({
//                 data: logoutData,
//             })
//                 .then((response) => {
//                     deleteAppSide()
//                     deleteSessionId()
//                     deletePassword()
//                     deletePhone()
//                     // AsyncStorage.removeItem('fb_last_recvd')
//                     dispatch(setUser(null))

//                     // Ensure 'Splash' is correctly defined in your navigation stack
//                     navigation.navigate('Splash') // Ensure this is a valid route name
//                 })
//                 .catch((error) => {
//                     console.error('Error:', error)
//                     Alert.alert('Error', 'An error occurred. Please try again.')
//                 })
//         } catch (error) {
//             console.error('Failed to log out:', error)
//             Alert.alert('Error', 'An error occurred. Please try again.')
//         }
//     }

//     // const handleLogout = async () => {
//     //     try {
//     //         const sess_id = await getSessionId()
//     //         const logoutData = {
//     //             action: 'driverLogout',
//     //         }
//     //         Post({
//     //             data: logoutData,
//     //         })
//     //             .then((response) => {
//     //                 deleteAppSide()
//     //                 deleteSessionId()
//     //                 deletePassword()
//     //                 deletePhone()
//     //                 dispatch(setUser(null))
//     //                 navigation.navigate('Splash')
//     //                 Alert.alert(
//     //                     'Logged out',
//     //                     'You have been logged out successfully.',
//     //                 )
//     //             })
//     //             .catch((error) => {
//     //                 console.error('Error:', error)
//     //                 Alert.alert('Error', 'An error occurred. Please try again.')
//     //             })
//     //     } catch (error) {
//     //         console.error('Failed to log out:', error)
//     //         Alert.alert('Error', 'An error occurred. Please try again.')
//     //     }
//     // }

// const profileOptions = [
//     {
//         id: 1,
//         title: 'Edit Profile',
//         icon: <FontAwesome5 name='user-alt' size={22} color='#0472FA' />,
//         screen: 'DriverEditProfile',
//     },
//     {
//         id: 2,
//         title: 'E-mail',
//         description: user ? `${user?.email}` : '',
//         icon: <MaterialIcons name='email' size={24} color='#00C600' />,
//         screen: 'Email',
//     },
//     {
//         id: 3,
//         title: 'Password',
//         icon: <Entypo name='key' size={24} color='#FF8900' />,
//         screen: 'Password',
//     },
//     {
//         id: 4,
//         title: 'Change City',
//         icon: <Entypo name='shuffle' size={22} color='#955F04' />,
//         screen: 'ChangeCity',
//     },
//     {
//         id: 5,
//         title: 'Vehicles',
//         icon: <Ionicons name='car-sport' size={24} color='#06DFEC' />,
//         screen: 'Vehicles',
//     },
//     {
//         id: 6,
//         title: 'Documents',
//         icon: (
//             <MaterialIcons
//                 name='insert-drive-file'
//                 size={24}
//                 color='#808080'
//             />
//         ),
//         screen: 'Documents',
//     },
//     {
//         id: 7,
//         title: 'Bank Account',
//         icon: <FontAwesome name='bank' size={22} color='#00B381' />,
//         screen: 'BankAccount',
//     },
//     {
//         id: 8,
//         title: 'Language',
//         icon: <FontAwesome5 name='globe' size={24} color='black' />,
//         screen: 'Language',
//     },
//     {
//         id: 9,
//         title: 'Settings',
//         icon: <Ionicons name='settings' size={24} color='#6F02B5' />,
//         screen: 'Settings',
//     },
//     {
//         id: 10,
//         title: 'Logout',
//         icon: (
//             <MaterialCommunityIcons
//                 name='logout'
//                 size={24}
//                 color='#844201'
//             />
//         ),
//         action: () => handleLogout(),
//     },
//     {
//         id: 11,
//         title: 'Delete my account',
//         description: 'Permanently delete account',
//         icon: <FontAwesome5 name='user-times' size={22} color='#FF0002' />,
//         action: () => confirmDelete(),
//     },
// ]
//     const deleteAccount = () => {
//         console.log('delete')

//         const body = new URLSearchParams({ action: 'del_user_acc' })

//         Post({ data: body })
//             .then((response) => {
//                 deleteAppSide()
//                 deleteSessionId()
//                 deletePassword()
//                 deletePhone()
//                 dispatch(setUser(null))
//                 // Ensure 'Splash' is correctly defined in your navigation stack
//                 navigation.navigate('Splash') // Ensure this is a valid route name
//             })
//             .catch((error) => console.log('Error deleting account', error))
//     }

//     const confirmDelete = () => {
//         Alert.alert(
//             'Confirm Deletion',
//             'Are you sure you want to delete your account?',
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 { text: 'OK', onPress: deleteAccount },
//             ],
//             { cancelable: false },
//         )
//     }
//     const renderProfileOption = ({ item }) => (
//         <View>
//             <TouchableOpacity
//                 style={styles.optionContainer}
//                 onPress={() => {
//                     if (
//                         item?.title === 'Logout' ||
//                         item.title === 'Delete my account'
//                     ) {
//                         item?.action()
//                     } else {
//                         navigation.navigate(item?.screen)
//                     }
//                 }}>
//                 <View style={styles.iconContainer}>{item?.icon}</View>
//                 <View style={styles.textContainer}>
//                     <Text
//                         style={[
//                             Style.fontSemiBold,
//                             Style.colorBlack,
//                             Style.label,
//                         ]}>
//                         {item.title}
//                     </Text>
//                     <Text
//                         style={[
//                             Style.fontMedium,
//                             Style.label14,
//                             Style.colorGray,
//                         ]}>
//                         {item.description}
//                     </Text>
//                 </View>
//                 <Ionicons name='chevron-forward' size={22} color='black' />
//             </TouchableOpacity>
//         </View>
//     )
//     const ListHeader = () => {
//         return (
//             <>
//                 <Spacing val={30} />
// <View style={[Style.alignCenter, Style.justifyCenter]}>
//     <Image
//         source={
//             user
//                 ? { uri: user?.photo }
//                 : require('../../assets/driver.png')
//         }
//         style={styles.image}
//     />
// </View>
//                 <Spacing val={20} />
//                 <Text
//                     style={[
//                         Style.fontBold,
//                         Style.labelButton,
//                         Style.colorBlack,
//                         Style.textCenter,
//                     ]}>
//                     {user ? `${user?.firstname} ${user?.lastname}` : ''}
//                 </Text>
//                 <Spacing val={10} />
//                 <Rating
//                     type='star'
//                     ratingCount={5}
//                     imageSize={25}
//                     onFinishRating={setRating}
//                     style={styles.rating}
//                 />
//                 <Spacing val={20} />

//                 <View
//                     style={[
//                         styles.ridesContainer,
//                         Style.flexRow,
//                         Style.selfAlignCenter,
//                     ]}>
//                     <View style={styles.completedContainer}>
//                         <FontAwesome
//                             name='check-circle'
//                             size={22}
//                             color='black'
//                         />
//                         <Text
//                             style={[
//                                 Style.fontBold,
//                                 Style.label14,
//                                 Style.colorBlack,
//                             ]}>
//                             {user ? user?.completed_rides : ''}
//                         </Text>
//                         <Text
//                             style={[
//                                 Style.fontBold,
//                                 Style.label14,
//                                 Style.colorBlack,
//                             ]}>
//                             Completed
//                         </Text>
//                     </View>
//                     <View style={styles.completedContainer}>
//                         <FontAwesome
//                             name='times-circle'
//                             size={22}
//                             color='black'
//                         />
//                         <Text
//                             style={[
//                                 Style.fontBold,
//                                 Style.label14,
//                                 Style.colorBlack,
//                             ]}>
//                             {user ? user?.cancelled_rides : ''}
//                         </Text>
//                         <Text
//                             style={[
//                                 Style.fontBold,
//                                 Style.label14,
//                                 Style.colorBlack,
//                             ]}>
//                             Cancelled
//                         </Text>
//                     </View>
//                     <View style={styles.completedContainer}>
//                         <FontAwesome5 name='users' size={22} color='black' />
//                         <Text
//                             style={[
//                                 Style.fontBold,
//                                 Style.label14,
//                                 Style.colorBlack,
//                             ]}>
//                             {user ? user?.referral_count : ''}
//                         </Text>
//                         <Text
//                             style={[
//                                 Style.fontBold,
//                                 Style.label14,
//                                 Style.colorBlack,
//                             ]}>
//                             Referrals
//                         </Text>
//                     </View>
//                 </View>
//                 <Spacing val={30} />
//             </>
//         )
//     }
//     const ListFooter = () => <Spacing val={40} />
//     const onBackPress = () => {
//         navigation.goBack()
//     }
//     return (
//         <View style={[Style.container, Style.hPaddingSixteen]}>
//             <Spacing val={Platform.OS === 'ios' && 35} />
//             <Header LeftIcon={true} onPressLeftIcon={onBackPress} />
//             <FlatList
//                 showsVerticalScrollIndicator={false}
//                 data={profileOptions}
//                 renderItem={renderProfileOption}
//                 keyExtractor={(item) => item.id.toString()}
//                 ListHeaderComponent={ListHeader}
//                 ListFooterComponent={ListFooter}
//             />
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     scrollContainer: {
//         paddingVertical: 20,
//         paddingHorizontal: 20,
//         alignItems: 'center',
//         backgroundColor: '#FFFFFF',
//     },
//     image: {
//         // marginTop: 50,
//         width: 100,
//         height: 100,
//         borderRadius: 55,
//         // marginBottom: 20,
//         // marginLeft: '35%',
//     },
//     imageContainer: {
//         marginTop: 40,
//         marginBottom: -15,
//         backgroundColor: 'red',
//     },
//     title: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         marginBottom: 20,
//         marginTop: -10,
//         textAlign: 'center',
//     },
//     ratingContainer: {
//         marginBottom: 10,
//     },
//     ridesContainer: {
//         flex: 1,
//     },
//     completedContainer: {
//         flexDirection: 'column',
//         alignItems: 'center',
//         borderWidth: 0.5,
//         borderColor: Color.lightGrey,
//         paddingHorizontal: 20,
//         paddingVertical: 15,
//         gap: 5,
//     },
//     cancelledContainer: {
//         flexDirection: 'column',
//         alignItems: 'center',
//         gap: 10,
//     },
//     referralsContainer: {
//         flexDirection: 'column',
//         alignItems: 'center',
//         gap: 10,
//     },
//     ridesText: {
//         fontWeight: '700',
//     },
//     divider: {
//         marginLeft: '10%',
//         marginTop: 20,
//         width: '80%',
//         height: 1,
//         backgroundColor: '#F4F4F4',
//     },
//     divider2: {
//         marginLeft: '20%',
//         width: '80%',
//         height: 1,
//         backgroundColor: '#F4F4F4',
//     },
//     optionContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 16,
//         paddingHorizontal: 10,
//         borderBottomWidth: 0.2,
//         borderBottomColor: Color.lightGrey,
//     },
//     iconContainer: {
//         marginRight: 50,
//         marginLeft: 10,
//     },
//     textContainer: {
//         flex: 1,
//     },
//     optionTitle: {
//         fontSize: 16,
//         fontWeight: '500',
//         marginTop: 10,
//         marginBottom: 4,
//         color: '#1B1B1B',
//     },
//     optionDescription: {
//         fontSize: 14,
//         color: 'gray',
//     },
// })

// export default Profile

import React, { useState } from 'react'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
} from 'react-native'
import { Rating } from 'react-native-ratings'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Entypo from 'react-native-vector-icons/Entypo'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import Color from '../../utils/Color'
import DeleteModal from '../../modals/DeleteModal'
import Header from '../../components/Header'
import { useNavigation } from '@react-navigation/native'
import {
    deleteAppSide,
    deletePassword,
    deletePhone,
    deleteSessionId,
    getPassword,
} from '../../utils/common'
import { getSessionId } from '../../utils/common'
import { RIDER_BASE_URL } from '../../utils/constants'
import { Post } from '../../network/network'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../../redux/userSlice'

const Profile = ({}) => {
    const [rating, setRating] = useState(0)
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
    const [sessionID, setSessionId] = useState('')
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user?.user)
    const handleLogout = async () => {
        try {
            const sess_id = await getSessionId()
            const logoutData = {
                action: 'userLogout',
            }

            Post({
                // endpoint: `${RIDER_BASE_URL}?sess_id=${sess_id}`,
                data: logoutData,
            })
                .then((response) => {
                    deleteAppSide()
                    deleteSessionId()
                    deletePassword()
                    deletePhone()
                    dispatch(setUser(null))

                    navigation.navigate('Splash')
                    Alert.alert(
                        'Logged out',
                        'You have been logged out successfully.',
                    )
                })
                .catch((error) => {
                    console.error('Error:', error)
                    Alert.alert('Error', 'An error occurred. Please try again.')
                })
        } catch (error) {
            console.error('Failed to log out:', error)
            Alert.alert('Error', 'An error occurred. Please try again.')
        }
    }

    const handleDeleteAccount = () => {
        console.log('Account deleted')
        navigation.navigate('Register')
    }

    // const profileOptions = [
    //     {
    //         id: 1,
    //         title: 'Edit Profile',
    //         icon: <FontAwesome5 name='user-alt' size={18} color='#0472FA' />,
    //         screen: 'EditProfile',
    //     },
    //     {
    //         id: 2,
    //         title: 'E-mail',
    //         description: user ? `${user?.email}` : '',
    //         icon: <MaterialIcons name='email' size={18} color='#00C600' />,
    //         screen: 'Email',
    //     },
    //     {
    //         id: 3,
    //         title: 'Password',
    //         icon: <Entypo name='key' size={18} color='#FF8900' />,
    //         screen: 'Password',
    //     },
    //     {
    //         id: 4,
    //         title: 'Documents',
    //         icon: (
    //             <MaterialIcons
    //                 name='insert-drive-file'
    //                 size={18}
    //                 color='#808080'
    //             />
    //         ),
    //         screen: 'Documents',
    //     },
    //     {
    //         id: 5,
    //         title: 'Language',
    //         icon: <FontAwesome5 name='globe' size={18} color='black' />,
    //         screen: 'Language',
    //     },
    //     {
    //         id: 6,
    //         title: 'Logout',
    //         icon: (
    //             <MaterialCommunityIcons
    //                 name='logout'
    //                 size={18}
    //                 color='#844201'
    //             />
    //         ),
    //         action: handleLogout,
    //     },
    //     {
    //         id: 7,
    //         title: 'Delete my account',
    //         description: 'Permanently delete account',
    //         icon: <FontAwesome5 name='user-times' size={18} color='#FF0002' />,
    //         action: () => setIsDeleteModalVisible(true),
    //     },
    // ]

    const profileOptions = [
        {
            id: 1,
            title: 'Edit Profile',
            icon: <FontAwesome5 name='user-alt' size={22} color='#0472FA' />,
            screen: 'DriverEditProfile',
        },
        {
            id: 2,
            title: 'E-mail',
            description: user ? `${user?.email}` : '',
            icon: <MaterialIcons name='email' size={24} color='#00C600' />,
            screen: 'Email',
        },
        {
            id: 3,
            title: 'Password',
            icon: <Entypo name='key' size={24} color='#FF8900' />,
            screen: 'Password',
        },
        {
            id: 4,
            title: 'Change City',
            icon: <Entypo name='shuffle' size={22} color='#955F04' />,
            screen: 'ChangeCity',
        },
        {
            id: 5,
            title: 'Vehicles',
            icon: <Ionicons name='car-sport' size={24} color='#06DFEC' />,
            screen: 'Vehicles',
        },
        {
            id: 6,
            title: 'Documents',
            icon: (
                <MaterialIcons
                    name='insert-drive-file'
                    size={24}
                    color='#808080'
                />
            ),
            screen: 'Documents',
        },
        {
            id: 7,
            title: 'Bank Account',
            icon: <FontAwesome name='bank' size={22} color='#00B381' />,
            screen: 'BankAccount',
        },
        {
            id: 8,
            title: 'Language',
            icon: <FontAwesome5 name='globe' size={24} color='black' />,
            screen: 'Language',
        },
        {
            id: 9,
            title: 'Settings',
            icon: <Ionicons name='settings' size={24} color='#6F02B5' />,
            screen: 'Settings',
        },
        {
            id: 10,
            title: 'Logout',
            icon: (
                <MaterialCommunityIcons
                    name='logout'
                    size={24}
                    color='#844201'
                />
            ),
            action: () => handleLogout(),
        },
        {
            id: 11,
            title: 'Delete my account',
            description: 'Permanently delete account',
            icon: <FontAwesome5 name='user-times' size={22} color='#FF0002' />,
            action: () => confirmDelete(),
        },
    ]

    const deleteAccount = async () => {
        console.log('delete')
        const password = await getPassword()
        const body = new URLSearchParams({
            action: 'del_user_acc',
            pwd: password,
        })

        Post({ data: body })
            .then((response) => {
                deleteAppSide()
                deleteSessionId()
                deletePassword()
                deletePhone()
                dispatch(setUser(null))
                // Ensure 'Splash' is correctly defined in your navigation stack
                navigation.navigate('Splash') // Ensure this is a valid route name
            })
            .catch((error) => console.log('Error deleting account', error))
    }

    const confirmDelete = () => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: deleteAccount },
            ],
            { cancelable: false },
        )
    }
    const renderProfileOption = ({ item }) => (
        <View>
            <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => {
                    if (item.action) {
                        item.action()
                    } else if (item.screen) {
                        navigation.navigate(item.screen)
                    }
                }}>
                <View style={styles.iconContainer}>{item.icon}</View>
                <View style={styles.textContainer}>
                    <Text
                        style={[
                            Style.fontMedium,
                            Style.colorGray1,
                            Style.label,
                        ]}>
                        {item.title}
                    </Text>
                    {item.description && (
                        <Text
                            style={[
                                Style.fontMedium,
                                Style.label14,
                                Style.colorGray,
                            ]}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <Ionicons name='chevron-forward' size={16} color='black' />
            </TouchableOpacity>
        </View>
    )

    const ListHeader = () => {
        return (
            <>
                {/* <Spacing val={50} /> */}
                <View style={[Style.alignCenter, Style.justifyCenter]}>
                    <Image
                        source={
                            user
                                ? { uri: user?.photo }
                                : require('../../assets/driver.png')
                        }
                        style={styles.image}
                    />
                </View>
                <Spacing val={20} />
                <Text
                    style={[
                        Style.fontBold,
                        Style.labelButton,
                        Style.colorBlack,
                        Style.textCenter,
                    ]}>
                    {user ? `${user?.firstname} ${user?.lastname}` : ''}
                </Text>
                <Spacing val={10} />
                <Rating
                    type='star'
                    ratingCount={5}
                    imageSize={20}
                    onFinishRating={setRating}
                    style={styles.rating}
                />
                <Spacing val={20} />

                <View
                    style={[
                        styles.ridesContainer,
                        Style.flexRow,
                        Style.selfAlignCenter,
                    ]}>
                    <View style={styles.completedContainer}>
                        <FontAwesome
                            name='check-circle'
                            size={18}
                            color='black'
                        />
                        <Text
                            style={[
                                Style.fontSemiBold,
                                Style.label14,
                                Style.colorBlack,
                            ]}>
                            {user ? user?.completed_rides : ''}
                        </Text>
                        <Text
                            style={[
                                Style.fontSemiBold,
                                Style.label14,
                                Style.colorBlack,
                            ]}>
                            Completed
                        </Text>
                    </View>
                    <View style={styles.completedContainer}>
                        <FontAwesome
                            name='times-circle'
                            size={18}
                            color='black'
                        />
                        <Text
                            style={[
                                Style.fontSemiBold,
                                Style.label14,
                                Style.colorBlack,
                            ]}>
                            {user ? user?.cancelled_rides : ''}
                        </Text>
                        <Text
                            style={[
                                Style.fontSemiBold,
                                Style.label14,
                                Style.colorBlack,
                            ]}>
                            Cancelled
                        </Text>
                    </View>
                    <View style={styles.completedContainer}>
                        <FontAwesome name='users' size={18} color='black' />
                        <Text
                            style={[
                                Style.fontSemiBold,
                                Style.label14,
                                Style.colorBlack,
                            ]}>
                            {user ? user?.referral_count : ''}
                        </Text>
                        <Text
                            style={[
                                Style.fontSemiBold,
                                Style.label14,
                                Style.colorBlack,
                            ]}>
                            Referrals
                        </Text>
                    </View>
                </View>
                <Spacing val={30} />
            </>
        )
    }
    const ListFooter = () => <Spacing val={40} />

    const onBackPress = () => {
        navigation.goBack()
    }
    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}
            <FlatList
                showsVerticalScrollIndicator={false}
                data={profileOptions}
                renderItem={renderProfileOption}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
            />
            <DeleteModal
                visible={isDeleteModalVisible}
                onClose={() => setIsDeleteModalVisible(false)}
                onDelete={deleteAccount}
            />
        </View>
    )
}

// const styles = StyleSheet.create({
//     scrollContainer: {
//         paddingVertical: 20,
//         paddingHorizontal: 20,
//         alignItems: 'center',
//         backgroundColor: '#FFFFFF',
//     },
//     image: {
//         width: 130,
//         height: 130,
//         borderRadius: 65,
//     },
//     ridesContainer: {
//         flex: 1,
//     },
//     completedContainer: {
//         flexDirection: 'column',
//         alignItems: 'center',
//         borderWidth: 0.5,

//         borderColor: '#e0e0e0',
//         paddingHorizontal: 26,
//         paddingVertical: 8,
//         gap: 16,
//     },
//     optionContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 16,
//         paddingHorizontal: 10,
//         borderBottomWidth: 0.2,
//         borderBottomColor: Color.lightGrey,
//     },
//     iconContainer: {
//         marginRight: 50,
//         marginLeft: 10,
//     },
//     textContainer: {
//         flex: 1,
//     },
// })

const styles = StyleSheet.create({
    scrollContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    image: {
        // marginTop: 50,
        width: 100,
        height: 100,
        borderRadius: 55,
        // marginBottom: 20,
        // marginLeft: '35%',
    },
    imageContainer: {
        marginTop: 40,
        marginBottom: -15,
        backgroundColor: 'red',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: -10,
        textAlign: 'center',
    },
    ratingContainer: {
        marginBottom: 10,
    },
    ridesContainer: {
        flex: 1,
    },
    completedContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: Color.lightGrey,
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 5,
    },
    cancelledContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
    },
    referralsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
    },
    ridesText: {
        fontWeight: '700',
    },
    divider: {
        marginLeft: '10%',
        marginTop: 20,
        width: '80%',
        height: 1,
        backgroundColor: '#F4F4F4',
    },
    divider2: {
        marginLeft: '20%',
        width: '80%',
        height: 1,
        backgroundColor: '#F4F4F4',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderBottomWidth: 0.2,
        borderBottomColor: Color.lightGrey,
    },
    iconContainer: {
        marginRight: 50,
        marginLeft: 10,
    },
    textContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 10,
        marginBottom: 4,
        color: '#1B1B1B',
    },
    optionDescription: {
        fontSize: 14,
        color: 'gray',
    },
})

export default Profile
