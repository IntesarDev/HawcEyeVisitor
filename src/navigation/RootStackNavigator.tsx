import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import ResourceBrowse from "../screens/ResourceBrowse";
import BookingListScreen from "../screens/BookingList";
import BookingDetailScreen from "../screens/BookingDetailScreen";
import BookingCalendarScreen from "../screens/BookingCalendarScreen";


const RootStack = createStackNavigator<RootStackParamList>();

const RootStackNavigator = () => {
  return (
 <RootStack.Navigator
  initialRouteName="ResourceBrowse"
  screenOptions={{ headerShown: true }}
>
  <RootStack.Screen
    name="ResourceBrowse"
    component={ResourceBrowse}
    options={{ headerShown: false, title: "Resources" }}
  />

  <RootStack.Screen
    name="BookingCalendar"
    component={BookingCalendarScreen}
    options={({ route }) => {
      const t = (route.params as { type: "room" | "car" | "parking" }).type;
      const titles = { room: "Choose Room date", car: "Choose Car date", parking: "Choose Parking date" };
      return { title: titles[t], headerBackTitle: "" };
    }}
  />
  <RootStack.Screen
    name="BookingList"
    component={BookingListScreen}
    options={({ route }) => {
      const { type } = route.params as { type: "room" | "car" | "parking"; date?: string };
      const titles = { room: "Rooms", car: "Cars", parking: "Parking" };
      return { title: titles[type], headerBackTitle: "" };
    }}
  />

  <RootStack.Screen
    name="BookingDetail"
    component={BookingDetailScreen}
    options={{ title: "Details", headerBackTitle: "" }}
  />
</RootStack.Navigator>

  );
};

export default RootStackNavigator;
