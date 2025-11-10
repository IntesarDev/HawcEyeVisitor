// store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import auth from "./slices/auth";
import bookingDraft from "./slices/bookingDraft";

// إعدادات الحفظ
const persistConfig = {
  key: "root-state",
  version: 1,
  storage: AsyncStorage,
};

// يجمع الشرائح المطلوبة فقط
const rootReducer = combineReducers({
  auth,
  bookingDraft,
});

// إضافة الحفظ التلقائي
const persistedReducer = persistReducer(persistConfig, rootReducer);

// إنشاء المتجر
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // منع تحذيرات serialize لأفعال redux-persist
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// الحافظ
export const persistor = persistStore(store);

// الأنواع
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
