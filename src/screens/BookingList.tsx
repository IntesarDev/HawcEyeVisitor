// src/screens/BookingListScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RootStackNavProps } from "../navigation/types";
import type { Resource } from "../types/env";
import { Asset } from "expo-asset";
import ResourceListItem from "../components/ResourceListItem";

// +++ NEW: قراءة المسودة من الريدكس للفولباك عند غياب الباراميترات
import { useAppSelector } from "../store/hooks";

const BLUE = "#0d7ff2";

/** تداخل نطاقين تاريخ-وقت */
const overlapsRange = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();

/** صياغة YYYY-MM-DD HH:mm بوقت UTC */
const fmt = (d: Date) => {
  const Y = d.getUTCFullYear();
  const M = String(d.getUTCMonth() + 1).padStart(2, "0");
  const D = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${Y}-${M}-${D} ${h}:${m}`;
};
/** صياغة HH:mm بوقت UTC */
const fmtHM = (d: Date) =>
  `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;

export default function BookingListScreen() {
  const navigation = useNavigation<RootStackNavProps<"BookingList">["navigation"]>();

  // نقرأ الباراميترات إن وُجدت
  const route = useRoute<RootStackNavProps<"BookingList">["route"]>();
  const params = route.params as
    | { type: "room" | "car" | "parking"; date: string; start: string; hours: number }
    | undefined;

  // +++ NEW: فولباك من Redux draft-byType إذا ما وصلت باراميترات لأي سبب
  const draft = useAppSelector((s) => s.bookingDraft);
  const currentType: "room" | "car" | "parking" =
    (params?.type as any) ?? (draft.type as any) ?? "room";

  // مسودة النوع الحالي فقط
  const draftForType = useAppSelector((s) => s.bookingDraft.byType[currentType]);

  const date: string = params?.date ?? draftForType.date ?? "";
  const start: string = params?.start ?? (draftForType.start ?? "00:00");
  const hours: number = params?.hours ?? draftForType.hours ?? 1;

  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    let alive = true;
    const build = (json: any): Resource[] => {
      const out: Resource[] = [];
      for (const r of json?.rooms ?? []) out.push({ ...r, type: "room" } as Resource);
      for (const c of json?.cars ?? []) out.push({ ...c, type: "car" } as Resource);
      for (const p of json?.parkings ?? []) out.push({ ...p, type: "parking" } as Resource);
      return out;
    };
    (async () => {
      try {
        const asset = Asset.fromModule(require("../mockData/resources.json"));
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        const res = await fetch(uri);
        const json = await res.json();
        if (alive) setResources(build(json));
      } catch {
        const json = require("../mockData/resources.json");
        if (alive) setResources(build(json));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // نبني start/end بـ UTC كي يطابق "Z" في JSON
  const startDT = useMemo(() => new Date(`${date}T${start}:00Z`), [date, start]);
  const endDT = useMemo(() => new Date(startDT.getTime() + hours * 3600 * 1000), [startDT, hours]);
  const endHM = useMemo(() => fmtHM(endDT), [endDT]);

  // تداخل "HH:mm" للغرف داخل نفس اليوم
  const overlapsHH = (aS: string, aE: string, bS: string, bE: string) => aS < bE && bS < aE;

  const sameDayUTC = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();

  const filtered = useMemo(() => {
    const out: Resource[] = [];

    for (const r of resources) {
      if (r.type !== currentType) continue;

      if (r.type === "car" || r.type === "parking") {
        const bookings = (r as any).bookings as { from: string; to: string }[] | undefined;
        const hasOverlap =
          Array.isArray(bookings) &&
          bookings.some((b) => overlapsRange(startDT, endDT, new Date(b.from), new Date(b.to)));
        if (!hasOverlap) {
          const updated = { ...(r as any), availabilityNow: "Available" as const } as Resource;
          out.push(updated);
        }
        continue;
      }

      if (r.type === "room") {
        if (!sameDayUTC(startDT, endDT)) continue;
        const bookingsToday = (r as any).bookingsToday as { from: string; to: string }[] | undefined;
        const wantS = start;
        const wantE = fmtHM(endDT);
        const busy =
          Array.isArray(bookingsToday) && bookingsToday.some((b) => overlapsHH(wantS, wantE, b.from, b.to));
        if (!busy) {
          const updatedRoom = { ...(r as any), availabilityNow: "Available" as const } as Resource;
          out.push(updatedRoom);
        }
      }
    }

    return out;
  }, [resources, currentType, startDT, endDT, start]);

  const endLabel = fmt(endDT);
  const iconByType = currentType === "room" ? "door" : currentType === "car" ? "car" : "parking";

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {date} {start} → {endLabel} • {hours}h
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ fontWeight: "800", color: "#0b1220" }}>No available resources</Text>
            <Text style={{ color: "#64748b", marginTop: 4, fontSize: 12 }}>Try a different start or duration</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ResourceListItem
            title={item.name}
            subtitle={(item as any).location ?? "-"}
            status="Available"
            iconName={iconByType}
            onPress={() =>
              navigation.navigate("BookingDetail", {
                data: item,
                date,
                start,
                end: endHM,
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  badge: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#eaf3ff",
    borderWidth: 1,
    borderColor: "#cfe0ff",
    alignSelf: "flex-start",
  },
  badgeText: { color: "#0b1220", fontWeight: "800", fontSize: 12 },
});
