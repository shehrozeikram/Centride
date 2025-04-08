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
  ActivityIndicator, // Import ActivityIndicator for loader
} from "react-native";
import Geocoding from "react-native-geocoding";
import DriverDropoffModal from "./DriverDropoffModal";
import { GOOGLE_MAPS_API_KEY } from "../constants/googleMapKey";
import { getSessionId } from "../utils/common";
import { DRIVER_BASE_URL } from "../utils/constants";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
Geocoding.init(GOOGLE_MAPS_API_KEY);

const DriverPickupModal = ({
  visible,
  onClose,
  newRideRequest,
  setDriverArriveModalVisible,
  setPickupModalVisible,
  setShowDirections,
  setDirectionsData,
}) => {
  const [dropoffModalVisible, setDropoffModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePickUp = async () => {
    setLoading(true);
    const url = `${DRIVER_BASE_URL}`;
    const sess_id = await getSessionId();
    const params = {
      sess_id: sess_id,
      action_get: "startride",
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
      setDropoffModalVisible(true);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
    }
  };

  // const handleCancelRide = () => {
  //   console.log("ride is cancelled");
  //   setDriverArriveModalVisible(false);
  //   setPickupModalVisible(false);
  //   setShowDirections(false);
  // };

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
      setDriverArriveModalVisible(false);
      setPickupModalVisible(false);
      setShowDirections(false);
      setDirectionsData(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Conditionally show the modal
  if (dropoffModalVisible) {
    return (
      <DriverDropoffModal
        visible={dropoffModalVisible}
        newRideRequest={newRideRequest}
        setDriverArriveModalVisible={setDriverArriveModalVisible}
        setPickupModalVisible={setPickupModalVisible}
        setDropoffModalVisible={setDropoffModalVisible}
        setShowDirections={setShowDirections}
        setDirectionsData={setDirectionsData}
      />
    );
  }

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
                  {newRideRequest?.rider_name || "Unknown Rider"}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>Waiting for the Customer</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </View>

          {/* Section 2 - Pickup Info */}
          <View style={styles.section}>
            <View style={styles.column}>
              <View style={styles.pickupInfo}>
                <Image
                  source={require("../assets/pick-up2.png")}
                  style={styles.pickupImage}
                />
                <Text style={styles.pickupAddressText} numberOfLines={2}>
                  {newRideRequest?.p_address}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
          </View>

          {/* Button Section - "Pick Up" Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.pickupButton}
              onPress={handlePickUp}
              disabled={loading} // Disable the button if loading is true
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" /> // Show loader
              ) : (
                <Text style={styles.pickupText}>Pick Up</Text>
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
    // </Modal>
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
  pickupButton: {
    backgroundColor: "green",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.85,
  },
  pickupText: {
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

export default DriverPickupModal;
