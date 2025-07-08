import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './slices/audioSlice';
import userReducer from './slices/userSlice';
import recordingReducer from './slices/recordingSlice';
import trafficReducer from './slices/trafficSlice';

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    user: userReducer,
    recording: recordingReducer,
    traffic: trafficReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
