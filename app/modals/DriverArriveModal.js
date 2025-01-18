import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native'
import Geocoding from 'react-native-geocoding'
import database from '@react-native-firebase/database'
import { useSelector } from 'react-redux'
import DriverPickupModal from './DriverPicupModal'
import { getSessionId } from '../utils/common'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Initialize Geocoding API with your key
Geocoding.init('AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw')

const DriverArriveModal = ({ notification }) => {
    const [pickupAddress, setPickupAddress] = useState('')
    const [pickupModalVisible, setPickupModalVisible] = useState(false)
    const user = useSelector((state) => state.user?.user)

    const getAddressFromCoordinates = async (latitude, longitude) => {
        try {
            const json = await Geocoding.from(latitude, longitude)
            if (json.results.length > 0) {
                setPickupAddress(json.results[0].formatted_address)
            } else {
                setPickupAddress('Address not found')
            }
        } catch (error) {
            console.error('Error fetching address:', error)
            setPickupAddress('Error fetching address')
        }
    }

    useEffect(() => {
        if (notification?.pickup_lat && notification?.pickup_long) {
            getAddressFromCoordinates(
                notification?.pickup_lat,
                notification?.pickup_long,
            )
        }
    }, [notification])

    const getCurrentUnixTimestamp = () => {
        return Math.floor(Date.now() / 1000) // Current timestamp in seconds
    }

    const driverArriveSave = async () => {
        const currentTimestamp = getCurrentUnixTimestamp()
        const msgData = {
            action: 'driver-arrived',
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
                'Data saved successfully from driver arrival modal',
                userId,
            )
        } catch (error) {
            console.error('Error saving data for driverId:', error)
        }
    }

    const handleDriverArrive = async () => {
        const sessId = getSessionId()
        const url = `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sessId}`

        // Request body data as x-www-form-urlencoded
        const body = new URLSearchParams({
            action_get: 'driverarrived',
            bookingid: notification?.booking_id,
        })

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Connection: 'keep-alive',
                },
                body: body.toString(),
            })

            if (res.ok) {
                console.log('res=', res.ok)
                driverArriveSave()
                setPickupModalVisible(true)
            } else {
                console.log('Request failed with status: ', res.status)
            }
        } catch (err) {
            console.log('Error: ', err.message)
        }
    }

    // If pickupModalVisible is true, show DriverPickupModal
    if (pickupModalVisible) {
        return (
            <DriverPickupModal
                visible={pickupModalVisible}
                notification={notification}
                pickupAddress={pickupAddress}
            />
        )
    }

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Driver Info Section */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <View style={styles.profileAndRating}>
                                <Image
                                    source={
                                        notification?.rider_image?.uri
                                            ? {
                                                  uri: notification?.rider_image
                                                      ?.uri,
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
                                <Text style={styles.timeText}>
                                    {notification.time_to_pickup}
                                </Text>
                                <Text style={styles.timeText}>Mins</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                    </View>

                    {/* Pickup Info Section */}
                    <View style={styles.section}>
                        <View style={styles.column}>
                            <View style={styles.pickupInfo}>
                                <Image
                                    source={require('../assets/pick-up2.png')}
                                    style={styles.pickupImage}
                                />
                                <Text
                                    style={styles.pickupText}
                                    numberOfLines={2} // Allows the address to break into two lines if it's too long
                                >
                                    {pickupAddress || 'Loading address...'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                    </View>

                    {/* "I've Arrived" Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.arrivedButton}
                            onPress={handleDriverArrive}>
                            <Text style={styles.arrivedText}>I'VE ARRIVED</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-start', // This is now aligned to the top, as it's no longer a modal
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    modalContent: {
        width: screenWidth,
        maxHeight: screenHeight * 0.55,
        backgroundColor: '#fff',
        borderRadius: 20,
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
    profileAndRating: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    driverName: {
        marginLeft: 10,
        fontSize: 16,
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
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    arrivedButton: {
        backgroundColor: '#2196F3',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 40,
        alignItems: 'center',
        justifyContent: 'center',
        width: screenWidth * 0.85,
    },
    arrivedText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '400',
    },
})

export default DriverArriveModal
