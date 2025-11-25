// src/screens/BookingListScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RootStackNavProps } from "../navigation/types";
import type { Resource } from "../types/env";
import ResourceListItem from "../components/ResourceListItem";

// +++ NEW: قراءة المسودة من الريدكس للفولباك عند غياب الباراميترات
import { useAppSelector } from "../hooks/reduxHooks";

// +++ NEW: Firestore
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";


const BLUE = "#0d7ff2";

// +++ NEW: نوع الحجوزات المخزّنة في collection `bookings`
type BookingDoc = {
  resourceId: string;
  type: "room" | "car" | "parking";
  start: string;
  end: string;
};

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
  // +++ NEW: كل الحجوزات من collection `bookings`
  const [bookingsAll, setBookingsAll] = useState<BookingDoc[]>([]);

  useEffect(() => {
    let alive = true;

    const fetchFromFirestore = async () => {
      try {
        // rooms
        const roomsSnap = await getDocs(collection(db, "rooms"));
        const rooms = roomsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: "room" as const,
        })) as Resource[];

        // parkings
        const parkingsSnap = await getDocs(collection(db, "parkings"));
        const parkings = parkingsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: "parking" as const,
        })) as Resource[];

        // cars
        const carsSnap = await getDocs(collection(db, "cars"));
        const cars = carsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: "car" as const,
        })) as Resource[];

        // +++ NEW: bookings
        const bookingsSnap = await getDocs(collection(db, "bookings"));
        const bookings = bookingsSnap.docs.map(
          (d) => d.data() as BookingDoc
        );

        if (alive) {
          // ندمجهم كلهم في مصفوفة واحدة
          setResources([...rooms, ...parkings, ...cars]);
          // +++ NEW
          setBookingsAll(bookings);
        }
      } catch (err) {
        console.log("Firestore error:", err);
      }
    };

    fetchFromFirestore();
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

      // +++ NEW: استخدم نفس مصدر البيانات للحجوزات (collection `bookings`)
      const bookingsForResource = bookingsAll.filter(
        (b) => b.resourceId === String(r.id) && b.type === r.type
      );

      const hasOverlap =
        bookingsForResource.length > 0 &&
        bookingsForResource.some((b) =>
          overlapsRange(startDT, endDT, new Date(b.start), new Date(b.end))
        );

      if (!hasOverlap) {
        const updated = { ...(r as any), availabilityNow: "Available" as const } as Resource;
        out.push(updated);
      }
    }

    return out;
  }, [resources, currentType, startDT, endDT, bookingsAll]);

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
