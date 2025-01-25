import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Register from "../screens/RiderScreens/Register";
import Otp from "../screens/RiderScreens/Otp";
import LoginWithPassword from "../screens/RiderScreens/LoginWithPassword";
import SelectRoleScreen from "../screens/selectRoleScreen";
import RideCompleted from "../screens/RiderScreens/RideCompleted";

const Stack = createStackNavigator();

const RiderStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SelectRoleScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="SelectRoleScreen"
        component={SelectRoleScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Otp"
        component={Otp}
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="LoginWithPassword"
        component={LoginWithPassword}
        options={{
          headerShown: true,
        }}
      />
      {/* <Stack.Screen
                name='RideCompleted'
                component={RideCompleted}
                options={{
                    headerShown: true,
                }}
            /> */}
    </Stack.Navigator>
  );
};

export default RiderStackNavigator;
