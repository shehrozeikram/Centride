import React from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Style from "../../utils/Styles";

import { useTranslation } from "react-i18next";

const RideItem = ({ item }) => {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.dateText}>
        {/* {`${item?.date} (${item?.day}, ${item?.year})`} */}
        {`${item?.pickUpTime}`}
      </Text>
      <Text style={styles.timeText}>{item?.time}</Text>
      <View style={styles.placeContainer}>
        <FontAwesome name="location-arrow" size={16} color="#4CAF50" />
        <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
          {item?.pickUpLocation}
        </Text>
      </View>
      <View style={styles.placeContainer}>
        <FontAwesome6 name="location-dot" size={16} color="#F44336" />
        <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
          {item?.dropOffLocation}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, Style.colorWhite]}>{"Current"}</Text>
      </View>
    </View>
  );
};
const Current = ({ data }) => {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const { currentBookings } = route.params || {};
  //   console.log("currentBookings==", currentBookings);
  return (
    <View style={Style.customComponent}>
      <FlatList
        data={data}
        renderItem={RideItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text>{t("no_booking_records")}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
    marginTop: 50,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.62,
    elevation: 4,
    margin: 5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 14,
    color: "#555",
  },
  placeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10, // Add gap between the start and end place
  },
  placeText: {
    fontSize: 18, // Increase text size for places
    color: "#333",
    marginLeft: 8, // Space between icon and text
    flex: 1, // Allow the text to take the available space
  },
  statusContainer: {
    marginTop: 10,
    padding: 5,
    backgroundColor: "#d4edda",
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#155724",
    fontWeight: "bold",
  },
});

export default Current;

// import React from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
// } from "react-native";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
// import Style from "../../utils/Styles";
// import { useTranslation } from "react-i18next";

// const rideData = [
//   {
//     id: "1",
//     date: "2023-09-10",
//     day: "Sunday",
//     year: "2023",
//     time: "08:00 AM",
//     startPlace: "The Grand Central Station, New York City",
//     endPlace: "Statue of Liberty, Liberty Island, NY",
//     status: "Completed",
//   },
//   {
//     id: "2",
//     date: "2023-09-11",
//     day: "Monday",
//     year: "2023",
//     time: "09:30 AM",
//     startPlace: "Los Angeles International Airport",
//     endPlace: "Hollywood Walk of Fame",
//     status: "Completed",
//   },
//   {
//     id: "3",
//     date: "2023-09-12",
//     day: "Tuesday",
//     year: "2023",
//     time: "10:15 AM",
//     startPlace: "San Francisco International Airport",
//     endPlace: "Golden Gate Bridge",
//     status: "Completed",
//   },
//   // Add more ride data as needed
// ];

// // RideItem component
// const RideItem = ({ item }) => {
//   return (
//     <View style={styles.itemContainer}>
//       <Text style={styles.dateText}>{`${item?.pickUpTime}`}</Text>
//       <Text style={styles.timeText}>{item?.time}</Text>
//       <View style={styles.placeContainer}>
//         <FontAwesome name="location-arrow" size={16} color="#4CAF50" />
//         <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
//           {item?.pickUpLocation}
//         </Text>
//       </View>
//       <View style={styles.placeContainer}>
//         <FontAwesome6 name="location-dot" size={16} color="#F44336" />
//         <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
//           {item?.dropOffLocation}
//         </Text>
//       </View>
//       <View style={styles.statusContainer}>
//         <Text style={[styles.statusText, Style.colorWhite]}>{"Current"}</Text>
//       </View>
//     </View>
//   );
// };

// // Current component
// const Current = ({ data }) => {
//   const { t, i18n } = useTranslation();

//   return (
//     <View style={Style.customComponent}>
//       <FlatList
//         data={data}
//         renderItem={RideItem}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.listContainer}
//         ListEmptyComponent={<Text>{t("no_booking_records")}</Text>}
//       />

//       {/* Centered Button */}
//       <TouchableOpacity style={styles.centerButton}>
//         <Text style={styles.centerButtonText}>{"Current"}</Text>
//       </TouchableOpacity>

//       {/* Cross Button - Top Right */}
//       <TouchableOpacity style={styles.crossButton}>
//         <FontAwesome name="times" size={30} color="red" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#f9f9f9",
//     marginTop: 50,
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
//   itemContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//     padding: 15,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 2.62,
//     elevation: 4,
//     margin: 5,
//   },
//   dateText: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   timeText: {
//     fontSize: 14,
//     color: "#555",
//   },
//   placeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10, // Add gap between the start and end place
//   },
//   placeText: {
//     fontSize: 18, // Increase text size for places
//     color: "#333",
//     marginLeft: 8, // Space between icon and text
//     flex: 1, // Allow the text to take the available space
//   },
//   statusContainer: {
//     marginTop: 10,
//     padding: 5,
//     backgroundColor: "#d4edda",
//     borderRadius: 5,
//     alignSelf: "flex-start",
//   },
//   statusText: {
//     color: "#155724",
//     fontWeight: "bold",
//   },

//   // Cross button styles
//   crossButton: {
//     position: "absolute",
//     top: 20,
//     right: 20,
//     backgroundColor: "transparent",
//     zIndex: 10,
//     padding: 10,
//   },

//   // Center button styles
//   centerButton: {
//     position: "absolute",
//     bottom: 56, // Placing it slightly above the bottom arrow button
//     left: "44%",
//     // transform: [{ translateX: -60 }],
//     backgroundColor: "#28a745", // Green color similar to "Current" status
//     borderRadius: 2,
//     paddingHorizontal: 20,
//     paddingVertical: 6,
//     zIndex: 10,
//   },

//   centerButtonText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// });

// export default Current;

// import React from "react";
// import {
//   View,
//   FlatList,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { useRoute } from "@react-navigation/native";
// import { useTranslation } from "react-i18next";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
// import Style from "../../utils/Styles";
// import { Post } from "../../network/network";
// import axios from "axios";
// import { getSessionId } from "../../utils/common";
// import { RIDER_BASE_URL } from "../../utils/constants";

// const RideItem = ({ item }) => {
//   return (
//     <View style={styles.itemContainer}>
//       <TouchableOpacity
//         style={styles.crossButton}
//         onPress={() => {
//           console.log("pressed");
//         }}
//       >
//         <Text style={styles.crossText}>×</Text>
//       </TouchableOpacity>
//       <Text style={styles.dateText}>{`${item?.pickUpTime}`}</Text>
//       <Text style={styles.timeText}>{item?.time}</Text>
//       <View style={styles.placeContainer}>
//         <FontAwesome name="location-arrow" size={16} color="#4CAF50" />
//         <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
//           {item?.pickUpLocation}
//         </Text>
//       </View>
//       <View style={[styles.placeContainer, { marginBottom: 20 }]}>
//         <FontAwesome6 name="location-dot" size={16} color="#F44336" />
//         <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
//           {item?.dropOffLocation}
//         </Text>
//       </View>

//       {/* Touchable Button Below DropOffLocation */}
//       <TouchableOpacity style={styles.statusButton} onPress={resumebooking}>
//         <Text style={[styles.statusText, Style.colorWhite]}>{"Current"}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const resumebooking = async () => {
//   try {
//     const sess_id = await getSessionId();

//     const params = {
//       action_get: "resumebooking",
//       sess_id: sess_id,
//       booking_id: 11398,
//     };

//     const queryString = new URLSearchParams(params).toString();
//     const response = await axios.get(`${RIDER_BASE_URL}?${queryString}`);

//     if (response.data?.error) {
//       Alert.alert("Error", response.data?.error);
//     } else {
//       console.log("response of resumebooking==", response);
//     }
//   } catch (error) {
//     console.error("Error in booking:", error);
//   }
// };

// const Current = ({ data }) => {
//   const route = useRoute();
//   //   console.log("route.params==", route.params);

//   const { currentBookings } = route.params?.params || {}; // Extract currentBookings from params

//   const { t } = useTranslation();
//   //   console.log("currentBookings==", currentBookings);

//   const dataToRender = currentBookings || [];

//   return (
//     <View style={Style.customComponent}>
//       <FlatList
//         data={dataToRender}
//         renderItem={RideItem}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.listContainer}
//         ListEmptyComponent={<Text>{t("no_booking_records")}</Text>} // Show message if no bookings
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   itemContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//     padding: 15,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 2.62,
//     elevation: 4,
//     margin: 5,
//     position: "relative",
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
//   statusButton: {
//     width: 350,
//     height: 40,
//     backgroundColor: "#4CAF50",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 20,
//     marginTop: 10,
//     alignSelf: "center",
//   },

//   statusText: {
//     color: "black",
//     fontWeight: "bold",
//     fontSize: 14,
//   },

//   placeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },

//   placeText: {
//     fontSize: 18,
//     color: "#333",
//     marginLeft: 8,
//     flex: 1,
//   },
//   crossButton: {
//     position: "absolute",
//     top: 12,
//     right: 20,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "rgba(211, 211, 211, 0.8)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 10,
//     pointerEvents: "box-none",
//   },

//   crossText: {
//     fontSize: 18,
//     color: "red",
//     fontWeight: "bold",
//   },
// });

// export default Current;
