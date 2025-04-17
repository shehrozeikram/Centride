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
  ActivityIndicator,
  Animated,
  Share,
  Linking,
  Alert,
} from "react-native";
import Geocoding from "react-native-geocoding";
import DriverDropoffModal from "./DriverDropoffModal";
import { GOOGLE_MAPS_API_KEY } from "../constants/googleMapKey";
import { getSessionId } from "../utils/common";
import { DRIVER_BASE_URL } from "../utils/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import ChatModal from "./ChatModal";

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
  const [showMenu, setShowMenu] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleCall = () => {
    const phoneNumber = newRideRequest?.rider_phone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleChat = () => {
    const currentRideData = newRideRequest || rideData;
    if (currentRideData?.booking_id) {
      setShowChatModal(true);
    }
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
        if (newRideRequest?.p_address) {
          Share.share({
            message: `Location: ${newRideRequest.p_address}`,
          });
        }
        break;
      case 'navigate':
        if (newRideRequest?.p_lat && newRideRequest?.p_lng) {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${newRideRequest.p_lat},${newRideRequest.p_lng}`;
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
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.leftSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{
                    uri: newRideRequest?.rider_image,
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.notificationBadge} />
              </View>
              <Text style={styles.nameText}>
                {newRideRequest?.rider_name || "Unknown Rider"}
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
                <Text style={styles.timeText}>0 Min</Text>
              </View>
            </View>
          </View>

          {/* Pickup Info */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {newRideRequest?.p_address}
            </Text>
          </View>

          {/* Button Section */}
          <TouchableOpacity
            style={[styles.pickupButton, { backgroundColor: '#50C878' }]}
            onPress={handlePickUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.pickupButtonText}>Pick Up</Text>
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

      {/* Add ChatModal */}
      <ChatModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        bookingId={newRideRequest?.booking_id || rideData?.booking_id}
        riderName={newRideRequest?.rider_name || rideData?.rider_name}
        riderImage={newRideRequest?.rider_image || rideData?.rider_image}
        isDriver={true}
      />
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
  pickupButton: {
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

export default DriverPickupModal;
