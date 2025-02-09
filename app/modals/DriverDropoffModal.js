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

const DriverDropoffModal = ({ visible, onClose, newRideRequest }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [rideData, setRideData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (newRideRequest) {
      setModalVisible(true);
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

  const handleDropOff = async () => {
    const url = `${DRIVER_BASE_URL}`;
    const sess_id = await getSessionId();
    const params = {
      sess_id: sess_id,
      action_get: "drivercompleted",
      bookingid: newRideRequest.booking_id,
      complete_code: newRideRequest.completion_code,
      ride_distance: newRideRequest.distance,
      ride_duration_secs: newRideRequest.time_to_pickup,
      ride_duration_secs_formated: newRideRequest.time_to_pickup,
      ride_fare: newRideRequest.fare,
      city_currency_symbol: "₨",
      city_currency_exchng: "1.00000",
      city_currency_code: "PKR",
      amount_paid_by_rider: newRideRequest.fare,
      coupon_code: newRideRequest.coupon_code,
      coupon_discount_type: newRideRequest.coupon_discount_type,
      coupon_discount_value: newRideRequest.coupon_discount_value,
      referral_used: newRideRequest.referral_used,
      referral_discount_value: newRideRequest.referral_discount_value,
    };

    // Set loading state (if you want to show a loading indicator while the API is called)
    setLoading(true);

    try {
      const queryString = new URLSearchParams(params).toString();
      const requestUrl = `${url}?${queryString}`;
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const jsonResponse = await response.json();
      // setResponseData(jsonResponse);
      setLoading(false);
      setModalVisible(false);
      navigation.replace("DriverRideCompleted", { newRideRequest });
    } catch (error) {
      setLoading(false);
      console.error("Error calling API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.modalContainer, styles.transparentBackground]}>
      <View style={styles.modalContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                  {/* {newRideRequest?.rider_name} */}
                  {rideData?.rider_name}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {newRideRequest?.time_to_pickup}
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
                  {/* {newRideRequest?.d_address} */}
                  {rideData?.d_address}
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
});

export default DriverDropoffModal;
