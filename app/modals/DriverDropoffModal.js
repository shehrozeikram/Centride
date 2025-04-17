import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Share,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Geocoding from "react-native-geocoding";
import { GOOGLE_MAPS_API_KEY } from "../constants/googleMapKey";
import { DRIVER_BASE_URL } from "../utils/constants";
import { getSessionId } from "../utils/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

Geocoding.init(GOOGLE_MAPS_API_KEY);

const DriverDropoffModal = ({
  visible,
  onClose,
  newRideRequest,
  setDriverArriveModalVisible,
  setPickupModalVisible,
  setShowDirections,
  setDirectionsData,
}) => {
  const [modalVisible, setModalVisible] = useState(visible || false);
  const [dropoffModalVisible, setDropoffModalVisible] = useState(visible || false);
  const [rideData, setRideData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  console.log("newRideRequest===", newRideRequest);

  useEffect(() => {
    if (newRideRequest) {
      setModalVisible(true);
    }
  }, [newRideRequest]);

  useEffect(() => {
    const loadRideData = async () => {
      if (visible) {
        if (newRideRequest) {
          setRideData(newRideRequest);
          await saveNewRideRequestToStorage(newRideRequest);
        } else {
          const savedRideRequest = await getNewRideRequestFromStorage();
          if (savedRideRequest) {
            console.log("Loaded saved ride request:", savedRideRequest);
            setRideData(savedRideRequest);
          }
        }
      }
    };

    loadRideData();
  }, [visible, newRideRequest]);

  useEffect(() => {
    if (visible !== undefined) {
      setModalVisible(visible);
      setDropoffModalVisible(visible);
    }
  }, [visible]);

  const saveNewRideRequestToStorage = async (request) => {
    try {
      await AsyncStorage.setItem("newRideRequest", JSON.stringify(request));
      console.log("New ride request saved in AsyncStorage!");
    } catch (error) {
      console.error("Error saving newRideRequest to AsyncStorage", error);
    }
  };

  const getNewRideRequestFromStorage = async () => {
    try {
      const savedRequest = await AsyncStorage.getItem("newRideRequest");
      if (savedRequest !== null) {
        console.log(
          "Retrieved newRideRequest from AsyncStorage:",
          JSON.parse(savedRequest)
        );
        return JSON.parse(savedRequest);
      }
    } catch (error) {
      console.error("Error retrieving newRideRequest from AsyncStorage", error);
    }
  };

  const saveRideStateToStorage = async (request) => {
    try {
      const rideState = {
        modalState: 'DROPOFF',
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
      await AsyncStorage.setItem("activeModalState", "DROPOFF");
      console.log("Saved dropoff state:", rideState);
    } catch (error) {
      console.error("Error saving dropoff state:", error);
    }
  };

  const handleDropOff = async () => {
    try {
      setLoading(true);
      
      // Get the current ride data from either source
      const currentRideData = rideData || newRideRequest;
      
      if (!currentRideData?.booking_id) {
        console.error("No booking ID found in ride data");
        Alert.alert("Error", "Could not find booking information");
        return;
      }

      console.log("Processing dropoff for booking:", currentRideData);
      
      const url = `${DRIVER_BASE_URL}`;
      const sess_id = await getSessionId();
      
      // Use currentRideData instead of newRideRequest
      const params = {
        sess_id: sess_id,
        action_get: "drivercompleted",
        bookingid: currentRideData.booking_id,
        complete_code: currentRideData.completion_code,
        ride_distance: currentRideData.distance,
        ride_duration_secs: currentRideData.time_to_pickup,
        ride_duration_secs_formated: currentRideData.time_to_pickup,
        ride_fare: currentRideData.fare,
        city_currency_symbol: "₨",
        city_currency_exchng: "1.00000",
        city_currency_code: "PKR",
        amount_paid_by_rider: currentRideData.fare,
        coupon_code: currentRideData.coupon_code || "",
        coupon_discount_type: currentRideData.coupon_discount_type || "",
        coupon_discount_value: currentRideData.coupon_discount_value || "",
        referral_used: currentRideData.referral_used || "",
        referral_discount_value: currentRideData.referral_discount_value || "",
      };

      console.log("Sending dropoff request with params:", params);

      const queryString = new URLSearchParams(params).toString();
      const requestUrl = `${url}?${queryString}`;
      
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      console.log("Drop off API response:", jsonResponse);

      // Clear stored data
      await AsyncStorage.removeItem("newRideRequest");
      await AsyncStorage.removeItem("activeRideState");
      await AsyncStorage.removeItem("activeModalState");

      // Reset all states
      setModalVisible(false);
      setDropoffModalVisible(false);
      
      // Reset parent component states if the functions exist
      if (typeof setDriverArriveModalVisible === 'function') {
        setDriverArriveModalVisible(false);
      }
      if (typeof setShowDirections === 'function') {
        setShowDirections(false);
      }
      if (typeof setPickupModalVisible === 'function') {
        setPickupModalVisible(false);
      }
      if (typeof setDirectionsData === 'function') {
        setDirectionsData(null);
      }

      // Navigate to completion screen with the current ride data
      navigation.replace("DriverRideCompleted", { 
        newRideRequest: currentRideData,
        fromDropoff: true 
      });

    } catch (error) {
      console.error("Error in handleDropOff:", error);
      Alert.alert(
        "Error",
        "Failed to complete drop off. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      setLoading(true);
      const currentRideData = rideData || newRideRequest;
      
      if (!currentRideData?.booking_id) {
        console.warn("No booking ID found");
        return;
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

      // Clear all stored data first
      await AsyncStorage.removeItem("newRideRequest");
      await AsyncStorage.removeItem("activeRideState");
      await AsyncStorage.removeItem("activeModalState");

      // Reset local state
      setRideData(null);
      setModalVisible(false);
      setDropoffModalVisible(false);
      
      // Clear map data
      if (typeof setDirectionsData === 'function') {
        setDirectionsData(null);
      }
      if (typeof setShowDirections === 'function') {
        setShowDirections(false);
      }

      // Reset all modal visibility states
      // Check if functions exist before calling them
      if (typeof setDriverArriveModalVisible === 'function') {
        setDriverArriveModalVisible(false);
      }
      if (typeof setPickupModalVisible === 'function') {
        setPickupModalVisible(false);
      }

      console.log("Ride cancelled and all states reset successfully");

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

  const handleCall = () => {
    const phoneNumber = (rideData || newRideRequest)?.rider_phone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleChat = () => {
    // Chat functionality to be implemented
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
        if ((rideData || newRideRequest)?.d_address) {
          Share.share({
            message: `Location: ${(rideData || newRideRequest).d_address}`,
          });
        }
        break;
      case 'navigate':
        if ((rideData || newRideRequest)?.d_lat && (rideData || newRideRequest)?.d_lng) {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${(rideData || newRideRequest).d_lat},${(rideData || newRideRequest).d_lng}`;
          Linking.openURL(url);
        }
        break;
      case 'cancel':
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

  return modalVisible ? (
    <View style={[styles.modalContainer, styles.transparentBackground]}>
      <View style={styles.modalContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.leftSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={
                    (rideData?.rider_image || newRideRequest?.rider_image) 
                      ? { uri: rideData?.rider_image || newRideRequest?.rider_image }
                      : require("../assets/driver.png")
                  }
                  style={styles.profileImage}
                  defaultSource={require("../assets/driver.png")}
                />
                <View style={styles.notificationBadge} />
              </View>
              <Text style={styles.nameText}>
                {rideData?.rider_name || newRideRequest?.rider_name || "Unknown Rider"}
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
                  {rideData?.time_to_pickup || newRideRequest?.time_to_pickup || "--"} Min
                </Text>
              </View>
            </View>
          </View>

          {/* Dropoff Info */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {newRideRequest?.dropoff_location  || newRideRequest?.d_address || "No address available"}
            </Text>
          </View>

          {/* Button Section */}
          <TouchableOpacity
            style={styles.dropoffButton}
            onPress={handleDropOff}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.dropoffText}>Drop Off</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Menu Modal */}
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
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "transparent",
    position: "absolute",
    zIndex: 99999,
    bottom: 4,
  },
  modalContent: {
    width: screenWidth,
    maxHeight: screenHeight * 0.55,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    padding: 20,
  },
  scrollContainer: {
    paddingVertical: 8,
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
    color: '#000',
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
  locationContainer: {
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  dropoffButton: {
    backgroundColor: "orange",
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  dropoffText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
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

export default DriverDropoffModal;
