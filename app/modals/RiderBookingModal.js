import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getSessionId } from "../utils/common";
import messaging from "@react-native-firebase/messaging";
import database from "@react-native-firebase/database";
import { useSelector } from "react-redux";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const RiderBookingModal = ({ visible, onClose, newRideRequest, location }) => {
  const [updatedRiderId, setUpdatedRiderId] = useState(null);
  const [ridersData, setRidersData] = useState([]);
  const [newMessage, setNewMessage] = useState(null);

  const [matchingRiders, setMatchingRiders] = useState([]); // To hold the matching rider ids
  const [timestamp, setTimestamp] = useState(null); // Store the current Unix timestamp
  const prevActionRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const user = useSelector((state) => state.user?.user);

  const prevMessageRef = useRef(null);

  // console.log('======user in modal======', user)
  console.log("newRideRequest in rider modal", newRideRequest);
  // console.log('=====location======', location)

  let min_bid_fare = 0;
  let max_bid_fare = 0;
  let mid_bid_fare = 0;

  // Check if all necessary properties are available and not null/undefined
  if (
    newRideRequest?.ride_bid_fare &&
    newRideRequest?.ride_bid_min_val &&
    newRideRequest?.ride_bid_max_val &&
    newRideRequest?.fare
  ) {
    // Extract and parse necessary values
    const fare = parseFloat(newRideRequest.fare); // Base fare
    const bid_rider_fare = parseFloat(newRideRequest.ride_bid_fare); // Rider's bid fare
    const bid_min = parseFloat(newRideRequest.ride_bid_min_val); // Min bid percentage
    const bid_max = parseFloat(newRideRequest.ride_bid_max_val); // Max bid percentage

    // console.log('Fare:', fare)
    // console.log('Rider Bid Fare:', bid_rider_fare)
    // console.log('Min Bid Percentage:', bid_min)
    // console.log('Max Bid Percentage:', bid_max)

    // Check if parsed values are valid numbers
    if (
      isNaN(fare) ||
      isNaN(bid_rider_fare) ||
      isNaN(bid_min) ||
      isNaN(bid_max)
    ) {
      console.error("Invalid values detected. One or more values are NaN.");
    } else {
      // Calculate min_bid_fare, max_bid_fare, and mid_bid_fare
      min_bid_fare = Math.ceil((bid_min / 100) * fare) + fare; // Adding bid to base fare
      max_bid_fare = Math.ceil((bid_max / 100) * fare) + fare; // Adding bid to base fare
      mid_bid_fare = Math.ceil((min_bid_fare + max_bid_fare) / 2); // Midpoint of min and max bid fare

      // console.log('Min Bid Fare:', min_bid_fare)
      // console.log('Max Bid Fare:', max_bid_fare)
      // console.log('Mid Bid Fare:', mid_bid_fare)
    }
  }

  const getCurrentUnixTimestamp = () => {
    return Math.floor(Date.now() / 1000); // Current timestamp in seconds
  };

  // const saveDataAcceptRide = async () => {
  //     const currentTimestamp = getCurrentUnixTimestamp()
  //     console.log('currentTimestamp', currentTimestamp)
  //     console.log('newRideRequest = ab', newRideRequest)
  //     const msgData = {
  //         action: 'driver-bid-notify',
  //         bid_fare: newRideRequest?.fare,
  //         booking_id: newRideRequest?.booking_id,
  //         driver_carid: user?.driver_ride_id,
  //         driver_carmodel: user?.car_model,
  //         driver_firstname: user?.firstname,
  //         driver_image: user
  //             ? { uri: user?.photo }
  //             : require('../assets/driver.png'),
  //         driver_carcolor: user?.car_color,
  //         driver_completed_rides: user?.completed_rides,
  //         driver_id: user?.driverid,
  //         driver_location_lat: location.latitude,
  //         driver_location_long: location.longitude,
  //         driver_phone: user?.phone,
  //         driver_photo: user?.photo,
  //         driver_platenum: user?.car_plate_num,
  //         driver_car_year: user?.car_year,
  //         driver_rating: user?.driver_rating,
  //         pickup_addr: newRideRequest?.pickup_addr,
  //         pickup_lat: newRideRequest?.p_lat,
  //         pickup_long: newRideRequest?.p_lng,
  //         time_notified: getCurrentUnixTimestamp(),
  //         ttl: 30,
  //         dropoff_lat: newRideRequest?.d_lat,
  //         dropoff_long: newRideRequest?.d_lng,
  //         distance: newRideRequest?.distance,
  //         destination_time_to_reach: newRideRequest?.time_to_pickup,

  //     }
  //     try {
  //         const userId = newRideRequest?.rider_id
  //         await database().ref(`/Riders/ridr-${userId}/notf/msg`).set(msgData)
  //         await database()
  //             .ref(`/Riders/ridr-${userId}/notf/msg_t`)
  //             .set(currentTimestamp)

  //         console.log(
  //             'Data saved successfully from driver',
  //             userId,
  //             currentTimestamp,
  //         )
  //     } catch (error) {
  //         console.error('Error saving data for driverId:', error)
  //     }
  // }

  const acceptRide = async () => {
    const sessId = getSessionId();
    const url = `https://appserver.txy.co/ajaxdriver_2_1_1.php?sess_id=${sessId}`;

    // Request body data as x-www-form-urlencoded
    const body = new URLSearchParams({
      action_get: "acceptride",
      bookingid: newRideRequest?.booking_id,
      bid_fare: 0,
    });
    console.log("body=b", body);

    try {
      // saveDataAcceptRide()
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Connection: "keep-alive",
        },
        body: body.toString(),
      });

      if (res.ok) {
        console.log("res=", res.ok);
        // const data = await res.json()
        // console.log('========acceptRide=======', data)
        // saveDataAcceptRide()
      } else {
        console.log("Request failed with status: ", res.status);
      }
    } catch (err) {
      console.log("Error: ", err.message);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.section}>
              <View style={styles.row}>
                {/* Updated Driver Info */}
                <View style={styles.driverInfo}>
                  <View style={styles.profileAndRating}>
                    <Image
                      source={{
                        uri: newRideRequest?.rider_image,
                      }}
                      style={styles.profileImage}
                    />
                    <Image
                      source={
                        newRideRequest?.driver_photo
                          ? {
                              uri: newRideRequest?.driver_photo,
                            }
                          : require("../assets/driver.png")
                      }
                      style={styles.profileImage}
                    />
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>
                        {newRideRequest?.rider_rating}
                      </Text>
                      <FontAwesome name="star" size={18} color="#FFD700" />
                    </View>
                    <Text style={{ color: "black" }}>
                      {newRideRequest?.rider_name}
                    </Text>
                  </View>
                </View>

                <View style={styles.driverDetailsContainer}>
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>
                      {newRideRequest?.city_currency_symbol}{" "}
                      {newRideRequest?.ride_amount}
                    </Text>
                    <Text style={styles.driverTrips}>Cash</Text>
                    <View style={styles.driverIdContainer}>
                      <View style={styles.row}>
                        <Ionicons
                          name="time"
                          size={18}
                          color="orange"
                          style={styles.icon}
                        />
                        <Text style={styles.driverIdText}>
                          {newRideRequest?.time_to_pickup} {"mins"}
                        </Text>
                        <Ionicons
                          name="navigate"
                          size={18}
                          color="skyblue"
                          style={[styles.icon, { marginLeft: 20 }]}
                        />
                        <Text style={styles.driverIdText}>
                          {newRideRequest?.distance}
                          {" Km"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
            </View>

            {/* Section for pickup/dropoff */}
            <View style={styles.section}>
              <View style={styles.column}>
                <View style={styles.pickupInfo}>
                  <Image
                    source={require("../assets/pick-up2.png")}
                    style={styles.pickupImage}
                  />
                  <Text style={styles.pickupText} numberOfLines={1}>
                    {newRideRequest?.p_address}
                  </Text>
                </View>
                <View style={styles.dropoffInfo}>
                  <Image
                    source={require("../assets/waypoint.png")}
                    style={styles.pickupImage}
                  />
                  <Text style={styles.dropoffText} numberOfLines={1}>
                    {newRideRequest?.d_address}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
            </View>

            {/* Accept Button */}
            <View style={styles.section}>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => {
                    acceptRide();
                    onClose();
                  }}
                >
                  <Text style={styles.acceptText}>
                    Accept for Rs {newRideRequest?.fare}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                {/* Column 2: Offer Your Fare */}
                <View style={styles.offerColumn}>
                  <Text style={styles.offerText}>Offer Your Fare</Text>
                </View>
              </View>
              <View style={styles.row}>
                {/* Column 3: 3 Buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Rs {min_bid_fare}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Rs {mid_bid_fare}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Rs {max_bid_fare}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: screenWidth,
    maxHeight: screenHeight * 0.6, // Adjust as needed
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  section: {
    paddingHorizontal: 15,
    // paddingVertical: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  timeContainer: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 10,
  },
  profileAndRating: {
    flexDirection: "column",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingText: {
    fontSize: 16,
    color: "#000",
    marginRight: 5,
  },
  driverDetailsContainer: {
    flex: 1,
    marginLeft: 60,
    // justifyContent: 'center',
  },
  driverDetails: {
    alignItems: "center",
  },
  driverName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  driverTrips: {
    fontSize: 14,
    color: "#888",
    fontWeight: "600",
  },
  driverId: {
    fontSize: 18,
    color: "black",
    fontWeight: "600",
  },
  vehicleInfo: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  vehicleYear: {
    fontSize: 12,
    color: "#888",
  },
  pickupInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  pickupImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  pickupText: {
    fontSize: 14,
    flex: 1,
    overflow: "hidden",
    color: "black",
  },
  dropoffInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropoffText: {
    fontSize: 14,
    flex: 1,
    overflow: "hidden",
    color: "black",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#4CAF50",
    marginHorizontal: 5,
    marginTop: 5,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    width: screenWidth - 30,
    alignItems: "center",
  },
  acceptText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  offerColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  offerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#888",
  },
  driverIdContainer: {
    marginTop: 5,
  },
  driverIdText: {
    fontSize: 18,
    color: "black",
    fontWeight: "600",
    marginLeft: 5,
  },
  icon: {
    marginRight: 5,
  },
});

export default RiderBookingModal;
