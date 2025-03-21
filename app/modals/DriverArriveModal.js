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

  const mapRef = useRef(null);

  // console.log("newRideRequest-+", newRideRequest);
  // console.log("user-+", user);

  useEffect(() => {
    if (newRideRequest) {
      getDistanceAndTime();
    }
  }, [newRideRequest]);

  useEffect(() => {
    const fetchRideData = async () => {
      if (newRideRequest) {
        setRideData(newRideRequest);
        await saveNewRideRequestToStorage(newRideRequest);
      } else {
        const savedRideRequest = await getNewRideRequestFromStorage();
        if (savedRideRequest) {
          setRideData(savedRideRequest);
        }
      }
    };

    fetchRideData();
  }, [newRideRequest]);

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

  const getDistanceAndTime = async () => {
    try {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const origin = `${latitude},${longitude}`;
          const destination = `${newRideRequest?.p_lat},${newRideRequest?.p_lng}`;

          const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.status === "OK") {
            const element = data.rows[0].elements[0];
            if (element.status === "OK") {
              const distanceText = element.distance.text;
              const distanceInMeters = element.distance.value;
              const durationText = element.duration.text;

              console.log(
                `Distance: ${distanceText}, Duration: ${durationText}`
              );

              const distanceInKilometers = distanceInMeters / 1000;

              const speed = 60;
              const timeInHours = distanceInKilometers / speed;
              let timeInMinutes = timeInHours * 60;
              if (timeInMinutes < 1) {
                timeInMinutes = 1;
              }

              timeInMinutes = Math.round(timeInMinutes);

              console.log(
                `Estimated Time at 60 km/h: ${timeInMinutes} minutes`
              );

              // Update the calculatedRideData state without affecting the original rideData
              setCalculatedRideData({
                time_to_pickup: timeInMinutes,
                estimated_distance: `${distanceInKilometers.toFixed(2)} km`,
              });
            }
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error("Error fetching distance and time:", error);
    }
  };

  const handleDriverArrive = async () => {
    setLoading(true);
    const url = `${DRIVER_BASE_URL}`;
    const sess_id = await getSessionId();
    const params = {
      sess_id: sess_id,
      action_get: "driverarrived",
      bookingid: newRideRequest?.booking_id || rideData?.booking_id,
    };

    const queryString = new URLSearchParams(params).toString();
    const requestUrl = `${url}?${queryString}`;

    try {
      const response = await fetch(requestUrl, {
        method: "GET",
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setLoading(false);
      setPickupModalVisible(true);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
    }
  };

  const handleCancelRide = async () => {
    const url = `${DRIVER_BASE_URL}`;
    const sess_id = await getSessionId();
    const params = {
      sess_id: sess_id,
      action_get: "bookingcancel",
      bookingid: newRideRequest?.booking_id || rideData?.booking_id,
      comment: "delete",
    };

    const queryString = new URLSearchParams(params).toString();
    const requestUrl = `${url}?${queryString}`;

    try {
      const response = await fetch(requestUrl, {
        method: "GET",
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setLoading(false);
      setShowDirections(false);
      setDriverArriveModalVisible(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // const handleCancelRide = () => {
  //   console.log("ride is cancelled");
  //   setDriverArriveModalVisible(false);
  //   setShowDirections(false);
  // };

  if (pickupModalVisible) {
    return (
      <DriverPickupModal
        visible={pickupModalVisible}
        newRideRequest={rideData}
        setDriverArriveModalVisible={setDriverArriveModalVisible}
        setPickupModalVisible={setPickupModalVisible}
        setDropoffModalVisible={setDropoffModalVisible}
        setShowDirections={setShowDirections}
      />
    );
  }

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Driver Info Section */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.profileAndRating}>
                <Image
                  source={{
                    uri: newRideRequest?.rider_image,
                  }}
                  style={styles.profileImage}
                />
                <Text style={styles.driverName}>
                  {rideData?.rider_name || "Unknown Rider"}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {calculatedRideData.time_to_pickup}
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
                  {rideData?.p_address}
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
