import React, { useState, useEffect, useRef } from 'react'
import MapView, {
    Callout,
    Marker,
    PROVIDER_GOOGLE,
    Polyline,
} from 'react-native-maps'
import Animated, {
    Easing,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    withDelay,
    withRepeat,
} from 'react-native-reanimated'
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    Platform,
    Alert,
    StatusBar,
    FlatList,
    Linking,
} from 'react-native'
import Ring from '../../components/Ring'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MapViewDirections from 'react-native-maps-directions'
import CustomModal from '../../modals/CustomModal'
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native'
import Geocoder from 'react-native-geocoding' // Import geocoding library
import Header from '../../components/Header'
import Spacing from '../../components/Spacing'
import Color from '../../utils/Color'
import { Post, PostData } from '../../network/network'
import axios from 'axios'
import GetLocation from 'react-native-get-location'
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder'
import { DRIVER_BASE_URL, RIDER_BASE_URL } from '../../utils/constants'
import { getSessionId } from '../../utils/common'
import Style from '../../utils/Styles'
import CryptoJS from 'crypto-js' // Import crypto-js for MD5 hashing
import messaging from '@react-native-firebase/messaging'
import database from '@react-native-firebase/database'
import RiderBid from '../../modals/RiderBid'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Sound from 'react-native-sound'
import DriverAssignedModal from '../../modals/DriverAssignedModal'
import DriverOnWay from '../../modals/DriverOnWay'
import RideCompleted from './RideCompleted'
import DriverCard from '../../modals/DriverCard'

import { useTranslation } from 'react-i18next'

const Google_Maps_Apikey = 'AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw' // Replace with your actual API key

// Initialize Geocoder with API key

Geocoder.init(Google_Maps_Apikey)

const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
}

const calculateTime = (distance) => {
    const avgSpeed = 20 // in km/h
    const timeInHours = distance / avgSpeed // time in hours
    const timeInMinutes = timeInHours * 60 // convert to minutes
    return Math.round(timeInMinutes) // rounded to the nearest minute
}

const CustomMarker = ({ driver }) => (
    <View style={styles.markerContainer}>
        <Image
            source={{
                uri: 'https://t3.ftcdn.net/jpg/01/92/21/40/360_F_192214085_QnQ58x0ZKRLSUEgarcjVHNWrnmH8uWTA.jpg',
            }} // Replace with driver?.icon?.url if dynamic
            style={[
                styles.markerIcon,
                { transform: [{ rotate: `${driver?.b_angle}deg` }] }, // Rotate the icon
            ]}
        />
    </View>
)

const RiderMapScreen = ({ route }) => {
    const { t, i18n } = useTranslation()
    const { hideStroke } = route.params || { hideStroke: false }
    // const mapRef = useRef(null) // Add a reference for the MapView
    const [origin, setOrigin] = useState()
    const [messageData, setMessageData] = useState(null)
    const [destination, setDestination] = useState(null) // Default to null
    const [modalVisible, setModalVisible] = useState(false)
    const [mapType, setMapType] = useState('standard') // State for toggling map view
    const [distance, setDistance] = useState(null) // State for distance
    // const route = useRoute()
    const navigation = useNavigation()
    // const [driverLocationsList, setDriverLocations] = useState([])
    const [showDriverOnWay, setShowDriverOnWay] = useState(false)
    const [showDriverAssignedModal, setShowDriverAssignedModal] =
        useState(false)
    const [newRideRequests, setNewRideRequests] = useState([])
    const [modalVisibleFlags, setModalVisibleFlags] = useState([])
    const [routeValue, setRouteValue] = useState('')
    const [selectedVehicle, setSelectedVehicle] = useState('')
    const [userAddress, setUserAddress] = useState('')
    const [notifications, setNotifications] = useState([])
    const [showRings, setShowRings] = useState(false)
    const [morningContainer, setMorningContainer] = useState(false)
    const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 })
    const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 })
    const [strokeColor, setStrokeColor] = useState('black')
    // const [newRideRequest, setNewRideRequest] = useState(null)
    const [newRideRequest, setNewRideRequest] = useState({ titleText: '' })
    const [showDirections, setShowDirections] = useState(false)
    const [driverLocations, setDriverLocations] = useState([]) // Nearby drivers
    const [error, setError] = useState(null) // To handle errors
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isShimmering, setIsShimmering] = useState(true)
    const [isMenuIcon, setIsMenuIcon] = useState(true)
    const [bookingId, setBookingId] = useState(null)
    const [serverClientTimeDiff, setServerClientTimeDiff] = useState(0)
    const [processedNotifications, setProcessedNotifications] = useState({})
    // new for
    const [hideDirections, setHideDirections] = useState(false)
    const [driverLocationLat, setDriverLocationLat] = useState(null)
    const [driverLocationLong, setDriverLocationLong] = useState(null)
    const [closedDriverIds, setClosedDriverIds] = useState([])
    const [formattedNotifications, setFormattedNotifications] = useState([])
    const [driverRequests, setDriverRequests] = useState([])
    const [rideRequests, setRideRequests] = useState([]) // Store multiple ride requests
    const [currentRideRequestIndex, setCurrentRideRequestIndex] = useState(0)
    const user = useSelector((state) => state.user?.user)
    const mapRef = useRef(null) // MapView reference
    const markerRefs = useRef([])

    const prevActionRef = useRef(null)
    const prevMessageRef = useRef(null)
    const isInitialLoadRef = useRef(true)

    const handleCloseDriverCard = (driverId) => {
        setClosedDriverIds((prevClosedIds) => [...prevClosedIds, driverId])
    }
    const [isDriverBid, setIsDriverBid] = useState(false)
    useEffect(() => {
        if (isDriverBid && formattedNotifications.length > 0) {
            console.log(
                'isDriverBid=======>',
                'is====>',
                isDriverBid,
                formattedNotifications,
            )
            driver_bid_notify(formattedNotifications)
        }
    }, [formattedNotifications, isDriverBid])
    let count = 0
    useEffect(() => {
        const fetchNotifications = async () => {
            const userId = user?.userid
            const reference = database()
                .ref(`Riders/ridr-${userId}/notf`)
                .on('value', async (snapshot) => {
                    const data = snapshot.val()
                    console.log('data==', data)
                    // console.log(typeof data.msg_t === 'string')
                    const stringValue = JSON.stringify(data.msg_t)
                    // console.log('Converted string:', stringValue)
                    // console.log(typeof stringValue === 'string')
                    if (data == null) return
                    if (!(data?.msg && data?.msg_t)) return

                    // Get last message timestamp from AsyncStorage
                    const last_msg_time_id =
                        await AsyncStorage.getItem('fb_last_recvd')
                    if (data.msg_t === last_msg_time_id) return

                    const lastMsgTimeIdString = last_msg_time_id
                        ? last_msg_time_id.toString()
                        : null
                    if (data.msg_t.toString() === lastMsgTimeIdString) return

                    // Update last message timestamp in AsyncStorage
                    await AsyncStorage.setItem(
                        'fb_last_recvd',
                        // stringValue,
                        // JSON.stringify(data.msg_t),
                        data?.msg_t?.toString(),
                    )

                    // Adjust current timestamp using the server-client time difference
                    let current_local_timestamp = Date.now()
                    current_local_timestamp += serverClientTimeDiff // Sync with server time
                    current_local_timestamp = Math.floor(
                        current_local_timestamp / 1000,
                    )

                    if (current_local_timestamp - 5 > data.msg_t) return

                    const message = data.msg

                    // Handle message actions
                    if (
                        message.hasOwnProperty('booking_id') &&
                        message.hasOwnProperty('action')
                    ) {
                        // Process "driver-bid-notify"
                        if (message.action === 'driver-bid-notify') {
                            // console.log('message======>', message)

                            if (message !== null) {
                                setFormattedNotifications(
                                    (prevNotifications) => [
                                        ...prevNotifications,
                                        ...[message], // Each message goes into its own array
                                    ],
                                )
                            }
                        }
                        // Switch based on action type
                        switch (message.action) {
                            case 'driver-assigned':
                                // accept_driver_bid_notify(message)
                                driver_assigned_notify(message)
                                break
                            case 'driver-bid-notify':
                                setIsDriverBid(true)
                                // driver_bid_notify(formattedNotifications) // Move to another useEffect to handle updated state
                                break
                            case 'accept-driver-bid-notify':
                                accept_driver_bid_notify(message)
                                break
                            case 'driver-arrived':
                                driver_arrived_notify(message)
                                break
                            case 'customer-onride':
                                customer_onride_notify(message)
                                break
                            case 'driver-complete':
                                driver_complete_notify(message)
                                break
                            case 'driver-cancelled':
                                driver_cancelled_notify(message)
                                break
                            case 'chat-message':
                                driver_chat_msg_notify(message)
                                break
                            case 'app-message':
                                app_message(message)
                                break
                            default:
                                console.log(
                                    'Unknown action type:',
                                    message.action,
                                )
                                break
                        }
                    }
                })

            // Clean up the listener on component unmount
            return () => {
                database()
                    .ref(`Riders/ridr-${userId}/notf`)
                    .off('value', reference)
            }
        }

        fetchNotifications()
    }, [])

    useEffect(() => {
        if (formattedNotifications.length > 0) {
            console.log('check', count++)
            // This will store the (booking_id, driver_id) pairs that have been processed
            const processedPairs = new Set()

            // Filter out duplicates based on (booking_id, driver_id)
            const uniqueNotifications = formattedNotifications
                .flat() // Flatten the array of arrays into a single array
                .filter((value) => {
                    const pair = `${value.booking_id}-${value.driver_id}`

                    // Check if this (booking_id, driver_id) combination is already processed
                    if (processedPairs.has(pair)) {
                        return false // Skip this notification
                    } else {
                        // Mark this combination as processed
                        processedPairs.add(pair)
                        return true // Proceed with this notification
                    }
                })

            // Call the driver_bid_notify with the unique notifications
            driver_bid_notify(uniqueNotifications)
        }
    }, [formattedNotifications])

    // useEffect(() => {
    //     if (formattedNotifications.length > 0) {
    //         // Remove duplicates based on booking_id and driver_id
    //         const uniqueNotifications = formattedNotifications
    //             .flat() // Flatten the array of arrays into a single array
    //             .filter(
    //                 (value, index, self) =>
    //                     index ===
    //                     self.findIndex(
    //                         (t) =>
    //                             t.booking_id === value.booking_id &&
    //                             t.driver_id === value.driver_id,
    //                     ),
    //             )

    //         console.log('Unique Notifications in rider:', uniqueNotifications)

    //         // Call the driver_bid_notify with the unique notifications
    //         driver_bid_notify(uniqueNotifications)
    //     }
    // }, [formattedNotifications])

    const driver_complete_notify = (notification) => {
        console.log(
            'Handling driver_complete_notify notification in rider and i came in driver_complete_notify',
            notification,
        )
        setDriverRequests([])
        navigation.navigate('RideCompleted', {
            notification,
        })

        setShowDriverOnWay(false)
        setMorningContainer(true)

        // Update newRideRequest state with relevant data
        // setNewRideRequest({
        //     ...notification, // Keep the existing notification data
        //     titleText: 'Your trip has ended', // Set title based on action
        // })

        console.log('Action being passed to showModal:', notification.action)

        // showDriverOnWay(false)
        // setMorningContainer(true)

        // Show modal with updated data and sound
        // showDriverOnWayModal('ride_alloc.mp3', notification.action)
    }
    const onReject = (data) => {
        // when you call api here to reject the request then just just call the bellow lines of code inside that fucntion if response success

        apiData = {
            action: 'bookingcancel',
            // driver_id: data?.driver_id,
            // driver_id: data?.driver_id,
            bookingid: data?.booking_id,
        }
        console.log('apiData', apiData)

        Post({ data: apiData })
            .then((result) => {
                console.log('result', result)
                const updatedDriverList = driverRequests.filter(
                    (item) => item?.driver_id !== data?.driver_id,
                )
                setDriverRequests(updatedDriverList)
                const updatedFormatedList = formattedNotifications.filter(
                    (item) => item?.driver_id !== data?.driver_id,
                )
                setFormattedNotifications(updatedDriverList)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const driver_cancelled_notify = (notification) => {
        console.log('driver_cancelled_notify===')
    }

    const customer_onride_notify = (notification) => {
        console.log('customer_onride_notify notification=', notification)
        // Update newRideRequest state with relevant data
        setNewRideRequest({
            ...notification, // Keep the existing notification data
            titleText: 'Your trip has started', // Set title based on action
        })

        if (mapRef.current) {
            const driverLocationLat = notification?.driver_location_lat
            const driverLocationLong = notification?.driver_location_long
            // const riderPickupLocationLat = notification?.pickup_lat
            // const riderPickupLocationLng = notification?.pickup_long
            const riderDropoffLocationLat = notification?.dropoff_lat
            const riderDropoffLocationLng = notification?.dropoff_long

            // Get destination coordinates from the push data
            const destinationLat = parseFloat(notification?.dropoff_lat)
            const destinationLng = parseFloat(notification?.dropoff_long)

            if (
                // riderPickupLocationLat &&
                // riderPickupLocationLng &&
                driverLocationLat &&
                driverLocationLong &&
                riderDropoffLocationLat &&
                riderDropoffLocationLng
            ) {
                // Calculate the center of the region (midpoint between pickup and dropoff)
                const centerLat =
                    (driverLocationLat + riderDropoffLocationLat) / 2
                const centerLng =
                    (driverLocationLong + riderDropoffLocationLng) / 2

                // Calculate the lat/lng difference between pickup and dropoff
                const latDiff = Math.abs(
                    driverLocationLat - riderDropoffLocationLat,
                )
                const lngDiff = Math.abs(
                    driverLocationLong - riderDropoffLocationLng,
                )

                // Add a small margin to account for the visible region
                const latitudeDelta = latDiff + 0.1
                const longitudeDelta = lngDiff + 0.1

                const adjustedCenterLat = centerLat - latDiff * 0.2

                // Zoom in the map to focus on driver and pickup location
                mapRef.current.animateToRegion({
                    latitude: adjustedCenterLat,
                    longitude: centerLng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                })
            }
        }

        // Show modal with updated data and sound
        showDriverOnWayModal('ride_alloc.mp3', notification.action)
        Alert.alert(
            'Trip Begin',
            'Your trip has started. I hope you will have a good time ',
            [
                {
                    text: 'OK',
                    onPress: () => setShowDriverAssignedModal(false), // Close alert
                },
            ],
            { cancelable: false }, // Prevents dismissing by tapping outside
        )
    }

    const driver_arrived_notify = (notification) => {
        console.log('driver_arrived_notify notification=', notification)
        setNewRideRequest({
            ...notification,
            titleText: 'Driver has arrived, Meet him',
        })

        // here is new code
        if (mapRef.current) {
            const driverLocationLat = notification?.driver_location_lat
            const driverLocationLong = notification?.driver_location_long
            const riderPickupLocationLat = notification?.pickup_lat
            const riderPickupLocationLng = notification?.pickup_long
            const riderDropoffLocationLat = notification?.dropoff_lat
            const riderDropoffLocationLng = notification?.dropoff_long

            // Get destination coordinates from the push data
            const destinationLat = parseFloat(notification?.dropoff_lat)
            const destinationLng = parseFloat(notification?.dropoff_long)

            if (
                riderPickupLocationLat &&
                riderPickupLocationLng &&
                riderDropoffLocationLat &&
                riderDropoffLocationLng
            ) {
                // Calculate the center of the region (midpoint between pickup and dropoff)
                const centerLat =
                    (riderPickupLocationLat + riderDropoffLocationLat) / 2
                const centerLng =
                    (riderPickupLocationLng + riderDropoffLocationLng) / 2

                // Calculate the lat/lng difference between pickup and dropoff
                const latDiff = Math.abs(
                    riderPickupLocationLat - riderDropoffLocationLat,
                )
                const lngDiff = Math.abs(
                    riderPickupLocationLng - riderDropoffLocationLng,
                )

                // Add a small margin to account for the visible region
                const latitudeDelta = latDiff + 0.1
                const longitudeDelta = lngDiff + 0.1

                const adjustedCenterLat = centerLat - latDiff * 0.2

                // Zoom in the map to focus on driver and pickup location
                mapRef.current.animateToRegion({
                    latitude: adjustedCenterLat,
                    longitude: centerLng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                })
            }
        }
        setHideDirections(false)
        showDriverOnWayModal('ride_alloc.mp3', notification.action)
        Alert.alert(
            'Driver has arrived',
            'Driver is waiting for you ',
            [
                {
                    text: 'OK',
                    onPress: () => setShowDriverAssignedModal(false), // Close alert
                },
            ],
            { cancelable: false }, // Prevents dismissing by tapping outside
        )
    }

    // const driver_arrived_notify = (notification) => {
    //     console.log('driver_arrived_notify notification=', notification)
    //     setNewRideRequest({
    //         ...notification,
    //         titleText: 'Driver has arrived, Meet him',
    //     })

    //     // here is new code
    //     if (mapRef.current) {
    //         const driverLocationLat = notification?.driver_location_lat
    //         const driverLocationLong = notification?.driver_location_long
    //         const riderPickupLocationLat = notification?.pickup_lat
    //         const riderPickupLocationLng = notification?.pickup_long
    //         const riderDropoffLocationLat = notification?.dropoff_lat
    //         const riderDropoffLocationLng = notification?.dropoff_long

    //         // Get destination coordinates from the push data
    //         const destinationLat = parseFloat(notification?.dropoff_lat)
    //         const destinationLng = parseFloat(notification?.dropoff_long)

    //         if (
    //             // driverLocationLat &&
    //             // driverLocationLong &&
    //             riderPickupLocationLat &&
    //             riderPickupLocationLng &&
    //             riderDropoffLocationLat &&
    //             riderDropoffLocationLng
    //         ) {
    //             // Calculate the center of the region (midpoint between driver and pickup)
    //             const centerLat =
    //                 (riderPickupLocationLat + riderDropoffLocationLat) / 2
    //             const centerLng =
    //                 (riderPickupLocationLng + riderDropoffLocationLng) / 2

    //             // Calculate the lat/lng difference between driver and pickup
    //             const latDiff = Math.abs(
    //                 riderPickupLocationLat - riderDropoffLocationLat,
    //             )
    //             const lngDiff = Math.abs(
    //                 riderPickupLocationLng - riderDropoffLocationLng,
    //             )

    //             // Set dynamic deltas (latitudeDelta and longitudeDelta)
    //             const latitudeDelta = latDiff + 0.05
    //             const longitudeDelta = lngDiff + 0.05

    //             // Zoom in the map to focus on driver and pickup location
    //             mapRef.current.animateToRegion({
    //                 latitude: centerLat,
    //                 longitude: centerLng,
    //                 latitudeDelta: latitudeDelta,
    //                 longitudeDelta: longitudeDelta,
    //             })
    //         }
    //     }

    //     showDriverOnWayModal('ride_alloc.mp3', notification.action)
    //     Alert.alert(
    //         'Driver has arrived',
    //         'Driver is waiting for you ',
    //         [
    //             {
    //                 text: 'OK',
    //                 onPress: () => setShowDriverAssignedModal(false), // Close alert
    //             },
    //         ],
    //         { cancelable: false }, // Prevents dismissing by tapping outside
    //     )
    // }

    // const driver_bid_notify = (notifications) => {
    //     console.log('notification of driver bid', notifications)
    //     const notificationArray = Array.isArray(notifications)
    //         ? notifications
    //         : [notifications] // If not an array, wrap it in an array
    //     console.log('notificationArray.length', notificationArray.length)
    //     // Iterate over each notification
    //     notificationArray.forEach((push_data) => {
    //         // Ensure that push_data is an object, as expected
    //         if (typeof push_data === 'object') {
    //             console.log('Processing push_data:', push_data)

    //             // Set the pickup location of the rider
    //             const riderPickupLocationLat = parseFloat(push_data.pickup_lat)
    //             const riderPickupLocationLng = parseFloat(push_data.pickup_long)

    //             const driverLat = parseFloat(push_data.driver_location_lat)
    //             const driverLng = parseFloat(push_data.driver_location_long)

    //             if (driverLat && driverLng) {
    //                 // Calculate distance using Haversine formula
    //                 const distance = haversine(
    //                     driverLat,
    //                     driverLng,
    //                     riderPickupLocationLat,
    //                     riderPickupLocationLng,
    //                 )

    //                 // Convert distance to the desired unit (km or miles)
    //                 let distanceInUnit = distance
    //                 if (push_data.dist_unit === 1) {
    //                     distanceInUnit = distance * 0.621371 // Convert to miles
    //                 }

    //                 // Calculate time in minutes
    //                 const timeToPickup = calculateTime(distanceInUnit)

    //                 // Update the push_data with distance and time
    //                 push_data.distance = distanceInUnit.toFixed(2)
    //                 push_data.time_to_pickup = timeToPickup

    //                 // Update the state to display the new ride requests

    //                 // setDriverRequests((prevRequests) => [
    //                 //     ...prevRequests,
    //                 //     ...[push_data], // Add new ride request
    //                 // ])
    //                 setDriverRequests((prevRequests) => {
    //                     // Filter out any request with the same driver_id
    //                     // this will check if we have already driver id in array then it will not add new request otherwise it will add new request of other driver to prevent duplication
    //                     const isDuplicate = prevRequests.some(
    //                         (item) => item.driver_id === push_data.driver_id,
    //                     )

    //                     if (isDuplicate) {
    //                         // If duplicate, return the previous state unchanged
    //                         return prevRequests
    //                     }

    //                     // If not duplicate, add the new request
    //                     return [...prevRequests, push_data]
    //                 })
    //                 setIsDriverBid(false)
    //                 // Adjust the map camera to the rider's location (if needed)
    //                 if (mapRef.current) {
    //                     mapRef.current.animateToRegion({
    //                         latitude: riderPickupLocationLat,
    //                         longitude: riderPickupLocationLng,
    //                         destination_lat: push_data?.dropoff_lat,
    //                         destination_lng: push_data?.dropoff_long,
    //                         // latitudeDelta: 0.01,
    //                         // longitudeDelta: 0.01,
    //                         latitudeDelta: 0.09,
    //                         longitudeDelta: 0.09,
    //                     })
    //                 }
    //             }
    //         } else {
    //             console.log(
    //                 'Expected an object for push_data, but got:',
    //                 push_data,
    //             )
    //         }
    //     })
    // }

    const driver_bid_notify = (notifications) => {
        console.log('notification of driver bid', notifications)
        const notificationArray = Array.isArray(notifications)
            ? notifications
            : [notifications] // If not an array, wrap it in an array
        console.log('notificationArray.length', notificationArray.length)
        // Iterate over each notification
        notificationArray.forEach((push_data) => {
            // Ensure that push_data is an object, as expected
            if (typeof push_data === 'object') {
                console.log('Processing push_data:', push_data)

                // Set the pickup location of the rider
                const riderPickupLocationLat = parseFloat(push_data.pickup_lat)
                const riderPickupLocationLng = parseFloat(push_data.pickup_long)

                const driverLat = parseFloat(push_data.driver_location_lat)
                const driverLng = parseFloat(push_data.driver_location_long)

                if (driverLat && driverLng) {
                    // Calculate distance using Haversine formula
                    const distance = haversine(
                        driverLat,
                        driverLng,
                        riderPickupLocationLat,
                        riderPickupLocationLng,
                    )

                    // Convert distance to the desired unit (km or miles)
                    let distanceInUnit = distance
                    if (push_data.dist_unit === 1) {
                        distanceInUnit = distance * 0.621371 // Convert to miles
                    }

                    // Calculate time in minutes
                    const timeToPickup = calculateTime(distanceInUnit)

                    // Update the push_data with distance and time
                    push_data.distance = distanceInUnit.toFixed(2)
                    push_data.time_to_pickup = timeToPickup

                    // Update the state to display the new ride requests
                    setDriverRequests((prevRequests) => {
                        const isDuplicate = prevRequests.some(
                            (item) => item.driver_id === push_data.driver_id,
                        )

                        if (isDuplicate) {
                            return prevRequests
                        }

                        return [...prevRequests, push_data]
                    })
                    setIsDriverBid(false)

                    // Adjust the map camera to the rider's location (if needed)
                    if (mapRef.current) {
                        // Get destination coordinates from the push data
                        const destinationLat = parseFloat(
                            push_data?.dropoff_lat,
                        )
                        const destinationLng = parseFloat(
                            push_data?.dropoff_long,
                        )

                        if (
                            riderPickupLocationLat &&
                            riderPickupLocationLng &&
                            destinationLat &&
                            destinationLng
                        ) {
                            // Calculate the center of the region (midpoint)
                            const centerLat =
                                (riderPickupLocationLat + destinationLat) / 2
                            const centerLng =
                                (riderPickupLocationLng + destinationLng) / 2

                            // Calculate the lat/lng difference between pickup and destination
                            const latDiff = Math.abs(
                                riderPickupLocationLat - destinationLat,
                            )
                            const lngDiff = Math.abs(
                                riderPickupLocationLng - destinationLng,
                            )

                            // Set dynamic deltas (latitudeDelta and longitudeDelta)
                            const latitudeDelta = latDiff + 0.05 // Adding some buffer to the region
                            const longitudeDelta = lngDiff + 0.05 // Adding some buffer to the region

                            mapRef.current.animateToRegion({
                                latitude: centerLat,
                                longitude: centerLng,
                                latitudeDelta: latitudeDelta,
                                longitudeDelta: longitudeDelta,
                            })
                        }
                    }
                }
            } else {
                console.log(
                    'Expected an object for push_data, but got:',
                    push_data,
                )
            }
        })
    }

    // console.log('driverRequest===', driverRequests)
    const renderItem = ({ item }) => {
        // If this driver card is in the closed list, do not render it
        // if (closedDriverIds.includes(item.driver_id)) {
        //     console.log('item.driver_id===', item.driver_id, closedDriverIds)
        //     return null // Do not render the card
        // }

        return (
            <DriverCard
                item={item}
                onReject={onReject}
                onClose={() => handleCloseDriverCard(item.driver_id)}
                clearData={() => {
                    setDriverRequests([])
                }}
            />
        )
    }

    const driver_assigned_notify = (notification) => {
        console.log('noti-driver_assigned_notify', notification)
        setShowDriverOnWay(true)
        setNewRideRequest({
            ...notification, // Keep the existing notification data
            titleText: 'Driver is on his way', // Set title based on action
        })

        if (mapRef.current) {
            const driverLocationLat = notification?.driver_location_lat
            const driverLocationLong = notification?.driver_location_long
            const riderPickupLocationLat = notification?.pickup_lat
            const riderPickupLocationLng = notification?.pickup_long

            // Get destination coordinates from the push data
            const destinationLat = parseFloat(notification?.dropoff_lat)
            const destinationLng = parseFloat(notification?.dropoff_long)

            if (
                driverLocationLat &&
                driverLocationLong &&
                riderPickupLocationLat &&
                riderPickupLocationLng
            ) {
                // Calculate the center of the region (midpoint between driver and pickup)
                const centerLat =
                    (driverLocationLat + riderPickupLocationLat) / 2
                const centerLng =
                    (driverLocationLong + riderPickupLocationLng) / 2

                // Calculate the lat/lng difference between driver and pickup
                const latDiff = Math.abs(
                    driverLocationLat - riderPickupLocationLat,
                )
                const lngDiff = Math.abs(
                    driverLocationLong - riderPickupLocationLng,
                )

                // Set dynamic deltas (latitudeDelta and longitudeDelta)
                const latitudeDelta = latDiff + 0.05 // Adding some buffer to the region
                const longitudeDelta = lngDiff + 0.05 // Adding some buffer to the region

                // Zoom in the map to focus on driver and pickup location
                mapRef.current.animateToRegion({
                    latitude: centerLat,
                    longitude: centerLng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                })
            }
        }
        setHideDirections(true)
        showDriverOnWayModal('ride_alloc.mp3', notification.action)
        Alert.alert(
            'Driver Assigned',
            'A driver has been assigned to you and is on his way.',
            [
                {
                    text: 'OK',
                    onPress: () => setShowDriverAssignedModal(false), // Close alert
                },
            ],
            { cancelable: false }, // Prevents dismissing by tapping outside
        )
    }

    const accept_driver_bid_notify = (notification) => {
        console.log('notifi=', notification)
        setShowDriverOnWay(true)
        setNewRideRequest({
            ...notification, // Keep the existing notification data
            titleText: 'Driver is on his way', // Set title based on action
        })

        // if (mapRef.current) {
        //     mapRef.current.animateToRegion({
        //         latitude: notification?.driver_location_lat,
        //         longitude: notification?.driver_location_long,
        //         // latitudeDelta: 0.01,
        //         // longitudeDelta: 0.01,
        //         latitudeDelta: 0.9,
        //         longitudeDelta: 0.9,
        //     })
        // }
        if (mapRef.current) {
            const driverLocationLat = notification?.driver_location_lat
            const driverLocationLong = notification?.driver_location_long

            const riderPickupLocationLat = notification?.pickup_lat
            const riderPickupLocationLng = notification?.pickup_long

            // Get destination coordinates from the push data
            const destinationLat = parseFloat(notification?.dropoff_lat)
            const destinationLng = parseFloat(notification?.dropoff_long)

            if (
                driverLocationLat &&
                driverLocationLong &&
                destinationLat &&
                destinationLng
            ) {
                // Calculate the center of the region (midpoint)
                const centerLat =
                    (driverLocationLat + riderPickupLocationLat) / 2
                const centerLng =
                    (driverLocationLong + riderPickupLocationLng) / 2

                // Calculate the lat/lng difference between pickup and destination
                const latDiff = Math.abs(
                    driverLocationLat - riderPickupLocationLng,
                )
                const lngDiff = Math.abs(driverLocationLong - destinationLng)

                // Set dynamic deltas (latitudeDelta and longitudeDelta)
                const latitudeDelta = latDiff + 0.05 // Adding some buffer to the region
                const longitudeDelta = lngDiff + 0.05 // Adding some buffer to the region

                mapRef.current.animateToRegion({
                    latitude: centerLat,
                    longitude: centerLng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                })
            }
        }
        showDriverOnWayModal('ride_alloc.mp3', notification.action)
        Alert.alert(
            'Driver Assigned',
            'A driver has been assigned to you and is on his way.',
            [
                {
                    text: 'OK',
                    onPress: () => setShowDriverAssignedModal(false), // Close alert
                },
            ],
            { cancelable: false }, // Prevents dismissing by tapping outside
        )
    }

    const syncServer = async () => {
        const body = new URLSearchParams({
            action: 'syncservertime',
        }).toString()

        try {
            const response = await Post({ data: body }) // Assuming `Post` is your function to make a POST request
            if (response && response.server_time) {
                const serverTime = response.server_time // Assuming server returns a field called `server_time`
                const currentLocalTime = Date.now()
                const timeDiff = serverTime - currentLocalTime // Difference in milliseconds
                setServerClientTimeDiff(timeDiff)
                // console.log('Server time diff:', timeDiff)
            }
        } catch (error) {
            console.log('Error syncing server time:', error)
        }
    }

    const sound = new Sound('ride-alloc.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            // console.log('Error loading sound', error)
        }
    })

    const playSound = (soundFile) => {
        // Load the sound file
        const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                // console.log(`Failed to load sound: ${error}`)
                return
            }
            sound.play((success) => {
                if (success) {
                    // console.log(`Played sound: ${soundFile}`)
                } else {
                    console.log('Playback failed due to audio decoding errors')
                }
            })
        })
    }

    const showDriverOnWayModal = (soundFile, action) => {
        // setShowDriverOnWay(true)
        playSound(soundFile) // Play the sound

        // Set titleText based on action
        let titleText = 'Driver is on his way' // Default title

        // Dynamically change titleText based on the action
        switch (action) {
            case 'accept-driver-bid-notify':
                titleText = 'Driver is on his way'
                break
            case 'driver-arrived':
                titleText = 'Driver has arrived, Meet him'
                break
            case 'customer-onride':
                titleText = 'Your trip has started'
                break
            default:
                titleText = 'Action not recognized' // Default if no action matches
                break
        }

        // Update newRideRequest with the new titleText
        setNewRideRequest((prevRequest) => ({
            ...prevRequest,
            titleText,
        }))
    }

    const showModal = (soundFile) => {
        setIsModalVisible(true) // Show the modal
        playSound(soundFile) // Play the sound
    }

    const booking_allocate_notify = (notification) => {
        const push_data = notification

        // Set the pickup location of the rider
        const riderPickupLocationLat = parseFloat(push_data.p_lat)
        const riderPickupLocationLng = parseFloat(push_data.p_lng)

        const driverLat = parseFloat(push_data.d_lat)
        const driverLng = parseFloat(push_data.d_lng)

        if (driverLat && driverLng) {
            // Calculate distance using Haversine formula
            const distance = haversine(
                driverLat,
                driverLng,
                riderPickupLocationLat,
                riderPickupLocationLng,
            )

            // Convert distance to desired unit (km or miles)
            let distanceInUnit = distance
            if (push_data.dist_unit === 1) {
                // 1 indicates miles
                distanceInUnit = distance * 0.621371 // Convert to miles
            }

            // Calculate time in minutes
            const timeToPickup = calculateTime(distanceInUnit)

            // Update the push_data with distance and time
            push_data.distance = distanceInUnit.toFixed(2)
            push_data.time_to_pickup = timeToPickup

            // Send the data to setNewRideRequest and display modal
            setNewRideRequest(push_data)

            showModal('ride_alloc.mp3')

            // Update rider's position on the map (if required)
            if (riderPickupMarker) {
                riderPickupMarker.setPosition({
                    lat: riderPickupLocationLat,
                    lng: riderPickupLocationLng,
                })
                // } else {
                setRiderPickupMarker(
                    new Marker({
                        position: {
                            lat: riderPickupLocationLat,
                            lng: riderPickupLocationLng,
                        },
                        icon: 'path/to/pick-up-pin.png',
                        animation: 'DROP',
                    }),
                )
            }

            // Adjust the map camera to the rider's location
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: riderPickupLocationLat,
                    longitude: riderPickupLocationLng,
                    // latitudeDelta: 0.01,
                    // longitudeDelta: 0.01,
                    latitudeDelta: 1.0,
                    longitudeDelta: 1.0,
                })
            }
        }
    }

    ////// Yahan khatm /////////

    useEffect(() => {
        // Set the status bar to be translucent, allowing the map to go under it.
        StatusBar.setTranslucent(true)
        StatusBar.setBackgroundColor('transparent')
    }, [])

    // Show content after 5 seconds
    useEffect(() => {
        handleRoute()
        const timer = setTimeout(() => {
            setMorningContainer(true)
        }, 5000)

        return () => {
            clearTimeout(timer)
        }
    }, [])

    // Simulate the shimmer effect for 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsShimmering(false)
        }, 8000)

        return () => clearTimeout(timer) // Clean up the timer when the component unmounts
    }, [])

    useEffect(() => {
        if (origin && destination) {
            const timer = setTimeout(() => {
                setShowDirections(true)
            }, 6000)
            return () => clearTimeout(timer)
        }
    }, [origin, destination])

    useEffect(() => {
        if (origin && destination && mapRef.current) {
            // Calculate the bounds to include both the origin and destination
            const latitudes = [origin.latitude, destination.latitude]
            const longitudes = [origin.longitude, destination.longitude]

            // Get the minimum and maximum latitudes and longitudes
            const minLat = Math.min(...latitudes)
            const maxLat = Math.max(...latitudes)
            const minLng = Math.min(...longitudes)
            const maxLng = Math.max(...longitudes)

            // Define the bounding region to ensure both points and the line are visible
            const padding = 0.1 // Some padding to avoid edge clipping
            const region = {
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2,
                latitudeDelta: maxLat - minLat + padding,
                longitudeDelta: maxLng - minLng + padding,
            }

            // Animate map camera to include both origin and destination with a zoom-out effect
            mapRef.current.animateToRegion(region, 1000) // Zoom-out effect

            // After the zoom-out animation, apply a zoom-in effect to make the map look like it's bouncing back
            setTimeout(() => {
                const zoomInRegion = {
                    latitude: region.latitude,
                    longitude: region.longitude,
                    latitudeDelta: region.latitudeDelta * 0.6, // Zoom in a little
                    longitudeDelta: region.longitudeDelta * 0.6, // Zoom in a little
                }

                // Animate the camera to zoom in (bounce-back effect)
                mapRef.current.animateToRegion(zoomInRegion, 500) // Shorter zoom-in duration
            }, 1000) // Wait for 1 second before applying the zoom-in (bounce-back effect)
        }
    }, [origin, destination])

    useEffect(() => {
        const interval = setInterval(() => {
            setStrokeColor((prev) =>
                prev === 'black' ? 'lightcoral' : 'black',
            )
        }, 1000)
        return () => clearInterval(interval) // Cleanup on unmount
    }, [])

    const showAlert = (data) => {
        console.log('Alerttttttttttt', data)
        if (data) {
            setNewRideRequest(data)
            setIsModalVisible(true)
        }
    }

    // Animate code
    const animateToRegion = () => {
        if (mapRef.current) {
            mapRef.current.animateCamera(
                {
                    center: {
                        latitude: origin?.latitude || 33.6844, // Use origin as center
                        longitude: origin?.longitude || 73.0479,
                    },
                    pitch: 0,
                    heading: 0,
                    altitude: 1000,
                    zoom: 18,
                },
                { duration: 2000 },
            )
        }
    }

    const onMapReady = () => {
        // Add a delay of 1 second before calling animateToRegion
        setTimeout(() => {
            animateToRegion()
        }, 1000) // Delay in milliseconds
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setStrokeColor((prev) =>
                prev === 'black' ? 'lightcoral' : 'black',
            )
        }, 1000) // Change color every second
        return () => clearInterval(interval) // Cleanup on unmount
    }, [])

    const onLayout = (event) => {
        const { width, height } = event.nativeEvent.layout
        setMapDimensions({ width, height })
    }

    useEffect(() => {
        getLocation()
    }, [])

    useEffect(() => {
        const { secondLocation, showModal } = route.params || {}

        if (secondLocation) {
            setDestination(secondLocation)
        }
        if (showModal) {
            setModalVisible(true)
        }

        // Animate to initial region and then zoom in
        if (mapRef.current && origin) {
            const initialRegion = {
                latitude: origin?.latitude,
                longitude: origin?.longitude,
                latitudeDelta: 0.09,
                longitudeDelta: 0.04,
            }

            // Animate to initial region
            mapRef.current.animateToRegion(initialRegion, 100)

            // Zoom in after the initial animation
            setTimeout(() => {
                mapRef.current.animateToRegion(
                    {
                        ...initialRegion,
                        latitudeDelta: 0.01, // Smaller delta for closer zoom
                        longitudeDelta: 0.01,
                    },
                    100, // Duration of zoom-in animation in milliseconds
                )
            }, 100) // Delay the zoom-in animation to start after the initial animation
        }
    }, [route.params])

    const isFocused = useIsFocused()
    useEffect(() => {
        handleRoute()
    }, [isFocused])

    const handleMapPress = async (latitude, longitude) => {
        try {
            const response = await Geocoder.from(latitude, longitude)
            const address = response.results[0].formatted_address

            setUserAddress(address)
        } catch (error) {
            console.error('Geocoder error:', error)
            Alert.alert('Error', 'Unable to retrieve address')
        }
    }
    const handleBlueAreaClick = async () => {
        try {
            // Geocode the address to get the latitude and longitude
            const geoResponse = await Geocoder.from(
                'BlueArea, Islamabad, Pakistan',
            )
            const { lat, lng } = geoResponse.results[0].geometry.location

            // Set the destination to the geocoded location
            const newDestination = {
                latitude: lat,
                longitude: lng,
            }
            setDestination(newDestination)

            // Calculate the distance between origin and destination
            const calculatedDistance = haversineDistance(
                origin?.latitude,
                origin?.longitude,
                newDestination?.latitude,
                newDestination?.longitude,
            )
            setDistance(calculatedDistance)

            if (mapRef.current) {
                // Step 1: Animate to the destination
                mapRef.current.animateToRegion(
                    {
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    },
                    1000, // Duration of animation in milliseconds
                )

                // Step 2: Zoom out to show both origin and destination
                setTimeout(() => {
                    const latitudes = [origin?.latitude, lat]
                    const longitudes = [origin?.longitude, lng]

                    const latitudeDelta =
                        Math.max(...latitudes) - Math.min(...latitudes) + 0.1 // Add some padding
                    const longitudeDelta =
                        Math.max(...longitudes) - Math.min(...longitudes) + 0.1 // Add some padding

                    const newRegion = {
                        latitude:
                            (Math.max(...latitudes) + Math.min(...latitudes)) /
                            2,
                        longitude:
                            (Math.max(...longitudes) +
                                Math.min(...longitudes)) /
                            2,
                        latitudeDelta,
                        longitudeDelta,
                    }

                    // Animate to new region that includes both origin and destination
                    mapRef.current.animateToRegion(newRegion, 1000)

                    // Step 3: Additional zoom out for better view
                    setTimeout(() => {
                        // Further zoom out to ensure full view
                        const additionalLatitudeDelta = latitudeDelta * 0.6 // Increase the delta for more zoom-out
                        const additionalLongitudeDelta = longitudeDelta * 0.6 // Increase the delta for more zoom-out

                        const finalRegion = {
                            latitude: newRegion.latitude,
                            longitude: newRegion.longitude,
                            latitudeDelta: additionalLatitudeDelta,
                            longitudeDelta: additionalLongitudeDelta,
                        }

                        mapRef.current.animateToRegion(finalRegion, 1000)

                        // Show the modal after the final zoom-out animation completes
                        setTimeout(() => {
                            setModalVisible(true)
                        }, 1000) // Delay to ensure the final zoom-out animation completes before showing the modal
                    }, 1000) // Delay to ensure the zoom-out animation completes before further zooming out
                }, 1000) // Delay to ensure the map animation to the destination completes before zooming out
            }
            // call firebase save data function
            // saveData()
        } catch (error) {
            console.log('Geocoding error:', error)
        }
    }
    const handleRoute = () => {
        if (route?.params) {
            setRouteValue(route?.params)
        }
    }

    const getLocation = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
        })
            .then((location) => {
                console.log('Location:', location)
                setOrigin({
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                })

                // Send this location to the backend to get available drivers
                const body = {
                    city: 1,
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    priority_driver: 0,
                }
                setInterval(() => {
                    handleTest(body)
                }, 10000)
            })
            .catch((error) => {
                console.log('Location Error:', error.code, error.message)
                setError('Failed to get location.')
            })
    }

    // Fetch drivers' locations
    const handleTest = async (data) => {
        const sess_id = await getSessionId() // Assuming this is a function that gets the session ID

        const url = `${RIDER_BASE_URL}?sess_id=${sess_id}&action_get=getavailablecitydrivers&city=${data?.city}&pickup_location[lat]=${data?.latitude}&pickup_location[lng]=${data?.longitude}&priority_driver=${data?.priority_driver}`

        try {
            const response = await axios.get(url)
            const driversLocations = response?.data?.drivers_locations || []
            setDriverLocations(driversLocations)

            // Animate the markers gradually when their location changes
            if (driversLocations.length > 0) {
                driversLocations.forEach((driver, index) => {
                    const newLat = parseFloat(driver?.position?.lat)
                    const newLng = parseFloat(driver?.position?.lng)

                    if (!isNaN(newLat) && !isNaN(newLng)) {
                        // Animate marker only if position has changed
                        const currentMarkerRef = markerRefs.current[index]

                        if (currentMarkerRef) {
                            const currentCoord =
                                currentMarkerRef.props.coordinate
                            const distance = Math.sqrt(
                                Math.pow(currentCoord.latitude - newLat, 2) +
                                    Math.pow(
                                        currentCoord.longitude - newLng,
                                        2,
                                    ),
                            )

                            if (distance > 0.0001) {
                                // Animate only if the marker's position changes
                                currentMarkerRef.animateMarkerToCoordinate(
                                    { latitude: newLat, longitude: newLng },
                                    1000, // Adjust the animation duration
                                )
                            }
                        }
                    }
                })
            }
        } catch (error) {
            console.error('Error fetching drivers:', error.message)
            setError('Failed to fetch drivers.')
        }
    }
    const getCurrentDateTime = () => {
        const now = new Date()

        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0') // Months are zero-based
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    const getCurrentDateTimePlusOneHour = () => {
        const now = new Date()

        // Add 1 hour to the current time
        now.setHours(now.getHours() + 1)

        // Format the new time
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')

        // Return the date and time formatted as YYYY-MM-DD HH:mm:ss
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const onBook = async () => {
        try {
            const scheduled = 0
            const dateTimeOneHourAhead = getCurrentDateTimePlusOneHour()
            const currentDateTime = getCurrentDateTime()

            // Define waypoints for the trip
            const wayPoints = {
                'dest-1': {
                    address: routeValue?.pickUpAddreess,
                    lat: routeValue?.picuploactionLatLng?.latitude,
                    lng: routeValue?.picuploactionLatLng?.longitude,
                },
                'dest-2': {
                    address: routeValue?.dropOffAddress,
                    lat: routeValue?.dropOffLoactionLatLng?.latitude,
                    lng: routeValue?.dropOffLoactionLatLng?.longitude,
                },
            }

            // Encrypt the booking price using MD5
            const bookingPrice = selectedVehicle?.npickup_cost
            const encryptedPrice = CryptoJS.MD5(
                'projectgics' + bookingPrice?.toString(),
            ).toString()
            console.log('Encrypted Price:', encryptedPrice)

            // Get session ID
            const sess_id = await getSessionId()

            // Prepare the parameters for the GET request
            const params = {
                action_get: 'newbooking',
                sess_id: sess_id,
                paddress: route?.params.pickUpAddreess,
                daddress: route?.params.dropOffAddress,
                plng: origin?.longitude,
                plat: origin?.latitude,
                dlat: destination?.latitude,
                dlng: destination?.longitude,
                p_type: 1,
                pdatetime: scheduled === 0 ? currentDateTime : currentDateTime,
                ride_id: selectedVehicle?.ride_id,
                route_id: selectedVehicle?.route_id,
                scheduled: 0,
                booking_price: bookingPrice,
                b_token: encryptedPrice,
                multidestination: 0,
                waypoints: JSON.stringify(wayPoints),
                user_bid_fare_val: bookingPrice,
            }

            const queryString = new URLSearchParams(params).toString()
            // Make the GET request with parameters in the URL
            const response = await axios.get(`${RIDER_BASE_URL}?${queryString}`)

            if (response.data?.error) {
                Alert.alert('Error', response.data?.error)
            } else {
                const bookingid = response.data?.new_booking_id
                setBookingId(bookingid)

                // saveData(bookingid)
                if (origin) {
                    // Set the ring position to the center of the map
                    const centerX = mapDimensions.width / 2
                    const centerY = mapDimensions.height / 2

                    setRingPosition({ x: centerX, y: centerY })
                    setShowRings(true)

                    // Hide rings after 30 seconds
                    setTimeout(() => {
                        setShowRings(false)
                    }, 15000)

                    // Close the modal
                    setModalVisible(false)

                    // Change MenuIcon to Cross Button
                    setIsMenuIcon(false)

                    // After 5 seconds, revert back to the MenuIcon
                    setTimeout(() => {
                        setIsMenuIcon(true)
                    }, 10000)
                }
            }
        } catch (error) {
            console.error('Error in booking:', error)
        }
    }

    useEffect(() => {
        // getDatabase()
        requestUserPermission()
        getToken()
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            setMessageData(remoteMessage.notification.body)
        })

        return unsubscribe
    }, [])

    // Set up background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {})

    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission()
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL

        if (enabled) {
            console.log('Authorization status:', authStatus)
        }
    }

    const getToken = async () => {
        const token = await messaging().getToken()
    }

    const getCurrentUnixTimestamp = () => {
        return Math.floor(Date.now() / 1000) // Current timestamp in seconds
    }

    // const saveData = async (bookingid) => {
    //     if (!bookingid) {
    //         console.error('No booking ID available, cannot save data.')
    //         return
    //     }

    //     const currentTimestamp = getCurrentUnixTimestamp()
    //     const bookingPrice = selectedVehicle?.npickup_cost
    //     const encryptedPrice = CryptoJS.MD5(
    //         'projectgics' + bookingPrice?.toString(),
    //     ).toString()

    //     const msgData = {
    //         action: 'driver-allocate',
    //         booking_id: bookingid, // Now bookingId should be set
    //         completion_code: '',
    //         coupon_code: '',
    //         coupon_discount_type: '0',
    //         coupon_discount_value: '0.00',
    //         coupon_max_discount: '0.00',
    //         coupon_min_fare: '0.00',
    //         d_address: route?.params.dropOffAddress,
    //         d_lat: route?.params.dropOffLoactionLatLng.latitude,
    //         d_lng: route?.params.dropOffLoactionLatLng.longitude,
    //         driver_accept_duration: '180',
    //         fare: '179.00',
    //         p_address: route?.params.pickUpAddreess,
    //         p_lat: route?.params.picuploactionLatLng.latitude,
    //         p_lng: route?.params.picuploactionLatLng.longitude,
    //         payment_type: '1',
    //         referral_discount_value: '0.00',
    //         referral_used: newRideRequest?.referral_used,
    //         ride_bid_max_val: '20.0',
    //         ride_bid_min_val: '10.0',
    //         ride_bid_fare: '179.0',
    //         rider_image: user
    //             ? { uri: user?.photo }
    //             : require('../../assets/driver.png'),
    //         rider_name: user?.firstname,
    //         rider_phone: user?.phone,
    //         rider_id: user?.userid,
    //         rider_rating: user?.user_rating,
    //         sent_time: currentTimestamp,
    //         waypoint1_address: '',
    //         waypoint1_lat: '',
    //         waypoint1_long: '',
    //         waypoint2_address: '',
    //         waypoint2_lat: '',
    //         waypoint2_long: '',
    //     }

    //     try {
    //         console.log('====driverLocations====1', driverLocations.length)
    //         if (driverLocations.length > 0) {
    //             // Filter the driverLocations based on the selectedVehicle.ride_type without regex
    //             const filteredDrivers = driverLocations.filter((driver) => {
    //                 const driverTitle = driver.title.toLowerCase() // Normalize driver title to lowercase
    //                 if (selectedVehicle.ride_type === 'Ride A/C') {
    //                     return (
    //                         driverTitle === 'ride a/c' ||
    //                         driverTitle === 'ride' ||
    //                         driverTitle === 'ride mini'
    //                     )
    //                 } else if (selectedVehicle.ride_type === 'Ride') {
    //                     return (
    //                         driverTitle === 'ride' ||
    //                         driverTitle === 'ride mini'
    //                     )
    //                 } else if (selectedVehicle.ride_type === 'Ride Mini') {
    //                     return driverTitle === 'ride mini'
    //                 } else if (selectedVehicle.ride_type === 'Moto') {
    //                     return driverTitle === 'moto'
    //                 } else if (
    //                     selectedVehicle.ride_type === 'Prado Deluxe 12hr'
    //                 ) {
    //                     return driverTitle === 'prado deluxe 12hr'
    //                 }

    //                 return false // Default case if no condition matches
    //             })
    //             // Now loop over the filtered drivers and process them
    //             filteredDrivers.map(async (driver) => {
    //                 const driverId = driver.driver_id
    //                 // Ensure driverId exists before proceeding
    //                 if (!driverId) {
    //                     console.error('Driver ID not found for driver:', driver)
    //                     return
    //                 }

    //                 // Saving data to the database for each driver
    //                 try {
    //                     await database()
    //                         .ref(`/Drivers/drvr-${driverId}/notf/msg`)
    //                         .set(msgData)
    //                     await database()
    //                         .ref(`/Drivers/drvr-${driverId}/notf/msg_t`)
    //                         .set(currentTimestamp)
    //                 } catch (error) {
    //                     console.error(
    //                         'Error saving data for driverId:',
    //                         driverId,
    //                         error,
    //                     )
    //                 }
    //             })
    //         } else {
    //             console.log('No drivers to process.')
    //         }
    //     } catch (error) {
    //         console.error('Error saving data: ', error)
    //     }
    // }

    const handleDeclineBid = async (bookingid) => {
        const sess_id = await getSessionId()
        const url = `${RIDER_BASE_URL}?sess_id=${sess_id}`
        // Define the request body as x-www-form-urlencoded format
        const body = new URLSearchParams({
            action: 'declinebid',
            driver_id: '1', // Make sure driver_id is a string
            bookingid: bookingid, // Make sure bookingid is a string
        }).toString()

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

            // Handle the response data
            if (response.ok) {
                // You can log the response or do something with it
            } else {
                Alert.alert('Error', 'Failed to process the request')
            }
        } catch (error) {
            // Handle any error that occurs during the fetch
            console.error('Error:', error)
            Alert.alert('Error', 'Something went wrong')
        }
    }

    const handleBookingCancelDriverSearch = async () => {
        // Check if bookingid is available in state
        if (bookingId) {
            const sess_id = await getSessionId()
            const url = `${RIDER_BASE_URL}?sess_id=${sess_id}`

            const body = new URLSearchParams({
                action: 'bookingCancelDriverSearch',
                bookingid: bookingId, // Use bookingid from state
            }).toString()

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
                    setShowRings(false) // Hide the rings
                    setShowDirections(false)
                    setDestination(false)
                } else {
                    Alert.alert('Error', 'Failed to process the request')
                }
            } catch (error) {
                console.error('Error:', error)
                Alert.alert('Error', 'Something went wrong')
            }
        } else {
            Alert.alert('Error', 'Booking ID is not available')
        }
    }

    const openNavigator = () => {
        if (origin && destination) {
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`
            Linking.openURL(url).catch((err) =>
                console.error('Error opening Google Maps', err),
            )
        } else {
            console.warn('Origin or destination not set')
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.headerStyle]}>
                {isMenuIcon && !showDriverOnWay ? (
                    <Header
                        menuIconStyle={{
                            zIndex: 9999,
                        }}
                        isMenuIcon={true}
                        isRightView={false}
                    />
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            setIsMenuIcon(true) // Existing logic
                            handleBookingCancelDriverSearch()
                        }}
                        style={styles.crossButton}>
                        <FontAwesome name='times' size={22} color='white' />
                    </TouchableOpacity>
                )}
            </View>

            {/* FlatList Displayed Above the Map */}
            {driverRequests.length > 0 && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10, // Ensure the FlatList is above the map
                        padding: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional background for clarity
                    }}>
                    <FlatList
                        data={driverRequests}
                        renderItem={renderItem}
                        keyExtractor={(item) =>
                            `${item.driver_id}-${Math.random().toString(36).substr(2, 9)}`
                        }
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {origin && (
                <View style={{ flex: 1 }}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        onLayout={onLayout}
                        provider={PROVIDER_GOOGLE}
                        mapType={mapType}
                        initialRegion={{
                            latitude: origin?.latitude || 33.6844,
                            longitude: origin?.longitude || 73.0479,
                            latitudeDelta: 0.06,
                            longitudeDelta: 0.06,
                        }}
                        onMapReady={onMapReady}
                        zoomEnabled>
                        <Marker coordinate={origin}>
                            <Image
                                source={require('../../assets/pick-up-loc-icon.png')}
                                style={styles.markerImage}
                            />
                        </Marker>

                        {destination && (
                            <>
                                <Marker coordinate={destination}>
                                    <Image
                                        source={require('../../assets/drop-off-pin.png')}
                                        style={styles.markerImage}
                                    />
                                </Marker>

                                {!hideStroke &&
                                    !hideDirections &&
                                    showDirections &&
                                    origin &&
                                    destination && (
                                        <MapViewDirections
                                            origin={origin}
                                            destination={destination}
                                            apikey={Google_Maps_Apikey}
                                            strokeColor={strokeColor}
                                            strokeWidth={2.5}
                                        />
                                    )}
                            </>
                        )}

                        {driverLocations.length > 0 &&
                            driverLocations.map((driver, index) => {
                                const latitude = parseFloat(
                                    driver?.position?.lat,
                                )
                                const longitude = parseFloat(
                                    driver?.position?.lng,
                                )

                                if (isNaN(latitude) || isNaN(longitude)) {
                                    console.log(
                                        `Invalid coordinates for driver ${index + 1}`,
                                    )
                                    return null
                                }

                                return (
                                    <Marker
                                        key={index}
                                        ref={(ref) =>
                                            (markerRefs.current[index] = ref)
                                        }
                                        coordinate={{
                                            latitude: latitude,
                                            longitude: longitude,
                                        }}
                                        title={driver?.title}
                                        rotation={driver?.b_angle}
                                        description={`Driver's location`}>
                                        {driver.title === 'Ride Mini' && (
                                            <Image
                                                source={require('../../assets/city-driver-icon-4.png')}
                                                style={styles.markerImage}
                                            />
                                        )}
                                        {driver.title === 'Ride' && (
                                            <Image
                                                source={require('../../assets/city-driver-icon-5.png')}
                                                style={styles.markerImage}
                                            />
                                        )}
                                        {driver.title === 'Ride A/C' && (
                                            <Image
                                                source={require('../../assets/city-driver-icon-1.png')}
                                                style={styles.markerImage}
                                            />
                                        )}
                                        {driver.title === 'Moto' && (
                                            <Image
                                                source={require('../../assets/city-driver-icon-6.png')}
                                                style={styles.markerImage}
                                            />
                                        )}
                                    </Marker>
                                )
                            })}
                    </MapView>
                </View>
            )}

            {showRings && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}>
                    {[...Array(16)].map((_, index) => (
                        <Ring
                            key={index}
                            delay={index * 200}
                            position={ringPosition}
                        />
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.mapToggleButton,
                    { position: 'absolute', right: 10, top: 150 },
                ]} // Positioned on the right side of the map
                onPress={openNavigator}>
                <Text style={styles.mapToggleText}>Navigator</Text>
            </TouchableOpacity>

            {/* Toggle button for map view */}
            <TouchableOpacity
                style={styles.mapToggleButton}
                onPress={() =>
                    setMapType(
                        mapType === 'standard' ? 'satellite' : 'standard',
                    )
                }>
                <Text style={styles.mapToggleText}>
                    {mapType === 'standard'
                        ? 'Satellite View'
                        : 'Standard View'}
                </Text>
            </TouchableOpacity>

            {/* Handle modals */}
            {morningContainer && !showDriverOnWay && (
                <View style={styles.buttonContainer}>
                    <View style={styles.morningContainer}>
                        <Image
                            style={styles.morningPic}
                            source={require('../../assets/afternoon.png')}
                        />

                        <Text style={styles.nameText}>
                            {t('morning_text')}
                            {/* Good morning, Shehroze */}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() =>
                            navigation.navigate('DropOffLocation', {
                                origin,
                                userAddress,
                            })
                        }>
                        <FontAwesome
                            name='search'
                            size={15}
                            color='red'
                            style={{ marginRight: 10 }}
                        />
                        <Text style={styles.buttonText}>
                            {t('search_button_text')}
                            {/* Where do you want to go? */}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button2}
                        onPress={handleBlueAreaClick}>
                        <FontAwesome
                            name='map-marker'
                            size={14}
                            color='red'
                            style={{ marginRight: 10 }}
                        />
                        <Text style={styles.button2Text} numberOfLines={1}>
                            {t('recent_search')}
                            {/* BlueArea, Islamabad, Pakistan */}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* {morningContainer && !showDriverOnWay && (
                <View style={styles.buttonContainer}>
                    <View style={styles.morningContainer}>
                        {isShimmering ? (
                            <ShimmerPlaceHolder
                                style={styles.morningPic}
                                autoRun={true}
                                colorShimmer={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                            />
                        ) : (
                            <Image
                                style={styles.morningPic}
                                source={require('../../assets/afternoon.png')}
                            />
                        )}

                        {isShimmering ? (
                            <ShimmerPlaceHolder
                                style={styles.nameText}
                                autoRun={true}
                                colorShimmer={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                            />
                        ) : (
                            <Text style={styles.nameText}>
                                Good morning, Shehroze
                            </Text>
                        )}
                    </View>

                    {isShimmering ? (
                        <ShimmerPlaceHolder
                            style={styles.button}
                            autoRun={true}
                            colorShimmer={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                        />
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() =>
                                navigation.navigate('DropOffLocation', {
                                    origin,
                                    userAddress,
                                })
                            }>
                            <FontAwesome
                                name='search'
                                size={15}
                                color='red'
                                style={{ marginRight: 10 }}
                            />
                            <Text style={styles.buttonText}>
                                Where do you want to go?
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isShimmering ? (
                        <ShimmerPlaceHolder
                            style={styles.button2}
                            autoRun={true}
                            colorShimmer={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                        />
                    ) : (
                        <TouchableOpacity
                            style={styles.button2}
                            onPress={handleBlueAreaClick}>
                            <FontAwesome
                                name='map-marker'
                                size={14}
                                color='red'
                                style={{ marginRight: 10 }}
                            />
                            <Text style={styles.button2Text} numberOfLines={1}>
                                BlueArea, Islamabad, Pakistan
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )} */}
            {/* Conditionally render DriverOnWay instead of morningContainer */}
            {showDriverOnWay && (
                <DriverOnWay
                    visible={showDriverOnWay}
                    onClose={() => setShowDriverOnWay(false)}
                    newRideRequest={newRideRequest}
                    handleDeclineBid={handleDeclineBid}
                    titleText={newRideRequest.titleText}
                    style={{ pointerEvents: 'auto' }}
                />
            )}

            <CustomModal
                visible={modalVisible}
                onBook={onBook}
                onSelectItem={(option) => setSelectedVehicle(option)}
                onClose={() => setModalVisible(false)}
                navigation={navigation}
                style={{ pointerEvents: 'auto' }} // Allow interactions with the map
            />
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    customMarkerIcon: {
        width: 40,
        height: 40,
    },
    buttonContainer: {
        backgroundColor: '#FFFFFF',
        height: '20%',
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    button: {
        marginLeft: '7%',
        marginTop: '2%',
        alignItems: 'center',
        backgroundColor: '#eff1f2',
        padding: 16,
        width: '85%',
        borderRadius: 5,
        flexDirection: 'row',
    },
    button2: {
        marginLeft: '7%',
        marginTop: '3%',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 6,
        width: '65%',
        borderRadius: 5,
        flexDirection: 'row',
        elevation: 3,
    },
    buttonText: {
        fontWeight: '500',
        color: '#000000',
        fontSize: 16,
    },
    button2Text: {
        color: '#000000',
        fontSize: 14,
    },
    morningContainer: {
        flexDirection: 'row',
        marginTop: -6,
    },
    morningPic: {
        marginTop: 20,
        marginLeft: 25,
        height: 25,
        width: 25,
    },
    nameText: {
        marginTop: 22,
        marginLeft: 15,
        fontSize: 15,
        color: 'grey',
    },
    mapToggleButton: {
        position: 'absolute',
        top: '60%',
        marginLeft: 5,
        backgroundColor: '#FBC02D',
        padding: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    mapToggleText: {
        color: '#000',
        fontWeight: 'bold',
    },
    markerImage: {
        height: 30,
        width: 30,
    },
    distanceContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    distanceText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerStyle: {
        height: 40,
        width: 40,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        position: 'absolute',
        backgroundColor: Color.black,
        top: Platform.OS === 'ios' ? 60 : 50,
        left: 20,
        zIndex: 999999,
    },

    crossButton: {
        position: 'absolute',
        // top: 10,
        // left: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'transparent',
        color: 'yellow',
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerIcon: {
        width: 30,
        height: 30,
    },
    markerText: {
        color: 'black',
    },
    ring: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 10,
        borderColor: 'tomato',
    },
})

export default RiderMapScreen
