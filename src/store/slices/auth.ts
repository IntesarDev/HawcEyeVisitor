import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// نوع المستخدم
export type User = { id: string; name: string; email: string };

// الحالة المبدئية للمصادقة
type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
};

// تعريف slice خاص بالمصادقة
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // تسجيل الدخول
    login(state, action: PayloadAction<User>) {
      state.isLoggedIn = true;
      state.user = action.payload;
    },

    // تسجيل الخروج
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
    },

    // تحديث بيانات المستخدم
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },
  },
});

// المغيرات والمقلّد
export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
