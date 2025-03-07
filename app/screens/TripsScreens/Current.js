// import React, { useState } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
// } from "react-native";
// import { useRoute } from "@react-navigation/native";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
// import Style from "../../utils/Styles";

// import { useTranslation } from "react-i18next";
// import { getSessionId } from "../../utils/common";
// import { RIDER_BASE_URL } from "../../utils/constants";

// const RideItem = ({ item, onCancel }) => {
//   const bookingId = item.ID;

//   const bookingCancel = async (bookingId) => {
//     if (bookingId) {
//       const sess_id = await getSessionId();
//       const url = `${RIDER_BASE_URL}?sess_id=${sess_id}`;

//       const body = new URLSearchParams({
//         action: "bookingcancel",
//         bookingid: bookingId,
//       }).toString();

//       try {
//         const response = await fetch(url, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           body: body,
//         });

//         const responseData = await response.json();

//         if (response.ok) {
//           onCancel(bookingId);
//         } else {
//           Alert.alert("Error", "Failed to process the request");
//         }
//       } catch (error) {
//         console.error("Error:", error);
//         Alert.alert("Error", "Something went wrong");
//       }
//     } else {
//       Alert.alert("Error", "Booking ID is not available");
//     }
//   };

//   return (
//     <View style={styles.itemContainer}>
//       <TouchableOpacity
//         style={styles.crossButton}
//         onPress={() => bookingCancel(bookingId)} // Pass the bookingId as argument
//       >
//         <FontAwesome name="times" size={20} color="white" />
//       </TouchableOpacity>

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

// const Current = ({ data = [] }) => {
//   // Provide a default empty array if data is undefined
//   const { t, i18n } = useTranslation();
//   const route = useRoute();
//   const { currentBookings } = route.params || {};
//   const [bookings, setBookings] = useState(currentBookings || data); // Ensure bookings is always an array

//   const handleCancelBooking = (bookingId) => {
//     // Filter out the booking with the given ID
//     const updatedBookings = bookings.filter((item) => item.ID !== bookingId);
//     setBookings(updatedBookings);
//   };

//   return (
//     <View style={Style.customComponent}>
//       {bookings.length === 0 ? (
//         <Text>{t("no_booking_records")}</Text>
//       ) : (
//         <FlatList
//           data={bookings}
//           renderItem={({ item }) => (
//             <RideItem item={item} onCancel={handleCancelBooking} />
//           )}
//           keyExtractor={(item, index) => index.toString()}
//           contentContainerStyle={styles.listContainer}
//           ListEmptyComponent={<Text>{t("no_booking_records")}</Text>}
//         />
//       )}
//     </View>
//   );
// };

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
//     marginTop: 10,
//   },
//   placeText: {
//     fontSize: 18,
//     color: "#333",
//     marginLeft: 8,
//     flex: 1,
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
//   crossButton: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     width: 30,
//     height: 30,
//     backgroundColor: "red",
//     borderRadius: 15,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default Current;

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator, // Import the ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Style from "../../utils/Styles";

import { useTranslation } from "react-i18next";
import { getSessionId } from "../../utils/common";
import { RIDER_BASE_URL } from "../../utils/constants";

const RideItem = ({ item, onCancel }) => {
  const bookingId = item.ID;

  const bookingCancel = async (bookingId) => {
    if (bookingId) {
      const sess_id = await getSessionId();
      const url = `${RIDER_BASE_URL}?sess_id=${sess_id}`;

      const body = new URLSearchParams({
        action: "bookingcancel",
        bookingid: bookingId,
      }).toString();

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body,
        });

        const responseData = await response.json();

        if (response.ok) {
          onCancel(bookingId);
        } else {
          Alert.alert("Error", "Failed to process the request");
        }
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "Something went wrong");
      }
    } else {
      Alert.alert("Error", "Booking ID is not available");
    }
  };

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.crossButton}
        onPress={() => bookingCancel(bookingId)} // Pass the bookingId as argument
      >
        <FontAwesome name="times" size={20} color="white" />
      </TouchableOpacity>

      <Text style={styles.dateText}>{`${item?.pickUpTime}`}</Text>
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

const Current = ({ data = [] }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const { currentBookings } = route.params || {};
  const [bookings, setBookings] = useState(currentBookings || data);
  const [loading, setLoading] = useState(false); // New state to handle loading indicator
  const [isPendingTripCancel, setPendingTripCancel] = useState(false);

  // const handleCancelBooking = (bookingId) => {
  //   const updatedBookings = bookings.filter((item) => item.ID !== bookingId);
  //   setBookings(updatedBookings);
  //   setPendingTripCancel(true);
  //   navigation.navigate("RiderMap", { isPendingTripCancel });
  // };

  const handleCancelBooking = (bookingId) => {
    const updatedBookings = bookings.filter((item) => item.ID !== bookingId);
    setBookings(updatedBookings);
    setPendingTripCancel(true); // Set the state indicating the trip is being canceled
    navigation.navigate("RiderMap", { isPendingTripCancel: true }); // Pass this state to RiderMap
  };

  useEffect(() => {
    // Simulating a loading process or API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 7000); // Assuming data loading takes 2 seconds
  }, []);

  return (
    <View style={Style.customComponent}>
      {loading ? (
        <ActivityIndicator size="large" color="orange" /> // Display loading spinner in orange
      ) : bookings.length === 0 ? (
        <Text>{t("no_booking_records")}</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={({ item }) => (
            <RideItem item={item} onCancel={handleCancelBooking} />
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text>{t("no_booking_records")}</Text>}
        />
      )}
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
    marginTop: 10,
  },
  placeText: {
    fontSize: 18,
    color: "#333",
    marginLeft: 8,
    flex: 1,
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
  crossButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    backgroundColor: "red",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Current;
