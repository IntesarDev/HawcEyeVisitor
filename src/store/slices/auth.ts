import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type User = { id: string; name: string; email: string };

type State = {
  isLoggedIn: boolean;
  user: User | null;
};

const initialState: State = { isLoggedIn: false, user: null };

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (s, a: PayloadAction<User>) => { s.isLoggedIn = true; s.user = a.payload; },
    logout: (s) => { s.isLoggedIn = false; s.user = null; },
    setUser: (s, a: PayloadAction<User | null>) => { s.user = a.payload; s.isLoggedIn = !!a.payload; },
  }
});

export const { login, logout, setUser } = slice.actions;
export default slice.reducer;
