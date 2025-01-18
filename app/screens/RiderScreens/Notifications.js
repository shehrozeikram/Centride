// src/screens/NotificationScreen.js
import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Header from '../../components/Header'
import { useNavigation } from '@react-navigation/native'
import Style from '../../utils/Styles'
import { PostData } from '../../network/network'
import HTMLParser from 'react-native-html-parser'

const Notifications = () => {
    const [notifications, setNotifications] = useState([])

    const removeNotification = (id) => {
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notification) => notification.id !== id),
        )
    }

    const navigation = useNavigation()

    const onBackPress = () => {
        navigation.goBack()
    }

    useEffect(() => {
        getNotifications()
    }, [])

    const getNotifications = () => {
        const body = new URLSearchParams({
            action: 'getusernotifications',
        }).toString()

        PostData({ data: body })
            .then((res) => {
                const htmlString = res.notifications // Get the HTML content from the API response

                // Use HTMLParser to parse the HTML string
                const parsedHTML = new HTMLParser.DOMParser().parseFromString(
                    htmlString,
                    'text/html',
                )

                const notifications = []
                const listItems =
                    parsedHTML.getElementsByTagName('ons-list-item')

                // Loop through each ons-list-item element and extract data
                for (let i = 0; i < listItems.length; i++) {
                    const listItem = listItems[i]
                    const timeElement =
                        listItem.getElementsByClassName('list-item__title')[0]
                    const messageElement = listItem.getElementsByClassName(
                        'list-item__subtitle',
                    )[0]

                    const notification = {
                        id: `${i}`, // Ensure a unique id
                        time: timeElement.textContent.trim(),
                        message: messageElement.textContent.trim(),
                    }
                    notifications.push(notification)
                }

                setNotifications(notifications)

                console.log(
                    '===========Extracted Notifications:=======',
                    notifications,
                )
            })
            .catch((error) => {
                console.log('error', error)
            })
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id} // Ensure unique key prop
                renderItem={({ item }) => (
                    <View style={styles.notificationCard}>
                        <Icon
                            name='bell'
                            size={30}
                            color='#4CAF50'
                            style={styles.icon}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>
                                {item?.message}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => removeNotification(item.id)}>
                            <Icon
                                name='close-circle'
                                size={24}
                                color='red'
                                style={styles.closeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
        marginTop: '20%',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        alignItems: 'center',
    },
    icon: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        color: '#757575',
    },
    closeIcon: {
        marginLeft: 15,
    },
})

export default Notifications
