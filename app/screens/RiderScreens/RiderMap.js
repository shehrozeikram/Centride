import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";

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
  Modal,
  ActivityIndicator,
  Animated, // Add this import
  Easing, // Add this import
} from "react-native";
import Ring from "../../components/Ring";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MapViewDirections from "react-native-maps-directions";
import CustomModal from "../../modals/CustomModal";
import {
  // useRoute,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import Geocoder from "react-native-geocoding"; // Import geocoding library
import Header from "../../components/Header";
// import Spacing from "../../components/Spacing";
import Color from "../../utils/Color";
import { Post } from "../../network/network";
import axios from "axios";
import GetLocation from "react-native-get-location";

import { RIDER_BASE_URL } from "../../utils/constants";
import { getSessionId } from "../../utils/common";
import CryptoJS from "crypto-js"; // Import crypto-js for MD5 hashing
import messaging from "@react-native-firebase/messaging";
import database from "@react-native-firebase/database";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestTrackingPermission } from "react-native-tracking-transparency";
import Sound from "react-native-sound";
import DriverOnWay from "../../modals/DriverOnWay";
import DriverCard from "../../modals/DriverCard";
import HTMLParser from "react-native-html-parser";
import moment from 'moment-timezone';

import { useTranslation } from "react-i18next";

// const Google_Maps_Apikey = "AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw"; // Replace with your actual API key
import { GOOGLE_MAPS_API_KEY } from "../../constants/googleMapKey";
import Geolocation from "@react-native-community/geolocation";
// Initialize Geocoder with API key

Geocoder.init(GOOGLE_MAPS_API_KEY);

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const calculateTime = (distance) => {
  const avgSpeed = 20; // in km/h
  const timeInHours = distance / avgSpeed; // time in hours
  const timeInMinutes = timeInHours * 60; // convert to minutes
  return Math.round(timeInMinutes); // rounded to the nearest minute
};

const CustomMarker = ({ driver }) => (
  <View style={styles.markerContainer}>
    <Image
      source={{
        uri: "https://t3.ftcdn.net/jpg/01/92/21/40/360_F_192214085_QnQ58x0ZKRLSUEgarcjVHNWrnmH8uWTA.jpg",
      }} // Replace with driver?.icon?.url if dynamic
      style={[
        styles.markerIcon,
        { transform: [{ rotate: `${driver?.b_angle}deg` }] }, // Rotate the icon
      ]}
    />
  </View>
);

const calculateBearing = (startLat, startLng, endLat, endLng) => {
  const startLatRad = startLat * (Math.PI / 180);
  const startLngRad = startLng * (Math.PI / 180);
  const endLatRad = endLat * (Math.PI / 180);
  const endLngRad = endLng * (Math.PI / 180);

  const dLong = endLngRad - startLngRad;
  const y = Math.sin(dLong) * Math.cos(endLatRad);
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
    Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLong);
  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  bearing = (bearing + 360) % 360;

  return bearing;
};

const RiderMapScreen = ({ route }) => {
  const [showViewAlert, setShowViewAlert] = useState(false);
  const { ongoing_bk } = route?.params || {};
  const { isPendingTripCancel } = route?.params || {};

  useEffect(() => {
    if (ongoing_bk && Object.keys(ongoing_bk).length > 0) {
      const timer = setTimeout(() => {
        setShowViewAlert(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [ongoing_bk]);

  const { t, i18n } = useTranslation();
  const { hideStroke } = route.params || { hideStroke: false };
  // const mapRef = useRef(null) // Add a reference for the MapView
  const [origin, setOrigin] = useState();
  const [messageData, setMessageData] = useState(null);
  const [destination, setDestination] = useState(null); // Default to null
  const [modalVisible, setModalVisible] = useState(false);
  const [mapType, setMapType] = useState("standard"); // State for toggling map view
  const [distance, setDistance] = useState(null); // State for distance
  // const route = useRoute()
  const navigation = useNavigation();
  // const [driverLocationsList, setDriverLocations] = useState([])
  const [showDriverOnWay, setShowDriverOnWay] = useState(false);
  const [showDriverAssignedModal, setShowDriverAssignedModal] = useState(false);
  const [newRideRequests, setNewRideRequests] = useState([]);
  const [modalVisibleFlags, setModalVisibleFlags] = useState([]);
  const [routeValue, setRouteValue] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showRings, setShowRings] = useState(false);
  const [morningContainer, setMorningContainer] = useState(false);
  const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [strokeColor, setStrokeColor] = useState("black");
  // const [newRideRequest, setNewRideRequest] = useState(null)
  const [newRideRequest, setNewRideRequest] = useState({ titleText: "" });
  const [showDirections, setShowDirections] = useState(false);
  const [driverLocations, setDriverLocations] = useState([]); // Nearby drivers
  const [error, setError] = useState(null); // To handle errors
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMenuIcon, setIsMenuIcon] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [serverClientTimeDiff, setServerClientTimeDiff] = useState(0);
  const [processedNotifications, setProcessedNotifications] = useState({});
  // new for
  const [hideDirections, setHideDirections] = useState(false);
  const [driverLocationLat, setDriverLocationLat] = useState(null);
  const [driverLocationLong, setDriverLocationLong] = useState(null);
  const [closedDriverIds, setClosedDriverIds] = useState([]);
  const [formattedNotifications, setFormattedNotifications] = useState([]);
  const [driverRequests, setDriverRequests] = useState([]);
  const [rideRequests, setRideRequests] = useState([]); // Store multiple ride requests
  const [currentRideRequestIndex, setCurrentRideRequestIndex] = useState(0);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");
  const [greetingImage, setGreetingImage] = useState(null);
  const [time, setTime] = useState(null);
  const [isBookingDone, setIsBookingDone] = useState(false); // Track if booking is completed
  // const [isPendingTripCancel, setPendingTripCancel] = useState(false);

  // Add these new states near the top with other useState declarations
  const [driverRoute, setDriverRoute] = useState({
    start: null,
    end: null,
    show: false
  });

  const [searchButtonAnim] = useState(new Animated.Value(0));
  const [greetingScale] = useState(new Animated.Value(0));

  // console.log("isPendingTripCancel:", isPendingTripCancel);

  const user = useSelector((state) => state.user?.user);
  const mapRef = useRef(null); // MapView reference
  const markerRefs = useRef({}); // Change to object instead of array

  const prevActionRef = useRef(null);
  const prevMessageRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const [animatedMarkers, setAnimatedMarkers] = useState({});
  const animatedMarkersRef = useRef({});

  useEffect(() => {
    // If the trip is canceled, you may want to hide the driver on the way
    if (isPendingTripCancel) {
      setShowDriverOnWay(false); // Hide the driver on the way if the trip is canceled
    }
  }, [isPendingTripCancel]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      const requestPermission = async () => {
        const permissionStatus = await requestTrackingPermission();
        console.log(permissionStatus);
      };

      requestPermission();
    }
  }, []);

  useEffect(() => {
    userGreeting();
  }, []);

  const handleCloseAlert = () => {
    setShowViewAlert(false);
  };

  useEffect(() => {
    if (showDriverOnWay) {
      setShowRings(false);
      setIsMenuIcon(true);
    }
  }, [showDriverOnWay]);

  // console.log("user-", user);

  const handleCloseDriverCard = (driverId) => {
    setClosedDriverIds((prevClosedIds) => [...prevClosedIds, driverId]);
  };
  const [isDriverBid, setIsDriverBid] = useState(false);
  useEffect(() => {
    if (isDriverBid && formattedNotifications.length > 0) {
      driver_bid_notify(formattedNotifications);
    }
  }, [formattedNotifications, isDriverBid]);
  let count = 0;
  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = user?.userid;
      let reference;

      if (userId) {
        reference = database()
          .ref(`Riders/ridr-${userId}/notf`)
          .on("value", async (snapshot) => {
            const data = snapshot.val();
            const stringValue = JSON.stringify(data.msg_t);
            if (data == null) return;
            if (!(data?.msg && data?.msg_t)) return;

            // Get last message timestamp from AsyncStorage
            const last_msg_time_id = await AsyncStorage.getItem("fb_last_recvd");
            if (data.msg_t === last_msg_time_id) return;

            const lastMsgTimeIdString = last_msg_time_id
              ? last_msg_time_id.toString()
              : null;
            if (data.msg_t.toString() === lastMsgTimeIdString) return;

            // Update last message timestamp in AsyncStorage
            await AsyncStorage.setItem(
              "fb_last_recvd",
              // stringValue,
              // JSON.stringify(data.msg_t),
              data?.msg_t?.toString()
            );

            let current_local_timestamp = Date.now();
            current_local_timestamp += serverClientTimeDiff;
            current_local_timestamp = Math.floor(current_local_timestamp / 1000);

            if (current_local_timestamp - 5 > data.msg_t) return;

            const message = data.msg;

            if (
              message.hasOwnProperty("booking_id") &&
              message.hasOwnProperty("action")
            ) {
              if (message.action === "driver-bid-notify") {
                if (message !== null) {
                  setFormattedNotifications((prevNotifications) => [
                    ...prevNotifications,
                    ...[message],
                  ]);
                }
              }
              // Switch based on action type
              switch (message.action) {
                case "driver-assigned":
                  // accept_driver_bid_notify(message)
                  driver_assigned_notify(message);
                  break;
                case "driver-bid-notify":
                  setIsDriverBid(true);
                  // driver_bid_notify(formattedNotifications)
                  break;
                case "accept-driver-bid-notify":
                  accept_driver_bid_notify(message);
                  break;
                case "driver-arrived":
                  driver_arrived_notify(message);
                  break;
                case "customer-onride":
                  customer_onride_notify(message);
                  break;
                case "driver-complete":
                  driver_complete_notify(message);
                  break;
                case "driver-cancelled":
                  driver_cancelled_notify(message);
                  break;
                case "chat-message":
                  driver_chat_msg_notify(message);
                  break;
                case "app-message":
                  app_message(message);
                  break;
                default:
                  console.log("Unknown action type:", message.action);
                  break;
              }
            }
          });
      }

      // Cleanup function
      return () => {
        if (reference) {
          database().ref(`Riders/ridr-${userId}/notf`).off("value", reference);
        }
      };
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (formattedNotifications.length > 0) {
      console.log("check", count++);
      const processedPairs = new Set();

      const uniqueNotifications = formattedNotifications
        .flat()
        .filter((value) => {
          const pair = `${value.booking_id}-${value.driver_id}`;

          if (processedPairs.has(pair)) {
            return false;
          } else {
            processedPairs.add(pair);
            return true;
          }
        });
      driver_bid_notify(uniqueNotifications);
    }
  }, [formattedNotifications]);

  const driver_complete_notify = (notification) => {
    // console.log(
    //   "Handling driver_complete_notify notification in rider and i came in driver_complete_notify",
    //   notification
    // );
    setDriverRequests([]);
    navigation.navigate("RideCompleted", {
      notification,
    });
    setShowDirections(false);
    setShowDriverOnWay(false);
    setMorningContainer(true);

    console.log("Action being passed to showModal:", notification.action);
  };
  const onReject = (data) => {
    apiData = {
      action: "bookingcancel",
      // driver_id: data?.driver_id,
      // driver_id: data?.driver_id,
      bookingid: data?.booking_id,
    };
    // console.log("apiData", apiData);

    Post({ data: apiData })
      .then((result) => {
        // console.log("result", result);
        const updatedDriverList = driverRequests.filter(
          (item) => item?.driver_id !== data?.driver_id
        );
        setDriverRequests(updatedDriverList);
        const updatedFormatedList = formattedNotifications.filter(
          (item) => item?.driver_id !== data?.driver_id
        );
        setFormattedNotifications(updatedDriverList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const driver_cancelled_notify = (notification) => {
    setShowDriverOnWay(false);
    setShowRings(false);
    setShowDirections(false);
    setDestination(false);
  };

  const customer_onride_notify = (notification) => {
    if (!notification?.driver_location_lat || !notification?.pickup_lat) {
        console.error("Missing location data in notification:", notification);
        return;
    }

    setShowDriverOnWay(true);
    setShowDirections(true);
    setHideDirections(false);
    setBookingId(notification.booking_id);
    setNewRideRequest({
        ...notification,
    });

    if (mapRef.current) {
        try {
            const driverLocationLat = parseFloat(notification?.driver_location_lat);
            const driverLocationLong = parseFloat(notification?.driver_location_long);
            const destinationLat = parseFloat(notification?.dropoff_lat);
            const destinationLng = parseFloat(notification?.dropoff_long);

            if (isNaN(driverLocationLat) || isNaN(driverLocationLong) || 
                isNaN(destinationLat) || isNaN(destinationLng)) {
                console.error("Invalid location data:", notification);
                return;
            }

            // Set origin and destination for the route
            setOrigin({
                latitude: driverLocationLat,
                longitude: driverLocationLong
            });
            setDestination({
                latitude: destinationLat,
                longitude: destinationLng
            });

            // Update stroke color to light blue
            setStrokeColor("#1E90FF");

            // Calculate bearing between points
            const bearing = calculateBearing(
                driverLocationLat,
                driverLocationLong,
                destinationLat,
                destinationLng
            );

            // First animation: Zoom out to show both points
            const zoomOutAnimation = () => {
                const centerLat = (driverLocationLat + destinationLat) / 2;
                const centerLng = (driverLocationLong + destinationLng) / 2;
                const latDiff = Math.abs(driverLocationLat - destinationLat);
                const lngDiff = Math.abs(driverLocationLong - destinationLng);

                mapRef.current.animateCamera({
                    center: {
                        latitude: centerLat,
                        longitude: centerLng
                    },
                    pitch: 45,
                    heading: bearing,
                    zoom: 15,
                    altitude: Math.max(latDiff, lngDiff) * 110000 * 1.2
                }, { duration: 1000 });
            };

            // Second animation: Set street-level view looking down the road
            const adjustViewAnimation = () => {
                setTimeout(() => {
                    // Calculate a slight offset in the direction of travel
                    const offsetMultiplier = 0.0001; // Small offset to position camera slightly behind
                    const latOffset = Math.sin(bearing * Math.PI / 180) * offsetMultiplier;
                    const lngOffset = Math.cos(bearing * Math.PI / 180) * offsetMultiplier;
                    
                    mapRef.current.animateCamera({
                        center: {
                            latitude: driverLocationLat - latOffset, // Position slightly behind the start point
                            longitude: driverLocationLong - lngOffset
                        },
                        pitch: 75, // Higher pitch for more ground-level view
                        heading: bearing,
                        zoom: 18.5, // Closer zoom for street level
                        altitude: 100 // Lower altitude for ground-level perspective
                    }, { duration: 1500 });
                }, 1000);
            };

            // Execute animation sequence
            zoomOutAnimation();
            adjustViewAnimation();

        } catch (error) {
            console.error('Error animating map:', error);
        }
    }

    setHideDirections(false);
    showDriverOnWayModal("ride_alloc.mp3", notification.action);
    Alert.alert(
        "Trip Begin",
        "Your trip has started. I hope you will have a good time",
        [
            {
                text: "OK",
                onPress: () => setShowDriverAssignedModal(false),
            },
        ],
        { cancelable: false }
    );

    // Reset driver route
    setDriverRoute({ start: null, end: null, show: false });
    setShowDirections(true); // Show the actual trip route
};

  const driver_arrived_notify = (notification) => {
    if (!notification?.driver_location_lat || !notification?.pickup_lat) {
        console.error("Missing location data in notification:", notification);
        return;
    }
    
    setShowDriverOnWay(true);
    setShowDirections(false); // Remove directions when driver arrives
    setHideDirections(true);
    
    setNewRideRequest({
        ...notification,
    });

    if (mapRef.current) {
        try {
            const driverLocationLat = parseFloat(notification?.driver_location_lat);
            const driverLocationLong = parseFloat(notification?.driver_location_long);
            const riderPickupLocationLat = parseFloat(notification?.pickup_lat);
            const riderPickupLocationLng = parseFloat(notification?.pickup_long);

            if (isNaN(driverLocationLat) || isNaN(driverLocationLong)) {
                console.error("Invalid driver location data:", notification);
                return;
            }

            // Zoom in to show driver and pickup location more closely
            const centerLat = (driverLocationLat + riderPickupLocationLat) / 2;
            const centerLng = (driverLocationLong + riderPickupLocationLng) / 2;
            const latDiff = Math.abs(driverLocationLat - riderPickupLocationLat);
            const lngDiff = Math.abs(driverLocationLong - riderPickupLocationLng);
            
            // Smaller deltas for closer zoom
            const latitudeDelta = latDiff + 0.02;
            const longitudeDelta = lngDiff + 0.02;

            mapRef.current.animateToRegion({
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta,
                longitudeDelta,
            });
        } catch (error) {
            console.error('Error animating map:', error);
        }
    }

    setHideDirections(true);
    setShowRings(false);
    showDriverOnWayModal("ride_alloc.mp3", notification.action);
    Alert.alert(
        "Driver has arrived",
        "Driver is waiting for you",
        [
            {
                text: "OK",
                onPress: () => setShowDriverAssignedModal(false),
            },
        ],
        { cancelable: false }
    );
};

  const driver_bid_notify = (notifications) => {
    if (!notifications) {
        console.warn('No notifications received');
        return;
    }

    const notificationArray = Array.isArray(notifications) ? notifications : [notifications];
    
    if (notificationArray.length === 0) {
        console.warn('Empty notifications array');
        return;
    }

    // Process each notification safely
    notificationArray.forEach((push_data, index) => {
        if (!push_data || typeof push_data !== 'object') {
            console.warn(`Invalid notification at index ${index}`);
            return;
        }

        // Set the pickup location of the rider
        const riderPickupLocationLat = parseFloat(push_data.pickup_lat);
        const riderPickupLocationLng = parseFloat(push_data.pickup_long);

        const driverLat = parseFloat(push_data.driver_location_lat);
        const driverLng = parseFloat(push_data.driver_location_long);

        if (driverLat && driverLng) {
          // Calculate distance using Haversine formula
          const distance = haversine(
            driverLat,
            driverLng,
            riderPickupLocationLat,
            riderPickupLocationLng
          );

          // Convert distance to the desired unit (km or miles)
          let distanceInUnit = distance;
          if (push_data.dist_unit === 1) {
            distanceInUnit = distance * 0.621371; // Convert to miles
          }

          // Calculate time in minutes
          const timeToPickup = calculateTime(distanceInUnit);

          // Update the push_data with distance and time
          push_data.distance = distanceInUnit.toFixed(2);
          push_data.time_to_pickup = timeToPickup;

          // Update the state to display the new ride requests
          setDriverRequests((prevRequests) => {
            if (!Array.isArray(prevRequests)) {
                return [push_data];
            }
            
            const isDuplicate = prevRequests.some(
                (item) => item?.driver_id === push_data?.driver_id
            );

            if (isDuplicate) {
                return prevRequests;
            }

            // Ensure we're not exceeding array bounds
            const maxRequests = 9; // Set maximum number of requests to store
            const newRequests = [...prevRequests, push_data];
            return newRequests.slice(-maxRequests); // Keep only the latest requests
          });
          setIsDriverBid(false);

          // Adjust the map camera to the rider's location (if needed)
          if (mapRef.current) {
            // Get destination coordinates from the push data
            const destinationLat = parseFloat(push_data?.dropoff_lat);
            const destinationLng = parseFloat(push_data?.dropoff_long);

            if (
              riderPickupLocationLat &&
              riderPickupLocationLng &&
              destinationLat &&
              destinationLng
            ) {
              // Calculate the center of the region (midpoint)
              const centerLat = (riderPickupLocationLat + destinationLat) / 2;
              const centerLng = (riderPickupLocationLng + destinationLng) / 2;

              // Calculate the lat/lng difference between pickup and destination
              const latDiff = Math.abs(riderPickupLocationLat - destinationLat);
              const lngDiff = Math.abs(riderPickupLocationLng - destinationLng);

              // Set dynamic deltas (latitudeDelta and longitudeDelta)
              const latitudeDelta = latDiff + 0.05; // Adding some buffer to the region
              const longitudeDelta = lngDiff + 0.05; // Adding some buffer to the region

              mapRef.current.animateToRegion({
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
              });
            }
          }
        }
    });
  };

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
          setDriverRequests([]);
        }}
      />
    );
  };

  const driver_assigned_notify = (notification) => {
    if (!notification || !notification.driver_location_lat || !notification.pickup_lat) {
        console.warn('Invalid notification data received');
        return;
    }

    // Set driver's current location as origin and pickup location as destination
    const driverLocationLat = parseFloat(notification.driver_location_lat);
    const driverLocationLong = parseFloat(notification.driver_location_long);
    const pickupLocationLat = parseFloat(notification.pickup_lat);
    const pickupLocationLng = parseFloat(notification.pickup_long);

    if (isNaN(driverLocationLat) || isNaN(driverLocationLong) || 
        isNaN(pickupLocationLat) || isNaN(pickupLocationLng)) {
        console.warn('Invalid coordinates');
        return;
    }

    // Calculate distance using haversine formula
    const distance = haversine(
        driverLocationLat,
        driverLocationLong,
        pickupLocationLat,
        pickupLocationLng
    );

    // Calculate estimated time
    const timeToPickup = calculateTime(distance);

    // Update the notification object with distance and time
    const updatedNotification = {
        ...notification,
        titleText: "Driver is on his way",
        distance: distance.toFixed(2),
        time_to_pickup: timeToPickup
    };

    // Set states for map and UI updates
    setNewRideRequest(updatedNotification);
    setShowDirections(true);
    setShowRings(false);
    setShowDriverOnWay(true);

    // Set origin (driver location) and destination (pickup location)
    setOrigin({
        latitude: driverLocationLat,
        longitude: driverLocationLong
    });
    setDestination({
        latitude: pickupLocationLat,
        longitude: pickupLocationLng
    });

    if (mapRef.current) {
        try {
            // First animation: Show both points
            const centerLat = (driverLocationLat + pickupLocationLat) / 2;
            const centerLng = (driverLocationLong + pickupLocationLng) / 2;
            const latDiff = Math.abs(driverLocationLat - pickupLocationLat);
            const lngDiff = Math.abs(driverLocationLong - pickupLocationLng);

            // Calculate bearing for camera orientation
            const bearing = calculateBearing(
                driverLocationLat,
                driverLocationLong,
                pickupLocationLat,
                pickupLocationLng
            );

            // Animate camera to show both points
            mapRef.current.animateCamera({
                center: {
                    latitude: centerLat,
                    longitude: centerLng
                },
                pitch: 45,
                heading: bearing,
                zoom: 15,
                altitude: Math.max(latDiff, lngDiff) * 110000 * 1.2
            }, { 
                duration: 1000,
                onComplete: () => {
                    // Second animation: Zoom in slightly for better view
                    setTimeout(() => {
                        if (mapRef.current) {
                            mapRef.current.animateCamera({
                                center: {
                                    latitude: centerLat,
                                    longitude: centerLng
                                },
                                pitch: 55,
                                heading: bearing,
                                zoom: 16,
                                altitude: Math.max(latDiff, lngDiff) * 110000
                            }, { duration: 1000 });
                        }
                    }, 1000);
                }
            });

            // Update stroke color for the route
            setStrokeColor("#1E90FF");

        } catch (error) {
            console.warn('Error in camera animation:', error);
        }
    }

    // Show modal and play sound
    showDriverOnWayModal("ride_alloc.mp3", "driver-assigned");

    // Show alert to user
    Alert.alert(
        "Driver Assigned",
        `A driver has been assigned and will arrive in approximately ${timeToPickup} minutes (${distance.toFixed(2)} km)`,
        [
            {
                text: "OK",
                onPress: () => setShowDriverAssignedModal(false),
            },
        ],
        { cancelable: false }
    );
};

  const accept_driver_bid_notify = (notification) => {
    console.log("notifi=", notification);
    setShowRings(false);
    setShowDriverOnWay(true);
    setNewRideRequest({
        ...notification,
        titleText: "Driver is on his way",
    });

    // Show directions between driver and pickup location
    setShowDirections(true);
    setHideDirections(false);

    if (mapRef.current) {
        try {
            const driverLocationLat = parseFloat(notification?.driver_location_lat);
            const driverLocationLong = parseFloat(notification?.driver_location_long);
            const riderPickupLocationLat = parseFloat(notification?.pickup_lat);
            const riderPickupLocationLng = parseFloat(notification?.pickup_long);
            const destinationLat = parseFloat(notification?.dropoff_lat);
            const destinationLng = parseFloat(notification?.dropoff_long);

            // Validate coordinates
            if (isNaN(driverLocationLat) || isNaN(driverLocationLong) || 
                isNaN(riderPickupLocationLat) || isNaN(riderPickupLocationLng)) {
                console.warn('Invalid coordinates in notification');
                return;
            }

            // Calculate center point between driver and pickup location
            const centerLat = (driverLocationLat + riderPickupLocationLat) / 2;
            const centerLng = (driverLocationLong + riderPickupLocationLng) / 2;

            // Calculate the lat/lng difference between driver and pickup
            const latDiff = Math.abs(driverLocationLat - riderPickupLocationLat);
            const lngDiff = Math.abs(driverLocationLong - riderPickupLocationLng);

            // Set dynamic deltas to show both driver and pickup location
            const latitudeDelta = latDiff + 0.05;
            const longitudeDelta = lngDiff + 0.05;

            // Animate map to show driver and pickup location
            mapRef.current.animateToRegion({
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta,
                longitudeDelta,
            });

            // Set origin to driver's location and destination to rider's pickup location
            setOrigin({
                latitude: driverLocationLat,
                longitude: driverLocationLong
            });
            setDestination({
                latitude: riderPickupLocationLat,
                longitude: riderPickupLocationLng
            });

        } catch (error) {
            console.error('Error animating map:', error);
        }
    }

    showDriverOnWayModal("ride_alloc.mp3", notification.action);
    Alert.alert(
        "Driver Assigned",
        "A driver has been assigned to you and is on his way.",
        [
            {
                text: "OK",
                onPress: () => setShowDriverAssignedModal(false),
            },
        ],
        { cancelable: false }
    );
};

  const syncServer = async () => {
    const body = new URLSearchParams({
      action: "syncservertime",
    }).toString();

    try {
      const response = await Post({ data: body });
      if (response && response.server_time) {
        const serverTime = response.server_time;
        const currentLocalTime = Date.now();
        const timeDiff = serverTime - currentLocalTime;
        setServerClientTimeDiff(timeDiff);
      }
    } catch (error) {
      console.log("Error syncing server time:", error);
    }
  };

  const sound = new Sound("ride-alloc.mp3", Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      // console.log('Error loading sound', error)
    }
  });

  const playSound = (soundFile) => {
    // Load the sound file
    const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        // console.log(`Failed to load sound: ${error}`)
        return;
      }
      sound.play((success) => {
        if (success) {
          // console.log(`Played sound: ${soundFile}`)
        } else {
          console.log("Playback failed due to audio decoding errors");
        }
      });
    });
  };

  const showDriverOnWayModal = (soundFile, action) => {
    setShowDriverOnWay(true)
    playSound(soundFile); // Play the sound
    // setShowRings(false);
    // Set titleText based on action
    let titleText = "Driver is on his way"; // Default title

    // Dynamically change titleText based on the action
    switch (action) {
      case "accept-driver-bid-notify":
        titleText = "Driver is on his way";
        break;
      case "driver-arrived":
        titleText = "Driver has arrived, Meet him";
        break;
      case "customer-onride":
        titleText = "Your trip has started";
        break;
      default:
        titleText = "Action not recognized"; // Default if no action matches
        break;
    }

    // Update newRideRequest with the new titleText
    setNewRideRequest((prevRequest) => ({
      ...prevRequest,
      titleText,
    }));
  };

  const showModal = (soundFile) => {
    setIsModalVisible(true); // Show the modal
    playSound(soundFile); // Play the sound
  };

  const booking_allocate_notify = (notification) => {
    const push_data = notification;

    // Set the pickup location of the rider
    const riderPickupLocationLat = parseFloat(push_data.p_lat);
    const riderPickupLocationLng = parseFloat(push_data.p_lng);

    const driverLat = parseFloat(push_data.d_lat);
    const driverLng = parseFloat(push_data.d_lng);

    if (driverLat && driverLng) {
      // Calculate distance using Haversine formula
      const distance = haversine(
        driverLat,
        driverLng,
        riderPickupLocationLat,
        riderPickupLocationLng
      );

      // Convert distance to desired unit (km or miles)
      let distanceInUnit = distance;
      if (push_data.dist_unit === 1) {
        // 1 indicates miles
        distanceInUnit = distance * 0.621371; // Convert to miles
      }

      // Calculate time in minutes
      const timeToPickup = calculateTime(distanceInUnit);

      // Update the push_data with distance and time
      push_data.distance = distanceInUnit.toFixed(2);
      push_data.time_to_pickup = timeToPickup;

      // Send the data to setNewRideRequest and display modal
      setNewRideRequest(push_data);

      showModal("ride_alloc.mp3");

      // Update rider's position on the map (if required)
      if (riderPickupMarker) {
        riderPickupMarker.setPosition({
          lat: riderPickupLocationLat,
          lng: riderPickupLocationLng,
        });
        // } else {
        setRiderPickupMarker(
          new Marker({
            position: {
              lat: riderPickupLocationLat,
              lng: riderPickupLocationLng,
            },
            icon: "path/to/pick-up-pin.png",
            animation: "DROP",
          })
        );
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
        });
      }
    }
  };

  useEffect(() => {
    // Set the status bar to be translucent, allowing the map to go under it.
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor("transparent");
  }, []);

  useEffect(() => {
    handleRoute();
    const timer = setTimeout(() => {
      setMorningContainer(true);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsShimmering(false);
  //   }, 8000);

  //   return () => clearTimeout(timer); // Clean up the timer when the component unmounts
  // }, []);

  useEffect(() => {
    if (origin && destination) {
      const timer = setTimeout(() => {
        setShowDirections(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [origin, destination]);

  useEffect(() => {
    if (origin && destination && mapRef.current) {
      // Calculate the bounds to include both the origin and destination
      const latitudes = [origin.latitude, destination.latitude];
      const longitudes = [origin.longitude, destination.longitude];

      // Get the minimum and maximum latitudes and longitudes
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      // Define the bounding region to ensure both points and the line are visible
      const padding = 0.1; // Some padding to avoid edge clipping
      const region = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: maxLat - minLat + padding,
        longitudeDelta: maxLng - minLng + padding,
      };

      // Animate map camera to include both origin and destination with a zoom-out effect
      mapRef.current.animateToRegion(region, 1000); // Zoom-out effect

      // After the zoom-out animation, apply a zoom-in effect to make the map look like it's bouncing back
      setTimeout(() => {
        const zoomInRegion = {
          latitude: region.latitude,
          longitude: region.longitude,
          latitudeDelta: region.latitudeDelta * 0.6, // Zoom in a little
          longitudeDelta: region.longitudeDelta * 0.6, // Zoom in a little
        };

        // Animate the camera to zoom in (bounce-back effect)
        mapRef.current.animateToRegion(zoomInRegion, 500); // Shorter zoom-in duration
      }, 1000); // Wait for 1 second before applying the zoom-in (bounce-back effect)
    }
  }, [origin, destination]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStrokeColor((prev) => (prev === "black" ? "#1E90FF" : "black"));
    }, 1000); // Change color every second
    return () => clearInterval(interval);
  }, []);

  const showAlert = (data) => {
    // console.log("Alerttttttttttt", data);
    if (data) {
      setNewRideRequest(data);
      setIsModalVisible(true);
    }
  };

  // Animate code
  const animateToRegion = () => {
    if (!mapRef.current) {
        console.warn('Map reference not ready in animateToRegion');
        return;
    }

    try {
        mapRef.current.animateCamera(
            {
                center: {
                    latitude: origin?.latitude || 33.6844,
                    longitude: origin?.longitude || 73.0479,
                },
                pitch: 0,
                heading: 0,
                altitude: 1000,
                zoom: 18,
            },
            { 
                duration: 2000,
                // Add optional callback for animation completion
                onComplete: () => {
                    console.log('Animation completed');
                }
            }
        );
    } catch (error) {
        console.warn('Error in animateToRegion:', error);
    }
};

  const onMapReady = () => {
    if (!mapRef.current) {
        console.warn('Map reference not ready');
        return;
    }

    setTimeout(() => {
        if (mapRef.current) {
            try {
                animateToRegion();
            } catch (error) {
                console.warn('Error in onMapReady animation:', error);
            }
        }
    }, 1000);
};

  useEffect(() => {
    const interval = setInterval(() => {
      setStrokeColor((prev) => (prev === "black" ? "#1E90FF" : "black"));
    }, 1000); // Change color every second
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setMapDimensions({ width, height });
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const { secondLocation, showModal } = route.params || {};

    if (secondLocation) {
      setDestination(secondLocation);
    }
    if (showModal) {
      setModalVisible(true);
    }

    // Animate to initial region and then zoom in
    if (mapRef.current && origin) {
      const initialRegion = {
        latitude: origin?.latitude,
        longitude: origin?.longitude,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
      };

      // Animate to initial region
      mapRef.current.animateToRegion(initialRegion, 100);

      // Zoom in after the initial animation
      setTimeout(() => {
        mapRef.current.animateToRegion(
          {
            ...initialRegion,
            latitudeDelta: 0.01, // Smaller delta for closer zoom
            longitudeDelta: 0.01,
          },
          100 // Duration of zoom-in animation in milliseconds
        );
      }, 100); // Delay the zoom-in animation to start after the initial animation
    }
  }, [route.params]);

  const isFocused = useIsFocused();
  useEffect(() => {
    handleRoute();
  }, [isFocused]);

  const handleMapPress = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0].formatted_address;

      setUserAddress(address);
    } catch (error) {
      console.error("Geocoder error:", error);
      Alert.alert("Error", "Unable to retrieve address");
    }
  };
  const handleBlueAreaClick = async () => {
    try {
      // Geocode the address to get the latitude and longitude
      const geoResponse = await Geocoder.from("BlueArea, Islamabad, Pakistan");
      const { lat, lng } = geoResponse.results[0].geometry.location;

      // Set the destination to the geocoded location
      const newDestination = {
        latitude: lat,
        longitude: lng,
      };
      setDestination(newDestination);

      // Calculate the distance between origin and destination
      const calculatedDistance = haversineDistance(
        origin?.latitude,
        origin?.longitude,
        newDestination?.latitude,
        newDestination?.longitude
      );
      setDistance(calculatedDistance);

      if (mapRef.current) {
        // Step 1: Animate to the destination
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000 // Duration of animation in milliseconds
        );

        // Step 2: Zoom out to show both origin and destination
        setTimeout(() => {
          const latitudes = [origin?.latitude, lat];
          const longitudes = [origin?.longitude, lng];

          const latitudeDelta =
            Math.max(...latitudes) - Math.min(...latitudes) + 0.1; // Add some padding
          const longitudeDelta =
            Math.max(...longitudes) - Math.min(...longitudes) + 0.1; // Add some padding

          const newRegion = {
            latitude: (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
            longitude: (Math.max(...longitudes) + Math.min(...longitudes)) / 2,
            latitudeDelta,
            longitudeDelta,
          };

          // Animate to new region that includes both origin and destination
          mapRef.current.animateToRegion(newRegion, 1000);

          // Step 3: Additional zoom out for better view
          setTimeout(() => {
            // Further zoom out to ensure full view
            const additionalLatitudeDelta = latitudeDelta * 0.6; // Increase the delta for more zoom-out
            const additionalLongitudeDelta = longitudeDelta * 0.6; // Increase the delta for more zoom-out

            const finalRegion = {
              latitude: newRegion.latitude,
              longitude: newRegion.longitude,
              latitudeDelta: additionalLatitudeDelta,
              longitudeDelta: additionalLongitudeDelta,
            };

            mapRef.current.animateToRegion(finalRegion, 1000);

            // Show the modal after the final zoom-out animation completes
            setTimeout(() => {
              setModalVisible(true);
            }, 1000); // Delay to ensure the final zoom-out animation completes before showing the modal
          }, 1000); // Delay to ensure the zoom-out animation completes before further zooming out
        }, 1000); // Delay to ensure the map animation to the destination completes before zooming out
      }
      // call firebase save data function
      // saveData()
    } catch (error) {
      console.log("Geocoding error:", error);
    }
  };
  const handleRoute = () => {
    if (route?.params) {
      setRouteValue(route?.params);
    }
  };

  const getLocation = () => {
    GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
    })
        .then((location) => {
            if (location) {
                setOrigin({
                    latitude: location.latitude,
                    longitude: location.longitude,
                });

                // Send this location to the backend to get available drivers
                const body = {
                    city: 1,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    priority_driver: 0,
                };

                // Use cleanup variable to prevent state updates after unmount
                let isComponentMounted = true;
                // Update driver locations more frequently (every 3 seconds)
                const intervalId = setInterval(() => {
                    if (isComponentMounted) {
                        handleTest(body);
                    }
                }, 3000); // Changed from 10000 to 3000 for more frequent updates

                // Cleanup function
                return () => {
                    isComponentMounted = false;
                    clearInterval(intervalId);
                };
            }
        })
        .catch((error) => {
            console.log("Location Error:", error.code, error.message);
            setError("Failed to get location.");
            Alert.alert(
                "Location Error",
                "Unable to get your current location. Please check your location settings."
            );
        });
};

  // Fetch drivers' locations
  const handleTest = async (data) => {
    const sess_id = await getSessionId();

    const url = `${RIDER_BASE_URL}?sess_id=${sess_id}&action_get=getavailablecitydrivers&city=${data?.city}&pickup_location[lat]=${data?.latitude}&pickup_location[lng]=${data?.longitude}&priority_driver=${data?.priority_driver}`;

    try {
        const response = await axios.get(url);
        const driversLocations = response?.data?.drivers_locations || [];
        
        // Update driver locations with animation
        driversLocations.forEach((driver) => {
            const driverId = driver?.driver_id || Math.random().toString();
            const newLat = parseFloat(driver?.position?.lat);
            const newLng = parseFloat(driver?.position?.lng);

            if (!isNaN(newLat) && !isNaN(newLng)) {
                const oldCoordinate = driverLocations.find(d => d?.driver_id === driverId)?.position;
                
                // Only animate if the position has changed significantly
                if (oldCoordinate) {
                    const oldLat = parseFloat(oldCoordinate.lat);
                    const oldLng = parseFloat(oldCoordinate.lng);
                    const distance = haversine(oldLat, oldLng, newLat, newLng);
                    
                    // Only animate if the car has moved more than 10 meters
                    if (distance > 0.01) {
                        animateMarkerToCoordinate(
                            driverId,
                            {
                                latitude: newLat,
                                longitude: newLng,
                            },
                            {
                                latitude: oldLat,
                                longitude: oldLng,
                            }
                        );
                    }
                } else {
                    // For new drivers, set their position immediately
                    animateMarkerToCoordinate(
                        driverId,
                        {
                            latitude: newLat,
                            longitude: newLng,
                        },
                        null
                    );
                }
            }
        });

        setDriverLocations(driversLocations);
    } catch (error) {
        console.error("Error fetching drivers:", error.message);
        setError("Failed to fetch drivers.");
    }
};

  const getCurrentDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  const getCurrentDateTimePlusOneHour = () => {
    const now = new Date();

    // Add 1 hour to the current time
    now.setHours(now.getHours() + 1);

    // Format the new time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Return the date and time formatted as YYYY-MM-DD HH:mm:ss
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const onBook = async (setLoading) => {
    setLoading(true);
    try {
      const scheduled = 0;
      const dateTimeOneHourAhead = getCurrentDateTimePlusOneHour();
      const currentDateTime = getCurrentDateTime();

      // Define waypoints for the trip
      const wayPoints = {
        "dest-1": {
          address: routeValue?.pickUpAddreess,
          lat: routeValue?.picuploactionLatLng?.latitude,
          lng: routeValue?.picuploactionLatLng?.longitude,
        },
        "dest-2": {
          address: routeValue?.dropOffAddress,
          lat: routeValue?.dropOffLoactionLatLng?.latitude,
          lng: routeValue?.dropOffLoactionLatLng?.longitude,
        },
      };

      const bookingPrice = selectedVehicle?.totalFare;
      const encryptedPrice = CryptoJS.MD5(
        "projectgics" + bookingPrice?.toString()
      ).toString();
      console.log("Encrypted Price:", encryptedPrice);

      // Get session ID
      const sess_id = await getSessionId();

      // Prepare the parameters for the GET request
      const params = {
        action_get: "newbooking",
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
      };

      const queryString = new URLSearchParams(params).toString();
      // Make the GET request with parameters in the URL
      const response = await axios.get(`${RIDER_BASE_URL}?${queryString}`);

      if (response.data?.error) {
        Alert.alert("Error", response.data?.error);
        setLoading(false);
      } else {
        const bookingid = response.data?.new_booking_id;
        setBookingId(bookingid);
        // setLoading(false);
        // saveData(bookingid)
        if (origin) {
          // Set the ring position to the center of the map
          const centerX = mapDimensions.width / 2;
          const centerY = mapDimensions.height / 2;

          setRingPosition({ x: centerX, y: centerY });
          setShowRings(true);
          setLoading(false);
          setModalVisible(false);
          setIsMenuIcon(false);
          setIsBookingDone(true);
        }
      }
    } catch (error) {
      console.error("Error in booking:", error);
      setLoading(false);
    }
  };

  const convertHTMLToJSON = (htmlString) => {
    if (!htmlString) return []; // Handle empty HTML string

    const parser = new HTMLParser.DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract the list items (each booking item)
    const listItems = doc.getElementsByTagName("ons-list-item");

    // Convert NodeList to Array
    const listArray = Array.from(listItems);
    const bookings = [];

    listArray.forEach((item) => {
      const booking = {
        bookingId: item.getAttribute("data-btitle"),
        time: item
          .getElementsByClassName("list-item__title")[0]
          ?.textContent.trim(),
        rideType: item.getAttribute("data-ridedesc"),
        driverPhone: item.getAttribute("data-driverphone"),
        paymentType: item.getAttribute("data-ptype"),
        pickUpTime: item.getAttribute("data-put"),
        driverImage: item.getAttribute("data-driverimg"),
        carImage: item.getAttribute("data-rideimg"),
        driverName: item.getAttribute("data-drivername"),
        cost: item.getAttribute("data-cost"),
        pickUpLocation: item.getAttribute("data-pul"),
        dropOffLocation: item.getAttribute("data-dol"),
        status: item.getElementsByTagName("span")[0]?.textContent.trim(),
        bookingData: JSON.parse(
          item.getElementsByClassName(
            `booking-list-item-data-${item.getAttribute("id").split("-").pop()}`
          )[0]?.textContent || "{}"
        ),
      };

      bookings.push(booking);
    });

    return bookings;
  };

  const convertHTMLToJSON2 = (htmlString) => {
    if (!htmlString) return []; // Handle empty HTML string

    const parser = new HTMLParser.DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract the list items (each booking item)
    const listItems = doc.getElementsByTagName("ons-list-item");

    // Convert NodeList to Array
    const listArray = Array.from(listItems);
    const bookings = [];

    listArray.forEach((item) => {
      const booking = {
        bookingId: item.getAttribute("id")?.split("-")[2], // Extracts the booking ID from the 'id' attribute
        time: item
          .getElementsByClassName("list-item__title")[0]
          ?.textContent.trim(), // Extracts time
        status: item.getElementsByTagName("span")[0]?.textContent.trim(), // Extracts status (e.g., "Pending trip")
        pickUpLocation: item
          .getElementsByClassName("list-item__subtitle")[0]
          ?.textContent.trim(), // Pickup location (first subtitle)
        dropOffLocation: item
          .getElementsByClassName("list-item__subtitle")[1]
          ?.textContent.trim(), // Dropoff location (second subtitle)
        driverImage: item.getAttribute("data-driverimg"), // Driver image from the 'data-driverimg' attribute
        carImage: item.getAttribute("data-rideimg"), // Car image from the 'data-rideimg' attribute
        cost: item.getAttribute("data-cost"), // Cost from the 'data-cost' attribute
        bookingData: JSON.parse(
          item.getElementsByClassName("booking-list-item-data")[0]
            ?.textContent || "{}"
        ), // Parse hidden JSON data from the corresponding <span>
        pickUpTime: formatDateTime(),
      };

      bookings.push(booking);
    });

    return bookings;
  };

  // const getBookings = () => {
  //   const data = {
  //     action: "getbookings",
  //   };
  //   Post({ data: data })
  //     .then((response) => {
  //       const pendingArray = convertHTMLToJSON2(response.pend_onride);
  //       setPendingBookings(pendingArray);
  //       if (pendingArray.length > 0) {
  //         setShowDriverOnWay(true);
  //       } else {
  //         setShowDriverOnWay(false);
  //       }
  //       console.log("pendingArray==", pendingArray);
  //     })
  //     .catch((error) => {
  //       console.log("error", error);
  //     });
  // };

  // useEffect(() => {
  //   getBookings();
  // }, []);

  // useEffect(() => {
  //   if (pendingBookings.length > 0) {
  //     setShowDriverOnWay(true);
  //   } else {
  //     setShowDriverOnWay(false);
  //   }
  // }, [pendingBookings]);

  // const getBookings = () => {
  //   const data = {
  //     action: "getbookings",
  //   };
  //   Post({ data: data })
  //     .then((response) => {
  //       console.log("response=-", response);
  //       // const completedArray = convertHTMLToJSON(response.booking_comp);
  //       const pendingArray = convertHTMLToJSON2(response.pend_onride);
  //       // const canceledArray = convertHTMLToJSON(response.booking_canc);
  //       console.log("==>pendingArr=============>", pendingArray);
  //       // console.log("bookingId=", bookingId);
  //       // Navigate to the Trips screen and pass the pendingBookings
  //       // navigation.navigate("Trips", {
  //       //   screen: "Current",
  //       //   params: { currentBookings: pendingArray, bookingId: bookingId }, // Sending pendingBookings as currentBookings
  //       // });

  //       setPendingBookings(pendingArray); // Optionally set state for local use
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching bookings:", error);
  //     });
  // };

  function formatDateTime() {
    const now = new Date();

    const options = {
      weekday: "long", // Full weekday name (e.g., "Thursday")
      year: "numeric", // Full year (e.g., "2025")
      month: "short", // Abbreviated month name (e.g., "Jan")
      day: "numeric", // Day of the month (e.g., "2")
    };

    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(now);

    // Ensure there's a space between the day and the year
    const dateParts = formattedDate.split(",");
    const dateString = dateParts[0].trim() + " " + dateParts[1].trim();

    return dateString;
  }

  const resumebooking = async () => {
    try {
      const sess_id = await getSessionId();

      const params = {
        action_get: "resumebooking",
        sess_id: sess_id,
        booking_id: ongoing_bk.booking_id,
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`${RIDER_BASE_URL}?${queryString}`);

      if (response.data?.error) {
        Alert.alert("Error", response.data?.error);
      } else {
        console.log("response of resumebooking==", response.data.ongoing_bk);
        handleCloseAlert();

        if (
          response.data.ongoing_bk.action === "driver-assigned" ||
          response.data.ongoing_bk.action === "driver-arrived" ||
          response.data.ongoing_bk.action === "customer-onride"
        ) {
          setShowDriverOnWay(true);
          setNewRideRequest(response.data.ongoing_bk);
          setHideDirections(true);
          showDriverOnWayModal(
            "ride_alloc.mp3",
            response.data.ongoing_bk.action
          );
        }
      }
    } catch (error) {
      console.error("Error in booking:", error);
    }
  };

  const getCurrentUnixTimestamp = () => {
    return Math.floor(Date.now() / 1000); // Current timestamp in seconds
  };
  const handleDeclineBid = async (bookingid) => {
    const sess_id = await getSessionId();
    const url = `${RIDER_BASE_URL}?sess_id=${sess_id}`;
    // Define the request body as x-www-form-urlencoded format
    const body = new URLSearchParams({
      action: "declinebid",
      driver_id: "1",
      bookingid: bookingid,
    }).toString();

    // Perform the POST request using fetch
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
      });

      const responseData = await response.json();

      // Handle the response data
      if (response.ok) {
        // You can log the response or do something with it
      } else {
        Alert.alert("Error", "Failed to process the request");
      }
    } catch (error) {
      // Handle any error that occurs during the fetch
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleBookingCancelDriverSearch = async () => {
    // Check if bookingid is available in state
    if (bookingId) {
      const sess_id = await getSessionId();
      const url = `${RIDER_BASE_URL}?sess_id=${sess_id}`;

      const body = new URLSearchParams({
        action: "bookingCancelDriverSearch",
        bookingid: bookingId, // Use bookingid from state
      }).toString();

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body,
        });

        const responseData = await response.json();

        if (response) {
          setShowRings(false); // Hide the rings
          setShowDirections(false);
          setDestination(false);
        } else {
          Alert.alert("Error", "Failed to process the request");
        }
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "Something went wrong");
      }
    } else {
      Alert.alert("Error", "Booking ID is not available");
    }
  };

  const openNavigator = () => {
    if (origin && destination) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`;
      Linking.openURL(url).catch((err) =>
        console.error("Error opening Google Maps", err)
      );
    } else {
      console.warn("Origin or destination not set");
    }
  };
  const userGreeting = () => {
    const cur_date = moment().tz("Asia/Karachi");
    const hour_now = cur_date.hours();
    const firstname = user?.firstname || "User";

    if (hour_now >= 0 && hour_now < 12) {
      // Morning
      setGreetingImage(require("../../assets/morning.png"));
      setGreetingMessage(t("Good morning, {{name}}", { name: firstname }));
    } else if (hour_now >= 12 && hour_now < 17) {
      // Afternoon
      setGreetingImage(require("../../assets/afternoon.png"));
      setGreetingMessage(t("Good afternoon, {{name}}", { name: firstname }));
    } else {
      // Evening
      setGreetingImage(require("../../assets/evening.jpeg"));
      setGreetingMessage(t("Good evening, {{name}}", { name: firstname }));
    }
  };

  const getDistanceAndTime = async (origin, destination) => {
    try {
      // Get current position (origin) if not provided as a prop
      const originCoordinates =
        origin ||
        (await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        }));

      const originStr = `${originCoordinates.latitude},${originCoordinates.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const element = data.rows[0].elements[0];
        if (element.status === "OK") {
          const distanceInMeters = element.distance.value;
          const durationText = element.duration.text;

          // Convert distance to kilometers
          const distanceInKilometers = distanceInMeters / 1000;

          // Calculate estimated time based on speed (60 km/h)
          const speed = 60;
          let timeInHours = distanceInKilometers / speed;
          let timeInMinutes = timeInHours * 60;

          if (timeInMinutes < 1) {
            timeInMinutes = 1; // Minimum 1 minute
          }

          timeInMinutes = Math.round(timeInMinutes);

          // Set the calculated time and distance in the state
          setDistance(`${distanceInKilometers.toFixed(2)} km`);
          setTime(timeInMinutes);
        }
      }
    } catch (error) {
      console.error("Error fetching distance and time:", error);
    }
  };

  // Trigger the distance/time calculation when origin or destination changes
  useEffect(() => {
    if (origin && destination) {
      getDistanceAndTime(origin, destination);
    }
  }, [origin, destination]);

  useEffect(() => {
    const sound = new Sound("ride-alloc.mp3", Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.warn('Error loading sound:', error);
        }
    });

    return () => {
        sound.release(); // Clean up the sound resource
    };
}, []);

  useEffect(() => {
    return () => {
        // Cleanup marker references when component unmounts
        markerRefs.current = [];
    };
}, []);

  // Add this new function
  const animateMarkerToCoordinate = (markerId, newCoordinate, oldCoordinate) => {
    if (!animatedMarkersRef.current[markerId]) {
      animatedMarkersRef.current[markerId] = {
        coordinate: new Animated.ValueXY({
          x: oldCoordinate?.longitude || newCoordinate.longitude,
          y: oldCoordinate?.latitude || newCoordinate.latitude
        }),
        rotation: new Animated.Value(0)
      };
    }

    // Calculate bearing for rotation
    const bearing = calculateBearing(
      oldCoordinate?.latitude || animatedMarkersRef.current[markerId].coordinate.y._value,
      oldCoordinate?.longitude || animatedMarkersRef.current[markerId].coordinate.x._value,
      newCoordinate.latitude,
      newCoordinate.longitude
    );

    const duration = 5000; // Increased duration to 5 seconds for smoother movement

    // Create smooth animations with easing
    const coordAnimation = Animated.timing(animatedMarkersRef.current[markerId].coordinate, {
      toValue: { x: newCoordinate.longitude, y: newCoordinate.latitude },
      duration: duration,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false
    });

    // Smoother rotation animation with less rotation
    const rotationAnimation = Animated.timing(animatedMarkersRef.current[markerId].rotation, {
      toValue: bearing,
      duration: duration,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false
    });

    // Run animations in parallel
    Animated.parallel([coordAnimation, rotationAnimation]).start();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.headerStyle]}>
        {/* {isMenuIcon && !showDriverOnWay ? ( */}
        {isMenuIcon ? (
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
              setIsMenuIcon(true); // Existing logic
              handleBookingCancelDriverSearch();
            }}
            style={styles.crossButton}
          >
            <FontAwesome name="times" size={22} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* FlatList Displayed Above the Map */}
      {driverRequests.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: 10,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
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

      {origin ? (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={styles.map}
            onLayout={onLayout}
            provider={Platform.OS === "android" ? MapView.PROVIDER_GOOGLE : MapView.PROVIDER_DEFAULT}
            mapType={mapType}
            initialRegion={{
                latitude: origin.latitude || 33.6844,
                longitude: origin.longitude || 73.0479,
                latitudeDelta: 0.06,
                longitudeDelta: 0.06,
            }}
            onMapReady={() => {
                // Ensure map is ready before any animations
                if (mapRef.current) {
                    onMapReady();
                }
            }}
            zoomEnabled
            onError={(error) => console.error('Map error:', error)}
          >
            <Marker coordinate={origin}>
              <Image
                source={require("../../assets/pick-up-loc-icon.png")}
                style={styles.markerImage}
              />
            </Marker>

            {destination && (
              <>
                <Marker coordinate={destination}>
                  <Image
                    source={require("../../assets/drop-off-pin.png")}
                    style={styles.markerImage}
                  />
                </Marker>

                {isBookingDone &&
                  !hideStroke &&
                  !hideDirections &&
                  showDirections &&
                  origin &&
                  destination && (
                    <MapViewDirections
                      origin={origin}
                      destination={destination}
                      apikey={GOOGLE_MAPS_API_KEY}
                      strokeColor={strokeColor}
                      strokeWidth={4.5}
                    />
                  )}
              </>
            )}

            {driverRoute.show && driverRoute.start && driverRoute.end && (
                <Animated.View
                    style={{
                        transform: [{
                            translateY: driverRoute.bounceAnim?.interpolate({
                                inputRange: [0, 1],
                                outputRange: [300, 0] // Start 300 units below and animate to final position
                            }) || 0
                        }],
                        opacity: driverRoute.bounceAnim?.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1]
                        }) || 1
                    }}
                >
                    <MapViewDirections
                        origin={driverRoute.start}
                        destination={driverRoute.end}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeColor="#1E90FF"
                        strokeWidth={4.5}
                    />
                </Animated.View>
            )}

            {driverLocations.length > 0 &&
              driverLocations.map((driver, index) => {
                const driverId = driver?.driver_id || index.toString();
                const animatedMarker = animatedMarkersRef.current[driverId];

                if (!animatedMarker) return null;

                const coordinate = {
                  latitude: animatedMarker.coordinate.y,
                  longitude: animatedMarker.coordinate.x
                };

                return (
                  <Marker.Animated
                    key={`${driverId}`}
                    coordinate={coordinate}
                    title={driver?.title}
                    description={`Driver's location`}
                  >
                    <Animated.View
                      style={{
                        transform: [{
                          rotate: animatedMarker.rotation.interpolate({
                            inputRange: [0, 360],
                            outputRange: ['0deg', '360deg']
                          })
                        }]
                      }}
                    >
                      {driver.title === "Ride Mini" && (
                        <Image
                          source={require("../../assets/city-driver-icon-4.png")}
                          style={styles.markerImage}
                        />
                      )}
                      {driver.title === "Ride" && (
                        <Image
                          source={require("../../assets/city-driver-icon-5.png")}
                          style={styles.markerImage}
                        />
                      )}
                      {driver.title === "Ride A/C" && (
                        <Image
                          source={require("../../assets/city-driver-icon-1.png")}
                          style={styles.markerImage}
                        />
                      )}
                      {driver.title === "Moto" && (
                        <Image
                          source={require("../../assets/city-driver-icon-6.png")}
                          style={styles.markerImage}
                        />
                      )}
                    </Animated.View>
                  </Marker.Animated>
                );
              })}
          </MapView>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Loading map...</Text>
        </View>
      )}

      {/* Custom Alert Modal */}
      <Modal
        visible={showViewAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseAlert}
      >
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>Your ride is in progress</Text>
            <TouchableOpacity onPress={resumebooking} style={styles.okButton}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showRings && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {[...Array(16)].map((_, index) => (
            <Ring key={index} delay={index * 200} position={ringPosition} />
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.mapToggleButton,
          { position: "absolute", right: 10, top: 150 },
        ]} // Positioned on the right side of the map
        onPress={openNavigator}
      >
        <Text style={styles.mapToggleText}>Navigator</Text>
      </TouchableOpacity>

      {/* Toggle button for map view */}
      <TouchableOpacity
        style={styles.mapToggleButton}
        onPress={() =>
          setMapType(mapType === "standard" ? "satellite" : "standard")
        }
      >
        <Text style={styles.mapToggleText}>
          {mapType === "standard" ? "Satellite View" : "Standard View"}
        </Text>
      </TouchableOpacity>

      {/* Handle modals */}
      {morningContainer && !showDriverOnWay && (
        <View style={styles.buttonContainer}>
          {/* <View style={styles.morningContainer}>
            <Image
              style={styles.morningPic}
              source={require("../../assets/afternoon.png")}
            />

            <Text style={styles.nameText}>
              {t("morning_text")}
            </Text>
          </View> */}
          <View style={styles.morningContainer}>
            <Image style={styles.morningPic} source={greetingImage} />
            <Text style={styles.nameText}>{greetingMessage}</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("DropOffLocation", {
                origin,
                userAddress,
                hideDirections,
                hideStroke,
              })
            }
          >
            <FontAwesome
              name="search"
              size={15}
              color="red"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.buttonText}>
              {t("search_button_text")}
              {/* Where do you want to go? */}
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.button2}
            onPress={handleBlueAreaClick}
          >
            <FontAwesome
              name="map-marker"
              size={14}
              color="red"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.button2Text} numberOfLines={1}>
              {t("recent_search")}
            </Text>
          </TouchableOpacity> */}
        </View>
      )}

      {/* Conditionally render DriverOnWay instead of morningContainer */}
      {!isPendingTripCancel && showDriverOnWay && newRideRequest && (
        <DriverOnWay
          visible={showDriverOnWay}
          onClose={() => setShowDriverOnWay(false)}
          setShowDriverOnWay={setShowDriverOnWay}
          newRideRequest={newRideRequest || {}} // Provide default empty object
          handleDeclineBid={handleDeclineBid}
          titleText={newRideRequest?.titleText || ''} // Add null check and default value
          style={{ pointerEvents: "auto" }}
        />
      )}

      <CustomModal
        visible={modalVisible}
        onBook={onBook}
        bookingId={bookingId}
        onSelectItem={(option) => setSelectedVehicle(option)}
        onClose={() => setModalVisible(false)}
        origin={origin}
        time={time}
        distance={distance}
        destination={destination}
        navigation={navigation}
        setHideDirections={setHideDirections}
        style={{ pointerEvents: "auto" }} // Allow interactions with the map
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  customMarkerIcon: {
    width: 40,
    height: 40,
  },
  buttonContainer: {
    backgroundColor: "#FFFFFF",
    height: "20%",
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  button: {
    marginLeft: "7%",
    marginTop: "2%",
    alignItems: "center",
    backgroundColor: "#eff1f2",
    padding: 16,
    width: "85%",
    borderRadius: 5,
    flexDirection: "row",
  },
  button2: {
    marginLeft: "7%",
    marginTop: "3%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 6,
    width: "65%",
    borderRadius: 5,
    flexDirection: "row",
    elevation: 3,
  },
  buttonText: {
    fontWeight: "500",
    color: "#000000",
    fontSize: 16,
  },
  button2Text: {
    color: "#000000",
    fontSize: 14,
  },
  morningContainer: {
    flexDirection: "row",
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
    color: "grey",
  },
  mapToggleButton: {
    position: "absolute",
    top: "60%",
    marginLeft: 5,
    backgroundColor: "#FBC02D",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  mapToggleText: {
    color: "#000",
    fontWeight: "bold",
  },
  markerImage: {
    height: 30,
    width: 30,
    resizeMode: 'contain'
  },
  distanceContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerStyle: {
    height: 40,
    width: 40,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    position: "absolute",
    backgroundColor: Color.black,
    top: Platform.OS === "ios" ? 60 : 50,
    left: 20,
    zIndex: 999999,
  },

  crossButton: {
    position: "absolute",
    // top: 10,
    // left: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'transparent',
    color: "yellow",
  },
  markerContainer: {
    alignItems: "center",
  },
  markerIcon: {
    width: 20,
    height: 20,
  },
  markerText: {
    color: "black",
  },
  ring: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: "tomato",
  },
  // alert styles
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  alertBox: {
    width: 280,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
  },
  alertText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  okButton: {
    position: "absolute", // Position it relative to the alert box
    bottom: 10, // Distance from the bottom of the alert box
    right: 10, // Distance from the right side of the alert box
    backgroundColor: "rgba(0, 0, 0, 0)", // Transparent background
    borderWidth: 1, // Optional: border around the button
    borderColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  okButtonText: {
    top: 10,
    fontSize: 14,
    color: "blue",
    // fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RiderMapScreen;
