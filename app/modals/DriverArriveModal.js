import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
  Platform,
  Modal,
  Animated,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import Geocoding from "react-native-geocoding";
import { useSelector } from "react-redux";
import DriverPickupModal from "./DriverPicupModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GOOGLE_MAPS_API_KEY } from "../constants/googleMapKey";
import { DRIVER_BASE_URL } from "../utils/constants";
import { getSessionId } from "../utils/common";
import Ionicons from "react-native-vector-icons/Ionicons";
import ChatModal from './ChatModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

Geocoding.init(GOOGLE_MAPS_API_KEY);

const DriverArriveModal = ({
  newRideRequest,
  setDriverArriveModalVisible,
  setDropoffModalVisible,
  setShowDirections,
  setDirectionsData,
}) => {
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rideData, setRideData] = useState(null);
  const [calculatedRideData, setCalculatedRideData] = useState({
    time_to_pickup: null,
    estimated_distance: null,
  });
  const user = useSelector((state) => state.user?.user);
  const intervalRef = useRef(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Move all function definitions before useEffect
  const calculateDistanceAndTime = () => {
    const currentRideData = rideData || newRideRequest;
    
    if (!currentRideData) {
      console.warn("No ride data available");
      return;
    }

    const pickupLat = parseFloat(currentRideData.p_lat);
    const pickupLng = parseFloat(currentRideData.p_lng);

    if (isNaN(pickupLat) || isNaN(pickupLng)) {
      console.warn("Invalid pickup coordinates:", {
        raw_p_lat: currentRideData.p_lat,
        raw_p_lng: currentRideData.p_lng
      });
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          console.log("Calculating distance with coordinates:", {
            driverLat: latitude,
            driverLng: longitude,
            pickupLat,
            pickupLng
          });

          const origin = `${latitude},${longitude}`;
          const destination = `${pickupLat},${pickupLng}`;

          const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.status === "OK" && data.rows[0]?.elements[0]?.status === "OK") {
            const element = data.rows[0].elements[0];
            const distanceInMeters = element.distance.value;
            const distanceInKilometers = distanceInMeters / 1000;
            const timeInMinutes = Math.max(1, Math.round((distanceInKilometers / 60) * 60));

            setCalculatedRideData({
              time_to_pickup: timeInMinutes,
              estimated_distance: `${distanceInKilometers.toFixed(2)} km`,
            });
          }
        } catch (error) {
          console.error("Error in distance calculation:", error);
        }
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
    );
  };

  const saveNewRideRequestToStorage = async (request) => {
    try {
      const rideState = {
        modalState: 'ARRIVE',
        rideRequest: request,
        directionsData: {
          origin: {
            latitude: parseFloat(request.p_lat),
            longitude: parseFloat(request.p_lng)
          },
          destination: {
            latitude: parseFloat(request.d_lat),
            longitude: parseFloat(request.d_lng)
          }
        },
        showDirections: true
      };
      
      await AsyncStorage.setItem("activeRideState", JSON.stringify(rideState));
      console.log("Saved arrive state:", rideState);
    } catch (error) {
      console.error("Error saving arrive state:", error);
    }
  };

  const getNewRideRequestFromStorage = async () => {
    try {
      const savedState = await AsyncStorage.getItem("activeRideState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        console.log("Retrieved ride state:", parsedState);
        return parsedState;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving ride state from AsyncStorage:", error);
      return null;
    }
  };

  // Handle chat messages
  useEffect(() => {
    if (newRideRequest?.chatMessage) {
      console.log("New chat message received in DriverArriveModal:", newRideRequest.chatMessage);
      setChatMessage(newRideRequest.chatMessage);
      if (!chatModalVisible) {
        setChatModalVisible(true);
      }
    }
  }, [newRideRequest?.chatMessage]);

  // Now use useEffect after all function definitions
  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      try {
        if (newRideRequest) {
          console.log("Setting new ride request:", newRideRequest);
          setRideData(newRideRequest);
          await saveNewRideRequestToStorage(newRideRequest);
          
          if (typeof setDirectionsData === 'function') {
            setDirectionsData({
              origin: {
                latitude: parseFloat(newRideRequest.p_lat),
                longitude: parseFloat(newRideRequest.p_lng)
              },
              destination: {
                latitude: parseFloat(newRideRequest.d_lat),
                longitude: parseFloat(newRideRequest.d_lng)
              }
            });
          }
          
          if (typeof setShowDirections === 'function') {
            setShowDirections(true);
          }
        } else {
          const savedState = await getNewRideRequestFromStorage();
          if (savedState && mounted) {
            console.log("Restoring saved ride state");
            setRideData(savedState.rideRequest);
            
            if (typeof setDirectionsData === 'function') {
              setDirectionsData(savedState.directionsData);
            }
            
            if (typeof setShowDirections === 'function') {
              setShowDirections(savedState.showDirections);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
    
    if (mounted) {
      calculateDistanceAndTime();
      intervalRef.current = setInterval(calculateDistanceAndTime, 5000);
    }

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [newRideRequest]);

  // Move the early return check here, after all hooks are declared
  if (!newRideRequest && !rideData) {
    return null;
  }

  const handleDriverArrive = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentRideData = rideData || newRideRequest;
      const url = `${DRIVER_BASE_URL}`;
      const sess_id = await getSessionId();
      const params = {
        sess_id: sess_id,
        action_get: "driverarrived",
        bookingid: currentRideData?.booking_id,
      };

      const queryString = new URLSearchParams(params).toString();
      const requestUrl = `${url}?${queryString}`;

      const response = await fetch(requestUrl, { method: "GET" });

      if (!response.ok) throw new Error("Network response was not ok");

      // Save the new modal state before showing pickup modal
      await AsyncStorage.setItem("activeModalState", "PICKUP");
      setPickupModalVisible(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentRideData = rideData || newRideRequest;
      if (!currentRideData?.booking_id) {
        throw new Error("No booking ID found");
      }

      const url = `${DRIVER_BASE_URL}`;
      const sess_id = await getSessionId();
      const params = {
        sess_id: sess_id,
        action_get: "bookingcancel",
        bookingid: currentRideData.booking_id,
        comment: "delete",
      };

      const queryString = new URLSearchParams(params).toString();
      const requestUrl = `${url}?${queryString}`;

      const response = await fetch(requestUrl, { method: "GET" });
      if (!response.ok) throw new Error("Network response was not ok");

      // First clear the map states
      if (typeof setDirectionsData === 'function') {
        setDirectionsData(null);
      }
      if (typeof setShowDirections === 'function') {
        setShowDirections(false);
      }

      // Clear local states
      setRideData(null);
      setCalculatedRideData({
        time_to_pickup: null,
        estimated_distance: null,
      });
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Clear storage
      await AsyncStorage.removeItem("activeRideState");
      
      // Close modal last
      if (typeof setDriverArriveModalVisible === 'function') {
        setDriverArriveModalVisible(false);
      }

      console.log("Ride cancelled successfully");

    } catch (error) {
      console.error("Error canceling ride:", error);
      Alert.alert(
        "Error",
        "Failed to cancel ride. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async () => {
    const currentRideData = rideData || newRideRequest;
    const phoneNumber = currentRideData?.rider_phone;
    
    if (!phoneNumber) {
      Alert.alert(
        "Error",
        "Phone number not available",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          "Phone calls are not supported on this device",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not initiate phone call",
        [{ text: "OK" }]
      );
    }
  };

  const handleShare = async () => {
    const currentRideData = rideData || newRideRequest;
    
    try {
      const shareMessage = `
Ride Details:
Passenger: ${currentRideData?.rider_name || 'Unknown'}
Pickup Location: ${currentRideData?.p_address || 'Not specified'}
Distance: ${calculatedRideData.estimated_distance || 'Unknown'}
Estimated Time: ${calculatedRideData.time_to_pickup || '--'} mins
      `.trim();

      const result = await Share.share({
        message: shareMessage,
        title: 'Ride Details',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not share ride details",
        [{ text: "OK" }]
      );
    }
  };

  const handleChat = () => {
    setChatModalVisible(true);
  };

  const handleMenuPress = () => {
    setShowMenu(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10
    }).start();
  };

  const handleCloseMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => setShowMenu(false));
  };

  const handleMenuOption = (option) => {
    handleCloseMenu();
    switch(option) {
      case 'share':
        // Handle share location
        if (currentRideData?.p_address) {
          Share.share({
            message: `Location: ${currentRideData.p_address}`,
          });
        }
        break;
      case 'navigate':
        // Handle navigation
        if (currentRideData?.p_lat && currentRideData?.p_lng) {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${currentRideData.p_lat},${currentRideData.p_lng}`;
          Linking.openURL(url);
        }
        break;
      case 'cancel':
        // Handle ride cancellation
        Alert.alert(
          "Cancel Ride",
          "Are you sure you want to cancel this ride?",
          [
            {
              text: "No",
              style: "cancel"
            },
            {
              text: "Yes",
              onPress: handleCancelRide
            }
          ]
        );
        break;
    }
  };

  // Render pickup modal if visible
  if (pickupModalVisible) {
    return (
      <DriverPickupModal
        visible={pickupModalVisible}
        newRideRequest={rideData || newRideRequest}
        setDriverArriveModalVisible={setDriverArriveModalVisible}
        setPickupModalVisible={setPickupModalVisible}
        setDropoffModalVisible={setDropoffModalVisible}
        setShowDirections={setShowDirections}
        setDirectionsData={setDirectionsData}
      />
    );
  }

  const currentRideData = rideData || newRideRequest;

  return (
    <View style={styles.container}>
      {/* Profile Section - Moved to top */}
      <View style={styles.profileSection}>
        <View style={styles.leftSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                currentRideData?.rider_image
                  ? { uri: currentRideData.rider_image }
                  : require("../assets/driver.png")
              }
              style={styles.profileImage}
            />
            <View style={styles.notificationBadge} />
          </View>
          <Text style={styles.nameText}>
            {currentRideData?.rider_name || "Unknown Rider"}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity onPress={handleCall} style={styles.actionButton}>
              <Ionicons name="call" size={22} color="#555555" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChat} style={styles.actionButton}>
              <Ionicons name="chatbubble" size={22} color="#555555" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMenuPress} style={styles.actionButton}>
              <Ionicons name="menu" size={22} color="#555555" />
            </TouchableOpacity>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color="#4CAF50" />
            <Text style={styles.timeText}>
              {calculatedRideData.time_to_pickup || "0"} Min
            </Text>
          </View>
        </View>
      </View>

      {/* Pickup Location - Moved below profile section */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>
          {currentRideData?.p_address}
        </Text>
      </View>

      {/* Pickup Button */}
      <TouchableOpacity 
        style={[styles.pickupButton, { backgroundColor: '#4A90E2' }]} 
        onPress={handleDriverArrive}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.pickupButtonText}>I'VE ARRIVED</Text>
        )}
      </TouchableOpacity>

      <ChatModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
        riderName={currentRideData?.rider_name}
        riderId={currentRideData?.rider_id}
        driverId={user?.id}
        initialMessage={chatMessage}
      />

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseMenu}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1} 
          onPress={handleCloseMenu}
        >
          <Animated.View 
            style={[
              styles.menuContainer,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuOption('share')}
            >
              <Ionicons name="share-social" size={20} color="#8B00FF" />
              <Text style={styles.menuText}>Share location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuOption('navigate')}
            >
              <Ionicons name="navigate" size={20} color="#555555" />
              <Text style={styles.menuText}>Navigate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuOption('cancel')}
            >
              <Ionicons name="close" size={20} color="#FF4444" />
              <Text style={[styles.menuText, { color: '#FF4444' }]}>Cancel ride</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFA500',
    borderWidth: 2,
    borderColor: 'white',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  rightSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  pickupButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  pickupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  timeText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});

export default DriverArriveModal;
