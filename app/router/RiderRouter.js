import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotificationScreen from "../screens/notification/NotificationScreen";
import RiderNavigator from "../navigators/RiderNavigator";
import Trips from "../screens/RiderScreens/Trips";
import Promotions from "../screens/RiderScreens/Promotions";
import CallForHelp from "../screens/RiderScreens/CallForHelp";
import Support from "../screens/RiderScreens/Support";
import RiderMapScreen from "../screens/RiderScreens/RiderMap";
import Profile from "../screens/RiderScreens/Profile";
import RideCompleted from "../screens/RiderScreens/RideCompleted";
import DropOffLocation from "../screens/RiderScreens/DropOffLocation";
import AboutTxyCo from "../screens/RiderScreens/SupportScreens/AboutTxyCo";
import HelpGuide from "../screens/RiderScreens/SupportScreens/HelpGuide";
import CustomerServiceChat from "../screens/RiderScreens/SupportScreens/CustomerServiceChat";
import DriveWithUs from "../screens/RiderScreens/SupportScreens/DriveWithUs";
import PrivacyPolicy from "../screens/RiderScreens/SupportScreens/PrivacyPolicy";
import RateApp from "../screens/RiderScreens/SupportScreens/RateApp";
import SoftwareLicenses from "../screens/RiderScreens/SupportScreens/SoftwareLicenses";
import EditProfile from "../screens/RiderScreens/EditProfileScreens/EditProfile";
import Documents from "../screens/RiderScreens/EditProfileScreens/Documents";
import Email from "../screens/RiderScreens/EditProfileScreens/Email";
import Password from "../screens/RiderScreens/EditProfileScreens/Password";
import Notifications from "../screens/RiderScreens/Notifications";
import TripsDetailScreen from "../screens/TripsScreens/TripsDetailScreen";
import Safety from "../screens/SafetyScreens/Safety";
import TxycoSupport from "../screens/SafetyScreens/TxycoSupport";
import PreRide from "../screens/SafetyScreens/PreRide";
import DriverVerification from "../screens/SafetyScreens/DriverVerification";
import SafetyProtocols from "../screens/SafetyScreens/SafetyProtocols";
import Current from "../screens/TripsScreens/Current";

const Stack = createNativeStackNavigator();

const RiderRoute = ({ route }) => {
  const { ongoing_bk } = route.params || {};
  // const { phone, sess_id } = route.params // Access the passed parameters
  return (
    // <Stack.Navigator
    //     initialRouteName='RiderMap'
    //     screenOptions={{ headerShown: false }}>
    //     <Stack.Screen name='RiderMap' component={RiderMapScreen} />

    <Stack.Navigator
      initialRouteName="RiderMap"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="RiderMap"
        component={RiderMapScreen}
        initialParams={{ ongoing_bk }} // Pass params to RiderMapScreen
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="RideCompleted"
        component={RideCompleted}
        options={{ headerShown: true }}
      />
      {/* <Stack.Screen name='DropOffLocation' component={DropOffLocation} /> */}
      <Stack.Screen
        name="DropOffLocation"
        component={DropOffLocation}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="AboutTxyCo"
        component={AboutTxyCo}
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
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Documents"
        component={Documents}
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
        name="Notifications"
        component={Notifications}
        options={{ headerShown: true }}
      />
      <Stack.Screen name="Trips" component={Trips} />
      <Stack.Screen name="TripsDetailScreen" component={TripsDetailScreen} />
      {/* <Stack.Screen name="Current" component={Current} /> */}
      {/* <Stack.Screen name='Promotions' component={Promotions} /> */}
      <Stack.Screen
        name="Promotions"
        component={Promotions}
        options={{ headerShown: true }}
      />
      {/* <Stack.Screen name='CallForHelp' component={CallForHelp} /> */}
      <Stack.Screen
        name="Support"
        component={Support}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Safety"
        component={Safety}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="TxycoSupport"
        component={TxycoSupport}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="PreRide"
        component={PreRide}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="DriverVerification"
        component={DriverVerification}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="SafetyProtocols"
        component={SafetyProtocols}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default RiderRoute;
