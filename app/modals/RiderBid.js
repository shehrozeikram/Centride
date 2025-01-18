import React, { useState } from 'react'
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
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { getSessionId, SESSION_ID } from '../utils/common'
import { DRIVER_BASE_URL, RIDER_BASE_URL } from '../utils/constants'
import messaging from '@react-native-firebase/messaging'
import database from '@react-native-firebase/database'
import { useSelector } from 'react-redux'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const RiderBid = ({ visible, onClose, newRideRequest }) => {
    const user = useSelector((state) => state.user?.user)
    const [rideRequestData, setRideRequestData] = useState(null)
    const [showDriverOnWay, setShowDriverOnWay] = useState(false)
    const [showDriverAssignedModal, setShowDriverAssignedModal] =
        useState(false)

    console.log('=====newRideRequest=====002', newRideRequest)
    // console.log('====user in rider side====', user)

    const acceptRide = async () => {
        const sessId = getSessionId()
        const url = `${DRIVER_BASE_URL}?sess_id=${sessId}`

        // Request body data as x-www-form-urlencoded
        const body = new URLSearchParams({
            action: 'acceptride',
            bookingid: '5877',
            bid_fare: '179',
        })

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            })

            if (res.ok) {
                const data = await res.json() // Assuming the API returns JSON
                // Handle the data after accepting ride
            } else {
                // Handle request failure
            }
        } catch (err) {
            // Handle error
        }
    }

    const getCurrentUnixTimestamp = () => {
        return Math.floor(Date.now() / 1000) // Current timestamp in seconds
    }
    const saveAccepBid = async () => {
        const currentTimestamp = getCurrentUnixTimestamp()
        console.log('==currentTimestamp==', currentTimestamp)
        console.log('===newRideRequest= accept bid==', newRideRequest)

        const msgData = {
            // action: 'driver-assigned',
            action: 'accept-driver-bid-notify',
            bid_fare: newRideRequest?.bid_fare,
            booking_id: newRideRequest?.booking_id,
            driver_carid: newRideRequest?.driver_ride_id,
            driver_carmodel: newRideRequest?.driver_carmodel,
            driver_image: user
                ? { uri: user?.photo }
                : require('../assets/driver.png'),
            driver_carcolor: newRideRequest?.driver_carcolor,
            driver_completed_rides: newRideRequest?.driver_completed_rides,
            driver_id: newRideRequest?.driver_id,
            driver_location_lat: newRideRequest?.driver_location_lat,
            driver_location_long: newRideRequest?.driver_location_long,
            driver_phone: newRideRequest?.driver_phone,
            driver_photo: newRideRequest?.driver_photo,
            driver_platenum: newRideRequest?.driver_platenum,
            driver_rating: newRideRequest?.driver_rating,
            pickup_addr: newRideRequest?.pickup_addr,
            pickup_lat: newRideRequest?.pickup_lat,
            pickup_long: newRideRequest?.pickup_long,
            time_notified: getCurrentUnixTimestamp(),
            ttl: 30,
            dropoff_lat: newRideRequest?.dropoff_lat,
            dropoff_long: newRideRequest?.dropoff_long,

            // p_address: newRideRequest?.pickup_addr,
            // p_lat: route?.params.picuploactionLatLng.latitude,
            // p_lng: route?.params.picuploactionLatLng.longitude,

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
            distance: newRideRequest?.distance,
            time_to_pickup: newRideRequest?.time_to_pickup,
        }

        try {
            const userId = user.userid
            const driverId = newRideRequest?.driver_id
            console.log('===userId in rider of driver Assigned===', msgData)

            // Saving to database...

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

            console.log(
                '===Data saved successfully from rider===Driver',
                userId,
                currentTimestamp,
                driverId,
                msgData,
            )

            setRideRequestData(newRideRequest)
            console.log('hiiiii')

            // Show the DriverOnWay modal for 20 seconds
            setShowDriverOnWay(true)

            // After 20 seconds, hide the DriverOnWay modal and show DriverAssignedModal
            // setTimeout(() => {
            //     setShowDriverOnWay(false)
            //     setShowDriverAssignedModal(true)
            // }, 20000) // 20 seconds delay for DriverOnWay modal

            // After 2 seconds of DriverOnWay modal being hidden, show DriverAssignedModal
            // setTimeout(() => {
            //     setShowDriverAssignedModal(true)
            // }, 22000) // 2 seconds after DriverOnWay modal ends
        } catch (error) {
            console.error('Error saving data for riderId:', error)
        }
    }

    const acceptBid = async () => {
        const sessId = getSessionId()
        const url = `${DRIVER_BASE_URL}?sess_id=${sessId}`
        // const driverId = newRideRequest?.driver_id

        // Request body data as x-www-form-urlencoded
        const body = new URLSearchParams({
            action: 'acceptbid',
            bookingid: newRideRequest.booking_id,
            bid_fare: newRideRequest.bid_fare,
            driver_id: newRideRequest?.driver_id,
        })
        console.log('====body====', body)

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            })
            console.log('======res=======', res)
            if (res.ok) {
                console.log('====api is working 1====', res)
                onClose()
                saveAccepBid()
            } else {
                // Handle request failure
            }
        } catch (err) {
            // Handle error
        }
    }

    const handleDeclineBid = async () => {
        const sess_id = await getSessionId()
        const url = `${RIDER_BASE_URL}?sess_id=${sess_id}`
        // Define the request body as x-www-form-urlencoded format
        const body = new URLSearchParams({
            action: 'declinebid',
            driver_id: 'drvr-1', // Make sure driver_id is a string
            bookingid: 7209, // Make sure bookingid is a string
        }).toString()

        console.log('=====bookingid=====', newRideRequest.booking_id)

        // Perform the POST request using fetch
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body,
            })

            const responseData = await response.json()
            if (response) {
                console.log(
                    '========Response of decline bid=========',
                    responseData,
                )
                onClose()
            } else {
                Alert.alert('Error', 'Failed to process the request')
            }
        } catch (error) {
            // Handle any error that occurs during the fetch
            console.error('Error:', error)
            Alert.alert('Error', 'Something went wrong')
        }
    }

    const rejectRide = () => {
        console.log('Ride Rejected')
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType='slide'>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {/* Section 2 (Updated) */}
                        <View style={styles.section}>
                            <View style={styles.row}>
                                {/* Driver Info */}
                                <View style={styles.driverInfo}>
                                    <View style={styles.profileAndRating}>
                                        <Image
                                            source={
                                                newRideRequest?.driver_image
                                                    ?.uri
                                                    ? {
                                                          uri: newRideRequest
                                                              ?.driver_image
                                                              ?.uri,
                                                      } // Use the provided URI if it exists
                                                    : require('../assets/driver.png')
                                            }
                                            style={styles.profileImage}
                                        />
                                        {/* <Image
                                            source={{
                                                uri: newRideRequest
                                                    ?.driver_image?.uri,
                                            }}
                                            style={styles.profileImage}
                                        /> */}
                                        <View style={styles.ratingContainer}>
                                            <Text style={styles.ratingText}>
                                                {newRideRequest?.driver_rating}
                                            </Text>
                                            <FontAwesome
                                                name='star'
                                                size={18}
                                                color='#FFD700'
                                            />
                                        </View>
                                        <Text style={{ color: 'black' }}>
                                            {newRideRequest?.driver_firstname}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.driverDetailsContainer}>
                                    <View style={styles.driverDetails}>
                                        <Text style={styles.driverName}>
                                            Rs {newRideRequest?.bid_fare}
                                        </Text>
                                        <Text style={styles.driverTrips}>
                                            {/* {newRideRequest?.payment_method} */}
                                        </Text>
                                        <View style={styles.driverIdContainer}>
                                            <View style={styles.row}>
                                                <Ionicons
                                                    name='time'
                                                    size={18}
                                                    color='orange'
                                                    style={styles.icon}
                                                />
                                                <Text
                                                    style={styles.driverIdText}>
                                                    {
                                                        newRideRequest?.time_to_pickup
                                                    }{' '}
                                                    mins
                                                </Text>
                                                <Ionicons
                                                    name='navigate'
                                                    size={18}
                                                    color='skyblue'
                                                    style={[
                                                        styles.icon,
                                                        { marginLeft: 20 },
                                                    ]}
                                                />
                                                <Text
                                                    style={styles.driverIdText}>
                                                    {newRideRequest?.distance}{' '}
                                                    km
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            {/* Reject and Accept buttons */}
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.rejectButton,
                                    ]}
                                    onPress={() => {
                                        handleDeclineBid()
                                    }}>
                                    <Text style={styles.actionText}>
                                        Reject
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.acceptButton,
                                    ]}
                                    // onPress={onClose}>
                                    onPress={() => {
                                        acceptBid()
                                        // onClose()
                                    }}>
                                    <Text style={styles.actionText}>
                                        Accept
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
        justifyContent: 'space-evenly', // Modal appears at the top
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: screenWidth,
        maxHeight: screenHeight * 0.6,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    scrollContainer: {
        paddingVertical: 20,
    },
    section: {
        paddingHorizontal: 15,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 10,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 10,
    },
    profileAndRating: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    ratingText: {
        fontSize: 16,
        color: '#000',
        marginRight: 5,
    },
    driverDetailsContainer: {
        flex: 1,
        marginLeft: 60,
    },
    driverDetails: {
        alignItems: 'center',
    },
    driverName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
    driverTrips: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
        marginTop: 15,
    },
    driverIdContainer: {
        marginTop: 5,
    },
    driverIdText: {
        fontSize: 18,
        color: 'black',
        fontWeight: '600',
        marginLeft: 5,
    },
    icon: {
        marginRight: 5,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 10,
        marginTop: 10, // Space between divider and buttons
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '48%',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    actionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 50,
    },
})

export default RiderBid
