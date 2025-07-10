import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  AppState,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import {
  setPlaying,
  setPaused,
  setCurrentProgram,
} from '../../store/slices/audioSlice';
import { TrackPlayerService, TrackPlayerState } from '../../services/trackPlayerService';
import { Button, LoadingSpinner } from '../common';

interface TrackPlayerComponentProps {
  streamUrl?: string;
  onError?: (error: string) => void;
}

const TrackPlayerComponent: React.FC<TrackPlayerComponentProps> = ({ streamUrl, onError }) => {
  const dispatch = useDispatch();
  const trackPlayerService = TrackPlayerService.getInstance();

  const { isPlaying, currentRegion, currentProgram } = useSelector(
    (state: RootState) => state.audio,
  );

  // 현재 지역이 변경되면 자동으로 재생
  useEffect(() => {
    if (currentRegion && isPlaying) {
      trackPlayerService.playRegion(currentRegion);
    }
  }, [currentRegion, isPlaying]);

  const [playerState, setPlayerState] = useState<TrackPlayerState>({
    isPlaying: false,
    isPaused: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    error: null,
    currentTrack: null,
  });

  const [volume, setVolume] = useState(1.0);

  useEffect(() => {
    // TrackPlayer 초기화
    const initializeTrackPlayer = async () => {
      try {
        await trackPlayerService.initialize();
      } catch (error) {
        console.error('TrackPlayer 초기화 실패:', error);
      }
    };

    initializeTrackPlayer();

    // 상태 변경 콜백 등록
    const handleStateChange = (state: TrackPlayerState) => {
      setPlayerState(state);

      // Redux 상태 동기화
      if (state.isPlaying !== isPlaying) {
        if (state.isPlaying) {
          dispatch(setPlaying(true));
        } else {
          dispatch(setPaused(true));
        }
      }
    };

    trackPlayerService.onStateChange(handleStateChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      trackPlayerService.removeStateChangeCallback(handleStateChange);
    };
  }, [dispatch, isPlaying]);

  // 앱 상태 변화 모니터링 (백그라운드/포그라운드)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log('App state changed to:', nextAppState);
      
      if (nextAppState === 'active') {
        // 앱이 포그라운드로 돌아왔을 때
        console.log('App became active');
      } else if (nextAppState === 'background') {
        // 앱이 백그라운드로 갔을 때
        console.log('App went to background');
        // 백그라운드에서도 재생 유지
        if (playerState.isPlaying) {
          trackPlayerService.enableBackgroundPlayback();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [playerState.isPlaying]);

  // 재생/일시정지 토글
  const handlePlayPause = async () => {
    try {
      if (playerState.isPlaying) {
        await trackPlayerService.pause();
      } else {
        await trackPlayerService.resume();
      }
    } catch (error) {
      console.error('재생/일시정지 실패:', error);
    }
  };

  // 재생 정지
  const handleStop = async () => {
    try {
      await trackPlayerService.stop();
    } catch (error) {
      console.error('재생 정지 실패:', error);
    }
  };

  // 볼륨 조절
  const handleVolumeChange = async (newVolume: number) => {
    try {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolume(clampedVolume);
      await trackPlayerService.setVolume(clampedVolume);
    } catch (error) {
      console.error('볼륨 변경 실패:', error);
    }
  };

  // 에러 처리
  const handleError = (error: any) => {
    console.error('TrackPlayer error:', error);
    const errorMessage = error?.message || '오디오 재생 중 오류가 발생했습니다.';

    onError?.(errorMessage);

    Alert.alert('재생 오류', errorMessage, [
      { text: '확인', onPress: () => trackPlayerService.stop() },
    ]);
  };

  // 에러 상태 모니터링
  useEffect(() => {
    if (playerState.error) {
      handleError({ message: playerState.error });
    }
  }, [playerState.error]);

  return (
    <View style={styles.container}>
      {/* 컨트롤 UI */}
      <View style={styles.controls}>
        {/* 재생/일시정지 버튼 */}
        <TouchableOpacity
          style={[
            styles.playButton,
            playerState.isPlaying && styles.pauseButton,
          ]}
          onPress={handlePlayPause}
          disabled={playerState.isBuffering}
        >
          <Text style={styles.playButtonText}>
            {playerState.isBuffering
              ? '⏳'
              : playerState.isPlaying
              ? '⏸️'
              : '▶️'}
          </Text>
        </TouchableOpacity>

        {/* 정지 버튼 */}
        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleStop}
          disabled={playerState.isBuffering}
        >
          <Text style={styles.stopButtonText}>⏹️</Text>
        </TouchableOpacity>

        {/* 볼륨 컨트롤 */}
        <View style={styles.volumeContainer}>
          <Text style={styles.volumeLabel}>🔊</Text>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => handleVolumeChange(volume > 0 ? 0 : 1)}
          >
            <Text style={styles.volumeText}>{volume > 0 ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 상태 표시 */}
      <View style={styles.statusContainer}>
        {playerState.isBuffering && (
          <Text style={styles.statusText}>버퍼링 중...</Text>
        )}
        {playerState.error && (
          <Text style={styles.errorText}>{playerState.error}</Text>
        )}
        {currentProgram && (
          <Text style={styles.programText}>
            현재 프로그램: {String(currentProgram)}
          </Text>
        )}
        {playerState.currentTrack && (
          <Text style={styles.trackText}>
            {playerState.currentTrack.title}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 50,
    minWidth: 60,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  playButtonText: {
    fontSize: 24,
    color: 'white',
  },
  stopButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 50,
    minWidth: 60,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 24,
    color: 'white',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  volumeButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 25,
    minWidth: 50,
    alignItems: 'center',
  },
  volumeText: {
    fontSize: 16,
    color: 'white',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 4,
  },
  programText: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 4,
  },
  trackText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default TrackPlayerComponent; 