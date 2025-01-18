import React, { useEffect, useState } from 'react'
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Alert,
    TouchableOpacity,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import Style from '../../utils/Styles'
import { getAppSide } from '../../utils/common'
import { Post } from '../../network/network'
import { useNavigation } from '@react-navigation/native'

import { useTranslation } from 'react-i18next'

const RideItem = ({ item }) => {
    const navigation = useNavigation()
    console.log('cancelled item', item)
    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('TripsDetailScreen', { item })}
            style={styles.itemContainer}>
            <Text style={styles.dateText}>
                {/* {`${item?.date} (${item?.day}, ${item?.year})`} */}
                {`${item?.pickUpTime})`}
            </Text>
            <Text style={styles.timeText}>{item?.time}</Text>
            <View style={styles.placeContainer}>
                <FontAwesome name='location-arrow' size={16} color='#4CAF50' />
                <Text
                    style={styles.placeText}
                    numberOfLines={1}
                    ellipsizeMode='tail'>
                    {item?.pickUpLocation}
                </Text>
            </View>
            <View style={styles.placeContainer}>
                <FontAwesome6 name='location-dot' size={16} color='#F44336' />
                <Text
                    style={styles.placeText}
                    numberOfLines={1}
                    ellipsizeMode='tail'>
                    {item?.dropOffLocation}
                </Text>
            </View>
            <View style={styles.statusContainer}>
                <Text style={[styles.statusText, Style.colorWhite]}>
                    {'Cancelled'}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const Cancelled = ({ data }) => {
    const { t, i18n } = useTranslation()
    const navigation = useNavigation()
    const [rideData, setRideData] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        getCancelledTrips()
    }, [])

    getCancelledTrips = async () => {
        const body = {
            action: 'getbookings',
        }

        Post({
            data: body,
        })
            .then((response) => {
                setRideData(response)
                console.log('Response', response)
            })
            .catch((error) => {
                setError(response.error)
                console.log('Error', error)
            })
    }

    return (
        <View style={[Style.customComponent]}>
            {error ? (
                <Text style={styles.errorText}>{error}</Text> // Display error message
            ) : (
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        <RideItem item={item} navigation={navigation} />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text>{t('no_booking_records')}</Text>}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginTop: 50,
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2.62,
        elevation: 4,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 14,
        color: '#555',
    },
    placeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10, // Add gap between the start and end place
    },
    placeText: {
        fontSize: 18, // Increase text size for places
        color: '#333',
        marginLeft: 8, // Space between icon and text
        flex: 1, // Allow the text to take the available space
    },
    bookingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#333',
    },
    priceText: {
        marginTop: 5,
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
    statusContainer: {
        marginTop: 10,
        padding: 5,
        borderRadius: 5,
        backgroundColor: 'red',
        alignSelf: 'flex-start',
    },
    statusText: {
        fontWeight: 'bold',
    },
})

export default Cancelled
