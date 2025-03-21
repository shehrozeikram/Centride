import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RIDER_BASE_URL } from "../utils/constants";
import { getSessionId } from "../utils/common";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const DriverOnWay = ({
  visible,
  onClose,
  newRideRequest = {},
  handleDeclineBid,
  titleText = '',
  children,
}) => {
  // Define default driver image
  const defaultDriverImage = require('../assets/driver.png'); // Make sure this image exists in your assets

  // Add null checks at the start of the component
  if (!newRideRequest) {
    return null;
  }

  // Use optional chaining and default image
  const driverName = newRideRequest?.driver_name || 'Driver';
  const driverImage = newRideRequest?.driver_image || defaultDriverImage;

  const [driverLocationAddress, setDriverLocationAddress] = useState('');
  const [pickupLocationAddress, setPickupLocationAddress] = useState('');
  const [dropoffLocationAddress, setDropoffLocationAddress] = useState('');
  const [rideRequest, setRideRequest] = useState(newRideRequest);
  const [finalDistance, setFinalDistance] = useState('');
  const [finalTimeToReach, setFinalTimeToReach] = useState('');
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  const Google_Maps_Apikey = 'AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw';

  useEffect(() => {
    setRideRequest(newRideRequest);
  }, [newRideRequest]);

  let displayText = '';

  if (newRideRequest?.action === 'driver-assigned') {
    displayText = 'Driver is on his way';
  } else if (newRideRequest?.action === 'driver-arrived') {
    displayText = 'Driver has arrived, Meet him';
  } else if (newRideRequest?.action === 'customer-onride') {
    displayText = 'Your trip has started';
  } else {
    displayText = 'Unknown action';
  }

  useEffect(() => {
    const fetchData = async () => {
      if (
        rideRequest?.pickup_lat &&
        rideRequest?.pickup_long &&
        rideRequest?.dropoff_lat &&
        rideRequest?.dropoff_long &&
        rideRequest?.driver_location_lat &&
        rideRequest?.driver_location_long
      ) {
        let distance, duration;

        if (rideRequest?.action === 'driver-assigned') {
          const {
            distance: driverAssignedDistance,
            duration: driverAssignedDuration,
          } = await fetchDistanceAndTime(
            rideRequest?.driver_location_lat,
            rideRequest?.driver_location_long,
            rideRequest?.pickup_lat,
            rideRequest?.pickup_long
          );
          distance = driverAssignedDistance;
          duration = driverAssignedDuration;
        } else if (rideRequest?.action === 'driver-arrived') {
          distance = '0';
          duration = '0';
        } else if (rideRequest?.action === 'customer-onride') {
          const { distance: onRideDistance, duration: onRideDuration } =
            await fetchDistanceAndTime(
              rideRequest?.pickup_lat,
              rideRequest?.pickup_long,
              rideRequest?.dropoff_lat,
              rideRequest?.dropoff_long
            );
          distance = onRideDistance;
          duration = onRideDuration;
        }

        setDistance(distance);
        setDuration(duration);

        if (
          distance &&
          distance !== 'N/A' &&
          distance !== 'Invalid coordinates'
        ) {
          const distanceInKm = parseFloat(distance.split(' ')[0]);
          if (!isNaN(distanceInKm)) {
            const timeInHours = distanceInKm / 60;
            const timeInMinutes = Math.round(timeInHours * 60);
            setEstimatedTime(timeInMinutes);
          }
        }
      }
    };

    fetchData();
  }, [rideRequest]);

  const fetchDistanceAndTime = async (
    pickupLat,
    pickupLong,
    dropoffLat,
    dropoffLong
  ) => {
    const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLong}&destinations=${dropoffLat},${dropoffLong}&key=${Google_Maps_Apikey}`;

    try {
      const response = await fetch(distanceUrl);
      const data = await response.json();

      if (!pickupLat || !pickupLong || !dropoffLat || !dropoffLong) {
        return {
          distance: 'Invalid coordinates',
          duration: 'Invalid coordinates',
        };
      }

      if (
        data?.status === 'OK' &&
        data?.rows &&
        data?.rows[0]?.elements &&
        data?.rows[0]?.elements[0]
      ) {
        const distance = data?.rows[0]?.elements[0]?.distance
          ? data?.rows[0]?.elements[0]?.distance.text
          : 'N/A';
        const duration = data?.rows[0]?.elements[0]?.duration
          ? data?.rows[0]?.elements[0]?.duration.text
          : 'N/A';

        return { distance, duration };
      } else {
        return { distance: 'N/A', duration: 'N/A' };
      }
    } catch (error) {
      console.error('Error fetching distance and time:', error);
      return { distance: 'N/A', duration: 'N/A' };
    }
  };

  const getCarImage = (carId) => {
    switch (carId) {
      case 2:
        return require('../assets/bike_new.png');
      case 3:
        return require('../assets/ride_mini.png');
      case 4:
        return require('../assets/ride_new.png');
      case 5:
        return require('../assets/ride_ac.png');
      case 6:
        return require('../assets/prado_standard.png');
      case 7:
        return require('../assets/prado_delux.png');
      case 8:
        return require('../assets/rikshah.png');
      default:
        return require('../assets/rikshah.png');
    }
  };

  const handleCancelRide = async () => {
    const url = `${RIDER_BASE_URL}`;
    const sess_id =  'N29hMmpsOGFzNjQyZ3FxdDExc3Qza2ZuajY='
    const params = {
      sess_id: sess_id,
      action_get:"bookingcancel",
      bookingid: newRideRequest?.booking_id || rideData?.booking_id,
      // comment: "delete",
    };

    console.log("params", params);
    const queryString = new URLSearchParams(params).toString();
    const requestUrl = `${url}?${queryString}`;

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("data", data);
      // setLoading(false);
      // setShowDirections(false);
      // setDriverArriveModalVisible(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    visible && (
      <View style={[styles.modalContainer, styles.modalBackground]}>
        {children}
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.titleText}>{displayText}</Text>
                {rideRequest?.action !== 'driver-arrived' && (
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                      {duration ? duration.split(' ')[0] : '0'}
                    </Text>

                    <Text style={styles.timeText}>
                      {duration ? duration.split(' ')[1] : '0'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.divider} />
            </View>

            <View style={styles.section}>
              <View style={styles.row}>
                <View style={styles.driverInfo}>
                  <View style={styles.profileAndRating}>
                    <Image
                      source={
                        rideRequest?.driver_photo
                          ? {
                              uri: rideRequest?.driver_photo,
                            }
                          : require('../assets/driver.png')
                      }
                      style={styles.profileImage}
                    />

                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>
                        {rideRequest?.driver_rating}
                      </Text>
                      <FontAwesome name='star' size={18} color='#FFD700' />
                    </View>
                  </View>
                </View>
                <View style={styles.driverDetailsContainer}>
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>
                      {rideRequest?.driver_firstname}
                    </Text>
                    <Text style={styles.driverId}>
                      {rideRequest?.completion_code}
                    </Text>
                    <Text style={styles.driverTrips}>
                      {rideRequest?.driver_completed_rides} Trips
                    </Text>
                  </View>
                </View>
                <View style={styles.vehicleInfo}>
                  <Image
                    source={getCarImage(Number(rideRequest?.driver_carid))}
                    style={styles.vehicleImage}
                  />

                  <Text style={styles.vehicleText}>
                    {rideRequest?.driver_platenum}
                  </Text>
                  <Text style={styles.vehicleYear}>
                    {rideRequest?.driver_carmodel}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
            </View>

            <View style={styles.section}>
              <View style={styles.column}>
                {rideRequest?.action !== 'driver-arrived' &&
                  rideRequest?.action !== 'customer-onride' && (
                    <View style={styles.pickupInfo}>
                      <Image
                        source={require('../assets/pick-up2.png')}
                        style={styles.pickupImage}
                      />

                      <Text style={styles.pickupText} numberOfLines={1}>
                        {rideRequest?.pickup_addr}
                      </Text>
                    </View>
                  )}
                <View style={styles.dropoffInfo}>
                  <Image
                    source={require('../assets/waypoint.png')}
                    style={styles.pickupImage}
                  />
                  <Text style={styles.dropoffText} numberOfLines={1}>
                    {rideRequest?.dropoff_addr}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
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
    )
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    backgroundColor: 'transparent',
  },
  modalContent: {
    width: screenWidth,
    maxHeight: screenHeight * 0.75,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  section: {
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
  },
  timeContainer: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 10,
  },
  profileAndRating: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 16,
    color: '#000',
    marginRight: 5,
  },
  driverDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  driverDetails: {
    alignItems: 'center',
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverTrips: {
    fontSize: 14,
    color: '#888',
    fontWeight: '400',
  },
  driverId: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  vehicleInfo: {
    alignItems: 'center',
    marginRight: 20,
  },
  vehicleImage: {
    width: 110,
    height: 80,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'black',
  },
  vehicleYear: {
    fontSize: 12,
    color: '#888',
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    overflow: 'hidden',
    color: 'black',
  },
  dropoffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropoffText: {
    fontSize: 14,
    flex: 1,
    overflow: 'hidden',
    color: 'black',
  },
  cancelButton: {
    // backgroundColor: "#f44336", // Red color
    // borderRadius: 30,
    // paddingVertical: 2,
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

export default DriverOnWay;
