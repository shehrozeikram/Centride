import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DriverNavigator from "../navigators/DriverNavigator";
import Notifications from "../screens/DriverScreens/Notifications";
import DriverMap from "../screens/DriverScreens/DriverMap";
import Trips from "../screens/DriverScreens/Trips";
import Wallet from "../screens/DriverScreens/Wallet";
import Earnings from "../screens/DriverScreens/Earnings";
import Promotions from "../screens/DriverScreens/Promotions";
import MyReferrals from "../screens/DriverScreens/Referrals/MyReferrals";
import CallForHelp from "../screens/DriverScreens/CallForHelp";
import Support from "../screens/DriverScreens/Support";
import Profile from "../screens/DriverScreens/Profile";
import Documents from "../screens/DriverScreens/Documents/Documents";
import CnicBack from "../screens/DriverScreens/Documents/CnicBack";
import CnicFront from "../screens/DriverScreens/Documents/CnicFront";
import DrivingLicenseBack from "../screens/DriverScreens/Documents/DrivingLicenseBack";
import DrivingLicenseFront from "../screens/DriverScreens/Documents/DrivingLicenseFront";
import VehicleDocumentBack from "../screens/DriverScreens/Documents/VehicleDocumentBack";
import VehicleDocumentFront from "../screens/DriverScreens/Documents/VehicleDocumentFront";
import IdVerification from "../screens/DriverScreens/Documents/IdVerification";
import VehiclePhoto from "../screens/DriverScreens/Documents/VehiclePhoto";
import BankAccount from "../screens/DriverScreens/EditProfile/BankAccount";
import DriverEditProfile from "../screens/DriverScreens/DriverEditProfile";
import Email from "../screens/DriverScreens/EditProfile/Email";
import Password from "../screens/DriverScreens/EditProfile/Password";
import SplashScreen from "../screens/splash/SplashScreen";
import ChangeCity from "../screens/DriverScreens/EditProfile/ChangeCity";
import Vehicles from "../screens/DriverScreens/EditProfile/Vehicles";
import Settings from "../screens/DriverScreens/EditProfile/Settings";
import DriverRideCompleted from "../screens/DriverScreens/DriverRideCompleted";
import HelpGuide from "../screens/RiderScreens/SupportScreens/HelpGuide";
import CustomerServiceChat from "../screens/RiderScreens/SupportScreens/CustomerServiceChat";
import DriveWithUs from "../screens/RiderScreens/SupportScreens/DriveWithUs";
import PrivacyPolicy from "../screens/RiderScreens/SupportScreens/PrivacyPolicy";
import RateApp from "../screens/RiderScreens/SupportScreens/RateApp";
import SoftwareLicenses from "../screens/RiderScreens/SupportScreens/SoftwareLicenses";
import AboutTxyCo from "../screens/RiderScreens/SupportScreens/AboutTxyCo";
// import Language from '../screens/RiderScreens/EditProfileScreens/Language'
import Language from "../screens/language/Language";

const Stack = createNativeStackNavigator();

const DriverRoute = () => {
  return (
    <Stack.Navigator
      initialRouteName="DriverMap"
      screenOptions={{ headerShown: false }}
    >
      {/* <Stack.Screen name='DriverApp' component={DriverNavigator} /> */}
      <Stack.Screen name="DriverMap" component={DriverMap} />
      <Stack.Screen
        name="Trips"
        component={Trips}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Wallet"
        component={Wallet}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Earnings"
        component={Earnings}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Promotions"
        component={Promotions}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="MyReferrals"
        component={MyReferrals}
        options={{ headerShown: true }}
      />

      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{ headerShown: true }}
      />

      {/* <Stack.Screen name='CallForHelp' component={CallForHelp} /> */}
      <Stack.Screen
        name="Support"
        component={Support}
        options={{ headerShown: true }}
      />

      <Stack.Screen
        name="HelpGuide"
        component={HelpGuide}
        options={{ headerShown: true }}
      />

      <Stack.Screen
        name="CustomerServiceChat"
        component={CustomerServiceChat}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="DriveWithUs"
        component={DriveWithUs}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="RateApp"
        component={RateApp}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="SoftwareLicenses"
        component={SoftwareLicenses}
        options={{ headerShown: true }}
      />

      <Stack.Screen
        name="AboutTxyCo"
        component={AboutTxyCo}
        options={{ headerShown: true }}
      />

      <Stack.Screen
        name="DriverRideCompleted"
        component={DriverRideCompleted}
        options={{ headerShown: true }}
      />

      {/* documents screens */}
      <Stack.Screen
        name="Documents"
        component={Documents}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="CnicBack"
        component={CnicBack}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="CnicFront"
        component={CnicFront}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="DrivingLicenseBack"
        component={DrivingLicenseBack}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="DrivingLicenseFront"
        component={DrivingLicenseFront}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="VehicleDocumentBack"
        component={VehicleDocumentBack}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="VehicleDocumentFront"
        component={VehicleDocumentFront}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="IdVerification"
        component={IdVerification}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="VehiclePhoto"
        component={VehiclePhoto}
        options={{ headerShown: true }}
      />

      {/* profiles */}
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="BankAccount"
        component={BankAccount}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="DriverEditProfile"
        component={DriverEditProfile}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Email"
        component={Email}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Password"
        component={Password}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="ChangeCity"
        component={ChangeCity}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Vehicles"
        component={Vehicles}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Language"
        component={Language}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: true }}
      />
      <Stack.Screen name="Splash" component={SplashScreen} />
    </Stack.Navigator>
  );
};

export default DriverRoute;
