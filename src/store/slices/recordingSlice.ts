import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recording } from '../../types';

interface RecordingState {
  recordings: Recording[];
  isRecording: boolean;
  currentRecording: Recording | null;
  isPlayingRecording: boolean;
}

const initialState: RecordingState = {
  recordings: [],
  isRecording: false,
  currentRecording: null,
  isPlayingRecording: false,
};

const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    startRecording: state => {
      state.isRecording = true;
    },
    stopRecording: state => {
      state.isRecording = false;
    },
    addRecording: (state, action: PayloadAction<Recording>) => {
      state.recordings.unshift(action.payload);
    },
    removeRecording: (state, action: PayloadAction<string>) => {
      state.recordings = state.recordings.filter(
        recording => recording.id !== action.payload,
      );
    },
    setCurrentRecording: (state, action: PayloadAction<Recording | null>) => {
      state.currentRecording = action.payload;
    },
    setPlayingRecording: (state, action: PayloadAction<boolean>) => {
      state.isPlayingRecording = action.payload;
    },
    updateRecording: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Recording> }>,
    ) => {
      const index = state.recordings.findIndex(
        recording => recording.id === action.payload.id,
      );
      if (index !== -1) {
        state.recordings[index] = {
          ...state.recordings[index],
          ...action.payload.updates,
        };
      }
    },
    clearRecordings: state => {
      state.recordings = [];
      state.currentRecording = null;
      state.isPlayingRecording = false;
    },
  },
});

export const {
  startRecording,
  stopRecording,
  addRecording,
  removeRecording,
  setCurrentRecording,
  setPlayingRecording,
  updateRecording,
  clearRecordings,
} = recordingSlice.actions;

export default recordingSlice.reducer;
