import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Header from "../../components/Header";
import TripTabs from "../TripsScreens/TripTabs";
import Style from "../../utils/Styles";
import { Post } from "../../network/network";
import HTMLParser from "react-native-html-parser";

const rideData = [
  {
    id: "1",
    date: "2023-09-10",
    day: "Sunday",
    year: "2023",
    time: "08:00 AM",
    startPlace: "The Grand Central Station, New York City",
    endPlace: "Statue of Liberty, Liberty Island, NY",
    status: "Completed",
    bookingId: "ABC123",
    price: "250.00",
  },
  {
    id: "2",
    date: "2023-09-11",
    day: "Monday",
    year: "2023",
    time: "09:30 AM",
    startPlace: "Los Angeles International Airport",
    endPlace: "Hollywood Walk of Fame",
    status: "Completed",
    bookingId: "XYZ456",
    price: "400.00",
  },
  {
    id: "3",
    date: "2023-09-12",
    day: "Tuesday",
    year: "2023",
    time: "10:15 AM",
    startPlace: "San Francisco International Airport",
    endPlace: "Golden Gate Bridge",
    status: "Completed",
    bookingId: "LMN789",
    price: "300.00",
  },
  // Add more ride data as needed
  //03215189987
];

const RideItem = ({ item }) => {
  return (
    <View style={styles.itemContainer}>
      <Text
        style={styles.dateText}
      >{`${item.date} (${item.day}, ${item.year})`}</Text>
      <Text style={styles.timeText}>{item.time}</Text>
      <View style={styles.placeContainer}>
        <FontAwesome name="location-arrow" size={16} color="#4CAF50" />
        <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
          {item.startPlace}
        </Text>
      </View>
      <View style={styles.placeContainer}>
        <FontAwesome6 name="location-dot" size={16} color="#F44336" />
        <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
          {item.endPlace}
        </Text>
      </View>
      <Text style={styles.bookingText}>Booking ID: {item.bookingId}</Text>
      <Text style={styles.priceText}>Price: Rs {item.price}</Text>
      <View
        style={[
          styles.statusContainer,
          {
            backgroundColor:
              item.status === "Cancelled" ? "#f8d7da" : "#d4edda",
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color: item.status === "Cancelled" ? "#721c24" : "#155724",
            },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );
};

const Trips = () => {
  const navigation = useNavigation();

  const [completedBookings, setCompletedBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const onBackPress = () => {
    navigation.goBack();
  };
  useEffect(() => {
    getBookings();
  }, []);
  const getBookings = () => {
    const data = {
      action: "getbookings",
    };
    Post({ data: data })
      .then((response) => {
        // console.log('=============BOOKINGS ==========>', response)
        const completedArray = convertHTMLToJSON(response.booking_comp);
        const pendingArray = convertHTMLToJSON(response.pend_onride);
        const canceledArray = convertHTMLToJSON(response.booking_canc);

        setCompletedBookings(completedArray);
        setPendingBookings(pendingArray);
        setCanceledBookings(canceledArray);
      })
      .catch((error) => {
        console.log("======error===", error);
      });
  };

  const convertHTMLToJSON = (htmlString) => {
    if (!htmlString) return []; // Handle empty HTML string

    const parser = new HTMLParser.DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract the list items (each booking item)
    const listItems = doc.getElementsByTagName("ons-list-item");

    // Convert NodeList to Array
    const listArray = Array.from(listItems);
    const bookings = [];

    listArray.forEach((item) => {
      const booking = {
        bookingId: item.getAttribute("data-btitle"),
        time: item
          .getElementsByClassName("list-item__title")[0]
          ?.textContent.trim(),
        rideType: item.getAttribute("data-ridedesc"),
        driverPhone: item.getAttribute("data-driverphone"),
        paymentType: item.getAttribute("data-ptype"),
        pickUpTime: item.getAttribute("data-put"),
        driverImage: item.getAttribute("data-driverimg"),
        carImage: item.getAttribute("data-rideimg"),
        driverName: item.getAttribute("data-drivername"),
        cost: item.getAttribute("data-cost"),
        pickUpLocation: item.getAttribute("data-pul"),
        dropOffLocation: item.getAttribute("data-dol"),
        status: item.getElementsByTagName("span")[0]?.textContent.trim(),
        bookingData: JSON.parse(
          item.getElementsByClassName(
            `booking-list-item-data-${item.getAttribute("id").split("-").pop()}`
          )[0]?.textContent || "{}"
        ),
      };

      bookings.push(booking);
    });

    return bookings;
  };
  return (
    <View style={Style.container}>
      <Spacing val={Platform.OS === "android" && 35} />
      <View style={[Style.hPaddingSixteen]}>
        {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} title={'Trips'} /> */}
        {/* <Spacing val={35} /> */}
      </View>

      <TripTabs
        cancelBooking={canceledBookings}
        completeBookings={completedBookings}
        currentBookings={pendingBookings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    backgroundColor: "#f9f9f9",
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
    fontSize: 18,
    color: "#333",
    marginLeft: 8, // Space between icon and text
    flex: 1,
  },
  bookingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
  priceText: {
    marginTop: 5,
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  statusContainer: {
    marginTop: 10,
    padding: 5,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  statusText: {
    fontWeight: "bold",
  },
});

export default Trips;
