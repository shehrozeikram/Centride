// import React, { useState, useEffect } from 'react'
// import {
//     View,
//     Text,
//     Image,
//     Modal,
//     TouchableOpacity,
//     StyleSheet,
//     Dimensions,
//     ScrollView,
// } from 'react-native'
// import FontAwesome from 'react-native-vector-icons/FontAwesome'
// import Ionicons from 'react-native-vector-icons/Ionicons'

// const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// const DriverOnWay = ({
//     visible,
//     onClose,
//     newRideRequest,
//     titleText,
//     children,
// }) => {
//     const [driverLocationAddress, setDriverLocationAddress] = useState('')
//     const [pickupLocationAddress, setPickupLocationAddress] = useState('')
//     const [dropoffLocationAddress, setDropoffLocationAddress] = useState('')
//     const [finalDistance, setFinalDistance] = useState('')
//     const [finalTimeToReach, setFinalTimeToReach] = useState('')

//     const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json'

//     const Google_Maps_Apikey = 'AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw'

//     // console.log('newRideRequest in Driver on way modal', newRideRequest)
//     // console.log('======titleText======', titleText)
//     // console.log('finalTimeToReach', finalTimeToReach)

//     const fetchAddress = async (lat, long) => {
//         try {
//             const response = await fetch(
//                 `${geocodeUrl}?latlng=${lat},${long}&key=${Google_Maps_Apikey}`, // Replace with your Google Maps API key
//             )
//             const data = await response.json()
//             if (data.status === 'OK') {
//                 return data.results[0].formatted_address
//             } else {
//                 return 'Address not found'
//             }
//         } catch (error) {
//             console.error('Error fetching address:', error)
//             return 'Address not found'
//         }
//     }

//     const fetchDistanceAndTime = async (
//         pickupLat,
//         pickupLong,
//         dropoffLat,
//         dropoffLong,
//     ) => {
//         const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLong}&destinations=${dropoffLat},${dropoffLong}&key=${Google_Maps_Apikey}`
//         try {
//             const response = await fetch(distanceUrl)
//             const data = await response.json()
//             if (data.status === 'OK') {
//                 const distance = data.rows[0].elements[0].distance.text
//                 const duration = data.rows[0].elements[0].duration.text
//                 return { distance, duration }
//             } else {
//                 return { distance: 'N/A', duration: 'N/A' }
//             }
//         } catch (error) {
//             // console.error('Error fetching distance and time:', error)
//             return { distance: 'N/A', duration: 'N/A' }
//         }
//     }

//     // useEffect(() => {
//     //     const getAddresses = async () => {
//     //         if (newRideRequest) {
//     //             const driverAddress = await fetchAddress(
//     //                 newRideRequest.driver_location_lat,
//     //                 newRideRequest.driver_location_long,
//     //             )
//     //             setDriverLocationAddress(driverAddress)

//     //             const pickupAddress = await fetchAddress(
//     //                 newRideRequest.pickup_lat,
//     //                 newRideRequest.pickup_long,
//     //             )
//     //             setPickupLocationAddress(pickupAddress)

//     //             const dropoffAddress = await fetchAddress(
//     //                 newRideRequest.dropoff_lat,
//     //                 newRideRequest.dropoff_long,
//     //             )
//     //             setDropoffLocationAddress(dropoffAddress)
//     //         }
//     //     }

//     //     if (newRideRequest) {
//     //         getAddresses()
//     //     }
//     // }, [newRideRequest])

//     useEffect(() => {
//         const getAddressesAndDistance = async () => {
//             if (newRideRequest) {
//                 try {
//                     // Fetch addresses
//                     const driverAddress = await fetchAddress(
//                         newRideRequest.driver_location_lat,
//                         newRideRequest.driver_location_long,
//                     )
//                     setDriverLocationAddress(driverAddress)

//                     const pickupAddress = await fetchAddress(
//                         newRideRequest.pickup_lat,
//                         newRideRequest.pickup_long,
//                     )
//                     setPickupLocationAddress(pickupAddress)

//                     const dropoffAddress = await fetchAddress(
//                         newRideRequest.dropoff_lat,
//                         newRideRequest.dropoff_long,
//                     )
//                     setDropoffLocationAddress(dropoffAddress)

//                     // Fetch distance and time
//                     const { distance, duration } = await fetchDistanceAndTime(
//                         newRideRequest.pickup_lat,
//                         newRideRequest.pickup_long,
//                         newRideRequest.dropoff_lat,
//                         newRideRequest.dropoff_long,
//                     )

//                     // Ensure that valid data is returned
//                     if (distance !== 'N/A' && duration !== 'N/A') {
//                         setFinalDistance(distance)
//                         setFinalTimeToReach(duration)
//                     } else {
//                         // Handle the case where distance and duration are 'N/A'
//                         setFinalDistance('N/A')
//                         setFinalTimeToReach('N/A')
//                     }
//                 } catch (error) {
//                     console.error(
//                         'Error fetching addresses or distance/time:',
//                         error,
//                     )
//                     setFinalDistance('N/A')
//                     setFinalTimeToReach('N/A')
//                 }
//             }
//         }

//         if (newRideRequest) {
//             getAddressesAndDistance()
//         }
//     }, [newRideRequest]) // Runs every time newRideRequest changes

//     return (
//         <Modal
//             transparent={true}
//             visible={visible}
//             onRequestClose={onClose}
//             animationType='slide'>
//             <View style={[styles.modalContainer, styles.modalBackground]}>
//                 {children}
//                 <View style={styles.modalContent}>
//                     <ScrollView contentContainerStyle={styles.scrollContainer}>
//                         {/* Section 1 */}
//                         <View style={styles.section}>
//                             <View style={styles.row}>
//                                 <Text style={styles.titleText}>
//                                     {titleText
//                                         ? titleText
//                                         : 'Driver is on his way'}
//                                 </Text>
//                                 <View style={styles.timeContainer}>
//                                     <Text style={styles.timeText}>
//                                         {titleText ===
//                                         'Driver has arrived, Meet him'
//                                             ? '0'
//                                             : titleText ===
//                                                 'Your trip has begun'
//                                               ? finalTimeToReach
//                                               : newRideRequest?.time_to_pickup}
//                                     </Text>

//                                     <Text style={styles.timeText}>Mins</Text>
//                                 </View>
//                             </View>
//                             <View style={styles.divider} />
//                         </View>

//                         {/* Section 2 */}
//                         <View style={styles.section}>
//                             <View style={styles.row}>
//                                 {/* Updated Driver Info */}
//                                 <View style={styles.driverInfo}>
//                                     <View style={styles.profileAndRating}>
//                                         <Image
//                                             source={
//                                                 newRideRequest?.driver_image
//                                                     ?.uri
//                                                     ? {
//                                                           uri: newRideRequest
//                                                               ?.driver_image
//                                                               ?.uri,
//                                                       }
//                                                     : require('../assets/driver.png')
//                                             }
//                                             style={styles.profileImage}
//                                         />

//                                         <View style={styles.ratingContainer}>
//                                             <Text style={styles.ratingText}>
//                                                 {newRideRequest?.driver_rating}
//                                             </Text>
//                                             <FontAwesome
//                                                 name='star'
//                                                 size={18}
//                                                 color='#FFD700'
//                                             />
//                                         </View>
//                                     </View>
//                                 </View>
//                                 <View style={styles.driverDetailsContainer}>
//                                     <View style={styles.driverDetails}>
//                                         <Text style={styles.driverName}>
//                                             {newRideRequest?.driver_firstname}
//                                         </Text>
//                                         <Text style={styles.driverTrips}>
//                                             {
//                                                 newRideRequest?.driver_completed_rides
//                                             }{' '}
//                                             Trips
//                                         </Text>
//                                         <Text style={styles.driverId}>
//                                             {newRideRequest?.driver_id}
//                                         </Text>
//                                     </View>
//                                 </View>
//                                 <View style={styles.vehicleInfo}>
//                                     <Image
//                                         source={require('../assets/bike.png')}
//                                         style={styles.vehicleImage}
//                                     />
//                                     <Text style={styles.vehicleText}>
//                                         {newRideRequest?.driver_platenum}
//                                     </Text>
//                                     <Text style={styles.vehicleYear}>
//                                         {newRideRequest?.driver_carcolor} 2021
//                                     </Text>
//                                 </View>
//                             </View>
//                             <View style={styles.divider} />
//                         </View>

//                         {/* Section 3 */}
//                         <View style={styles.section}>
//                             <View style={styles.column}>
//                                 <View style={styles.pickupInfo}>
//                                     <Image
//                                         source={require('../assets/pick-up2.png')}
//                                         style={styles.pickupImage}
//                                     />
//                                     <Text
//                                         style={styles.pickupText}
//                                         numberOfLines={1}>
//                                         {titleText === 'Driver is on his way'
//                                             ? driverLocationAddress ||
//                                               'Loading...'
//                                             : pickupLocationAddress ||
//                                               'Loading...'}

//                                         {/* {driverLocationAddress || 'Loading...'} */}
//                                     </Text>
//                                 </View>
//                                 <View style={styles.dropoffInfo}>
//                                     <Image
//                                         source={require('../assets/waypoint.png')}
//                                         style={styles.pickupImage}
//                                     />
//                                     <Text
//                                         style={styles.dropoffText}
//                                         numberOfLines={1}>
//                                         {titleText === 'Driver is on his way'
//                                             ? pickupLocationAddress ||
//                                               'Loading...'
//                                             : dropoffLocationAddress ||
//                                               'Loading...'}
//                                     </Text>
//                                 </View>
//                             </View>
//                             <View style={styles.divider} />
//                         </View>

//                     </ScrollView>
//                 </View>
//             </View>
//         </Modal>
//     )
// }

// const styles = StyleSheet.create({
//     modalContainer: {
//         flex: 1,
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     },
//     modalBackground: {
//         backgroundColor: 'transparent',
//     },
//     modalContent: {
//         width: screenWidth,
//         maxHeight: screenHeight * 0.75,
//         backgroundColor: '#fff',
//         borderTopLeftRadius: 20,
//         borderTopRightRadius: 20,
//         overflow: 'hidden',
//     },
//     scrollContainer: {
//         paddingVertical: 20,
//     },
//     section: {
//         paddingHorizontal: 15,
//         paddingVertical: 4,
//     },
//     row: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },
//     column: {
//         flexDirection: 'column',
//         justifyContent: 'flex-start',
//     },
//     titleText: {
//         fontSize: 18,
//         fontWeight: '400',
//         color: '#000',
//     },
//     timeContainer: {
//         backgroundColor: '#000',
//         borderRadius: 10,
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     timeText: {
//         color: '#fff',
//         fontSize: 14,
//     },
//     divider: {
//         height: 1,
//         backgroundColor: '#ddd',
//         marginVertical: 10,
//     },
//     driverInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'flex-start',
//         marginLeft: 10,
//     },
//     profileAndRating: {
//         flexDirection: 'column',
//         alignItems: 'center',
//         // marginRight: 10,
//     },
//     profileImage: {
//         width: 70,
//         height: 70,
//         borderRadius: 35,
//     },
//     ratingContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 5,
//     },
//     ratingText: {
//         fontSize: 16,
//         color: '#000',
//         marginRight: 5,
//     },
//     driverDetailsContainer: {
//         flex: 1,
//         justifyContent: 'center',
//     },
//     driverDetails: {
//         alignItems: 'center',
//     },
//     driverName: {
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     driverTrips: {
//         fontSize: 14,
//         color: '#888',
//         fontWeight: '400',
//     },
//     driverId: {
//         fontSize: 14,
//         color: '#888',
//         fontWeight: '500',
//     },
//     vehicleInfo: {
//         alignItems: 'center',
//         marginRight: 20,
//     },
//     vehicleImage: {
//         width: 110,
//         height: 80,
//     },
//     vehicleText: {
//         fontSize: 12,
//         fontWeight: '400',
//         color: 'black',
//     },
//     vehicleYear: {
//         fontSize: 12,
//         color: '#888',
//     },
//     pickupInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     pickupImage: {
//         width: 30,
//         height: 30,
//         marginRight: 10,
//     },
//     pickupText: {
//         fontSize: 14,
//         flex: 1,
//         overflow: 'hidden',
//         color: 'black',
//     },
//     dropoffInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     dropoffText: {
//         fontSize: 14,
//         flex: 1,
//         overflow: 'hidden',
//         color: 'black',
//     },
//     actionsContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         // paddingVertical: 2,
//         paddingHorizontal: 15,
//     },
//     actionButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderRadius: 6,
//         paddingVertical: 8,
//         paddingHorizontal: 4,
//         elevation: 2,
//         marginHorizontal: 4,
//         width: (screenWidth - 60 - 24) / 4,
//     },
//     callButton: {
//         backgroundColor: '#4CAF50',
//     },
//     chatButton: {
//         backgroundColor: '#2196F3',
//     },
//     shareButton: {
//         backgroundColor: '#FFC107',
//     },
//     cancelButton: {
//         backgroundColor: '#F44336',
//     },
//     actionText: {
//         color: '#fff',
//         fontSize: 12,
//         fontWeight: 'bold',
//         marginLeft: 4,
//     },
//     actionIcon: {
//         marginRight: 4,
//     },
// })

// export default DriverOnWay

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
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const DriverOnWay = ({
    visible,
    onClose,
    newRideRequest,
    titleText,
    children,
}) => {
    const [driverLocationAddress, setDriverLocationAddress] = useState('')
    const [pickupLocationAddress, setPickupLocationAddress] = useState('')
    const [dropoffLocationAddress, setDropoffLocationAddress] = useState('')
    const [rideRequest, setRideRequest] = useState(newRideRequest)
    const [finalDistance, setFinalDistance] = useState('')
    const [finalTimeToReach, setFinalTimeToReach] = useState('')

    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
    const Google_Maps_Apikey = 'AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw'

    useEffect(() => {
        setRideRequest(newRideRequest)
        console.log('newRideRequest=', newRideRequest)
    }, [newRideRequest])
    // console.log('rideRequest=', rideRequest)

    const fetchAddress = async (lat, long) => {
        try {
            const response = await fetch(
                `${geocodeUrl}?latlng=${lat},${long}&key=${Google_Maps_Apikey}`, // Replace with your Google Maps API key
            )
            const data = await response.json()
            if (data.status === 'OK') {
                return data.results[0].formatted_address
            } else {
                return 'Address not found'
            }
        } catch (error) {
            console.error('Error fetching address:', error)
            return 'Address not found'
        }
    }

    // const fetchDistanceAndTime = async (
    //     pickupLat,
    //     pickupLong,
    //     dropoffLat,
    //     dropoffLong,
    // ) => {
    //     const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLong}&destinations=${dropoffLat},${dropoffLong}&key=${Google_Maps_Apikey}`
    //     try {
    //         const response = await fetch(distanceUrl)
    //         const data = await response.json()
    //         if (data.status === 'OK') {
    //             const distance = data.rows[0].elements[0].distance.text
    //             const duration = data.rows[0].elements[0].duration.text
    //             return { distance, duration }
    //         } else {
    //             return { distance: 'N/A', duration: 'N/A' }
    //         }
    //     } catch (error) {
    //         console.error('Error fetching distance and time:', error)
    //         return { distance: 'N/A', duration: 'N/A' }
    //     }
    // }

    const fetchDistanceAndTime = async (
        pickupLat,
        pickupLong,
        dropoffLat,
        dropoffLong,
    ) => {
        const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLong}&destinations=${dropoffLat},${dropoffLong}&key=${Google_Maps_Apikey}`
        try {
            const response = await fetch(distanceUrl)
            const data = await response.json()

            // Log the response for debugging
            console.log('Distance and Time API Response:', data)

            if (!pickupLat || !pickupLong || !dropoffLat || !dropoffLong) {
                return {
                    distance: 'Invalid coordinates',
                    duration: 'Invalid coordinates',
                }
            }

            if (
                data.status === 'OK' &&
                data.rows &&
                data.rows[0] &&
                data.rows[0].elements &&
                data.rows[0].elements[0]
            ) {
                const distance = data.rows[0].elements[0].distance
                    ? data.rows[0].elements[0].distance.text
                    : 'N/A'
                const duration = data.rows[0].elements[0].duration
                    ? data.rows[0].elements[0].duration.text
                    : 'N/A'

                return { distance, duration }
            } else {
                console.error('Invalid data or status from API:', data)
                return { distance: 'N/A', duration: 'N/A' }
            }
        } catch (error) {
            console.error('Error fetching distance and time:', error)
            return { distance: 'N/A', duration: 'N/A' }
        }
    }

    useEffect(() => {
        const getAddressesAndDistance = async () => {
            if (newRideRequest) {
                try {
                    // Fetch addresses
                    const driverAddress = await fetchAddress(
                        newRideRequest.driver_location_lat,
                        newRideRequest.driver_location_long,
                    )
                    setDriverLocationAddress(driverAddress)

                    const pickupAddress = await fetchAddress(
                        newRideRequest.pickup_lat,
                        newRideRequest.pickup_long,
                    )
                    setPickupLocationAddress(pickupAddress)

                    const dropoffAddress = await fetchAddress(
                        newRideRequest.dropoff_lat,
                        newRideRequest.dropoff_long,
                    )
                    setDropoffLocationAddress(dropoffAddress)

                    // Fetch distance and time
                    const { distance, duration } = await fetchDistanceAndTime(
                        newRideRequest.pickup_lat,
                        newRideRequest.pickup_long,
                        newRideRequest.dropoff_lat,
                        newRideRequest.dropoff_long,
                    )

                    // Ensure that valid data is returned
                    if (distance !== 'N/A' && duration !== 'N/A') {
                        setFinalDistance(distance)
                        setFinalTimeToReach(duration)
                    } else {
                        setFinalDistance('N/A')
                        setFinalTimeToReach('N/A')
                    }
                } catch (error) {
                    console.error(
                        'Error fetching addresses or distance/time:',
                        error,
                    )
                    setFinalDistance('N/A')
                    setFinalTimeToReach('N/A')
                }
            }
        }

        if (newRideRequest) {
            getAddressesAndDistance()
        }
    }, [newRideRequest]) // Runs every time newRideRequest changes

    return (
        visible && ( // Show the view only if 'visible' is true
            <View style={[styles.modalContainer, styles.modalBackground]}>
                {children}
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {/* Section 1 */}
                        <View style={styles.section}>
                            <View style={styles.row}>
                                <Text style={styles.titleText}>
                                    {titleText
                                        ? titleText
                                        : 'Driver is on his way'}
                                </Text>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeText}>
                                        {titleText ===
                                        'Driver has arrived, Meet him'
                                            ? '0'
                                            : titleText ===
                                                'Your trip has started'
                                              ? finalTimeToReach
                                              : rideRequest?.time_to_pickup}
                                    </Text>

                                    <Text style={styles.timeText}>Mins</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                        </View>

                        {/* Section 2 */}
                        <View style={styles.section}>
                            <View style={styles.row}>
                                {/* Updated Driver Info */}
                                <View style={styles.driverInfo}>
                                    <View style={styles.profileAndRating}>
                                        <Image
                                            source={
                                                rideRequest?.driver_photo
                                                    ? {
                                                          uri: rideRequest?.driver_photo,
                                                      }
                                                    : require('../assets/driver.png')
                                            }
                                            style={styles.profileImage}
                                        />

                                        <View style={styles.ratingContainer}>
                                            <Text style={styles.ratingText}>
                                                {rideRequest?.driver_firstname?.toString() ||
                                                    'Loading...'}
                                                {/* {newRideRequest?.driver_rating} */}
                                            </Text>
                                            <FontAwesome
                                                name='star'
                                                size={18}
                                                color='#FFD700'
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.driverDetailsContainer}>
                                    <View style={styles.driverDetails}>
                                        <Text style={styles.driverName}>
                                            {rideRequest?.driver_firstname ||
                                                'Loading...'}

                                            {/* {newRideRequest?.driver_firstname} */}
                                        </Text>
                                        <Text style={styles.driverTrips}>
                                            {
                                                rideRequest?.driver_completed_rides
                                            }{' '}
                                            Trips
                                        </Text>
                                        <Text style={styles.driverId}>
                                            {rideRequest?.driver_id}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.vehicleInfo}>
                                    <Image
                                        source={require('../assets/bike.png')}
                                        style={styles.vehicleImage}
                                    />
                                    <Text style={styles.vehicleText}>
                                        {rideRequest?.driver_platenum}
                                    </Text>
                                    <Text style={styles.vehicleYear}>
                                        {rideRequest?.driver_carcolor} 2021
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                        </View>

                        {/* Section 3 */}
                        <View style={styles.section}>
                            <View style={styles.column}>
                                <View style={styles.pickupInfo}>
                                    <Image
                                        source={require('../assets/pick-up2.png')}
                                        style={styles.pickupImage}
                                    />
                                    <Text
                                        style={styles.pickupText}
                                        numberOfLines={1}>
                                        {titleText === 'Driver is on his way'
                                            ? driverLocationAddress ||
                                              'Loading...'
                                            : pickupLocationAddress ||
                                              'Loading...'}
                                    </Text>
                                </View>
                                <View style={styles.dropoffInfo}>
                                    <Image
                                        source={require('../assets/waypoint.png')}
                                        style={styles.pickupImage}
                                    />
                                    <Text
                                        style={styles.dropoffText}
                                        numberOfLines={1}>
                                        {titleText === 'Driver is on his way'
                                            ? pickupLocationAddress ||
                                              'Loading...'
                                            : dropoffLocationAddress ||
                                              'Loading...'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        // flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalBackground: {
        backgroundColor: 'transparent',
    },
    modalContent: {
        width: screenWidth,
        maxHeight: screenHeight * 0.75,
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
        paddingVertical: 4,
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
        fontWeight: '400',
        color: '#000',
    },
    timeContainer: {
        backgroundColor: '#000',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
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
        fontSize: 16,
        color: '#000',
        marginRight: 5,
    },
    driverDetailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    driverDetails: {
        alignItems: 'center',
    },
    driverName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    driverTrips: {
        fontSize: 14,
        color: '#888',
        fontWeight: '400',
    },
    driverId: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    vehicleInfo: {
        alignItems: 'center',
        marginRight: 20,
    },
    vehicleImage: {
        width: 110,
        height: 80,
    },
    vehicleText: {
        fontSize: 12,
        fontWeight: '400',
        color: 'black',
    },
    vehicleYear: {
        fontSize: 12,
        color: '#888',
    },
    pickupInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    pickupImage: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    pickupText: {
        fontSize: 14,
        flex: 1,
        overflow: 'hidden',
        color: 'black',
    },
    dropoffInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropoffText: {
        fontSize: 14,
        flex: 1,
        overflow: 'hidden',
        color: 'black',
    },
})

export default DriverOnWay
