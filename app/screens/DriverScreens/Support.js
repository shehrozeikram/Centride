// import { useNavigation } from '@react-navigation/native'
// import React from 'react'
// import {
//     View,
//     Text,
//     FlatList,
//     TouchableOpacity,
//     StyleSheet,
// } from 'react-native'
// import Icon from 'react-native-vector-icons/FontAwesome'

// const Support = () => {
//     const navigation = useNavigation()
//     const helpItems = [
//         {
//             id: '1',
//             title: 'Help Guide',
//             description: 'Find detailed guides to help you use the app.',
//             icon: 'book',
//             color: '#F07FC7',
//             screen: 'HelpGuide',
//         },
//         {
//             id: '2',
//             title: 'Customer Service Chat',
//             description: 'Chat with our support team for assistance.',
//             icon: 'comments',
//             color: '#FFAA00',
//             screen: 'CustomerServiceChat',
//         },
//     ]

//     const learnMoreItems = [
//         {
//             id: '3',
//             title: 'Terms and Privacy Policy',
//             description: 'Review our terms and privacy policies.',
//             icon: 'file-text',
//             color: '#654313',
//             screen: 'PrivacyPolicy',
//         },
//         {
//             id: '4',
//             title: 'Drive with Us',
//             description: 'Join our team of drivers and earn with us.',
//             icon: 'car',
//             color: '#C1BD03',
//             screen: 'DriveWithUs',
//         },
//         {
//             id: '5',
//             title: 'Rate App',
//             description: 'Give us feedback on your experience.',
//             icon: 'star',
//             color: '#EEBD5F',
//             screen: 'RateApp',
//         },
//         {
//             id: '6',
//             title: 'Software Licenses',
//             description: 'View the software licenses we use.',
//             icon: 'code',
//             color: '#AE00C4',
//             screen: 'SoftwareLicenses',
//         },
//         {
//             id: '7',
//             title: 'About TxyCo',
//             description: 'Learn more about our company and mission.',
//             icon: 'info-circle',
//             color: '#3EA5F5',
//             screen: 'AboutTxyCo',
//         },
//     ]

//     const handlePress = (screen) => {
//         navigation.navigate(screen)
//     }

//     const renderItem = ({ item }) => (
//         <TouchableOpacity
//             style={styles.item}
//             onPress={() => handlePress(item.screen)}
//         >
//             <Icon
//                 name={item.icon}
//                 color={item.color}
//                 size={24}
//                 style={styles.itemIcon}
//             />
//             <View style={styles.textContainer}>
//                 <Text style={styles.itemTitle}>{item.title}</Text>
//                 <Text style={styles.itemDescription}>{item.description}</Text>
//             </View>
//             <Icon name='chevron-right' size={20} style={styles.arrowIcon} />
//         </TouchableOpacity>
//     )

//     return (
//         <View style={styles.container}>
//             <Text style={styles.heading}>How can we help?</Text>
//             <FlatList
//                 data={helpItems}
//                 renderItem={renderItem}
//                 keyExtractor={(item) => item.id}
//                 style={styles.list}
//             />

//             <Text style={[styles.heading, styles.secondHeading]}>
//                 Learn more about us
//             </Text>
//             <FlatList
//                 data={learnMoreItems}
//                 renderItem={renderItem}
//                 keyExtractor={(item) => item.id}
//                 style={styles.list}
//             />
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//         backgroundColor: '#fff',
//         marginTop: 90,
//     },
//     heading: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#333',
//         marginVertical: 28,
//     },
//     secondHeading: {
//         marginTop: '-18%',
//     },
//     list: {
//         marginBottom: 16,
//     },
//     item: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
//     },
//     itemIcon: {
//         marginRight: 35,
//     },
//     textContainer: {
//         flex: 1,
//     },
//     itemTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#333',
//     },
//     itemDescription: {
//         fontSize: 14,
//         color: '#777',
//         marginTop: 4,
//     },
//     arrowIcon: {
//         color: '#ccc',
//     },
// })

// export default Support

import React from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Spacing from '../../components/Spacing'
import Style from '../../utils/Styles'
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'

const Support = ({ navigation }) => {
    const helpItems = [
        {
            id: '1',
            title: 'Help Guide',
            description: 'Find detailed guides to help you use the app.',
            icon: 'book',
            color: '#F07FC7',
            screen: 'HelpGuide',
        },
        {
            id: '2',
            title: 'Customer Service Chat',
            description: 'Chat with our support team for assistance.',
            icon: 'comments',
            color: '#FFAA00',
            screen: 'CustomerServiceChat',
        },
    ]

    const learnMoreItems = [
        {
            id: '3',
            title: 'Terms and Privacy Policy',
            description: 'Review our terms and privacy policies.',
            icon: 'legal',
            color: '#654313',
            screen: 'PrivacyPolicy',
        },
        {
            id: '4',
            title: 'Drive with Us',
            description: 'Join our team of drivers and earn with us.',
            icon: 'car',
            color: '#C1BD03',
            screen: 'DriveWithUs',
        },
        {
            id: '5',
            title: 'Rate App',
            description: 'Give us feedback on your experience.',
            icon: 'star',
            color: '#EEBD5F',
            screen: 'RateApp',
        },
        {
            id: '6',
            title: 'Software Licenses',
            description: 'View the software licenses we use.',
            icon: 'gavel',
            color: '#AE00C4',
            screen: 'SoftwareLicenses',
        },
        {
            id: '7',
            title: 'About Centride',
            description: 'Learn more about our company and mission.',
            icon: 'info-circle',
            color: '#3EA5F5',
            screen: 'AboutTxyCo',
        },
    ]

    const handlePress = (screen) => {
        navigation.navigate(screen)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(item.screen)}>
            <Icon
                name={item.icon}
                color={item.color}
                size={16}
                style={styles.itemIcon}
            />
            <View style={styles.textContainer}>
                <Text style={[Style.colorBlack, Style.label]}>
                    {item.title}
                </Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            <Icon name='chevron-right' size={14} style={Style.colorBlack} />
        </TouchableOpacity>
    )

    const onBackPress = () => {
        navigation.goBack()
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            {/* <Spacing val={Platform.OS === 'ios' && 35} /> */}
            <Spacing val={35} />

            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                How can we help?
            </Text>
            <Spacing val={20} />
            <View>
                <FlatList
                    data={helpItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            </View>
            <Spacing val={36} />
            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                Learn more about us
            </Text>
            <Spacing val={20} />
            <View>
                <FlatList
                    data={learnMoreItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 90,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 28,
    },
    secondHeading: {
        marginTop: '-18%',
    },
    list: {
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    itemIcon: {
        marginRight: 35,
    },
    textContainer: {
        flex: 1,
    },
    itemDescription: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
})

export default Support
