import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ServicesScreen from "@/screens/ServicesScreen";
import ServiceDetailScreen from "@/screens/ServiceDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ServicesStackParamList = {
  Services: undefined;
  ServiceDetail: { serviceId: string; title: string };
};

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export default function ServicesStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          title: "Services",
        }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={({ route }) => ({
          title: route.params.title,
        })}
      />
    </Stack.Navigator>
  );
}
