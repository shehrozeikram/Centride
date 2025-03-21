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
  Easing,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import OfferModal from "./OfferModal";
import { setSessionId } from "../utils/common";
import { useSelector } from "react-redux";
import { Post } from "../network/network";
import Spacing from "../components/Spacing";
import Style from "../utils/Styles";
import Color from "../utils/Color";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: screenHeight } = Dimensions.get("window");

const CustomModal = ({
  visible,
  onClose,
  navigation,
  bookingId,
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
  const bounceAnimation = useRef(new Animated.Value(0)).current;
  const translateYAnimation = useRef(new Animated.Value(0)).current;
  const [promoData, setPromoData] = useState(null);

  const user = useSelector((state) => state?.user?.user);
  const animatedHeight = useRef(new Animated.Value(screenHeight * 0.7)).current;

  // console.log("bookingId=====", bookingId);

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

  useEffect(() => {
    if (visible) {
      // Reset animations
      bounceAnimation.setValue(0);
      translateYAnimation.setValue(screenHeight); // Start from bottom of screen

      Animated.parallel([
        // Fade in with bounce
        Animated.spring(bounceAnimation, {
          toValue: 1,
          tension: 65,
          friction: 5,
          useNativeDriver: true,
        }),
        // Quick consecutive bounces
        Animated.sequence([
          // Initial rise
          Animated.timing(translateYAnimation, {
            toValue: -25,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // First bounce
          Animated.timing(translateYAnimation, {
            toValue: -5,
            duration: 150,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          // Second bounce
          Animated.timing(translateYAnimation, {
            toValue: -15,
            duration: 150,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Final settle
          Animated.timing(translateYAnimation, {
            toValue: 0,
            duration: 100,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(bounceAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnimation, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    const getPromoData = async () => {
      try {
        console.log('Checking for promo data...');
        const savedPromoData = await AsyncStorage.getItem('activePromoCode');
        console.log('Retrieved Promo Data:', savedPromoData);
        
        if (savedPromoData) {
          const parsedData = JSON.parse(savedPromoData);
          console.log('Parsed Promo Data:', parsedData);
          
          if (parsedData.discount) {
            console.log('Discount value:', parsedData.discount);
            setPromoData(parsedData);
            if (carsArray.length > 0) {
              calculateFaresForAllOptions(carsArray);
            }
          } else {
            console.log('No discount value found in promo data');
          }
        } else {
          console.log('No promo data found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving promo data:', error);
      }
    };

    if (visible) {
      getPromoData();
    }
  }, [visible]);

  const calculateFaresForAllOptions = (carsData) => {
    if (distanceInKm && timeInMinutes && carsData?.length > 0) {
      console.log('Calculating fares with promoData:', promoData);

      const updatedCarsArray = carsData.map((car) => {
        const baseFare = parseFloat(car?.pickup_cost) || 0;
        const costPerKm = parseFloat(car?.cost_per_km) || 0;
        const costPerMinute = parseFloat(car?.cost_per_minute) || 0;
        const initialDistance = parseFloat(car?.init_distance) || 0;

        let originalFare = baseFare;
        if (distanceInKm > initialDistance) {
          originalFare += (distanceInKm - initialDistance) * costPerKm;
        }
        originalFare += timeInMinutes * costPerMinute;
        originalFare = Math.round(originalFare);

        let discountedFare = originalFare;
        if (promoData && promoData.discount) {
          // Convert "20.00" to 20 for percentage calculation
          const discountPercentage = parseFloat(promoData.discount);
          console.log('Applying discount percentage:', discountPercentage, '%');
          
          // Calculate discount amount (20% of original fare)
          const discountAmount = (originalFare * (discountPercentage / 100));
          discountedFare = originalFare - discountAmount;
          discountedFare = Math.round(discountedFare);
          
          console.log('Discount calculation:', {
            originalFare,
            discountPercentage,
            discountAmount,
            finalPrice: discountedFare
          });
        }

        return {
          ...car,
          originalFare: originalFare.toFixed(2),
          totalFare: discountedFare.toFixed(2),
          hasPromo: !!promoData
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
    // console.log("Option selected:", option);

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
        <View style={styles.priceContainer}>
          {promoData ? (
            <>
              <Text style={styles.originalPrice}>
                <Text style={styles.currencySymbol}>{item?.symbol}</Text>
                {item?.originalFare}
              </Text>
              <Text style={styles.discountedPrice}>
                <Text style={styles.currencySymbol}>{item?.symbol}</Text>
                {item?.totalFare}
              </Text>
              <Text style={styles.promoApplied}>
                {parseFloat(promoData.discount)}% OFF
              </Text>
            </>
          ) : (
            <Text style={styles.priceText}>
              <Text style={styles.currencySymbol}>{item?.symbol}</Text>
              {item?.totalFare}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <Pressable onPress={onClose} style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: translateYAnimation,
                },
                {
                  scale: bounceAnimation.interpolate({
                    inputRange: [0, 0.4, 0.7, 1],
                    outputRange: [0.3, 1.05, 0.98, 1],
                  }),
                },
              ],
              opacity: bounceAnimation,
            },
          ]}
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
  promoApplied: {
    fontSize: 12,
    color: 'green',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  originalPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 2,
  },
  promoApplied: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '500',
  },
});

export default CustomModal;
