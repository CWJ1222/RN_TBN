import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

const initialState: User = {
  id: '',
  username: '',
  nickname: '',
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ username: string; password: string }>,
    ) => {
      state.username = action.payload.username;
      state.id = `user_${Date.now()}`;
      state.isLoggedIn = true;
    },
    logout: state => {
      state.id = '';
      state.username = '';
      state.nickname = '';
      state.isLoggedIn = false;
    },
    setNickname: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { login, logout, setNickname, updateProfile } = userSlice.actions;

export default userSlice.reducer;
