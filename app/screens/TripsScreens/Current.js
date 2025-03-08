import React, { useState, useEffect, memo } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Style from "../../utils/Styles";

import { useTranslation } from "react-i18next";
import { getSessionId } from "../../utils/common";
import { DRIVER_BASE_URL, RIDER_BASE_URL } from "../../utils/constants";

const RideItem = ({ item, onCancel }) => {
  console.log("item---", item);
  const bookingId = item?.bookingId;

  // const bookingCancel = async (bookingId) => {
  //   if (bookingId) {
  //     const sess_id = await getSessionId();
  //     const url = `${RIDER_BASE_URL}?sess_id=${sess_id}`;

  //     const body = new URLSearchParams({
  //       action: "bookingcancel",
  //       bookingid: bookingId,
  //     }).toString();

  //     try {
  //       const response = await fetch(url, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //         },
  //         body: body,
  //       });

  //       const responseData = await response.json();

  //       if (response.ok) {
  //         console.log("i am here----->");
  //         onCancel(bookingId);
  //       } else {
  //         Alert.alert("Error", "Failed to process the request");
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //       Alert.alert("Error", "Something went wrong");
  //     }
  //   } else {
  //     Alert.alert("Error", "Booking ID is not available");
  //   }
  // };

  return (
    <View style={styles.itemContainer}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={styles.dateText}>{`${item?.pickUpTime}`}</Text>
          <Text style={styles.timeText}>{item?.time}</Text>
          <View style={styles.placeContainer}>
            <FontAwesome name="location-arrow" size={16} color="#4CAF50" />
            <Text
              style={styles.placeText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.pickUpLocation}
            </Text>
          </View>
          <View style={styles.placeContainer}>
            <FontAwesome6 name="location-dot" size={16} color="#F44336" />
            <Text
              style={styles.placeText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.dropOffLocation}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, Style.colorWhite]}>
              {"Current"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.crossButton}
          onPress={() => onCancel(bookingId)}
        >
          <FontAwesome name="times" size={15} color="white" />
        </TouchableOpacity>
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
  const [loading, setLoading] = useState(false);
  const [isPendingTripCancel, setPendingTripCancel] = useState(false);

  const handleCancelBooking = async (bookingId) => {
    console.log("bookingId------", bookingId);

    const url = `${DRIVER_BASE_URL}`;
    const sess_id = await getSessionId();
    const params = {
      sess_id: sess_id,
      action_get: "bookingcancel",
      bookingid: bookingId,
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
      console.log("i am here----->");

      const updatedBookings = bookings.filter(
        (item) => item.bookingId !== bookingId
      );
      setBookings(updatedBookings);
      setPendingTripCancel(true);
      navigation.navigate("DriverMap", { isPendingTripCancel: true });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setBookings(data);
    }
  }, [data]);

  useEffect(() => {
    if (currentBookings && currentBookings.length > 0) {
      setBookings(currentBookings);
    }
  }, [currentBookings]);

  if (loading) {
    return (
      <View
        style={[
          Style.customComponent,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t("no_booking_records")}</Text>
    </View>
  );

  return (
    <View style={[Style.customComponent, { flex: 1 }]}>
      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <RideItem item={item} onCancel={handleCancelBooking} />
        )}
        keyExtractor={(item) =>
          item.bookingId?.toString() || Math.random().toString()
        }
        contentContainerStyle={[
          styles.listContainer,
          bookings.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={EmptyListComponent}
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
    width: 35,
    height: 35,
    backgroundColor: "red",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default memo(Current);
