import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Spacing from "../../components/Spacing";

import { useTranslation } from "react-i18next";

export default function Safety({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <View style={styles.container}>
      {/* First section: Only one box with increased width */}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigation.navigate("TxycoSupport")}
          style={styles.box}
        >
          {/* Add Support Icon and Support Text */}
          {/* <Ionicons
                        name='chatbox-ellipses-outline'
                        size={32}
                        color='black'
                        style={styles.icon}
                    /> */}
          <Image
            source={require("../../assets/chat.png")} // Path to your image
            style={styles.icon}
          />
          <Text style={styles.mainBoxText}>{t("txyco_support")}</Text>
        </TouchableOpacity>
      </View>

      {/* Custom 'Call Emergency' Button using TouchableOpacity */}
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>{t("call_emergency")}</Text>
      </TouchableOpacity>

      {/* Second section: Heading 'How you're protected' */}
      <Text style={styles.heading}>{t("protected_text")}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigation.navigate("PreRide")}
          style={styles.protectedBox}
        >
          <Text style={styles.protectedBoxText}>{t("pre_ride")}</Text>
          <Image
            source={require("../../assets/info.png")} // Path to your image
            style={styles.preRideImage}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("DriverVerification")}
          style={styles.protectedBox}
        >
          <Text style={styles.protectedBoxText}>
            {t("driver_verification")}
            {/* Driver Verification */}
          </Text>
          <Image
            source={require("../../assets/idv.png")} // Path to your image
            style={styles.infoImage}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigation.navigate("SafetyProtocols")}
          style={styles.protectedBox}
        >
          <Text style={styles.protectedBoxText}>
            {t("safety_protocols")}
            {/* Safety Protocols */}
          </Text>
          <Image
            source={require("../../assets/shield.png")}
            style={styles.infoImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  protectedBox: {
    width: "48%",
    height: 120,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 10,
  },
  protectedBoxText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#3E3E3E",
    marginLeft: 6,
  },
  boxText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  box: {
    width: "100%", // Updated to take up full width
    height: 120,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#D23D37",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: Platform.OS === "ios" ? 112 : 140,
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
  },
  icon: {
    marginBottom: 10,
    marginTop: -14,
    width: 50,
    height: 50,
  },
  mainBoxText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#000000",
  },
  preRideImage: {
    position: "absolute",
    right: 20,
    bottom: 1,
    width: 90,
    height: 90,
  },
  infoImage: {
    position: "absolute",
    right: 20,
    bottom: 1,
    width: 90,
    height: 90,
  },
});
