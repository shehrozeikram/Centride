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
import Geocoding from 'react-native-geocoding'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import DriverDropoffModal from './DriverDropoffModal'
import database from '@react-native-firebase/database'
import { useSelector } from 'react-redux'
import { getSessionId } from '../utils/common'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Initialize Geocoding API with your key
Geocoding.init('AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw')

const DriverPickupModal = ({
    visible,
    onClose,
    notification,
    pickupAddress,
}) => {
    const [dropoffModalVisible, setDropoffModalVisible] = useState(false)
    const [dropoffAddress, setDropoffAddress] = useState('')
    const user = useSelector((state) => state.user?.user)
    console.log('notification PickupModal', notification)
    console.log('=====pickupAddress======', pickupAddress)

    // Convert dropoff coordinates to an address
    useEffect(() => {
        if (notification?.dropoff_lat && notification?.dropoff_long) {
            fetchDropoffAddress(
                notification?.dropoff_lat,
                notification?.dropoff_long,
            )
        }
    }, [notification])

    const fetchDropoffAddress = async (latitude, longitude) => {
        try {
            const json = await Geocoding.from(latitude, longitude)
            if (json.results.length > 0) {
                setDropoffAddress(json.results[0].formatted_address)
            } else {
                setDropoffAddress('Address not found')
            }
        } catch (error) {
            console.error('Error fetching drop-off address:', error)
            setDropoffAddress('Error fetching address')
        }
    }

    const getCurrentUnixTimestamp = () => {
        return Math.floor(Date.now() / 1000) // Current timestamp in seconds
    }

    const pickUpSave = async () => {
        const currentTimestamp = getCurrentUnixTimestamp()
        console.log('currentTimestamp', currentTimestamp)
        const msgData = {
            action: 'customer-onride',
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
            driver_platenum: user?.car_plate_num,
            driver_rating: user?.driver_rating,
            pickup_lat: notification?.pickup_lat,
            pickup_long: notification?.pickup_long,
            dropoff_lat: notification?.dropoff_lat,
            dropoff_long: notification?.dropoff_long,
            driver_location_lat: notification?.driver_location_lat,
            driver_location_long: notification?.driver_location_long,
        }
        try {
            const userId = notification?.rider_id
            await database().ref(`/Riders/ridr-${userId}/notf/msg`).set(msgData)
            await database()
                .ref(`/Riders/ridr-${userId}/notf/msg_t`)
                .set(currentTimestamp)

            console.log(
                'Data saved successfully from driver pickup modal',
                msgData,
            )
        } catch (error) {
            console.error('Error saving data for driverId:', error)
        }
    }

    const handlePickUp = async () => {
        const sessId = getSessionId()
        const url = `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sessId}`

        // Request body data as x-www-form-urlencoded
        const body = new URLSearchParams({
            action_get: 'startride',
            bookingid: notification?.booking_id,
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
                console.log('res===', res.ok)
                pickUpSave()
                setDropoffModalVisible(true)
            } else {
                console.log('Request failed with status: ', res.status)
            }
        } catch (err) {
            console.log('Error: ', err.message)
        }
    }

    // const handlePickUp = async () => {
    //     setDropoffModalVisible(true)
    //     pickUpSave()
    // }

    // Conditionally show the modal
    if (dropoffModalVisible) {
        return (
            <DriverDropoffModal
                visible={dropoffModalVisible}
                notification={notification}
                pickupAddress={pickupAddress}
            />
        )
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType='slide'>
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
                                                  }
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
                                        numberOfLines={2}>
                                        {pickupAddress ||
                                            'Pickup Address not available'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                        </View>

                        {/* Section 3 - Dropoff Info */}
                        <View style={styles.section}>
                            <View style={styles.column}>
                                <View style={styles.pickupInfo}>
                                    <Image
                                        source={require('../assets/drop-off.png')}
                                        style={styles.pickupImage}
                                    />
                                    <Text
                                        style={styles.pickupAddressText}
                                        numberOfLines={2}>
                                        {dropoffAddress ||
                                            'Loading drop-off address...'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                        </View>

                        {/* Button Section - "Pick Up" Button */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.pickupButton}
                                onPress={handlePickUp}>
                                <Text style={styles.pickupText}>Pick Up</Text>
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
    driverName: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
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
        fontSize: 12,
        flex: 1,
        overflow: 'hidden',
        flexWrap: 'wrap',
    },
    pickupAddressText: {
        fontSize: 12,
        flex: 1,
        overflow: 'hidden',
        flexWrap: 'wrap',
        color: 'black',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    pickupButton: {
        backgroundColor: 'green',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 40,
        alignItems: 'center',
        justifyContent: 'center',
        width: screenWidth * 0.85,
    },
    pickupText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '400',
    },
})

export default DriverPickupModal
