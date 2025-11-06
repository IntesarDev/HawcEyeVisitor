import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ResourceType } from '../../types/env';

export type Booking = {
  id: string;
  resourceId: string;
  resourceName: string;
  type: ResourceType;
  location?: string;
  start: string;   // ISO
  end: string;     // ISO
  pricePerHour?: number;
  total?: number;
};

type State = { items: Booking[] };
const initialState: State = { items: [] };

const slice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setAll: (s, a: PayloadAction<Booking[]>) => { s.items = a.payload; },
    addOne: (s, a: PayloadAction<Booking>) => { s.items.push(a.payload); },
    removeById: (s, a: PayloadAction<string>) => {
      s.items = s.items.filter(b => b.id !== a.payload);
    },
    clear: (s) => { s.items = []; },
  },
});

export const { setAll, addOne, removeById, clear } = slice.actions;
export default slice.reducer;
