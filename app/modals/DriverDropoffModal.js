import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Geocoding from "react-native-geocoding";
import { GOOGLE_MAPS_API_KEY } from "../constants/googleMapKey";
import { DRIVER_BASE_URL } from "../utils/constants";
import { getSessionId } from "../utils/common";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const navigation = useNavigation();

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

  return modalVisible ? (
    <View style={[styles.modalContainer, styles.transparentBackground]}>
      <View style={styles.modalContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.profileAndRating}>
                <Image
                  source={
                    (rideData?.rider_image || newRideRequest?.rider_image) 
                      ? { uri: rideData?.rider_image || newRideRequest?.rider_image }
                      : require("../assets/driver.png") // Default image
                  }
                  style={styles.profileImage}
                  defaultSource={require("../assets/driver.png")} // Fallback image while loading
                />
                <Text style={styles.driverName}>
                  {rideData?.rider_name || newRideRequest?.rider_name || "Unknown Rider"}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {rideData?.time_to_pickup || newRideRequest?.time_to_pickup || "--"}
                </Text>
                <Text style={styles.timeText}>Mins</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </View>

          <View style={styles.section}>
            <View style={styles.column}>
              <View style={styles.pickupInfo}>
                <Image
                  source={require("../assets/pick-up2.png")}
                  style={styles.pickupImage}
                />
                <Text style={styles.pickupAddressText} numberOfLines={2}>
                  {rideData?.d_address || newRideRequest?.d_address || "No address available"}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
          </View>

          <View style={styles.buttonContainer}>
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
            {/* Cancel Ride Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRide}
            >
              <Text style={styles.cancelText}>CANCEL RIDE</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  },
  scrollContainer: {
    paddingVertical: 8,
  },
  section: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileAndRating: {
    flexDirection: "column",
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  driverName: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  timeContainer: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 6,
  },
  pickupInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    overflow: "hidden",
    flexWrap: "wrap",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  dropoffButton: {
    backgroundColor: "orange",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.85,
  },
  dropoffText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
  },
  cancelButton: {
    // backgroundColor: "#f44336", // Red color
    // borderRadius: 30,
    // paddingVertical: 10,
    // paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.25,
    marginLeft: "70%",
    marginTop: 10,
  },
  cancelText: {
    color: "red",
    fontSize: 14,
    fontWeight: "400",
  },
});

export default DriverDropoffModal;
