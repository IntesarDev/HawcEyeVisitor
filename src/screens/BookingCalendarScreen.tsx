// src/screens/BookingCalendarScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RootStackNavProps } from "../navigation/types";
import BookingCalendar from "../components/BookingCalendar";
import DurationPicker from "../components/DurationPicker";
import StartTimePicker from "../components/StartTimePicker";
import BookingButton from "../components/AppButton";

const LIGHT_BLUE = "#eaf3ff";

export default function BookingCalendarScreen() {
  const navigation = useNavigation<RootStackNavProps<"BookingCalendar">["navigation"]>();
  const { params: { type } } = useRoute<RootStackNavProps<"BookingCalendar">["route"]>();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [start, setStart] = useState<string | null>(null);
  const [hours, setHours] = useState<number>(1);

  const typeLabel = useMemo(() => (type === "room" ? "Meeting Hall" : type === "car" ? "Car" : "Parking"), [type]);
  const canContinue = !!selectedDate && !!start && hours > 0;

  const onContinue = () => {
    if (!canContinue) return;
    navigation.navigate("BookingList", { type, date: selectedDate, start: start!, hours });
  };

  return (
    <View style={s.container}>
      <Text style={s.header}>Choose {typeLabel} date</Text>

      {/* اختيار التاريخ */}
      <BookingCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* اختيار وقت البداية */}
      <StartTimePicker value={start} onChange={setStart} step={30} />

      {/* اختيار المدة */}
      <DurationPicker hours={hours} onChange={setHours} step={1} min={1} />

      {/* زر المتابعة */}
      <BookingButton
        label={canContinue ? "Continue" : "Select date, start, duration"}
        disabled={!canContinue}
        onPress={onContinue}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_BLUE, padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0b1220",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },
});
