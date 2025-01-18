import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Image,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Geocoding from 'react-native-geocoding'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import database from '@react-native-firebase/database'
import { useSelector } from 'react-redux'
import { getSessionId } from '../utils/common'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

Geocoding.init('AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw')

const DriverDropoffModal = ({
    visible,
    onClose,
    notification,
    pickupAddress,
}) => {
    const navigation = useNavigation()
    const user = useSelector((state) => state.user?.user)

    // console.log('looser', user)

    const handleDropOff = async () => {
        const currentTimestamp = getCurrentUnixTimestamp()
        console.log('notification=drop', notification)
        const sessId = getSessionId()
        const url = `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sessId}`

        // Request body data as x-www-form-urlencoded
        const body = new URLSearchParams({
            action_get: 'drivercompleted',
            bookingid: notification?.booking_id,
            complete_code: '3744',
            ride_distance: 0,
            ride_duration_secs: 24,
            ride_duration_secs_formated: 24,
            ride_fare: 16559,
            city_currency_symbol: 'Rs',
            city_currency_exchng: 1.0,
            city_currency_code: '',
            amount_paid_by_rider: 16559,
            coupon_code: '',
            coupon_discount_type: 0,
            coupon_discount_value: 0.0,
            referral_used: 0,
            referral_discount_value: 0.0,
        })

        try {
            // saveDataAcceptRide()
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Connection: 'keep-alive',
                },
                body: body.toString(),
            })

            if (res.ok) {
                console.log('res===drop', res.ok)
                const msgData = await dropOffSave()
                if (msgData) {
                    onClose && onClose()
                    navigation.navigate('DriverRideCompleted', { msgData })
                } else {
                    console.error('Error during drop-off save.')
                }
            } else {
                console.log('Request failed with status: ', res.status)
            }
        } catch (err) {
            console.log('Error: ', err.message)
        }
    }

    const getCurrentUnixTimestamp = () => {
        return Math.floor(Date.now() / 1000) // Current timestamp in seconds
    }

    const dropOffSave = async () => {
        const currentTimestamp = getCurrentUnixTimestamp()
        const msgData = {
            action: 'driver-complete',
            // bid_fare: notification?.ride_bid_fare,
            // booking_id: notification?.booking_id,
            // driver_carmodel: user?.car_model,
            // driver_image: user
            //     ? { uri: user?.photo }
            //     : require('../assets/driver.png'),
            // driver_carcolor: user?.car_color,
            // driver_completed_rides: user?.completed_rides,
            // driver_phone: user?.phone,
            // driver_photo: notification?.driver_photo,
            // driver_platenum: user?.car_plate_num,
            // driver_rating: user?.driver_rating,
            // pickup_addr: notification?.pickup_addr,
            // pickup_lat: notification?.p_lat,
            // pickup_long: notification?.p_lng,
            // time_notified: getCurrentUnixTimestamp(),
            // ttl: 30,
            // dropoff_lat: notification?.d_lat,
            // dropoff_long: notification?.d_lng,

            bid_fare: notification?.ride_bid_fare,
            booking_id: notification?.booking_id,
            driver_carid: user?.driver_ride_id,
            driver_carmodel: user?.car_model,
            driver_image: user
                ? { uri: user?.photo }
                : require('../assets/driver.png'),
            driver_carcolor: user?.car_color,
            driver_completed_rides: user?.completed_rides,
            driver_id: user?.driverid,
            driver_firstname: user?.firstname,
            driver_lastname: user?.lastname,
            driver_rating: user?.rating,
            driver_platenum: user?.car_plate_num,
            driver_rating: user?.driver_rating,
            pickup_lat: notification?.pickup_lat,
            pickup_long: notification?.pickup_long,
            dropoff_lat: notification?.dropoff_lat,
            dropoff_long: notification?.dropoff_long,
            driver_location_lat: notification?.driver_location_lat,
            driver_location_long: notification?.driver_location_long,

            rider_image: notification?.rider_image,
            rider_name: notification?.rider_name,
            rider_rating: notification?.rider_rating,
        }

        try {
            const userId = notification?.rider_id
            await database().ref(`/Riders/ridr-${userId}/notf/msg`).set(msgData)
            await database()
                .ref(`/Riders/ridr-${userId}/notf/msg_t`)
                .set(currentTimestamp)

            console.log(
                'Data saved successfully from driver dropoff',
                userId,
                msgData,
            )

            // Return the msgData after saving
            return msgData
        } catch (error) {
            console.error('Error saving data for driverId:', error)
            return null
        }
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType='slide'>
            {/* Conditionally apply the background color */}
            <View
                style={[
                    styles.modalContainer,
                    visible && styles.transparentBackground,
                ]}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {/* Section 1 - Driver Image + Timer */}
                        <View style={styles.section}>
                            <View style={styles.row}>
                                <View style={styles.profileAndRating}>
                                    <Image
                                        source={
                                            notification?.rider_image?.uri
                                                ? {
                                                      uri: notification
                                                          ?.rider_image?.uri,
                                                  } // Use the provided URI if it exists
                                                : require('../assets/driver.png')
                                        }
                                        style={styles.profileImage}
                                    />
                                    <Text style={styles.driverName}>
                                        {notification?.rider_name ||
                                            'Unknown Rider'}
                                    </Text>
                                </View>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeText}>0</Text>
                                    <Text style={styles.timeText}>Mins</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                        </View>

                        {/* Section 2 - Pickup Info */}
                        <View style={styles.section}>
                            <View style={styles.column}>
                                <View style={styles.pickupInfo}>
                                    <Image
                                        source={require('../assets/pick-up2.png')}
                                        style={styles.pickupImage}
                                    />
                                    <Text
                                        style={styles.pickupAddressText}
                                        numberOfLines={2} // Allows the address to break into two lines if it's too long
                                    >
                                        {pickupAddress}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                        </View>

                        {/* Button Section - "I've Arrived" Button */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.pickupButton}
                                onPress={handleDropOff}>
                                <Text style={styles.pickupText}>Drop Off</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Default black transparent background
    },
    // This will override the background color when the modal is visible
    transparentBackground: {
        backgroundColor: 'transparent', // Remove the black transparent shade
    },
    modalContent: {
        width: screenWidth, // Keep full width
        maxHeight: screenHeight * 0.55, // Reduced height
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    scrollContainer: {
        paddingVertical: 10,
    },
    section: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    column: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    timeContainer: {
        backgroundColor: '#000',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        color: '#fff',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 6,
    },
    profileAndRating: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    ratingText: {
        fontSize: 14,
        color: '#000',
        marginRight: 5,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 10,
    },
    driverDetailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    driverDetails: {
        alignItems: 'center',
    },
    // driverName: {
    //     fontSize: 14,
    //     fontWeight: 'bold',
    // },
    driverName: {
        marginLeft: 10, // Add some space between the image and the name
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    driverTrips: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    driverId: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    vehicleInfo: {
        alignItems: 'center',
        marginRight: 20,
    },
    vehicleImage: {
        width: 80,
        height: 60,
    },
    vehicleText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    vehicleYear: {
        fontSize: 10,
        color: '#888',
    },
    pickupInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    pickupImage: {
        width: 25,
        height: 25,
        marginRight: 6,
    },
    pickupText: {
        fontSize: 12, // Adjusted font size for better readability
        flex: 1,
        overflow: 'hidden',
        flexWrap: 'wrap', // Allows text to wrap within the container
    },
    pickupAddressText: {
        fontSize: 12,
        flex: 1,
        overflow: 'hidden',
        flexWrap: 'wrap',
        color: 'black',
    },
    buttonContainer: {
        justifyContent: 'center', // Center the button vertically
        alignItems: 'center', // Center the button horizontally
        marginTop: 15, // Add some space above the button
    },
    pickupButton: {
        backgroundColor: 'orange',
        borderRadius: 30,
        paddingVertical: 10, // Increased padding for more height
        paddingHorizontal: 40, // Increased padding for larger width
        alignItems: 'center',
        justifyContent: 'center',
        width: screenWidth * 0.85, // Increased width to 75% of screen width
    },
    pickupText: {
        color: '#fff',
        fontSize: 14, // Increased font size for better readability
        fontWeight: '400',
    },
})

export default DriverDropoffModal
