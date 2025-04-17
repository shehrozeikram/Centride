import React, { useEffect, useRef, useState } from "react";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestTrackingPermission } from "react-native-tracking-transparency";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  Linking,
  Easing,
} from "react-native";
import Sound from "react-native-sound";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MapViewDirections from "react-native-maps-directions";
import Header from "../../components/Header";
import Color from "../../utils/Color";
import GetLocation from "react-native-get-location";
import axios from "axios";
import { Post } from "../../network/network";
import { getSessionId } from "../../utils/common";
import { DRIVER_BASE_URL } from "../../utils/constants";
import Style from "../../utils/Styles";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import Geocoder from "react-native-geocoding";
import messaging from "@react-native-firebase/messaging";
import database from "@react-native-firebase/database";
import RiderBookingModal from "../../modals/RiderBookingModal";
import { useSelector } from "react-redux";
import HTMLParser from "react-native-html-parser";
import DriverArriveModal from "../../modals/DriverArriveModal";
import DriverDropoffModal from "../../modals/DriverDropoffModal";
import DriverPicupModal from "../../modals/DriverPicupModal";
let sound;
import { GOOGLE_MAPS_API_KEY } from "../../constants/googleMapKey";

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

const ridersRef = database().ref("Drivers/");

const DriverMap = ({ navigation }) => {
  const route = useRoute();
  const { ongoing_bk } = route?.params || {};
  const mapRef = useRef(null);
  // console.log("ongoing_bk driver =", ongoing_bk);
  // const navigation = useNavigation();
  const [isOnline, setIsOnline] = useState(false);
  const [showViewAlert, setShowViewAlert] = useState(false);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [driverLocationsList, setDriverLocations] = useState([]);
  const [messageData, setMessageData] = useState(null);
  const [newRideRequest, setNewRideRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showTripInfo, setShowTripInfo] = useState(true);
  const [driverArriveModalVisible, setDriverArriveModalVisible] =
    useState(false);
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [dropoffModalVisible, setDropoffModalVisible] = useState(false);
  const [timeOnline, setTimeOnline] = useState("");
  const [matchingRiders, setMatchingRiders] = useState([]);
  const [timestamp, setTimestamp] = useState(null);
  const [ridersData, setRidersData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationData, setNotificationData] = useState(null);
  const [serverClientTimeDiff, setServerClientTimeDiff] = useState(0);
  const [sessionIdForParams, setSessionIdForParams] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [hideDirections, setHideDirections] = useState(false);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [strokeColor, setStrokeColor] = useState("black");

  const user = useSelector((state) => state.user?.user);
  const isMounted = useRef(true);
  const intervalIdRef = useRef(null);

  const [directionsData, setDirectionsData] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [driverArriveModal, setDriverArriveModal] = useState(false);
  const [dropoffModal, setDropoffModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedTrips, setCompletedTrips] = useState(0);
  const [todayEarning, setTodayEarning] = useState();

  const markerRefs = useRef([]);
  const user_id = user?.driverid;
  const server_client_time_diff = 0;

  const prevMessageRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const message_ref = database().ref(`Drivers/drvr-${user_id}/notf`);

  const markerRef = useRef(null);

  const [lastBearing, setLastBearing] = useState(0);

  const calculateBearing = (startLat, startLng, endLat, endLng) => {
    startLat = startLat * (Math.PI / 180);
    startLng = startLng * (Math.PI / 180);
    endLat = endLat * (Math.PI / 180);
    endLng = endLng * (Math.PI / 180);

    const dLong = endLng - startLng;

    const y = Math.sin(dLong) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
             Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLong);

    let bearing = Math.atan2(y, x);
    bearing = bearing * (180 / Math.PI);
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  const animateMarkerToCoordinate = (newCoordinate, oldCoordinate) => {
    if (!oldCoordinate || !markerRef.current) {
      return;
    }

    const duration = 1000;

    // If we have destination coordinates, calculate bearing towards destination
    let targetBearing;
    if (directionsData?.destination) {
      targetBearing = calculateBearing(
        newCoordinate.latitude,
        newCoordinate.longitude,
        directionsData.destination.latitude,
        directionsData.destination.longitude
      );
    } else {
      // If no destination, calculate bearing based on movement
      targetBearing = calculateBearing(
        oldCoordinate.latitude,
        oldCoordinate.longitude,
        newCoordinate.latitude,
        newCoordinate.longitude
      );
    }

    // Calculate the shortest rotation path
    let delta = ((((targetBearing - lastBearing) % 360) + 540) % 360) - 180;
    let newBearing = (lastBearing + delta + 360) % 360;

    // Only update if there's significant movement
    const minMovementThreshold = 0.00001;
    if (
      Math.abs(oldCoordinate.latitude - newCoordinate.latitude) > minMovementThreshold || 
      Math.abs(oldCoordinate.longitude - newCoordinate.longitude) > minMovementThreshold
    ) {
      if (Platform.OS === 'android') {
        if (markerRef.current) {
          markerRef.current.animateMarkerToCoordinate(newCoordinate, duration);
          markerRef.current.setNativeProps({
            style: {
              transform: [{ rotate: `${newBearing - 90}deg` }]
            }
          });
        }
      } else {
        // For iOS
        const latitudeDelta = newCoordinate.latitude - oldCoordinate.latitude;
        const longitudeDelta = newCoordinate.longitude - oldCoordinate.longitude;
        const stepCount = Math.floor(duration / 16.67); // 60fps

        let currentStep = 0;
        const animate = () => {
          if (currentStep < stepCount && markerRef.current) {
            const progress = currentStep / stepCount;
            const currentLatitude = oldCoordinate.latitude + (latitudeDelta * progress);
            const currentLongitude = oldCoordinate.longitude + (longitudeDelta * progress);
            const currentRotation = lastBearing + (delta * progress);

            if (markerRef.current) {
              markerRef.current.setNativeProps({
                coordinate: {
                  latitude: currentLatitude,
                  longitude: currentLongitude,
                },
                style: {
                  transform: [{ rotate: `${currentRotation - 90}deg` }]
                }
              });
            }

            currentStep++;
            requestAnimationFrame(animate);
          } else {
            if (markerRef.current) {
              markerRef.current.setNativeProps({
                coordinate: newCoordinate,
                style: {
                  transform: [{ rotate: `${newBearing - 90}deg` }]
                }
              });
            }
            setLastBearing(newBearing);
          }
        };

        requestAnimationFrame(animate);
      }
    }
  };

  useEffect(() => {
    if (route.params?.isPendingTripCancel) {
      setDriverArriveModalVisible(false);
      setDestination(false);

      setShowDirections(false);
    }
  }, [route.params]);
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
    console.log("Checking ongoing_bk and route params:", ongoing_bk, route.params);
    
    // Only show the alert if ongoing_bk is 1 AND we're not coming from ride completion
    if (ongoing_bk === 1 && !route.params?.fromRideComplete) {
      setShowViewAlert(true);
    } else {
      setShowViewAlert(false);
    }
  }, [ongoing_bk, route.params]);

  const onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setMapDimensions({ width, height });
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

  let processed_notifications = {};

  useEffect(() => {
    const message_ref = database().ref(`Drivers/drvr-${user_id}/notf`);

    const reference = message_ref.on("value", async (snapshot) => {
      const data = snapshot.val();
      console.log("data in message_ref", data);
      if (data == null) return;
      if (!(data.hasOwnProperty("msg") && data.hasOwnProperty("msg_t"))) return;
      let last_msg_time_id = await AsyncStorage.getItem("fb_last_recvd");

      if (data.msg_t === last_msg_time_id) return;

      await AsyncStorage.setItem("fb_last_recvd", data.msg_t.toString());

      let current_local_timestamp = Date.now();
      current_local_timestamp += server_client_time_diff;
      current_local_timestamp = Math.floor(current_local_timestamp / 1000);

      if (current_local_timestamp - 5 > data.msg_t) return;

      var message = data.msg;

      if (
        message.hasOwnProperty("booking_id") &&
        message.hasOwnProperty("action")
      ) {
        if (
          !message.hasOwnProperty("repeatable") &&
          message.action !== "chat-message"
        ) {
          // Check if this message has already been processed for the given booking ID
          if (processed_notifications.hasOwnProperty(message.booking_id)) {
            const found = processed_notifications[message.booking_id].find(
              function (el) {
                return el === message.action;
              }
            );
            if (found) {
              // If the action was already processed, skip it
              return;
            } else {
              processed_notifications[message.booking_id].push(message.action); // Add the action to the list of processed actions
            }
          } else {
            processed_notifications[message.booking_id] = [message.action]; // Create a new entry for this booking ID
          }
        }

        // Handle different action types
        switch (message.action) {
          case "driver-allocate":
            booking_allocate_notify(message);
            break;
          case "customer-cancelled":
            customer_cancelled_notify(message);
            break;
          case "decline-driver-bid-notify":
            decline_bid(message);
            break;
          case "accept-driver-bid-notify":
            accept_bid(message);
            break;
          case "chat-message":
            chat_msg_notify(message);
            break;
          default:
            console.log("Unknown action:", message.action);
            break;
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      message_ref.off("value", reference);
    };
  }, [user?.driverid]);

  const toggleOnlineStatus = () => {
    handleSetAvailability();
  };

  const sound = new Sound("ride-alloc.mp3", Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log("Error loading sound", error);
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

  const showModal = (soundFile) => {
    setIsModalVisible(true);
    playSound(soundFile);
    setTimeout(() => {
      setIsModalVisible(false);
    }, 13000);
  };

  const booking_allocate_notify = (notification) => {
    console.log("Handling booking allocation notification abc:", notification);

    const push_data = notification;

    const driverAcceptDuration = push_data.driver_accept_duration;
    const notifSentTime = push_data.sent_time;

    let currentTimestamp = Date.now();
    currentTimestamp += server_client_time_diff;
    currentTimestamp = Math.floor(currentTimestamp / 1000);

    let driverAcceptTime = driverAcceptDuration - (currentTimestamp - notifSentTime);

    if (driverAcceptTime <= 0) return;

    const riderPickupLocationLat = parseFloat(push_data.p_lat);
    const riderPickupLocationLng = parseFloat(push_data.p_lng);

    const driverLat = parseFloat(push_data.d_lat);
    const driverLng = parseFloat(push_data.d_lng);

    if (driverLat && driverLng) {
      const distance = haversine(
        driverLat,
        driverLng,
        riderPickupLocationLat,
        riderPickupLocationLng
      );

      let distanceInUnit = distance;
      if (push_data.dist_unit === 1) {
        distanceInUnit = distance * 0.621371;
      }

      const timeToPickup = calculateTime(distanceInUnit);
      push_data.distance = distanceInUnit.toFixed(2);
      push_data.time_to_pickup = timeToPickup;

      setNewRideRequest(push_data);
      showModal("ride_alloc.mp3");
      setShowDirections(true);

      // Calculate the bearing between driver and pickup location
      const bearing = calculateBearing(
        driverLat,
        driverLng,
        riderPickupLocationLat,
        riderPickupLocationLng
      );

      if (mapRef.current) {
        // First, position the camera directly above the driver's location with a vertical view
        mapRef.current.animateCamera({
          center: {
            latitude: driverLat,
            longitude: driverLng,
          },
          pitch: 75, // Very steep angle for vertical view
          heading: bearing, // Point towards destination
          altitude: distance * 250, // Lower altitude for closer view
          zoom: distance > 2 ? 16 : 17 // Closer zoom for better detail
        }, {
          duration: 1000
        });

        // After a short delay, adjust to show both points while maintaining vertical perspective
        setTimeout(() => {
          // Calculate midpoint between driver and pickup location
          const midLat = (driverLat + riderPickupLocationLat) / 2;
          const midLng = (driverLng + riderPickupLocationLng) / 2;

          // Move slightly towards the driver's position for better perspective
          const adjustedMidLat = midLat - (riderPickupLocationLat - driverLat) * 0.2;
          const adjustedMidLng = midLng - (riderPickupLocationLng - driverLng) * 0.2;

          mapRef.current.animateCamera({
            center: {
              latitude: adjustedMidLat,
              longitude: adjustedMidLng,
            },
            pitch: 70, // Maintain steep angle
            heading: bearing,
            altitude: distance * 300, // Adjust altitude based on distance
            zoom: distance > 2 ? 15 : 16
          }, {
            duration: 1000
          });
        }, 1500);

        // Final adjustment to ensure both points are visible while keeping vertical view
        setTimeout(() => {
          mapRef.current.fitToCoordinates(
            [
              { latitude: driverLat, longitude: driverLng },
              { latitude: riderPickupLocationLat, longitude: riderPickupLocationLng }
            ],
            {
              edgePadding: {
                top: 200,    // Large top padding for vertical view
                right: 50,   // Minimal side padding
                bottom: 100, // Moderate bottom padding
                left: 50     // Minimal side padding
              },
              animated: true
            }
          );
        }, 2500);
      }

      setDirectionsData({
        origin: { latitude: driverLat, longitude: driverLng },
        destination: {
          latitude: riderPickupLocationLat,
          longitude: riderPickupLocationLng,
        },
      });
    }
  };

  const accept_bid = (notification) => {
    console.log("Handling accept_bid notification:", notification);

    setNotificationData(notification);
  };

  const customer_cancelled_notify = (notification) => {
    console.log("notification in customer_cancelled_notify ", notification);
    
    // Reset all modals
    setIsModalVisible(false);
    setDriverArriveModal(false);
    setDriverArriveModalVisible(false);
    setPickupModalVisible(false);
    setDropoffModalVisible(false);
    setShowDirections(false);
    setShowViewAlert(false);
    
    // Reset destination and directions data
    setDestination(null);
    setDirectionsData(null);
    setNewRideRequest(null);
    
    // Reset map to current location
    if (mapRef.current && origin) {
      mapRef.current.animateToRegion({
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    
    Alert.alert(
      "Booking Cancelled",
      "Your booking has been cancelled",
      [
        {
          text: "OK",
          onPress: () => {},
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    getLocation();
    requestUserPermission();
    getToken();
  }, []);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  };

  const getToken = async () => {
    const token = await messaging().getToken();
    console.log("FCM Token:", token);
  };

  useEffect(() => {
    const { secondLocation } = route.params || {};
    if (secondLocation) {
      setDestination(secondLocation);
    }
  }, [route.params]);

  useEffect(() => {
    if (origin && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [origin]);

  const getLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      const newCoords = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      // Animate marker if we have previous coordinates
      if (origin) {
        animateMarkerToCoordinate(newCoords, origin);
      }

      setOrigin(newCoords);

      if (location.latitude && location.longitude) {
        console.log("location in getLocation", location);
      }
    } catch (error) {
      console.log("Location Error:", error.code, error.message);
    }
  };

  const fetchDriverLocations = async (latitude, longitude) => {
    const sess_id = await getSessionId();
    const url = `${DRIVER_BASE_URL}?sess_id=${sess_id}&action_get=getavailablecitydrivers&city=1`; // Use the correct city ID
    try {
      const response = await axios.get(url);
      setDriverLocations(response.data.drivers_locations || []);
    } catch (error) {
      console.error("Error fetching drivers:", error.message);
    }
  };

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    Alert.alert(remoteMessage[{ text: "OK" }]);
  });

  useEffect(() => {
    if (origin) {
      console.log("Origin updated:", origin);
      setDriverLocation();
    }
  }, [origin]);

  const callApis = async () => {
    try {
      await Promise.all([setAvailability(), setAvailability()]);
    } catch (error) {
      console.error("Error while calling APIs concurrently:", error);
    }
  };

  const handleCheckDriverLoginStatus = async () => {
    const sess_id = await getSessionId();
    const url = `${DRIVER_BASE_URL}?sess_id=${sess_id}`;

    const body = new URLSearchParams({
      action: "checkDriverLoginStatus",
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
      if (response.ok) {
        console.log(
          "completed_trips=====",
          responseData.profileinfo.completed_rides
        );
        console.log("driver_today_earning=====", responseData.profileinfo);
        setCompletedTrips(responseData.profileinfo.completed_rides);
        setTodayEarning(responseData.driver_today_earning);
      } else {
        Alert.alert("Error", "Failed to process the request");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };
  useEffect(() => {
    handleCheckDriverLoginStatus(); // Call the function on component mount
  }, []);

  const handleSetAvailability = async () => {
    try {
      setLoading(true);
      const sess_id = await getSessionId();
      const url = `${DRIVER_BASE_URL}?sess_id=${sess_id}`;
      const newStatus = !isOnline;

      const body = new URLSearchParams({
        action: "setAvailability",
        status: newStatus ? "true" : "false",
      }).toString();

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      if (responseData.success === 1) {
        if (responseData.status === 1) {
          // Driver is now online
          await AsyncStorage.setItem("isOnline", "true");
          setIsOnline(true);
          // Interval will be started by the useEffect that watches isOnline
        } else if (responseData.status === 0) {
          // Driver is now offline
          await AsyncStorage.setItem("isOnline", "false");
          setIsOnline(false);
          if (intervalIdRef.current) {
            // clearInterval(intervalIdRef.current);
            // intervalIdRef.current = null;
          }
        }
      } else {
        throw new Error("Operation was not successful");
      }
    } catch (error) {
      console.error("Error in handleSetAvailability:", error);
      const currentStatus = await AsyncStorage.getItem("isOnline");
      setIsOnline(currentStatus === "true");
      Alert.alert(
        "Error",
        "Failed to update availability status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineStatus = async () => {
    try {
      const savedStatus = await AsyncStorage.getItem("isOnline");
      if (savedStatus === "true") {
        setIsOnline(true);
        // Start location updates immediately if driver is online
        if (origin) {
          setDriverLocation();
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
          }
          intervalIdRef.current = setInterval(() => {
            setDriverLocation();
          }, 10000);
        }
      } else {
        setIsOnline(false);
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error loading online status:", error);
    }
  };

  const setDriverLocation = async () => {
    if (!origin) {
      console.log("Origin is not yet available");
      return;
    }

    const sessId = await getSessionId();
    
    // Get current location before making API call
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      const newCoords = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      // Animate marker to new position if we have previous coordinates
      if (origin && markerRef.current) {
        animateMarkerToCoordinate(newCoords, origin);
      }

      // Update origin state with new coordinates
      setOrigin(newCoords);

      // Make API call with new coordinates
      const url = `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sessId}&lat=${location.latitude}&long=${location.longitude}`;

      const body = new URLSearchParams();
      body.append("action", "setDriverLocation");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTimeOnline(data.driver_time_online);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setNewRideRequest(null);
  };
  const handleCloseAlert = () => {
    setShowViewAlert(false);
  };

  const getDriverHistory = async () => {
    setLoading(true);

    const sess_id = await getSessionId();
    const url = `${DRIVER_BASE_URL}?sess_id=${sess_id}`;

    const body = new URLSearchParams({
      action: "getDriverHistory",
    }).toString();
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
      });

      const apiResponse = await response.json();
      const htmlContent = apiResponse.pend_onride;

      // Regex to match both time and status
      const timeAndStatusMatch = htmlContent.match(
        /<span class='list-item__title'>(.*?)<\/span>\s*<span[^>]*style=['"][^'"]*font-weight:\s*bold[^'"]*['"][^>]*>(.*?)<\/span>/
      );

      const hiddenDataMatch = htmlContent.match(
        /id='booking-list-item-data-\d+' type='text' style='display:none'>(.*?)<\/span>/
      );
      let hiddenData = {};
      if (hiddenDataMatch && hiddenDataMatch[1]) {
        try {
          hiddenData = JSON.parse(hiddenDataMatch[1]);
        } catch (error) {
          console.error("Error parsing hidden data:", error);
        }
      }

      const bookingIdMatch = htmlContent.match(/Booking ID:#(\d+)/);
      const pickupLocationMatch = htmlContent.match(
        /<span style='display:inline-block;margin-left:22px;font-weight:bold;'>(.*?)<\/span>/
      );
      const dropoffLocationMatch = htmlContent.match(
        /<span style='display:inline-block;margin-left:22px;font-weight:bold;'>(.*?)<\/span>/
      );

      const bookingDetails = {
        booking_id: bookingIdMatch ? bookingIdMatch[1] : null,
        time: timeAndStatusMatch ? timeAndStatusMatch[1] : null,
        status: timeAndStatusMatch ? timeAndStatusMatch[2] : null,
        pickup_location: pickupLocationMatch ? pickupLocationMatch[1] : null,
        dropoff_location: dropoffLocationMatch ? dropoffLocationMatch[1] : null,
        car_type: hiddenData.car_type || null,
        cost: hiddenData.booking_cost || null,
        payment_type: hiddenData.payment_type || null,
        p_lat: hiddenData.p_lat || null,
        p_lng: hiddenData.p_lng || null,
        d_lat: hiddenData.d_lat || null,
        d_lng: hiddenData.d_lng || null,
      };

      console.log("Extracted Booking Details:", bookingDetails);
      setBookingDetails(bookingDetails);

      // Set up map view with origin and destination
      if (bookingDetails.p_lat && bookingDetails.p_lng && bookingDetails.d_lat && bookingDetails.d_lng) {
        const origin = {
          latitude: parseFloat(bookingDetails.p_lat),
          longitude: parseFloat(bookingDetails.p_lng)
        };
        const destination = {
          latitude: parseFloat(bookingDetails.d_lat),
          longitude: parseFloat(bookingDetails.d_lng)
        };

        // Set directions data
        setDirectionsData({ origin, destination });
        setShowDirections(true);

        // Center the map on the route
        const midPoint = {
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
        };
        mapRef.current?.animateToRegion({
          ...midPoint,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }

      // Show appropriate modal based on status
      setShowViewAlert(false);
      if (bookingDetails.status === "Booking accepted") {
        setDriverArriveModal(true);
        setDriverArriveModalVisible(true);
        setPickupModalVisible(false);
        setDropoffModalVisible(false);
      } 
      // else if (bookingDetails.status === "Driver arrived") {
      //   setDriverArriveModal(false);
      //   setDriverArriveModalVisible(false);
      //   setPickupModalVisible(true);
      //   setDropoffModalVisible(false);
      // } 
      
      else if (bookingDetails.status === "Servicing booking") {
        console.log("Servicing booking", bookingDetails.status);
        setDriverArriveModal(false);
        setDriverArriveModalVisible(false);
        setPickupModalVisible(false);
        setDropoffModalVisible(true);
        setDropoffModal(true);
        setNewRideRequest(bookingDetails);
      }

      // else if (bookingDetails.status === "Servicing booking") {
      // console.log("Servicing booking", bookingDetails.status);
      //   setDriverArriveModal(false);
      //   setDriverArriveModalVisible(false);
      //   setPickupModalVisible(false);
      //   setDropoffModalVisible(true);
      // }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong");
      setLoading(false);
    }
  };

  const sanitizeHTML = (html) => {
    return html
      .replace(/<ons-button[^>]*>.*?<\/ons-button>/g, "")
      .replace(/\bonclick\s*=\s*(['"]?)[^'"\s>]*\1/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const convertHTMLToJSON = (htmlString) => {
    if (!htmlString) return []; // Handle empty HTML string

    // Sanitize HTML before parsing
    const cleanedHtml = sanitizeHTML(htmlString);

    // Initialize the HTML parser
    const parser = new HTMLParser.DOMParser();
    const doc = parser.parseFromString(cleanedHtml, "text/html");

    // Extract the list items (each booking item)
    const listItems = doc.getElementsByTagName("ons-list-item");

    // Convert NodeList to Array
    const listArray = Array.from(listItems);
    const bookings = [];

    listArray.forEach((item) => {
      const fullText = item.textContent.replace(/\s{2,}/g, " ").trim(); // Normalize spacing

      // Use regex to extract values correctly
      const bookingIdMatch = fullText.match(/Booking ID:\s*(#\d+)/);
      const fareMatch = fullText.match(/Fare:\s*(₨[\d,]+(?:\.\d{2})?)/);
      const paymentMethodMatch = fullText.match(/\((Cash|Card|Wallet)\)/);

      // Extract pickup and dropoff locations by splitting at common delimiters
      const locationMatches =
        fullText
          .split("Booking ID:")[1]
          ?.split("Fare:")[1]
          ?.split(/\s{2,}/) || [];

      const pickupLocation =
        locationMatches.length > 0 ? locationMatches[0].trim() : "";
      const dropoffLocation =
        locationMatches.length > 1 ? locationMatches[1].trim() : "";

      // Extract time and userName
      const timeMatch = fullText.match(/^(\d{1,2}:\d{2} (AM|PM))/);
      const time = timeMatch ? timeMatch[0] : "";

      const userName = fullText
        .replace(time, "")
        .split("Booking ID:")[0]
        .trim();

      // Push the cleaned booking data
      const booking = {
        time,
        userName,
        bookingId: bookingIdMatch ? bookingIdMatch[1] : "",
        fare: fareMatch ? fareMatch[1] : "",
        paymentMethod: paymentMethodMatch ? paymentMethodMatch[1] : "",
        pickupLocation,
        dropoffLocation,
      };

      bookings.push(booking);
    });

    return bookings;
  };

  const openNavigator = () => {
    if (origin && newRideRequest) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin?.latitude},${origin?.longitude}&destination=${newRideRequest?.d_lat},${newRideRequest?.d_lng}`;
      Linking.openURL(url).catch((err) =>
        console.error("Error opening Google Maps", err)
      );
    } else {
      console.warn("Origin or destination not set");
    }
  };

  const animateToRegion = () => {
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: origin?.latitude || 33.6844,
            longitude: origin?.longitude || 73.0479,
          },
          pitch: 45, // Add camera tilt
          heading: 0, // North is up
          altitude: 500, // Lower altitude for closer view
          zoom: 17, // Increased zoom level
        },
        { duration: 1000 }
      );
    }
  };

  const onMapReady = () => {
    // Add a delay of 1 second before calling animateToRegion
    setTimeout(() => {
      animateToRegion();
    }, 1000); // Delay in milliseconds
  };

  // Add cleanup effect
  useEffect(() => {
    const initializeDriver = async () => {
      await getLocation();
      await loadOnlineStatus();
    };

    initializeDriver();

    // Cleanup interval when component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []); // Run only once on mount

  // Add effect to start interval when origin is available and driver is online
  useEffect(() => {
    if (origin && isOnline && !intervalIdRef.current) {
      setDriverLocation();
      intervalIdRef.current = setInterval(() => {
        setDriverLocation();
      }, 10000);
    }
  }, [origin, isOnline]);

  // Update the booking-related effect
  // useEffect(() => {
  //   if (showViewAlert || isModalVisible || driverArriveModal || dropoffModal) {
  //     const persistOnlineStatus = async () => {
  //       const savedStatus = await AsyncStorage.getItem("isOnline");
  //       if (savedStatus === "true") {
  //         setIsOnline(true);
  //         // Ensure location updates are running
  //         if (!intervalIdRef.current) {
  //           setDriverLocation();
  //           intervalIdRef.current = setInterval(() => {
  //             setDriverLocation();
  //           }, 10000);
  //         }
  //       }
  //     };
  //     persistOnlineStatus();
  //   }
  // }, [showViewAlert, isModalVisible, driverArriveModal, dropoffModal]);

  const chat_msg_notify = (message) => {
    console.log("Handling chat message notification:", message);
    
    // Check if we have a chat modal visible
    if (driverArriveModal) {
      // Pass the message to the chat modal
      setNewRideRequest(prev => ({
        ...prev,
        chatMessage: message
      }));
    } else {
      // If chat modal is not visible, show the modal
      setDriverArriveModal(true);
      setNewRideRequest(prev => ({
        ...prev,
        chatMessage: message
      }));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.headerStyle]}>
        <Header isMenuIcon={true} isRightView={false} isDriver={true} />
      </View>

      {driverArriveModal && (
        <DriverArriveModal
          newRideRequest={newRideRequest}
          setDriverArriveModalVisible={setDriverArriveModalVisible}
          setDropoffModalVisible={setDropoffModalVisible}
          setShowDirections={setShowDirections}
          setDirectionsData={setDirectionsData}
        />
      )}

      {pickupModalVisible && (
        <DriverPickupModal
          newRideRequest={newRideRequest}
          setDriverArriveModalVisible={setDriverArriveModalVisible}
          setPickupModalVisible={setPickupModalVisible}
          setDropoffModalVisible={setDropoffModalVisible}
          setShowDirections={setShowDirections}
          setDirectionsData={setDirectionsData}
        />
      )}

      {dropoffModalVisible && (
        <DriverDropoffModal
          newRideRequest={newRideRequest}
          setDropoffModalVisible={setDropoffModalVisible}
        />
      )}

      {origin && (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={
              Platform.OS === "android"
                ? MapView.PROVIDER_GOOGLE
                : MapView.PROVIDER_DEFAULT
            }
            initialRegion={{
              latitude: origin?.latitude || 33.6844,
              longitude: origin?.longitude || 73.0479,
              latitudeDelta: 0.06,
              longitudeDelta: 0.06,
            }}
            zoomEnabled
          >
            <Marker 
              ref={markerRef}
              coordinate={origin}
              anchor={{ x: 0.5, y: 0.5 }}
              flat={true}
              tracksViewChanges={false}
            >
              <View style={{
                transform: [{ rotate: `${lastBearing - 90}deg` }],
                backgroundColor: 'transparent',
              }}>
                <Image
                  source={require("../../assets/city-driver-icon-1.png")}
                  style={styles.markerImage}
                  resizeMode="contain"
                />
              </View>
            </Marker>

            {directionsData?.origin && (
              <Marker coordinate={directionsData.destination}>
                <Image
                  source={require("../../assets/pick-up-loc-icon.png")}
                  style={styles.markerImage}
                />
              </Marker>
            )}

            {directionsData?.destination && (
              <Marker coordinate={directionsData.origin}>
                <Image
                  source={require("../../assets/drop-off-pin.png")}
                  style={styles.markerImage}
                />
              </Marker>
            )}

            {showDirections && directionsData && (
              <>
                {/* Primary route line */}
                <MapViewDirections
                  origin={directionsData.origin}
                  destination={directionsData.destination}
                  apikey={GOOGLE_MAPS_API_KEY}
                  strokeColor="#0066FF"  // Professional blue color
                  strokeWidth={4}
                  lineDashPattern={[0]}
                  mode="DRIVING"
                  precision="high"
                  lineCap="round"
                  strokeColors={[
                    '#0066FF',  // Start color
                    '#00AAFF',  // Middle color
                    '#0066FF'   // End color
                  ]}
                />
                {/* Secondary line for glow effect */}
                <MapViewDirections
                  origin={directionsData.origin}
                  destination={directionsData.destination}
                  apikey={GOOGLE_MAPS_API_KEY}
                  strokeColor="rgba(0, 102, 255, 0.2)"  // Transparent blue for glow
                  strokeWidth={8}
                  lineDashPattern={[0]}
                  mode="DRIVING"
                  precision="high"
                  lineCap="round"
                />
              </>
            )}
          </MapView>
        </View>
      )}

      <Modal
        visible={showViewAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseAlert}
      >
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>View your Booking</Text>
            <TouchableOpacity
              onPress={getDriverHistory}
              style={styles.okButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <Text style={styles.okButtonText}>OK</Text>
              )}
              {/* <Text style={styles.okButtonText}>OK</Text> */}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: isOnline ? "green" : "gray",
          },
        ]}
        onPress={toggleOnlineStatus}
      >
        <Text style={styles.toggleButtonText}>
          {isOnline ? "Online" : "Offline"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.mapToggleButton,
          { position: "absolute", right: 10, top: 150 },
        ]} // Positioned on the right side of the map
        onPress={openNavigator}
      >
        <Text style={styles.mapToggleText}>Navigator</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Trips")}
        style={styles.infoContainer}
      >
        <View style={styles.mainContainer}>
          <View style={styles.tripsContainer}>
            <Text style={styles.text}>Completed Trips</Text>
            <Text style={styles.number}>{completedTrips}</Text>
          </View>
          <View style={styles.earningsContainer}>
            {/* <Text style={styles.text}>Today's earning</Text>
            <Text style={styles.number}>Rs {todayEarning}</Text> */}
          </View>
          <View style={styles.onlineContainer}>
            <Text style={styles.text}>Time online</Text>
            <Text style={styles.number}>{timeOnline}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <RiderBookingModal
        visible={isModalVisible}
        onClose={closeModal}
        newRideRequest={newRideRequest}
        location={origin}
        driverArriveModalVisible={driverArriveModalVisible}
        setDriverArriveModalVisible={setDriverArriveModalVisible}
        setPickupModalVisible={setPickupModalVisible}
        setDropoffModalVisible={setDropoffModalVisible}
        setShowDirections={setShowDirections}
        setIsOnline={setIsOnline}
        setIsModalVisible = {setIsModalVisible}
        setDirectionsData = {setDirectionsData}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  earningsContainer: {
    flexDirection: "column",
    gap: 15,
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    height: "14%",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  mainContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 25,
  },
  number: {
    marginLeft: 20,
    fontWeight: "700",
    color: "black",
  },
  onlineContainer: {
    flexDirection: "column",
    gap: 15,
  },
  text: {
    fontWeight: "300",
    color: "black",
  },
  tripsContainer: {
    flexDirection: "column",
    gap: 15,
    color: "black",
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
    top: Platform.OS === "ios" ? 60 : 30,
    left: 10,
    zIndex: 9999,
  },
  markerContainer: {
    alignItems: "center",
  },
  markerIcon: {
    width: 30,
    height: 30,
  },
  markerText: {
    color: "black",
  },
  // alert styles
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    elevation: 5,
  },
  alertText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  okButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  okButtonText: {
    top: 10,
    fontSize: 14,
    color: "blue",
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
    height: 45,
    width: 45,
    transform: [{ rotate: '0deg' }], // Initial rotation
  },
  headerStyle: {
    height: 40,
    width: 40,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    position: "absolute",
    backgroundColor: "black",
    top: Platform.OS === "ios" ? 60 : 30,
    left: 10,
    zIndex: 9999,
  },
  toggleButton: {
    position: "absolute",
    top: "5%",
    right: 10,
    backgroundColor: "#FBC02D",
    padding: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },

  toggleButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default DriverMap;
