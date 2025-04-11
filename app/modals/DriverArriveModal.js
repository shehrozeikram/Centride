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
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import Geocoding from "react-native-geocoding";
import { useSelector } from "react-redux";
import DriverPickupModal from "./DriverPicupModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GOOGLE_MAPS_API_KEY } from "../constants/googleMapKey";
import { DRIVER_BASE_URL } from "../utils/constants";
import { getSessionId } from "../utils/common";

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
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.profileAndRating}>
                <Image
                  source={
                    currentRideData?.rider_image
                      ? { uri: currentRideData.rider_image }
                      : require("../assets/driver.png") // Add a default image
                  }
                  style={styles.profileImage}
                  defaultSource={require("../assets/driver.png")} // Fallback image
                />
                <Text style={styles.driverName}>
                  {currentRideData?.rider_name || "Unknown Rider"}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {calculatedRideData.time_to_pickup || "--"}
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
                  source={require("../assets/pick-up2.png")}
                  style={styles.pickupImage}
                />
                <Text style={styles.pickupText} numberOfLines={2}>
                  {currentRideData?.p_address}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.arrivedButton}
              onPress={handleDriverArrive}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.arrivedText}>I'VE ARRIVED</Text>
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
  );
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
  arrivedButton: {
    backgroundColor: "#2196F3",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.85,
  },
  arrivedText: {
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

export default DriverArriveModal;
