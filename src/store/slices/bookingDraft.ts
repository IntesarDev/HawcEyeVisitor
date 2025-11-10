import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// أنواع المسودة
export type BookingType = "room" | "car" | "parking";
type DraftFields = { date: string; start: string | null; hours: number };

// الحالة المبدئية للمسودة
type DraftState = {
  type: BookingType | null;
  byType: Record<BookingType, DraftFields>;
  // حقول قديمة محتملة من نسخة سابقة (لهجرة ذاتية)
  date?: string;
  start?: string | null;
  hours?: number;
};

// قالب حقول فارغ
const EMPTY: DraftFields = { date: "", start: null, hours: 1 };

// مولّد حالة byType سليمة
const freshByType = (): Record<BookingType, DraftFields> => ({
  room: { ...EMPTY },
  car: { ...EMPTY },
  parking: { ...EMPTY },
});

// ترميم ذاتي للحالة القادمة من persist
const heal = (s: DraftState) => {
  if (!s.byType) s.byType = freshByType();

  // نقل الحقول المسطحة القديمة إلى النوع الحالي ثم مسحها
  if (s.date !== undefined || s.start !== undefined || s.hours !== undefined) {
    const t: BookingType = s.type ?? "room";
    if (!s.byType[t]) s.byType[t] = { ...EMPTY };
    s.byType[t].date = s.date ?? s.byType[t].date ?? "";
    s.byType[t].start = s.start ?? s.byType[t].start ?? null;
    s.byType[t].hours = s.hours ?? s.byType[t].hours ?? 1;
    delete s.date;
    delete s.start;
    delete s.hours;
  }

  // تأكيد وجود جميع الأنواع
  (["room", "car", "parking"] as BookingType[]).forEach((t) => {
    if (!s.byType[t]) s.byType[t] = { ...EMPTY };
  });
};

// حالة ابتدائية
const initialState: DraftState = {
  type: null,
  byType: freshByType(),
};

// تعريف slice خاص بمسودة الحجز
const bookingDraftSlice = createSlice({
  name: "bookingDraft",
  initialState,
  reducers: {
    // تحديد نوع الحجز الحالي
    setType(s, a: PayloadAction<BookingType>) {
      heal(s);
      s.type = a.payload;
    },
    // ضبط التاريخ لنوع معيّن
    setDate(s, a: PayloadAction<{ type: BookingType; date: string }>) {
      heal(s);
      s.byType[a.payload.type].date = a.payload.date;
    },
    // ضبط وقت البداية لنوع معيّن
    setStart(s, a: PayloadAction<{ type: BookingType; start: string | null }>) {
      heal(s);
      s.byType[a.payload.type].start = a.payload.start;
    },
    // ضبط عدد الساعات لنوع معيّن
    setHours(s, a: PayloadAction<{ type: BookingType; hours: number }>) {
      heal(s);
      s.byType[a.payload.type].hours = a.payload.hours;
    },
    // إعادة تعيين مسودة النوع الحالي
    resetCurrent(s) {
      heal(s);
      if (s.type) s.byType[s.type] = { ...EMPTY };
    },
    // إعادة تعيين كامل المسودة
    resetAll: () => initialState,
  },
});

// المغيرات والمقلّد
export const { setType, setDate, setStart, setHours, resetCurrent, resetAll } = bookingDraftSlice.actions;
export default bookingDraftSlice.reducer;
