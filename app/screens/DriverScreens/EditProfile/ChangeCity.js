import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/FontAwesome"; // Import FontAwesome for the checkmark icon
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../../components/Header";
import { useNavigation } from "@react-navigation/native";
import Spacing from "../../../components/Spacing";
import Style from "../../../utils/Styles";
import { setSessionId } from "../../../utils/common";
import { Post } from "../../../network/network";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../redux/userSlice";
const data = [
  {
    id: "1",
    icon: <FontAwesome5 name="city" size={22} color="#6F02B5" />,
    city: "Faislabad",
  },
  {
    id: "2",
    icon: <FontAwesome5 name="city" size={22} color="#00B381" />,
    city: "Gilgit",
  },
  {
    id: "3",
    icon: <FontAwesome5 name="city" size={22} color="#844201" />,
    city: "Islamabad Rawalpindi",
  },
  {
    id: "4",
    icon: <FontAwesome5 name="city" size={22} color="#FF0002" />,
    city: "Karachi Tariff",
  },
  {
    id: "5",
    icon: <FontAwesome5 name="city" size={22} color="#808080" />,
    city: "Lahore Tariff",
  },
  {
    id: "6",
    icon: <FontAwesome5 name="city" size={22} color="#06DFEC" />,
    city: "Peshawar Tariff - 1",
  },
  {
    id: "7",
    icon: <FontAwesome5 name="city" size={22} color="#FF8900" />,
    city: "Skardu",
  },
  {
    id: "8",
    icon: <FontAwesome5 name="city" size={22} color="#00C600" />,
    city: "Portuguese",
  },
];

const ChangeCity = () => {
  const user = useSelector((state) => state?.user?.user);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [cites, setCites] = useState([]);
  const [result, setResult] = useState([]);
  const [userCity, setUserCity] = useState(
    user?.city
      .replace(/ Tariff$/, "")
      .replace(/ \(.+\)$/, "")
      .trim()
  );
  useEffect(() => {
    getSession();
  }, []);
  const getSession = async () => {
    const firstData = {
      action: "checkDriverLoginStatus",
      timezone: "Asia/Karachi",
      platform: Platform.OS,
      display_lang: "en",
    };

    Post({
      data: firstData,
    })
      .then((firstResponse) => {
        const cityIdArray = [...firstResponse?.tariff_data?.result?.city_id];
        const citiesInPakistan =
          Array.isArray(firstResponse?.tariff_data?.result?.city_name) &&
          firstResponse?.tariff_data?.result?.city_name.map((city, index) => ({
            id: (index + 1).toString(), // Create a string id starting from 1
            name: city
              .replace(/ Tariff$/, "")
              .replace(/ \(.+\)$/, "")
              .trim(),
            city_id: cityIdArray[index],
            icon: <FontAwesome5 name="city" size={22} color="#06DFEC" />,
          }));

        setCites(citiesInPakistan);
        setResult(firstResponse?.tariff_data?.result);

        const sess_id = firstResponse?.sess_id;

        setSessionId(sess_id); //async
      })

      .catch((error) => {
        console.error("Error:", error);
        // Alert.alert('Error', 'An error occurred. Please try again.')
      });
  };

  const filteredData = cites.filter((item) =>
    item?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item) => {
    setSelectedId(item?.city_id);
    setUserCity(item?.name);

    setSearch(""); // Clear search input on selection
    changeCity(item?.city_id);
  };
  // const onBackPress = () => {
  //     navigation.goBack()
  // }
  const changeCity = (city_id) => {
    const body = new URLSearchParams({
      action: "updateDriverCity",
      city_id: city_id,
    }).toString();
    Post({ data: body })
      .then((response) => {
        const userData = {
          ...user,

          city_id: city_id,
        };

        dispatch(setUser(userData));
        console.log("=======CAR UPDATE=======", response);

        navigation.goBack();
      })
      .catch((error) => {
        console.log("error", error);
        Alert("Error", "Car update error");
      });
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        {
          backgroundColor: item?.name === userCity ? "#e0e0e0" : "#fff",
        }, // Highlight selected item
      ]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.flagText}>{item?.icon}</Text>
        <Text style={styles.languageText}>{item?.name}</Text>
      </View>
      {item?.name === userCity && (
        <Icon name="check-circle" size={20} color="#4caf50" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[Style.container, Style.hPaddingSixteen]}>
      <Spacing val={Platform.OS === "ios" && 35} />
      {/* <Header LeftIcon={true} onPressLeftIcon={onBackPress} /> */}
      <Spacing val={20} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 36 : 60,
    paddingHorizontal: 20,
  },
  searchInput: {
    height: 45,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    marginBottom: 20,
    fontSize: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagText: {
    fontSize: 30,
    marginRight: 15, // Gap between flag and language
  },
  languageText: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
});

export default ChangeCity;
