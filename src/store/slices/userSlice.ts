import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  email: string;
  nickname: string;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  email: '',
  nickname: '',
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ email: string; nickname: string }>,
    ) => {
      state.email = action.payload.email;
      state.nickname = action.payload.nickname;
      state.isLoggedIn = true;
    },
    logout: state => {
      state.email = '';
      state.nickname = '';
      state.isLoggedIn = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { login, logout, updateProfile } = userSlice.actions;

export default userSlice.reducer;
