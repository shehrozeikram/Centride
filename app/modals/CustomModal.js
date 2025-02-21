import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Pressable,
  ActivityIndicator,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import OfferModal from "./OfferModal";
import { setSessionId } from "../utils/common";
import { useSelector } from "react-redux";
import { Post } from "../network/network";
import Spacing from "../components/Spacing";
import Style from "../utils/Styles";
import Color from "../utils/Color";

const { height: screenHeight } = Dimensions.get("window");

const CustomModal = ({
  visible,
  onClose,
  navigation,
  onBook,
  onSelectItem,
  distance,
  time,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [updatedPrice, setUpdatedPrice] = useState(null);
  const [carsArray, setCarsArray] = useState([]);
  const [fare, setFare] = useState({});
  const [loading, setLoading] = useState(false);
  const [distanceInKm, setDistanceInKm] = useState(null);
  const [timeInMinutes, setTimeInMinutes] = useState(null);

  const user = useSelector((state) => state?.user?.user);
  const animatedHeight = useRef(new Animated.Value(screenHeight * 0.7)).current;

  useEffect(() => {
    if (distance) {
      console.log("distance", distance);
      setDistanceInKm(parseFloat(distance.replace(/[^0-9.-]+/g, "")) || 0);
      console.log("distanceInKm", distanceInKm);
    } else {
      setDistanceInKm(0);
    }

    if (time) {
      setTimeInMinutes(parseFloat(time) || 0);
    } else {
      setTimeInMinutes(0);
    }
  }, [distance, time]);

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (distanceInKm && timeInMinutes && carsArray.length > 0) {
      calculateFaresForAllOptions(carsArray);
    }
  }, [distanceInKm, timeInMinutes]);

  const calculateFaresForAllOptions = (carsData) => {
    if (distanceInKm && timeInMinutes && carsData?.length > 0) {
      const updatedCarsArray = carsData.map((car) => {
        const baseFare = parseFloat(car?.pickup_cost) || 0;
        const costPerKm = parseFloat(car?.cost_per_km) || 0;
        const costPerMinute = parseFloat(car?.cost_per_minute) || 0;
        const initialDistance = parseFloat(car?.init_distance) || 0;

        let totalFare = baseFare;
        if (distanceInKm > initialDistance) {
          totalFare += (distanceInKm - initialDistance) * costPerKm;
        }

        totalFare += timeInMinutes * costPerMinute;

        totalFare = Math.round(totalFare);

        return {
          ...car,
          totalFare: totalFare.toFixed(2),
        };
      });

      setCarsArray(updatedCarsArray);
    }
  };

  const getSession = async () => {
    const firstData = {
      action: "checkLoginStatus",
      timezone: "Asia/Karachi",
      platform: Platform.OS,
      display_lang: "en",
    };

    Post({ data: firstData })
      .then((firstResponse) => {
        const carData =
          firstResponse?.tariff_data?.result[user?.route_id]?.cars;
        setCarsArray(carData);
        setSessionId(firstResponse?.sess_id);
        calculateFaresForAllOptions(carData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleOptionSelect = (option) => {
    console.log("Option selected:", option);

    onSelectItem(option);
    setSelectedOption(option);
    setUpdatedPrice(null);
  };

  const renderOption = ({ item }) => {
    const isSelected = selectedOption && selectedOption.id === item.id;
    const image = item?.ride_img.replace("..", "https://appserver.txy.co");

    return (
      <TouchableOpacity
        style={[styles.optionContainer, isSelected && styles.selectedOption]}
        onPress={() => handleOptionSelect(item)}
      >
        <Image
          resizeMode={"contain"}
          source={{ uri: item?.image ?? image }}
          style={styles.optionImage}
        />
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>{item?.ride_type}</Text>
          <Spacing />
          <View style={styles.row}>
            <FontAwesome name="users" size={14} color="black" />
            <Text style={styles.optionSeats}>{item.num_seats}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.priceText}>
            <Text style={styles.currencySymbol}>{item?.symbol}</Text>
            {item?.totalFare != null
              ? ` ${parseFloat(item?.totalFare)}`
              : "Fare not calculated yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
    >
      <Pressable onPress={onClose} style={styles.modalContainer}>
        <Animated.View
          style={[styles.modalContent, { height: animatedHeight }]}
        >
          <FlatList
            data={carsArray}
            renderItem={renderOption}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity
            style={[styles.bookButton, loading && { opacity: 0.7 }]}
            onPress={() => !loading && onBook(setLoading)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>
                Book {selectedOption ? selectedOption.type : ""}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  swipeHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 10,
  },
  swipeText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 10,
    color: "#888",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  optionImage: {
    width: 80,
    height: 50,
    marginRight: 10,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: "15%",
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "black",
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  bookButton: {
    backgroundColor: Color.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cashContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingVertical: 2,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  cashImage: {
    width: 40,
    height: 40,
    marginRight: 5,
  },
  cashDetails: {
    flex: 1,
    alignItems: "center",
  },
  cashTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 2,
  },
  selectedPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  optionSeats: {
    fontSize: 14,
    marginLeft: 4,
    color: "black",
  },

  offerContainer: {
    backgroundColor: Color.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  offerText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  swipeText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 10,
    color: "#888",
  },
  selectedOption: {
    backgroundColor: Color.primary,
    borderLeftColor: "#ff8c00",
    borderLeftWidth: 10,
    paddingLeft: 10,
    marginLeft: -10,
  },
  selectedPriceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  defaultPriceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  currencySymbol: {
    fontSize: 10,
    fontWeight: "400",
    color: "green",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
});

export default CustomModal;
