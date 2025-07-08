import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioState, Program } from '../../types';

const initialState: AudioState = {
  isPlaying: false,
  isPaused: false,
  currentProgram: null,
  currentRegion: '2', // 기본값: 부산 (숫자 코드)
  volume: 1.0,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
      state.isPaused = !action.payload;
    },
    setPaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload;
      state.isPlaying = !action.payload;
    },
    setCurrentProgram: (state, action: PayloadAction<Program | null>) => {
      state.currentProgram = action.payload;
    },
    setCurrentRegion: (state, action: PayloadAction<string>) => {
      state.currentRegion = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    resetAudio: state => {
      state.isPlaying = false;
      state.isPaused = false;
      state.currentProgram = null;
    },
  },
});

export const {
  setPlaying,
  setPaused,
  setCurrentProgram,
  setCurrentRegion,
  setVolume,
  resetAudio,
} = audioSlice.actions;

export default audioSlice.reducer;
