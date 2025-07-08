import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import {
  setPlaying,
  setPaused,
  setCurrentProgram,
} from '../../store/slices/audioSlice';
import { AudioService, AudioPlayerState } from '../../services/audioService';
import { Button, LoadingSpinner } from '../common';

interface AudioPlayerProps {
  streamUrl?: string;
  onError?: (error: string) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ streamUrl, onError }) => {
  const dispatch = useDispatch();
  const videoRef = useRef<VideoRef>(null);
  const audioService = AudioService.getInstance();

  const { isPlaying, currentRegion, currentProgram } = useSelector(
    (state: RootState) => state.audio,
  );

  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    error: null,
  });

  const [volume, setVolume] = useState(1.0);

  useEffect(() => {
    // AudioService에 플레이어 참조 설정
    audioService.setPlayerRef(videoRef.current);

    // 상태 변경 콜백 등록
    const handleStateChange = (state: AudioPlayerState) => {
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

    audioService.onStateChange(handleStateChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      audioService.removeStateChangeCallback(handleStateChange);
    };
  }, [dispatch, isPlaying]);

  // 재생/일시정지 토글
  const handlePlayPause = () => {
    if (playerState.isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
  };

  // 재생 정지
  const handleStop = () => {
    audioService.stop();
  };

  // 볼륨 조절
  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    audioService.setVolume(clampedVolume);
  };

  // 에러 처리
  const handleError = (error: any) => {
    console.error('Video player error:', error);
    const errorMessage =
      error?.error?.errorString || '오디오 재생 중 오류가 발생했습니다.';

    audioService.handleError(error);
    onError?.(errorMessage);

    Alert.alert('재생 오류', errorMessage, [
      { text: '확인', onPress: () => audioService.stop() },
    ]);
  };

  // 버퍼링 처리
  const handleBuffer = (data: any) => {
    audioService.handleBuffering(data.isBuffering);
  };

  // 재생 진행 상태 처리
  const handleProgress = (data: any) => {
    audioService.handleProgress(data.currentTime, data.playableDuration);
  };

  // 재생 완료 처리
  const handleEnd = () => {
    audioService.handleEnd();
  };

  // 재생 준비 완료
  const handleLoad = (data: any) => {
    console.log('오디오 로드 완료:', data);
    audioService.handleBuffering(false);
  };

  return (
    <View style={styles.container}>
      {/* 숨겨진 비디오 플레이어 (오디오 전용) */}
      <Video
        ref={videoRef}
        source={{ uri: streamUrl }}
        style={styles.hiddenVideo}
        paused={!playerState.isPlaying}
        volume={volume}
        onError={handleError}
        onBuffer={handleBuffer}
        onProgress={handleProgress}
        onEnd={handleEnd}
        onLoad={handleLoad}
        repeat={true}
        playInBackground={true}
        playWhenInactive={true}
        ignoreSilentSwitch="ignore"
        controls={false}
        resizeMode="none"
      />

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
            {currentProgram.title} - {currentProgram.mc}
          </Text>
        )}
      </View>

      {/* 로딩 스피너 */}
      <LoadingSpinner
        visible={playerState.isBuffering}
        text="스트리밍 연결 중..."
        overlay={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    margin: 16,
  },
  hiddenVideo: {
    width: 0,
    height: 0,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  playButtonText: {
    fontSize: 24,
  },
  stopButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  stopButtonText: {
    fontSize: 20,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeLabel: {
    fontSize: 16,
  },
  volumeButton: {
    padding: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
  },
  volumeText: {
    fontSize: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
    textAlign: 'center',
  },
  programText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default AudioPlayer;
