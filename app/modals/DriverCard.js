import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { getSessionId } from '../utils/common'
import { DRIVER_BASE_URL, RIDER_BASE_URL } from '../utils/constants'
import database from '@react-native-firebase/database'
import { useSelector } from 'react-redux'

const DriverCard = ({ item, onClose, onReject, clearData }) => {
    const user = useSelector((state) => state.user?.user)
    const [rideRequestData, setRideRequestData] = useState(null)
    const [showDriverOnWay, setShowDriverOnWay] = useState(false)
    const [loading, setLoading] = useState(false)

    const getCurrentUnixTimestamp = () => {
        return Math.floor(Date.now() / 1000) // Current timestamp in seconds
    }

    const saveAccepBid = async () => {
        const currentTimestamp = getCurrentUnixTimestamp()

        const msgData = {
            action: 'accept-driver-bid-notify',
            bid_fare: item?.bid_fare,
            booking_id: item?.booking_id,
            driver_carid: item?.driver_ride_id,
            driver_carmodel: item?.driver_carmodel,
            driver_firstname: item.driver_firstname,
            driver_image: item.driver_image,
            driver_carcolor: item?.driver_carcolor,
            driver_completed_rides: item?.driver_completed_rides,
            driver_id: item?.driver_id,
            driver_location_lat: item?.driver_location_lat,
            driver_location_long: item?.driver_location_long,
            driver_phone: item?.driver_phone,
            driver_photo: item?.driver_photo,
            driver_platenum: item?.driver_platenum,
            driver_rating: item?.driver_rating,
            pickup_addr: item?.pickup_addr,
            pickup_lat: item?.pickup_lat,
            pickup_long: item?.pickup_long,
            time_notified: getCurrentUnixTimestamp(),
            ttl: 30,
            dropoff_lat: item?.dropoff_lat,
            dropoff_long: item?.dropoff_long,

            ride_bid_max_val: '20.0',
            ride_bid_min_val: '10.0',
            ride_bid_fare: '179.0',
            rider_image: user
                ? { uri: user?.photo }
                : require('../assets/driver.png'),
            rider_name: user?.firstname,
            rider_phone: user?.phone,
            rider_id: user?.userid,
            rider_rating: user?.user_rating,
            sent_time: getCurrentUnixTimestamp(),
            distance: item?.distance,
            time_to_pickup: item?.time_to_pickup,
        }

        try {
            const userId = user.userid
            const driverId = item?.driver_id
            console.log('===userId in rider of driver Assigned===', driverId)

            await database().ref(`/Riders/ridr-${userId}/notf/msg`).set(msgData)
            await database()
                .ref(`/Riders/ridr-${userId}/notf/msg_t`)
                .set(currentTimestamp)

            await database()
                .ref(`/Drivers/drvr-${driverId}/notf/msg`)
                .set(msgData)
            await database()
                .ref(`/Drivers/drvr-${driverId}/notf/msg_t`)
                .set(currentTimestamp)

            setRideRequestData(item)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error('Error saving data for riderId:', error)
        }
    }

    const acceptBid = async () => {
        const sessId = getSessionId()
        const url = `${DRIVER_BASE_URL}?sess_id=${sessId}`

        const body = new URLSearchParams({
            action: 'acceptbid',
            bookingid: item?.booking_id,
            bid_fare: item?.bid_fare,
            driver_id: item?.driver_id,
        })

        try {
            setLoading(true)
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            })
            if (res.ok) {
                onClose()
                saveAccepBid()
                clearData && clearData()
            } else {
                setLoading(false)
            }
        } catch (err) {
            setLoading(false)
        }
    }

    return (
        <View style={styles.card} pointerEvents={loading ? 'none' : 'auto'}>
            <View style={styles.row}>
                {/* Profile and Rating Section */}
                <View style={styles.profileAndRating}>
                    <Image
                        source={
                            item.driver_image && item.driver_image.uri
                                ? { uri: item.driver_image.uri }
                                : require('../assets/driver.png')
                        }
                        style={styles.profileImage}
                    />
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingText}>{item.rating}</Text>
                        <FontAwesome name='star' size={16} color='#FFD700' />
                    </View>

                    <Text style={styles.driverName}>
                        {item.driver_firstname}
                    </Text>
                </View>

                {/* Hygiene Points Section */}
                <View style={styles.hygieneSection}>
                    <Ionicons name='flash' size={18} color='green' />
                    <Text style={styles.hygieneText}>Hygiene Points: 5</Text>
                </View>

                {/* Rs Section */}
                <View style={styles.rsSection}>
                    <Text style={styles.rsText}>Rs {item.bid_fare}</Text>
                </View>
            </View>

            {/* Time, Hygiene Points and Distance Section */}
            <View style={styles.timeDistanceContainer}>
                <View style={styles.row}>
                    {/* Time Section */}
                    <View style={styles.timeContainer}>
                        <Ionicons name='time' size={16} color='orange' />
                        <Text style={styles.timeText}>
                            {item.time_to_pickup} mins
                        </Text>
                    </View>

                    {/* Hygiene Points Section */}
                    {/* <View style={styles.hygieneSection}>
                        <Ionicons name='ios-flash' size={18} color='green' />
                        <Text style={styles.hygieneText}>
                            Hygiene Points: 5
                        </Text>
                    </View> */}

                    {/* Distance Section */}
                    <View style={styles.distanceContainer}>
                        <Ionicons name='navigate' size={16} color='skyblue' />
                        <Text style={styles.distanceText}>
                            {item.distance} km
                        </Text>
                    </View>
                </View>
            </View>

            {/* Accept and Reject Buttons */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    onPress={() => {
                        onReject(item)
                    }}
                    style={[styles.button, styles.rejectButton]}>
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => {
                        acceptBid()
                    }}>
                    {loading ? (
                        <ActivityIndicator size={'small'} color={'white'} />
                    ) : (
                        <Text style={styles.buttonText}>Accept</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        height: 240, // Adjusted height for the new layout
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileAndRating: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    ratingText: {
        fontSize: 14,
        color: '#000',
        marginRight: 3,
    },
    driverName: {
        fontSize: 12,
        color: '#000',
        fontWeight: 'bold',
        marginTop: 3,
    },
    rsSection: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    rsText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    timeDistanceContainer: {
        marginTop: 6,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#000',
    },
    hygieneSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    hygieneText: {
        fontWeight: '500',
        fontSize: 14,
        color: '#000',
        marginLeft: 5,
        // backgroundColor: 'lightgrey',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    distanceText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#000',
    },
    buttonsContainer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        width: '48%', // Ensures both buttons are aligned side by side with equal width
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default DriverCard
