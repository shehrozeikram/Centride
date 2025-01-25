import React, { memo, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  I18nManager,
  TouchableHighlight,
  Platform,
  Image,
  Text,
  Linking,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import Style from "../utils/Styles";
import { useNavigation } from "@react-navigation/native";
import Color from "../utils/Color";
import AppButton from "./AppButton";
import Spacing from "./Spacing";
import {
  DRIVER,
  deletePassword,
  deletePhone,
  deleteSessionId,
  setAppSide,
} from "../utils/common";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const DrawerRow = memo(({ Icon, onPress, text, style }) => (
  <TouchableHighlight
    style={styles.touchable}
    underlayColor={Color.buttonHighLitColor}
    onPress={onPress}
  >
    <View
      style={[
        Style.flexRow,
        Style.alignCenter,
        Style.justifyStart,
        Style.gap15,
      ]}
    >
      <View style={[Style.iconDirection]}>
        <Icon />
      </View>
      <Text style={style}>{text}</Text>
    </View>
  </TouchableHighlight>
));

const DrawerModal = ({ isVisible, onClose }) => {
  const { t, i18n } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(null);
  const user = useSelector((state) => state.user?.user);

  const translateX = useSharedValue(-width);
  const animate_Width = I18nManager.isRTL ? width : -width;
  const duration = 200;
  useEffect(() => {
    drawerAnimation();
  }, [isVisible]);

  const drawerAnimation = () => {
    if (isVisible) {
      translateX.value = withTiming(0, { duration: duration });
    } else {
      translateX.value = withTiming(animate_Width, { duration: duration });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleDial = () => {
    const phoneNumber = "tel:03214554025";
    Linking.openURL(phoneNumber).catch((err) =>
      console.error("Failed to open dialer:", err)
    );
  };

  const handleClose = () => {
    translateX.value = withTiming(
      animate_Width,
      { duration: duration },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      }
    );
  };

  const navigation = useNavigation();

  const onLogout = () => {
    console.log("call logout ");
    handleClose();
    setTimeout(() => {}, 500);
  };
  const size = 20;

  const handleSwitch = () => {
    handleClose();
    setTimeout(() => {
      setAppSide(DRIVER);
      deletePassword();
      deletePhone();
      deleteSessionId();

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "RiderStackNavigator",
            params: { screen: "Register" },
          },
        ],
      });
    }, 300);
  };
  const options = [
    {
      title: t("drawer.trips"),
      Icon: () => <FontAwesome name="map" size={size} color="#03C5C2" />,
      SelectedIcon: () => (
        <FontAwesome name="map" size={size} color="#03C5C2" />
      ),
      index: 0,
      onPress: handleClose,
      screen: "Trips",
    },
    {
      title: t("drawer.promo_discounts"),
      Icon: () => <FontAwesome name="gift" size={size} color="#EE5C5D" />,
      SelectedIcon: () => (
        <FontAwesome name="gift" size={size} color="#EE5C5D" />
      ),
      index: 1,
      onPress: handleClose,
      screen: "Promotions",
    },
    {
      title: t("drawer.notifications"),
      Icon: () => <Ionicons name="notifications" size={size} color="#9F6DB5" />,
      SelectedIcon: () => (
        <Ionicons name="notifications" size={size} color="#9F6DB5" />
      ),
      index: 2,
      onPress: handleClose,
      screen: "Notifications",
    },
    {
      title: t("drawer.call_for_help"),
      Icon: () => <Ionicons name="call" size={size} color="#73E175" />,
      SelectedIcon: () => <Ionicons name="call" size={size} color="#73E175" />,
      index: 3,
      onPress: () => {
        handleDial();
        handleClose();
      },
      isBottom: false,
      screen: "CallForHelp",
    },
    {
      title: t("drawer.support"),
      Icon: () => (
        <FontAwesome name="info-circle" size={size} color="#42A3F2" />
      ),
      SelectedIcon: () => (
        <FontAwesome name="info-circle" size={size} color="#42A3F2" />
      ),
      index: 4,
      isBottom: false,
      onPress: handleClose,
      screen: "Support",
    },
    {
      title: t("drawer.safety"),
      Icon: () => <FontAwesome name="shield" size={size} color="#FFA500" />,
      SelectedIcon: () => (
        <FontAwesome name="shield" size={size} color="#FFA500" />
      ),
      index: 5,
      isBottom: false,
      onPress: handleClose,
      screen: "Safety",
    },
  ];

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={handleClose}
        />
        <Animated.View style={[styles.drawer, animatedStyle]}>
          {/* Part 1: Profile Section with Full Width and Height Gray Background */}

          <View style={[styles.topOptions]}>
            <Spacing val={Platform.OS === "ios" && 35} />
            <View
              style={[
                // Style.alignStart,
                {
                  backgroundColor: "#F5F5F5", // Gray background
                  // width: '100%',
                  paddingVertical: 30,
                  paddingHorizontal: 20,
                },
              ]}
            >
              {/* Profile Section */}
              <TouchableOpacity
                onPress={() => {
                  handleClose();
                  navigation.navigate("Profile");
                }}
              >
                <Image
                  source={
                    user
                      ? { uri: user?.photo }
                      : require("../assets/driver.png")
                  }
                  style={{
                    height: 80,
                    width: 80,
                    borderRadius: 40,
                    marginBottom: 14,
                  }}
                />
                {/* Profile Name */}
                <Text
                  style={[Style.fontBold, Style.colorBlack, Style.labelButton]}
                >
                  {user
                    ? `${user?.firstname} ${user?.lastname}`
                    : t("drawer.no_name")}
                </Text>
              </TouchableOpacity>

              {/* Arrow Icon in front of Profile Image */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 35,
                  right: 20, // Change to move the arrow to the right-most side
                }}
                onPress={() => {
                  handleClose();
                  navigation.navigate("Profile");
                }}
              >
                <FontAwesome name="chevron-right" size={20} color="black" />
              </TouchableOpacity>
            </View>
            {/* <Spacing val={20} /> */}
            <View style={Style.hPaddingSixteen}>
              {options
                .filter((option) => !option.isBottom)
                .map((item) => (
                  <DrawerRow
                    key={item.index}
                    Icon={
                      selectedTab === item.index ? item.SelectedIcon : item.Icon
                    }
                    onPress={() => {
                      setSelectedTab(item.index);
                      item?.onPress();
                      navigation.navigate(item?.screen);
                    }}
                    text={item.title}
                    style={[
                      styles.defaultTextColor,
                      Style.fontMedium,
                      Style.label,
                      styles.vPadding,
                      Style.hPaddingSixteen,
                    ]}
                  />
                ))}
            </View>
          </View>

          {/* Part 2: Bottom Options (Trips and Other Options) */}
          <View style={[styles.bottomOptions]}>
            {options
              .filter((option) => option.isBottom)
              .map((item) => (
                <DrawerRow
                  key={item.index}
                  Icon={
                    selectedTab === item.index ? item.SelectedIcon : item.Icon
                  }
                  onPress={() => {
                    setSelectedTab(item.index);
                    item?.onPress();
                  }}
                  text={item.title}
                  style={[
                    selectedTab === item.index
                      ? styles.selectedTabTextColor
                      : styles.defaultTextColor,
                    styles.vPadding,
                  ]}
                />
              ))}
          </View>

          {/* Switch to Drive Button */}
          <View style={[Style.hPaddingSixteen]}>
            <AppButton
              onPress={() => {
                handleSwitch();
              }}
              name={t("drawer.switch_to_driver")}
            />
          </View>
          <Spacing val={30} />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default memo(DrawerModal);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    // backgroundColor: Color.transparant,
    justifyContent: "flex-start",
  },
  overlayTouchable: {
    flex: 1,
    width: "100%",
  },
  drawer: {
    backgroundColor: Color.white,
    width: "80%",
    height: "100%",
    // paddingTop: Platform.OS === 'ios' ? 60 : 40,
    // paddingHorizontal: 20,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  drawerTitle: {
    fontSize: 24,
    marginBottom: 20,
  },

  topOptions: {
    flex: 4,
  },
  bottomOptions: {
    flex: 1,
  },
  touchable: {
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 15,
    marginTop: 10,
    // borderTopWidth: 0.2,
    // borderTopColor: Color.lightGrey,
  },
  selectedTabTextColor: {
    color: Color.primary,
    paddingVertical: 5,
  },
  defaultTextColor: {
    color: Color.black,
    paddingVertical: 5,
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Color.semiTransparent,
  },
  vPadding: {
    paddingVertical: I18nManager.isRTL ? 5 : null,
  },
});
