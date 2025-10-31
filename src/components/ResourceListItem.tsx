// src/components/ResourceListItem.tsx
import React, { memo } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  status?: "Available" | "Busy" | string;
  iconName: "door" | "car" | "parking" | string;
  onPress?: () => void;
};

const BLUE = "#0d7ff2";

function ResourceListItem({ title, subtitle = "-", status = "Available", iconName, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={s.row} activeOpacity={0.7}>
      <View style={s.leading}>
        <MaterialCommunityIcons name={iconName as any} size={20} color={BLUE} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.sub}>{subtitle}</Text>
      </View>

      {!!status && <Text style={[s.status, status === "Available" ? s.ok : undefined]}>{status}</Text>}
      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );
}

export default memo(ResourceListItem);

const s = StyleSheet.create({
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
    marginBottom: 0,
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
  ok: { color: "#1f9d55" },
});
