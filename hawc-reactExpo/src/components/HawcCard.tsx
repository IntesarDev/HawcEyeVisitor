// src/components/HawcCard.tsx
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  subtitle?: string;
  statusText?: string;
  statusColor?: string;
  onPress?: () => void;
  testID?: string;
};

const BLUE = "#0d7ff2";

export default function HawcCard({
  icon,
  title,
  subtitle,
  statusText,
  statusColor,
  onPress,
  testID,
}: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} testID={testID}>
      <View style={styles.leading}>
        <MaterialCommunityIcons name={icon} size={20} color={BLUE} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>

      {statusText ? (
        <Text style={[styles.status, { color: statusColor ?? "#1f9d55" }]}>{statusText}</Text>
      ) : null}
      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6eefc",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  leading: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#d6e4ff",
  },
  title: { fontSize: 16, fontWeight: "800", color: "#0b1220" },
  sub: { fontSize: 12, color: "#64748b" },
  status: { fontSize: 12, fontWeight: "800", marginRight: 8 },
});
