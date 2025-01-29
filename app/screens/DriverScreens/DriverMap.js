import React, { useEffect, useRef, useState } from "react";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from "react-native";
import Sound from "react-native-sound";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MapViewDirections from "react-native-maps-directions";
import Header from "../../components/Header";
import Color from "../../utils/Color";
import GetLocation from "react-native-get-location";
import axios from "axios";
import { Post } from "../../network/network";
import { getAppSide, getSessionId, setSessionId } from "../../utils/common";
import { DRIVER_BASE_URL } from "../../utils/constants";
import Style from "../../utils/Styles";
import { useIsFocused, useRoute } from "@react-navigation/native";
import Geocoder from "react-native-geocoding";
import messaging from "@react-native-firebase/messaging";
import database from "@react-native-firebase/database";
import RiderBookingModal from "../../modals/RiderBookingModal";
import { useSelector } from "react-redux";
// import DriverArriveModal from "../../modals/DriverArriveModal";
let sound;

const Google_Maps_Apikey = "AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw";
// const dropoffpin = require('../../assets/dropoffpin.png'); // Update the path as necessary

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
  const mapRef = useRef(null);
  const route = useRoute();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [driverLocationsList, setDriverLocations] = useState([]);
  const [messageData, setMessageData] = useState(null);
  const [newRideRequest, setNewRideRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showTripInfo, setShowTripInfo] = useState(true);
  // const [driverArriveModalVisible, setDriverArriveModalVisible] =
  //   useState(false);
  const [timeOnline, setTimeOnline] = useState("");
  const [matchingRiders, setMatchingRiders] = useState([]);
  const [timestamp, setTimestamp] = useState(null);
  const [ridersData, setRidersData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationData, setNotificationData] = useState(null);
  const [serverClientTimeDiff, setServerClientTimeDiff] = useState(0);
  const [sessionIdForParams, setSessionIdForParams] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const user = useSelector((state) => state.user?.user);
  const isMounted = useRef(true);

  const [directionsData, setDirectionsData] = useState(null); // Store directions data (origin and destination)
  const [showDirections, setShowDirections] = useState(false);

  // console.log('=user=', user)
  // console.log('====origin====', origin)

  const markerRefs = useRef([]);
  const user_id = user?.driverid;
  const server_client_time_diff = 0;

  const prevMessageRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const message_ref = database().ref(`Drivers/drvr-${user_id}/notf`);

  // useEffect(() => {

  //     getSession()
  // }, [])

  const syncServer = async () => {
    const body = new URLSearchParams({
      action: "syncservertime",
    }).toString();

    try {
      const response = await Post({ data: body }); // Assuming `Post` is your function to make a POST request
      if (response && response.server_time) {
        const serverTime = response.server_time; // Assuming server returns a field called `server_time`
        const currentLocalTime = Date.now();
        const timeDiff = serverTime - currentLocalTime; // Difference in milliseconds
        setServerClientTimeDiff(timeDiff);
        // console.log('Server time diff:', timeDiff)
      }
    } catch (error) {
      console.log("Error syncing server time:", error);
    }
  };

  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     const driverId = user?.driverid;
  //     //   console.log("=====driverId =====", driverId);

  //     const reference = database()
  //       .ref(`Drivers/drvr-${driverId}/notf`)
  //       .on("value", async (snapshot) => {
  //         const data = snapshot.val();
  //         console.log("Fetched snapshot data:", data);

  //         // Check if data is null
  //         if (data == null) {
  //           console.log("No data found in Firebase");
  //           return;
  //         }

  //         // Access the message and timestamp directly
  //         const msg = data.msg;
  //         const msg_t = data.msg_t;

  //         if (!msg || !msg_t) {
  //           console.log("Invalid message structure:", data);
  //           return;
  //         }

  //         const last_msg_time_id = await AsyncStorage.getItem("fb_last_recvd");
  //         console.log(
  //           "Last message time from AsyncStorage:",
  //           last_msg_time_id,
  //           "TYPEOF=====>",
  //           typeof last_msg_time_id
  //         );

  //         // Add timestamp tolerance here (e.g., 1 second grace period for identical timestamps)
  //         const toleranceInSeconds = 5;
  //         const timestampDifference = Math.abs(
  //           msg_t - parseInt(last_msg_time_id, 10)
  //         );

  //         // If the timestamp difference is 0 or within the tolerance, allow the message to be processed
  //         if (
  //           !last_msg_time_id ||
  //           timestampDifference > toleranceInSeconds ||
  //           timestampDifference === 0
  //         ) {
  //           console.log("Processing new message:", data);

  //           // Update AsyncStorage with the new message timestamp
  //           await AsyncStorage.setItem(
  //             "fb_last_recvd",
  //             // JSON.stringify(msg_t),
  //             msg_t?.toString()
  //           );

  //           // Prepare formatted notifications
  //           const formattedNotifications = [msg]; // Directly add msg to the array
  //           console.log("Formatted Notifications:", formattedNotifications);

  //           if (formattedNotifications.length > 0) {
  //             setNotifications(formattedNotifications);
  //           } else {
  //             console.log("No notifications to display");
  //           }

  //           // Handle missing booking_id
  //           if (!msg.booking_id) {
  //             console.log("Warning: booking_id is missing", msg);

  //             // If no booking_id, return without processing further
  //             return;
  //           } else {
  //             const processed = await AsyncStorage.getItem(
  //               `processed_${msg.booking_id}_${msg.action}`
  //             );
  //             console.log(
  //               `Processed for booking ${msg.booking_id}:`,
  //               processed
  //             );
  //             if (processed) return;

  //             // Handle notification actions based on action type
  //             switch (msg.action) {
  //               case "driver-allocate":
  //                 booking_allocate_notify(msg);
  //                 break;
  //               case "customer-cancelled":
  //                 customer_cancelled_notify(msg);
  //                 break;
  //               case "decline-driver-bid-notify":
  //                 decline_bid(msg);
  //                 break;
  //               // case "accept-driver-bid-notify":
  //               //   accept_bid(msg);
  //               //   break;
  //               case "chat-message":
  //                 chat_msg_notify(msg);
  //                 break;
  //               default:
  //                 break;
  //             }

  //             // Mark notification as processed
  //             await AsyncStorage.setItem(
  //               `processed_${msg.booking_id}_${msg.action}`,
  //               "true"
  //             );
  //           }
  //         } else {
  //           console.log(
  //             "Skipping processed message due to timestamp tolerance:",
  //             data
  //           );
  //         }
  //       });

  //     return () => {
  //       database().ref(`Drivers/drvr-${driverId}/notf`).off("value", reference);
  //     };
  //   };

  //   fetchNotifications();
  // }, [serverClientTimeDiff]);

  useEffect(() => {
    isMounted.current = true; // Set to true when component is mounted

    const fetchNotifications = async () => {
      const driverId = user?.driverid;
      const reference = database()
        .ref(`Drivers/drvr-${driverId}/notf`)
        .on("value", async (snapshot) => {
          const data = snapshot.val();
          console.log("Fetched snapshot data:", data);

          if (data == null) {
            console.log("No data found in Firebase");
            return;
          }

          const msg = data.msg;
          const msg_t = data.msg_t;

          if (!msg || !msg_t) {
            console.log("Invalid message structure:", data);
            return;
          }

          const last_msg_time_id = await AsyncStorage.getItem("fb_last_recvd");
          console.log("Last message time from AsyncStorage:", last_msg_time_id);

          const toleranceInSeconds = 5;
          const timestampDifference = Math.abs(
            msg_t - parseInt(last_msg_time_id, 10)
          );

          if (
            !last_msg_time_id ||
            timestampDifference > toleranceInSeconds ||
            timestampDifference === 0
          ) {
            console.log("Processing new message:", data);

            await AsyncStorage.setItem("fb_last_recvd", msg_t?.toString());

            const formattedNotifications = [msg]; // Directly add msg to the array
            console.log("Formatted Notifications:", formattedNotifications);

            if (formattedNotifications.length > 0) {
              if (isMounted.current) {
                // Only update state if component is mounted
                setNotifications(formattedNotifications);
              }
            } else {
              console.log("No notifications to display");
            }

            if (!msg.booking_id) {
              console.log("Warning: booking_id is missing", msg);
              return;
            } else {
              const processed = await AsyncStorage.getItem(
                `processed_${msg.booking_id}_${msg.action}`
              );
              if (processed) return;

              switch (msg.action) {
                case "driver-allocate":
                  booking_allocate_notify(msg);
                  break;
                case "customer-cancelled":
                  customer_cancelled_notify(msg);
                  break;
                case "decline-driver-bid-notify":
                  decline_bid(msg);
                  break;
                case "chat-message":
                  chat_msg_notify(msg);
                  break;
                default:
                  break;
              }

              await AsyncStorage.setItem(
                `processed_${msg.booking_id}_${msg.action}`,
                "true"
              );
            }
          } else {
            console.log(
              "Skipping processed message due to timestamp tolerance:",
              data
            );
          }
        });

      return () => {
        database().ref(`Drivers/drvr-${driverId}/notf`).off("value", reference);
      };
    };

    fetchNotifications();

    return () => {
      isMounted.current = false; // Set to false when component unmounts
    };
  }, [user?.driverid]);

  //   useEffect(() => {
  //     const fetchNotifications = async () => {
  //       const driverId = user?.driverid;
  //       //   console.log("=====driverId =====", driverId);

  //       const reference = database()
  //         .ref(`Drivers/drvr-${driverId}/notf`) // Path to listen for notifications
  //         .on("value", async (snapshot) => {
  //           const data = await snapshot.val();
  //           console.log("data is here=====", data);
  //           if (data == null) return;
  //           if (!(data?.msg && data?.msg_t)) return;

  //           // Get last message timestamp from AsyncStorage
  //           const last_msg_time_id = await AsyncStorage.getItem("fb_last_recvd");
  //           if (data.msg_t === last_msg_time_id) return;
  //           const lastMsgTimeIdString = last_msg_time_id
  //             ? last_msg_time_id.toString()
  //             : null;
  //           if (data.msg_t.toString() === lastMsgTimeIdString) return;

  //           // Update last message timestamp in AsyncStorage
  //           await AsyncStorage.setItem(
  //             "fb_last_recvd",
  //             JSON.stringify(data.msg_t)
  //           );
  //           // console.log(
  //           //     '=========Last message time updated 11========',
  //           //     JSON.stringify(data.msg_t),
  //           // )

  //           // Adjust current timestamp using the server-client time difference
  //           let current_local_timestamp = Date.now();
  //           current_local_timestamp += serverClientTimeDiff; // Sync with server time
  //           current_local_timestamp = Math.floor(current_local_timestamp / 1000); // Get seconds part

  //           // console.log(
  //           //     'current_local_timestamp',
  //           //     current_local_timestamp,
  //           // )
  //           // console.log('serverClientTimeDiff 11', serverClientTimeDiff)

  //           if (current_local_timestamp - 15 > data.msg_t) return;

  //           // console.log('========Processing message  1=========', data)
  //           const message = data;
  //           // console.log('========message  11=========', message)
  //           // Handle message actions
  //           if (message?.booking_id && message?.action) {
  //             if (!(message?.repeatable && !message?.processed)) {
  //               if (data[message.booking_id]) {
  //                 const found = data[message.booking_id].find(
  //                   (el) => el === message.action
  //                 );
  //                 if (found) {
  //                   console.log("=======found======");
  //                   return;
  //                 } else {
  //                   data[message.booking_id].push(message.action); // Add new action
  //                 }
  //               } else {
  //                 data[message.booking_id] = [message.action]; // First action for this booking_id
  //               }
  //             }
  //           }

  //           // Check if data exists and update the notifications state
  //           if (data) {
  //             console.log("====data is down 1====", data);
  //             const formattedNotifications = Object.values(data); // Convert to array if it's an object
  //             setNotifications(formattedNotifications);

  //             console.log("========notifications 12====", notifications);

  //             // Loop through notifications and show alerts
  //             for (const notification of formattedNotifications) {
  //               // Check if notification has already been processed (via AsyncStorage)
  //               const processed = await AsyncStorage.getItem(
  //                 `processed_${notification.booking_id}_${notification.action}`
  //               );
  //               console.log("========notifications 1====", notifications);
  //               console.log("======processed======001", processed);
  //               if (processed) {
  //                 continue;
  //               }

  //               // console.log(
  //               //     '=======notification in driver 11========',
  //               //     processed,
  //               // )

  //               // Show alert

  //               // showAlert(notification)

  //               switch (notification.action) {
  //                 case "driver-allocate":
  //                   booking_allocate_notify(notification);
  //                   break;
  //                 case "customer-cancelled":
  //                   customer_cancelled_notify(notification);
  //                   break;
  //                 case "decline-driver-bid-notify":
  //                   decline_bid(notification);
  //                   break;
  //                 case "accept-driver-bid-notify":
  //                   accept_bid(notification);
  //                   break;
  //                 case "chat-message":
  //                   chat_msg_notify(notification);
  //                   break;
  //                 default:
  //                   break;
  //               }

  //               // Mark notification as processed by storing it in AsyncStorage
  //               await AsyncStorage.setItem(
  //                 `processed_${notification.booking_id}_${notification.action}`,
  //                 "true"
  //               );
  //             }
  //           } else {
  //             setNotifications([]);
  //           }
  //         });

  //       // Clean up the listener on component unmount
  //       return () => {
  //         database().ref(`Drivers/drvr-${driverId}/notf`).off("value", reference);
  //       };
  //     };

  //     fetchNotifications();
  //   }, [serverClientTimeDiff]);

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
    setIsModalVisible(true); // Show the modal
    playSound(soundFile);
    // After 5 seconds, close the modal
    setTimeout(() => {
      setIsModalVisible(false); // Hide the modal after 5 seconds
    }, 13000);
  };

  const booking_allocate_notify = (notification) => {
    console.log("Handling booking allocation notification:", notification);

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

      let distanceInUnit = distance;
      if (push_data.dist_unit === 1) {
        distanceInUnit = distance * 0.621371; // Convert to miles
      }

      // Calculate time in minutes
      const timeToPickup = calculateTime(distanceInUnit);

      // Update the push_data with distance and time
      push_data.distance = distanceInUnit.toFixed(2);
      push_data.time_to_pickup = timeToPickup;

      // Optionally update the UI with distance and time information
      setNewRideRequest(push_data);
      showModal("ride_alloc.mp3");

      // Trigger the MapViewDirections rendering
      setDirectionsData({
        origin: { latitude: driverLat, longitude: driverLng },
        destination: {
          latitude: riderPickupLocationLat,
          longitude: riderPickupLocationLng,
        },
      });
      setShowDirections(true);

      if (mapRef.current) {
        if (
          riderPickupLocationLat &&
          riderPickupLocationLng &&
          driverLat &&
          driverLng
        ) {
          // Calculate the center of the map as the midpoint between driver and rider
          const centerLat = (driverLat + riderPickupLocationLat) / 2;
          const centerLng = (driverLng + riderPickupLocationLng) / 2;

          // Calculate the distance in degrees between the driver and the rider for zooming
          const latDiff = Math.abs(driverLat - riderPickupLocationLat);
          const lngDiff = Math.abs(driverLng - riderPickupLocationLng);

          // Set a larger delta to zoom out and see the full path
          const latitudeDelta = latDiff + 0.05; // Increase to zoom out
          const longitudeDelta = lngDiff + 0.05; // Increase to zoom out

          // Update the map view to center and adjust zoom level
          mapRef.current.animateToRegion({
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          });
        }
      }
    }
  };

  // const booking_allocate_notify = (notification) => {
  //     console.log('Handling booking allocation notification:', notification)

  //     const push_data = notification

  //     // Set the pickup location of the rider
  //     const riderPickupLocationLat = parseFloat(push_data.p_lat)
  //     const riderPickupLocationLng = parseFloat(push_data.p_lng)

  //     console.log('push_data.p_lat', push_data.p_lat)

  //     const driverLat = parseFloat(push_data.d_lat)
  //     const driverLng = parseFloat(push_data.d_lng)

  //     if (driverLat && driverLng) {
  //         console.log('=====driverLat======', driverLat)
  //         // Calculate distance using Haversine formula
  //         const distance = haversine(
  //             driverLat,
  //             driverLng,
  //             riderPickupLocationLat,
  //             riderPickupLocationLng,
  //         )

  //         // Convert distance to desired unit (km or miles)
  //         let distanceInUnit = distance
  //         // console.log('====distanceInUnit====', distanceInUnit)
  //         if (push_data.dist_unit === 1) {
  //             // 1 indicates miles
  //             distanceInUnit = distance * 0.621371 // Convert to miles
  //         }

  //         // Calculate time in minutes
  //         const timeToPickup = calculateTime(distanceInUnit)

  //         // Update the push_data with distance and time
  //         push_data.distance = distanceInUnit.toFixed(2)
  //         push_data.time_to_pickup = timeToPickup

  //         // Optionally update the UI with distance and time information
  //         console.log(
  //             `Distance to pickup: ${push_data.distance} km, Time to pickup: ${push_data.time_to_pickup} min`,
  //         )

  //         // Send the data to setNewRideRequest and display modal
  //         setNewRideRequest(push_data)

  //         showModal('ride_alloc.mp3')

  //         // setIsModalVisible(true)

  //         // ride_allocate.play((success) => {
  //         //     if (success) {
  //         //         console.log('Sound played successfully')
  //         //     } else {
  //         //         console.log('Failed to play sound')
  //         //     }
  //         // })

  //         // Update rider's position on the map (if required)
  //         // if (riderPickupMarker) {
  //         //     riderPickupMarker.setPosition({
  //         //         lat: riderPickupLocationLat,
  //         //         lng: riderPickupLocationLng,
  //         //     })
  //         //     setRiderPickupMarker(
  //         //         new Marker({
  //         //             position: {
  //         //                 lat: riderPickupLocationLat,
  //         //                 lng: riderPickupLocationLng,
  //         //             },
  //         //             icon: 'path/to/pick-up-pin.png',
  //         //             animation: 'DROP',
  //         //         }),
  //         //     )
  //         // }

  //         // Adjust the map camera to the rider's location

  //         if (mapRef.current) {
  //             const driverLocationLat = origin?.latitude
  //             const driverLocationLong = origin?.longitude
  //             const riderPickupLocationLat = notification?.pickup_lat
  //             const riderPickupLocationLng = notification?.pickup_long

  //             // Get destination coordinates from the push data
  //             const destinationLat = parseFloat(notification?.dropoff_lat)
  //             const destinationLng = parseFloat(notification?.dropoff_long)

  //             if (
  //                 driverLocationLat &&
  //                 driverLocationLong &&
  //                 riderPickupLocationLat &&
  //                 riderPickupLocationLng
  //             ) {
  //                 // Calculate the center of the region (midpoint between driver and pickup)
  //                 const centerLat =
  //                     (driverLocationLat + riderPickupLocationLat) / 2
  //                 const centerLng =
  //                     (driverLocationLong + riderPickupLocationLng) / 2

  //                 // Calculate the lat/lng difference between driver and pickup
  //                 const latDiff = Math.abs(
  //                     driverLocationLat - riderPickupLocationLat,
  //                 )
  //                 const lngDiff = Math.abs(
  //                     driverLocationLong - riderPickupLocationLng,
  //                 )

  //                 // Set dynamic deltas (latitudeDelta and longitudeDelta)
  //                 const latitudeDelta = latDiff + 0.05 // Adding some buffer to the region
  //                 const longitudeDelta = lngDiff + 0.05 // Adding some buffer to the region

  //                 // Zoom in the map to focus on driver and pickup location
  //                 mapRef.current.animateToRegion({
  //                     latitude: centerLat,
  //                     longitude: centerLng,
  //                     latitudeDelta: latitudeDelta,
  //                     longitudeDelta: longitudeDelta,
  //                 })
  //             }
  //         }

  //         // if (mapRef.current) {
  //         //     mapRef.current.animateToRegion({
  //         //         latitude: riderPickupLocationLat,
  //         //         longitude: riderPickupLocationLng,
  //         //         latitudeDelta: 0.01,
  //         //         longitudeDelta: 0.01,
  //         //     })
  //         // }
  //     }
  // }

  const accept_bid = (notification) => {
    console.log("Handling accept_bid notification:", notification);

    setNotificationData(notification);
    // setShowTripInfo(false)
    // setDriverArriveModalVisible(true);
    // setTimeout(() => {
    //     setDriverArriveModalVisible(false)
    //     setShowTripInfo(true)
    // }, 20000)
  };

  // const accept_bid = (notification) => {
  //     console.log('Handling accept_bid notification:', notification)

  //     // const push_data = notification

  //     // Set the pickup location of the rider
  //     const riderPickupLocationLat = parseFloat(notification.p_lat)
  //     const riderPickupLocationLng = parseFloat(notification.p_lng)

  //     console.log('push_data.p_lat', notification.p_lat)

  //     const driverLat = parseFloat(notification.d_lat)
  //     const driverLng = parseFloat(notification.d_lng)

  //     if (driverLat && driverLng) {
  //         console.log('=====driverLat======', driverLat)
  //         // Calculate distance using Haversine formula
  //         const distance = haversine(
  //             driverLat,
  //             driverLng,
  //             riderPickupLocationLat,
  //             riderPickupLocationLng,
  //         )

  //         // Convert distance to desired unit (km or miles)
  //         let distanceInUnit = distance
  //         // console.log('====distanceInUnit====', distanceInUnit)
  //         if (notification.dist_unit === 1) {
  //             // 1 indicates miles
  //             distanceInUnit = distance * 0.621371 // Convert to miles
  //         }

  //         // Calculate time in minutes
  //         const timeToPickup = calculateTime(distanceInUnit)

  //         // Update the push_data with distance and time
  //         notification.distance = distanceInUnit.toFixed(2)
  //         notification.time_to_pickup = timeToPickup

  //         // Optionally update the UI with distance and time information
  //         console.log(
  //             `Distance to pickup: ${notification.distance} km, Time to pickup: ${notification.time_to_pickup} min`,
  //         )

  //         setNotificationData(notification)
  //         setShowTripInfo(false)
  //         setDriverArriveModalVisible(true)

  //         // ride_allocate.play((success) => {
  //         //     if (success) {
  //         //         console.log('Sound played successfully')
  //         //     } else {
  //         //         console.log('Failed to play sound')
  //         //     }
  //         // })

  //         // Update rider's position on the map (if required)
  //         // if (riderPickupMarker) {
  //         //     riderPickupMarker.setPosition({
  //         //         lat: riderPickupLocationLat,
  //         //         lng: riderPickupLocationLng,
  //         //     })
  //         //     setRiderPickupMarker(
  //         //         new Marker({
  //         //             position: {
  //         //                 lat: riderPickupLocationLat,
  //         //                 lng: riderPickupLocationLng,
  //         //             },
  //         //             icon: 'path/to/pick-up-pin.png',
  //         //             animation: 'DROP',
  //         //         }),
  //         //     )
  //         // }

  //         // Adjust the map camera to the rider's location
  //         if (mapRef.current) {
  //             mapRef.current.animateToRegion({
  //                 latitude: riderPickupLocationLat,
  //                 longitude: riderPickupLocationLng,
  //                 latitudeDelta: 0.01,
  //                 longitudeDelta: 0.01,
  //             })
  //         }
  //     }
  // }

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
    // Save this token to your database for the user
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

  // useEffect(() => {
  //     const intervalId = setInterval(() => {
  //         setDriverLocation()
  //     }, 5000) // Call every 5000 milliseconds (5 seconds)

  //     // Cleanup the interval on component unmount
  //     return () => clearInterval(intervalId)
  // }, [])

  // const getLocation = async () => {
  //     try {
  //         const location = await GetLocation.getCurrentPosition({
  //             enableHighAccuracy: true,
  //             timeout: 15000,
  //         })
  //         setOrigin({
  //             latitude: location.latitude,
  //             longitude: location.longitude,
  //         })
  //         await fetchDriverLocations(location.latitude, location.longitude)
  //     } catch (error) {
  //         // console.warn('Location Error:', error.code, error.message)
  //     }
  // }

  const getLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      setOrigin({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Call setDriverLocation only after origin is set
      if (location.latitude && location.longitude) {
        // await setDriverLocation()
        // await callApis()
      }
    } catch (error) {
      // Handle location error
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

  // Set up background message handler
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // console.log('Message handled in the background!', remoteMessage)
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
      // Calling the function twice at the same time
      await Promise.all([setAvailability(), setAvailability()]);
    } catch (error) {
      console.error("Error while calling APIs concurrently:", error);
    }
  };

  // useEffect(() => {
  // callApis()
  // setDriverLocation()

  //     const intervalId = setInterval(() => {
  //         callApis()
  //         setDriverLocation()
  //     }, 100000) // 10000 ms = 10 seconds

  //     // Clean up the interval when the component unmounts
  //     return () => {
  //         clearInterval(intervalId)
  //     }
  // }, [])

  // useEffect(() => {
  //     // This effect runs only once when the component mounts to set up the interval
  //     const callApisAndSetLocation = () => {
  //         callApis()
  //         setDriverLocation()
  //     }

  //     // Call immediately on mount
  //     callApisAndSetLocation()

  //     const intervalId = setInterval(() => {
  //         callApisAndSetLocation()
  //     }, 10000) // Run every 10 seconds

  //     // Clean up the interval on unmount
  //     return () => {
  //         clearInterval(intervalId)
  //     }
  // }, [])

  /////////////// Api Set Availability /////////////////
  const setAvailability = async () => {
    // const sessId = 'MGMxNmtldTRtMmNvZmtwcTNxcjN1dDd2ajc='
    const sessId = await getSessionId();
    const url = `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sessId}`;

    const body = new URLSearchParams();
    body.append("action", "setAvailability");

    try {
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
      console.log("running setAvailability after every 10 secs ", data);
      // console.log(
      //     '=====================Success setAvailability  ==============',
      //     data,
      // )
    } catch (error) {
      console.error("Error:", error);
    }
  };

  /////////////// Api setDriverLocation /////////////////
  // const setDriverLocation = async () => {
  //     console.log('==== location new ====', location)
  //     const sessId = await getSessionId()
  //     const lat = location?.latitude
  //     const long = location?.longitude
  //     // console.log('===origin helo===', origin)
  //     const url = `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sessId}&lat=${lat}&long=${long}`

  //     const body = new URLSearchParams()
  //     body.append('action', 'setDriverLocation')

  //     try {
  //         const response = await fetch(url, {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/x-www-form-urlencoded',
  //             },
  //             body: body.toString(),
  //         })

  //         if (!response.ok) {
  //             throw new Error(`Error: ${response.status}`)
  //         }

  //         const data = await response.json()
  //         console.log('running setDriverLocation after every 10 secs ')
  //         setTimeOnline(data.driver_time_online)
  //     } catch (error) {
  //         console.error('Error:', error)
  //     }
  // }

  const setDriverLocation = async () => {
    if (!origin) {
      console.log("Origin is not yet available");
      return;
    }

    // const sessId = await getSessionId();
    const sessId = "ZWxybHIzcGVsOW5qbjhqbTA2b2VyOHRwZHE";
    const lat = origin?.latitude;
    const long = origin?.longitude;
    console.log("===origin in setDriverLocation===", origin);

    const url = `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sessId}&lat=${lat}&long=${long}`;

    const body = new URLSearchParams();
    body.append("action", "setDriverLocation");

    try {
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
      console.log("Running setDriverLocation after every 10 secs", data);
      setTimeOnline(data.driver_time_online);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setNewRideRequest(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.headerStyle]}>
        <Header isMenuIcon={true} isRightView={false} isDriver={true} />
      </View>

      {origin && (
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
          // initialRegion={{
          //     latitude: origin.latitude,
          //     longitude: origin.longitude,
          //     latitudeDelta: 0.0922,
          //     longitudeDelta: 0.0421,
          // }}
          zoomEnabled
        >
          <Marker coordinate={origin}>
            <Image
              source={require("../../assets/city-driver-icon-1.png")}
              style={styles.markerImage}
            />
            {/* <FontAwesome name='user' size={50} color='blue' /> */}
          </Marker>

          {showDirections && directionsData && (
            <MapViewDirections
              origin={directionsData.origin}
              destination={directionsData.destination}
              apikey={Google_Maps_Apikey}
              strokeColor={"black"}
              strokeWidth={2.5}
            />
          )}

          {/* {destination && (
                        <MapViewDirections
                            origin={origin}
                            destination={destination}
                            apikey={Google_Maps_Apikey}
                            strokeColor='black'
                            strokeWidth={8}
                            onReady={(result) => {
                                console.log('Route ready:', result)
                            }}
                            onError={(errorMessage) => {
                                console.log(
                                    'MapViewDirections error:',
                                    errorMessage,
                                )
                            }}
                        />
                    )} */}

          {driverLocationsList.length > 0 &&
            driverLocationsList.map((driver, index) => {
              const latitude = parseFloat(driver?.position?.lat);
              const longitude = parseFloat(driver?.position?.lng);

              if (isNaN(latitude) || isNaN(longitude)) {
                console.log(`Invalid coordinates for driver ${index + 1}`);
                return null;
              }

              return (
                <Marker
                  key={index}
                  ref={(ref) => (markerRefs.current[index] = ref)}
                  coordinate={{
                    latitude: latitude,
                    longitude: longitude,
                  }}
                  title={driver?.title}
                  rotation={driver?.b_angle}
                  description={`Driver's location`}
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
                </Marker>
              );
            })}

          {/* {driverLocationsList.map((driver) => (
                        <Marker
                            key={driver.driver_id}
                            coordinate={{
                                latitude: parseFloat(driver.position.lat),
                                longitude: parseFloat(driver.position.lng),
                            }}
                            title={driver.title}>
                            <CustomMarker driver={driver} />
                            <Callout>
                                <Text style={styles.markerText}>
                                    {driver.title}
                                </Text>
                            </Callout>
                        </Marker>
                    ))} */}
        </MapView>
      )}

      {/* {driverArriveModalVisible && (
        <DriverArriveModal
          visible={driverArriveModalVisible}
          notification={notificationData}
        />
      )} */}

      <TouchableOpacity
        onPress={() => navigation.navigate("Trips")}
        style={styles.infoContainer}
      >
        <View style={styles.mainContainer}>
          <View style={styles.tripsContainer}>
            <Text style={styles.text}>Completed Trips</Text>
            <Text style={styles.number}>0</Text>
          </View>
          <View style={styles.earningsContainer}>
            <Text style={styles.text}>Today's earning</Text>
            <Text style={styles.number}>Rs0.00</Text>
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "85%",
  },
  earningsContainer: {
    flexDirection: "column",
    gap: 15,
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    height: "30%",
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
});

export default DriverMap;
