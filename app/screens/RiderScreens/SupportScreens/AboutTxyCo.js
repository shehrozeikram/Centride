import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/FontAwesome"; // Import FontAwesome icons
import Ionicons from "react-native-vector-icons/Ionicons";

// Example company image
const imageUri = "https://example.com/your-company-image.jpg"; // Replace with your image URL

const AboutTxyCo = () => {
  const { t, i18n } = useTranslation();

  const handleContactPress = () => {
    Linking.openURL("https://txy.co/service-plus/");
  };

  const handleSocialPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Text style={styles.title}>{t("about_txyco_title")}</Text>
      <Text style={styles.description}>{t("about_txyco_description")}</Text>
      <Text style={styles.sectionTitle}>{t("about_txyco_our_mission")}</Text>
      <Text style={styles.sectionContent}>
        {t("about_txyco_our_mission_description")}
      </Text>
      <Text style={styles.sectionTitle}>{t("about_txyco_our_values")}</Text>
      <Text style={styles.sectionContent}>
        {t("about_txyco_value_innovation")}
        {"\n"}
        {t("about_txyco_value_integrity")}
        {"\n"}
        {t("about_txyco_value_collaboration")}
        {"\n"}
        {/* {t("about_txyco_value_excellence")} */}
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleContactPress}>
        <Text style={styles.buttonText}>{t("about_txyco_contact_us")}</Text>
      </TouchableOpacity>

      {/* Social Media Icons Section */}
      <View style={styles.socialMediaContainer}>
        <TouchableOpacity
          onPress={() =>
            handleSocialPress("https://www.youtube.com/@TxycoOfficial")
          }
        >
          <Icon
            name="youtube"
            size={30}
            color="#FF0000"
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            handleSocialPress(
              "https://www.facebook.com/share/19wpQ9ruby/?mibextid=wwXIfr"
            )
          }
        >
          <Icon
            name="facebook"
            size={30}
            color="#3b5998"
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            handleSocialPress(
              "https://www.tiktok.com/@txyco_official?_t=ZS-8tGyQikoRxE&_r=1"
            )
          }
        >
          <Ionicons
            name="logo-tiktok"
            size={30}
            color="#000000"
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            handleSocialPress(
              "https://www.instagram.com/txyco.official?igsh=eG5qZGI3bWc5d3V2"
            )
          }
        >
          <Icon
            name="instagram"
            size={30}
            color="#C13584"
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSocialPress("https://www.linkedin.com")}
        >
          <Icon
            name="linkedin"
            size={30}
            color="#0077b5"
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "ios" ? "-50%" : "-40%",
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#FBC12C",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  socialMediaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  socialIcon: {
    marginHorizontal: 10,
  },
});

export default AboutTxyCo;
