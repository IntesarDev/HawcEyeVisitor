// src/screens/BookingDetailScreen.tsx
import React, { useMemo, useRef } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable, Animated } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import type { Resource } from "../types/env";

const BLUE = "#0d7ff2";
const CTA_H = 72; // ارتفاع الزر + الهوامش للـScrollView

export default function BookingDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "BookingDetail">>();
  const { data, date, start, end } = route.params as {
    data: Resource;
    date?: string;     // "YYYY-MM-DD"
    start?: string;    // "HH:mm"
    end?: string;      // "HH:mm"
  };

  const item = data;
  const pricePerHour = (item as any).pricePerHour ?? 0;

  // بناء Date بوقت UTC من تاريخ + HH:mm
  const buildUTC = (d?: string, hm?: string) => {
    if (!d || !hm) return null;
    const [hh, mm] = hm.split(":").map(n => parseInt(String(n), 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    const dt = new Date(`${d}T00:00:00Z`);
    dt.setUTCHours(hh, mm, 0, 0);
    return dt;
  };

  const hasSelection = !!(date && start && end);

  // ساعات الفوترة = تقـريب لأعلى ساعة
  const billedHours = useMemo(() => {
    if (!hasSelection) return null;
    const s = buildUTC(date, start);
    const e = buildUTC(date, end);
    if (!s || !e) return null;
    const diffMs = e.getTime() - s.getTime();
    if (diffMs <= 0) return null;
    return Math.max(1, Math.ceil(diffMs / 3_600_000));
  }, [hasSelection, date, start, end]);

  const total = useMemo(() => (billedHours == null ? null : billedHours * pricePerHour), [billedHours, pricePerHour]);

  // CTA animation
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  const canBook = !!(hasSelection && pricePerHour > 0 && billedHours != null);

  const onBook = () => {
    if (!canBook) return;
    console.log("Book now:", { id: item.id, type: item.type, date, start, end, billedHours, pricePerHour, total });
    // TODO: استدعاء API الحجز
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={s.wrap} contentContainerStyle={[s.cc, { paddingBottom: CTA_H + 24 }]}>
        {!!item.image && <Image source={{ uri: item.image }} style={s.img} resizeMode="cover" />}

        <View style={s.header}>
          <Text style={s.title}>{item.name}</Text>
          {(item as any).location ? <Text style={s.sub}>{(item as any).location}</Text> : null}
          {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
          {hasSelection && <Text style={s.hint}>{date} • {start} → {end}</Text>}
        </View>

        {item.type === "room" && (
          <Section title="Room Info">
            <Row label="Capacity"  value={String((item as any).capacity ?? "-")} />
            <Row label="Equipment" value={(item as any).equipment?.length ? (item as any).equipment.join(", ") : "-"} />
          </Section>
        )}

        {item.type === "car" && (
          <Section title="Car Info">
            <Row label="Plate"        value={(item as any).plate ?? "-"} />
            <Row label="Fuel"         value={(item as any).fuel ?? "-"} />
            <Row label="Range"        value={(item as any).rangeKm ? `${(item as any).rangeKm} km` : "-"} />
            <Row label="Last service" value={(item as any).lastService ?? "-"} />
          </Section>
        )}

        {item.type === "parking" && (
          <Section title="Parking Info">
            <Row label="Covered"    value={(item as any).covered ? "Yes" : "No"} />
            <Row label="EV charger" value={(item as any).evCharger ? "Yes" : "No"} />
          </Section>
        )}

        <Section title="Pricing">
          <Row label="Price per hour" value={pricePerHour ? `${pricePerHour.toFixed(2)} €` : "—"} />
          <Row
            label={billedHours != null ? `Total (${billedHours} h)` : "Total"}
            value={total != null ? `${total.toFixed(2)} €` : "—"}
          />
          {hasSelection && total == null && <Text style={s.note}>Invalid time range.</Text>}
        </Section>

        <View style={{ height: 8 }} />
      </ScrollView>

      <View style={s.ctaWrap}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            onPress={onBook}
            onPressIn={pressIn}
            onPressOut={pressOut}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={[s.cta, !canBook && s.ctaDisabled]}
            disabled={!canBook}
          >
            <Text style={s.ctaText}>Book now</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.h2}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  cc: { paddingBottom: 0 },
  img: { width: "100%", height: 240 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: 0.2, marginBottom: 6, color: "#0b0f19" },
  sub: { fontSize: 15, color: "#4b5563", marginBottom: 8 },
  desc: { fontSize: 16, color: "#111827", lineHeight: 23 },
  hint: { marginTop: 6, fontSize: 13, color: "#475569", fontWeight: "600" },

  section: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  h2: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#0b0f19" },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 15, color: "#374151", fontWeight: "600" },
  value: { fontSize: 15, color: "#111827" },

  note: { marginTop: 6, fontSize: 12, color: "#64748b", fontWeight: "600" },

  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  cta: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BLUE,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaDisabled: { backgroundColor: "#94a3b8" },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.4 },
});
