import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrafficNews } from '../../types';

interface TrafficState {
  news: TrafficNews[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: TrafficState = {
  news: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const trafficSlice = createSlice({
  name: 'traffic',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTrafficNews: (state, action: PayloadAction<TrafficNews[]>) => {
      state.news = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    addTrafficNews: (state, action: PayloadAction<TrafficNews>) => {
      state.news.unshift(action.payload);
    },
    removeTrafficNews: (state, action: PayloadAction<string>) => {
      state.news = state.news.filter(news => news.id !== action.payload);
    },
    updateTrafficNews: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<TrafficNews> }>,
    ) => {
      const index = state.news.findIndex(news => news.id === action.payload.id);
      if (index !== -1) {
        state.news[index] = { ...state.news[index], ...action.payload.updates };
      }
    },
    clearTrafficNews: state => {
      state.news = [];
      state.lastUpdated = null;
    },
    setLastUpdated: (state, action: PayloadAction<Date>) => {
      state.lastUpdated = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setTrafficNews,
  addTrafficNews,
  removeTrafficNews,
  updateTrafficNews,
  clearTrafficNews,
  setLastUpdated,
} = trafficSlice.actions;

export default trafficSlice.reducer;
