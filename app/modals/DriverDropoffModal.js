// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Image,
//   Modal,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   ScrollView,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import Geocoding from "react-native-geocoding";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import database from "@react-native-firebase/database";
// import { useSelector } from "react-redux";
// import { getSessionId } from "../utils/common";

// const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Geocoding.init("AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw");

// const DriverDropoffModal = ({
//   visible,
//   onClose,
//   newRideRequest,
//   // pickupAddress,
// }) => {
//   const navigation = useNavigation();
//   // const user = useSelector((state) => state.user?.user)

//   // console.log("looser", newRideRequest);

//   const handleDropOff = async () => {
//     navigation.navigate("DriverRideCompleted", { newRideRequest });
//   };

//   const sess_id = "ZWxybHIzcGVsOW5qbjhqbTA2b2VyOHRwZHE=";

//   const ajaxurl = `https://appserver.txy.co/ajaxdriver_2_1_1.php?session_id=${sess_id}`;
//   const driverCompleted = async () => {
//     // const sess_id = "ZWxybHIzcGVsOW5qbjhqbTA2b2VyOHRwZHE=";
//     // const ajaxurl = "https://appserver.txy.co/ajaxdriver_2_1_1.php";

//     const post_data = {
//       action_get: "drivercompleted",
//       bookingid: newRideRequest.booking_id,
//       complete_code: newRideRequest.completion_code,
//       ride_distance: newRideRequest.distance,
//       ride_duration_secs: newRideRequest.time_to_pickup,
//       ride_duration_secs_formated: newRideRequest.time_to_pickup,
//       ride_fare: newRideRequest.fare,
//       city_currency_symbol: "Rs",
//       city_currency_exchng: 1.0,
//       city_currency_code: "PKR",
//       amount_paid_by_rider: newRideRequest.fare,
//       coupon_code: newRideRequest.coupon_code,
//       coupon_discount_type: newRideRequest.coupon_discount_type,
//       coupon_discount_value: newRideRequest.coupon_discount_value,
//       referral_used: newRideRequest.referral_used,
//       referral_discount_value: newRideRequest.referral_discount_value,
//     };

//     try {
//       const response = await fetch(ajaxurl, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         timeout: 120000,
//         body: JSON.stringify(post_data),
//       });

//       const data = await response.json();

//       if (data.hasOwnProperty("error")) {
//         // setLoading(false);
//         Alert.alert(
//           "Error",
//           data.error,
//           [
//             {
//               text: "Cancel",
//               onPress: () => {},
//               style: "cancel",
//             },
//             { text: "Retry", onPress: () => driverCompleted() },
//           ],
//           { cancelable: false }
//         );
//         return;
//       }

//       if (data.hasOwnProperty("success")) {
//         navigation.navigate("DriverRideCompleted", { newRideRequest });
//         // Assuming `ride_ui_btn_sound` is a predefined sound handler
//         // ride_ui_btn_sound.play();
//         // driver_accept_ride_request_ui_states.ui_state = 4; // Next state - finished
//         // localStorage.removeItem(`pbk-${booking_id}`);
//         // processuistates(); // Assuming this function is defined elsewhere
//         // setLoading(false);
//       }
//     } catch (error) {
//       // setLoading(false);
//       Alert.alert(
//         "Error",
//         "Error communicating with server",
//         [
//           {
//             text: "Cancel",
//             onPress: () => {},
//             style: "cancel",
//           },
//           { text: "Retry", onPress: () => driverCompleted() },
//         ],
//         { cancelable: false }
//       );
//     }

//     return (
//       <Modal
//         transparent={true}
//         visible={visible}
//         onRequestClose={onClose}
//         animationType="slide"
//       >
//         {/* Conditionally apply the background color */}
//         <View
//           style={[
//             styles.modalContainer,
//             visible && styles.transparentBackground,
//           ]}
//         >
//           <View style={styles.modalContent}>
//             <ScrollView contentContainerStyle={styles.scrollContainer}>
//               {/* Section 1 - Driver Image + Timer */}
//               <View style={styles.section}>
//                 <View style={styles.row}>
//                   <View style={styles.profileAndRating}>
//                     <Image
//                       source={
//                         newRideRequest?.rider_image?.uri
//                           ? {
//                               uri: newRideRequest?.rider_image,
//                             } // Use the provided URI if it exists
//                           : require("../assets/driver.png")
//                       }
//                       style={styles.profileImage}
//                     />
//                     <Text style={styles.driverName}>
//                       {newRideRequest?.rider_name}
//                     </Text>
//                   </View>
//                   <View style={styles.timeContainer}>
//                     <Text style={styles.timeText}>0</Text>
//                     <Text style={styles.timeText}>Mins</Text>
//                   </View>
//                 </View>
//                 <View style={styles.divider} />
//               </View>

//               {/* Section 2 - Pickup Info */}
//               <View style={styles.section}>
//                 <View style={styles.column}>
//                   <View style={styles.pickupInfo}>
//                     <Image
//                       source={require("../assets/pick-up2.png")}
//                       style={styles.pickupImage}
//                     />
//                     <Text
//                       style={styles.pickupAddressText}
//                       numberOfLines={2} // Allows the address to break into two lines if it's too long
//                     >
//                       {newRideRequest?.d_address}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={styles.divider} />
//               </View>

//               {/* Button Section - "I've Arrived" Button */}
//               <View style={styles.buttonContainer}>
//                 <TouchableOpacity
//                   style={styles.pickupButton}
//                   onPress={driverCompleted}
//                 >
//                   <Text style={styles.pickupText}>Drop Off</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     );
//   };
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     // justifyContent: "flex-end",
//     alignItems: "center",
//     backgroundColor: "red", // Default black transparent background
//     position: "absolute",
//     zIndex: 99999,
//     bottom: 10,
//   },

//   // This will override the background color when the modal is visible
//   transparentBackground: {
//     backgroundColor: "transparent", // Remove the black transparent shade
//   },
//   modalContent: {
//     width: screenWidth, // Keep full width
//     maxHeight: screenHeight * 0.55, // Reduced height
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     overflow: "hidden",
//   },
//   scrollContainer: {
//     paddingVertical: 10,
//   },
//   section: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   column: {
//     flexDirection: "column",
//     justifyContent: "flex-start",
//   },
//   titleText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#000",
//   },
//   timeContainer: {
//     backgroundColor: "#000",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   timeText: {
//     color: "#fff",
//     fontSize: 14,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#ddd",
//     marginVertical: 6,
//   },
//   profileAndRating: {
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   profileImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 5,
//   },
//   ratingText: {
//     fontSize: 14,
//     color: "#000",
//     marginRight: 5,
//   },
//   driverInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-start",
//     marginLeft: 10,
//   },
//   driverDetailsContainer: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   driverDetails: {
//     alignItems: "center",
//   },
//   // driverName: {
//   //     fontSize: 14,
//   //     fontWeight: 'bold',
//   // },
//   driverName: {
//     marginLeft: 10, // Add some space between the image and the name
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#000",
//   },
//   driverTrips: {
//     fontSize: 12,
//     color: "#888",
//     fontWeight: "600",
//   },
//   driverId: {
//     fontSize: 12,
//     color: "#888",
//     fontWeight: "600",
//   },
//   vehicleInfo: {
//     alignItems: "center",
//     marginRight: 20,
//   },
//   vehicleImage: {
//     width: 80,
//     height: 60,
//   },
//   vehicleText: {
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   vehicleYear: {
//     fontSize: 10,
//     color: "#888",
//   },
//   pickupInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   pickupImage: {
//     width: 25,
//     height: 25,
//     marginRight: 6,
//   },
//   pickupText: {
//     fontSize: 12, // Adjusted font size for better readability
//     flex: 1,
//     overflow: "hidden",
//     flexWrap: "wrap", // Allows text to wrap within the container
//   },
//   pickupAddressText: {
//     fontSize: 12,
//     flex: 1,
//     overflow: "hidden",
//     flexWrap: "wrap",
//     color: "black",
//   },
//   buttonContainer: {
//     justifyContent: "center", // Center the button vertically
//     alignItems: "center", // Center the button horizontally
//     marginTop: 15, // Add some space above the button
//   },
//   pickupButton: {
//     backgroundColor: "orange",
//     borderRadius: 30,
//     paddingVertical: 10, // Increased padding for more height
//     paddingHorizontal: 40, // Increased padding for larger width
//     alignItems: "center",
//     justifyContent: "center",
//     width: screenWidth * 0.85, // Increased width to 75% of screen width
//   },
//   pickupText: {
//     color: "#fff",
//     fontSize: 14, // Increased font size for better readability
//     fontWeight: "400",
//   },
// });

// export default DriverDropoffModal;

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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Geocoding from "react-native-geocoding";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import database from "@react-native-firebase/database";
import { useSelector } from "react-redux";
import { getSessionId } from "../utils/common";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

Geocoding.init("AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw");

const DriverDropoffModal = ({ visible, onClose, newRideRequest }) => {
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const navigation = useNavigation();

  // console.log("looser", newRideRequest);

  // Show the modal as soon as the component mounts
  useEffect(() => {
    if (newRideRequest) {
      setModalVisible(true); // Open modal if newRideRequest is available
    }
  }, [newRideRequest]); // Run when newRideRequest changes

  const handleDropOff = async () => {
    navigation.navigate("DriverRideCompleted", { newRideRequest });
  };

  const driverCompleted = async () => {
    // Define the session ID and AJAX URL inside the function
    const sess_id = "ZWxybHIzcGVsOW5qbjhqbTA2b2VyOHRwZHE=";
    const ajaxurl = `https://appserver.txy.co/ajaxdriver_2_1_1.php?session_id=${sess_id}`;

    // Prepare the post data based on the newRideRequest
    const post_data = {
      action_get: "drivercompleted",
      bookingid: newRideRequest.booking_id,
      complete_code: newRideRequest.completion_code,
      ride_distance: newRideRequest.distance,
      ride_duration_secs: newRideRequest.time_to_pickup,
      ride_duration_secs_formated: newRideRequest.time_to_pickup,
      ride_fare: newRideRequest.fare,
      city_currency_symbol: "Rs",
      city_currency_exchng: 1.0,
      city_currency_code: "PKR",
      amount_paid_by_rider: newRideRequest.fare,
      coupon_code: newRideRequest.coupon_code,
      coupon_discount_type: newRideRequest.coupon_discount_type,
      coupon_discount_value: newRideRequest.coupon_discount_value,
      referral_used: newRideRequest.referral_used,
      referral_discount_value: newRideRequest.referral_discount_value,
    };

    console.log("idr aya");

    try {
      // Make the network request with the data
      const response = await fetch(ajaxurl, {
        method: "POST", // POST request to send data
        headers: {
          "Content-Type": "application/json", // Indicate we're sending JSON data
        },
        timeout: 120000,
        body: JSON.stringify(post_data),
      });

      // Log the raw response text for debugging
      const responseText = await response.text();
      console.log("Response Text:", responseText);

      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText); // Try parsing the response text as JSON
        console.log("Response Data:", data); // Log the parsed data
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError); // Log JSON parsing error
        Alert.alert("Error", "Invalid server response format or server error.");
        return;
      }

      if (data.hasOwnProperty("error")) {
        // If the response has an error, show an alert with Retry option
        Alert.alert(
          "Error",
          data.error,
          [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel",
            },
            { text: "Retry", onPress: () => driverCompleted() }, // Retry the same function
          ],
          { cancelable: false }
        );
        return; // Exit the function if there's an error
      }

      // If the request was successful, navigate to the 'DriverRideCompleted' screen
      if (data.hasOwnProperty("success")) {
        const navigation = useNavigation(); // Assuming useNavigation is available here
        navigation.navigate("DriverRideCompleted", { newRideRequest });
      }
    } catch (error) {
      // If the fetch request fails, show an alert with Retry option
      console.error("Fetch failed:", error); // Log the fetch error
      Alert.alert(
        "Error",
        "Error communicating with server",
        [
          {
            text: "Cancel",
            onPress: () => {},
            style: "cancel",
          },
          { text: "Retry", onPress: () => driverCompleted() }, // Retry the function on error
        ],
        { cancelable: false }
      );
    }
  };

  // const driverCompleted = async () => {
  //   // Define the session ID and AJAX URL inside the function
  //   const sess_id = "ZWxybHIzcGVsOW5qbjhqbTA2b2VyOHRwZHE=";
  //   const ajaxurl = `https://appserver.txy.co/ajaxdriver_2_1_1.php?session_id=${sess_id}`;

  //   // Prepare the post data based on the newRideRequest
  //   const post_data = {
  //     action_get: "drivercompleted",
  //     bookingid: newRideRequest.booking_id,
  //     complete_code: newRideRequest.completion_code,
  //     ride_distance: newRideRequest.distance,
  //     ride_duration_secs: newRideRequest.time_to_pickup,
  //     ride_duration_secs_formated: newRideRequest.time_to_pickup,
  //     ride_fare: newRideRequest.fare,
  //     city_currency_symbol: "Rs",
  //     city_currency_exchng: 1.0,
  //     city_currency_code: "PKR",
  //     amount_paid_by_rider: newRideRequest.fare,
  //     coupon_code: newRideRequest.coupon_code,
  //     coupon_discount_type: newRideRequest.coupon_discount_type,
  //     coupon_discount_value: newRideRequest.coupon_discount_value,
  //     referral_used: newRideRequest.referral_used,
  //     referral_discount_value: newRideRequest.referral_discount_value,
  //   };
  //   console.log("idr aya");

  //   try {
  //     // Make the network request with the data
  //     const response = await fetch(ajaxurl, {
  //       method: "GET", // Can also use POST if needed, but since you are using query params, GET should work
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       timeout: 120000, // You can adjust this timeout as needed
  //       body: JSON.stringify(post_data), // Send the request body
  //     });

  //     // Log for debugging
  //     console.log("idr aya");

  //     const data = await response.json(); // Parse the response JSON

  //     if (data.hasOwnProperty("error")) {
  //       // If the response has an error, show an alert with Retry option
  //       Alert.alert(
  //         "Error",
  //         data.error,
  //         [
  //           {
  //             text: "Cancel",
  //             onPress: () => {},
  //             style: "cancel",
  //           },
  //           { text: "Retry", onPress: () => driverCompleted() }, // Retry the same function
  //         ],
  //         { cancelable: false }
  //       );
  //       return; // Exit the function if there's an error
  //     }

  //     // If the request was successful, navigate to the 'DriverRideCompleted' screen
  //     if (data.hasOwnProperty("success")) {
  //       navigation.navigate("DriverRideCompleted", { newRideRequest });
  //     }
  //   } catch (error) {
  //     // If the fetch request fails, show an alert with Retry option
  //     Alert.alert(
  //       "Error",
  //       "Error communicating with server",
  //       [
  //         {
  //           text: "Cancel",
  //           onPress: () => {},
  //           style: "cancel",
  //         },
  //         { text: "Retry", onPress: () => driverCompleted() }, // Retry the function on error
  //       ],
  //       { cancelable: false }
  //     );
  //   }
  // };

  return (
    <Modal
      transparent={true}
      visible={modalVisible} // Control visibility through state
      onRequestClose={onClose}
      animationType="slide"
    >
      <View
        style={[
          styles.modalContainer,
          modalVisible && styles.transparentBackground,
        ]}
      >
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.section}>
              <View style={styles.row}>
                <View style={styles.profileAndRating}>
                  <Image
                    source={
                      newRideRequest?.rider_image?.uri
                        ? { uri: newRideRequest?.rider_image }
                        : require("../assets/driver.png")
                    }
                    style={styles.profileImage}
                  />
                  <Text style={styles.driverName}>
                    {newRideRequest?.rider_name}
                  </Text>
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>0</Text>
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
                    {newRideRequest?.d_address}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.pickupButton}
                onPress={driverCompleted}
              >
                <Text style={styles.pickupText}>Drop Off</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     justifyContent: "flex-end",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)", // Default black transparent background
//   },
//   transparentBackground: {
//     backgroundColor: "transparent", // Remove the black transparent shade
//   },
//   modalContent: {
//     width: screenWidth, // Keep full width
//     maxHeight: screenHeight * 0.55, // Reduced height
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     overflow: "hidden",
//   },
//   scrollContainer: {
//     paddingVertical: 10,
//   },
//   section: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   column: {
//     flexDirection: "column",
//     justifyContent: "flex-start",
//   },
//   titleText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#000",
//   },
//   timeContainer: {
//     backgroundColor: "#000",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   timeText: {
//     color: "#fff",
//     fontSize: 14,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#ddd",
//     marginVertical: 6,
//   },
//   profileAndRating: {
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   profileImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 5,
//   },
//   ratingText: {
//     fontSize: 14,
//     color: "#000",
//     marginRight: 5,
//   },
//   driverInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-start",
//     marginLeft: 10,
//   },
//   driverDetailsContainer: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   driverDetails: {
//     alignItems: "center",
//   },
//   driverName: {
//     marginLeft: 10,
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#000",
//   },
//   pickupInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   pickupImage: {
//     width: 25,
//     height: 25,
//     marginRight: 6,
//   },
//   pickupText: {
//     fontSize: 12,
//     flex: 1,
//     overflow: "hidden",
//     flexWrap: "wrap",
//   },
//   pickupAddressText: {
//     fontSize: 12,
//     flex: 1,
//     overflow: "hidden",
//     flexWrap: "wrap",
//     color: "black",
//   },
//   buttonContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 15,
//   },
//   pickupButton: {
//     backgroundColor: "green",
//     borderRadius: 30,
//     paddingVertical: 10,
//     paddingHorizontal: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     width: screenWidth * 0.85,
//   },
//   pickupText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "400",
//   },
// });

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    // justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "red", // Default black transparent background
    position: "absolute",
    zIndex: 99999,
    bottom: 10,
  },

  // This will override the background color when the modal is visible
  transparentBackground: {
    backgroundColor: "transparent", // Remove the black transparent shade
  },
  modalContent: {
    width: screenWidth, // Keep full width
    maxHeight: screenHeight * 0.55, // Reduced height
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  scrollContainer: {
    paddingVertical: 10,
  },
  section: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  timeContainer: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  profileAndRating: {
    flexDirection: "column",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    color: "#000",
    marginRight: 5,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 10,
  },
  driverDetailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  driverDetails: {
    alignItems: "center",
  },
  // driverName: {
  //     fontSize: 14,
  //     fontWeight: 'bold',
  // },
  driverName: {
    marginLeft: 10, // Add some space between the image and the name
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  driverTrips: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  driverId: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  vehicleInfo: {
    alignItems: "center",
    marginRight: 20,
  },
  vehicleImage: {
    width: 80,
    height: 60,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  vehicleYear: {
    fontSize: 10,
    color: "#888",
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
    fontSize: 12, // Adjusted font size for better readability
    flex: 1,
    overflow: "hidden",
    flexWrap: "wrap", // Allows text to wrap within the container
  },
  pickupAddressText: {
    fontSize: 12,
    flex: 1,
    overflow: "hidden",
    flexWrap: "wrap",
    color: "black",
  },
  buttonContainer: {
    justifyContent: "center", // Center the button vertically
    alignItems: "center", // Center the button horizontally
    marginTop: 15, // Add some space above the button
  },
  pickupButton: {
    backgroundColor: "orange",
    borderRadius: 30,
    paddingVertical: 10, // Increased padding for more height
    paddingHorizontal: 40, // Increased padding for larger width
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.85, // Increased width to 75% of screen width
  },
  pickupText: {
    color: "#fff",
    fontSize: 14, // Increased font size for better readability
    fontWeight: "400",
  },
});

export default DriverDropoffModal;
