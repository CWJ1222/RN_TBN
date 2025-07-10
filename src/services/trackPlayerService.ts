import TrackPlayer, {
  Event,
  RepeatMode,
  State,
  useTrackPlayerEvents,
  Capability,
} from 'react-native-track-player';
import { Platform } from 'react-native';
import { RegionService } from './regionService';

export interface TrackPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  currentTrack: any | null;
}

export class TrackPlayerService {
  private static instance: TrackPlayerService;
  private onStateChangeCallbacks: ((state: TrackPlayerState) => void)[] = [];
  private currentStreamUrl: string | null = null;
  private isInitialized = false;

  private currentState: TrackPlayerState = {
    isPlaying: false,
    isPaused: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    error: null,
    currentTrack: null,
  };

  static getInstance(): TrackPlayerService {
    if (!TrackPlayerService.instance) {
      TrackPlayerService.instance = new TrackPlayerService();
    }
    return TrackPlayerService.instance;
  }

  // 오디오 스트림 URL이 실제 오디오 포맷인지 체크 (HEAD 요청)
  static async checkStreamUrlIsAudio(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const contentType = res.headers.get('content-type');
      // audio/mpeg, audio/aac, application/vnd.apple.mpegurl(HLS) 등 허용
      return (
        !!contentType &&
        (contentType.startsWith('audio/') ||
          contentType.includes('mpegurl') ||
          contentType.includes('aac'))
      );
    } catch {
      return false;
    }
  }

  // TrackPlayer 초기화
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await TrackPlayer.setupPlayer();
      
      // 기본 설정
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        color: 0x2196F3,
      });

      // 이벤트 리스너 설정
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('TrackPlayer 초기화 완료');
    } catch (error) {
      console.error('TrackPlayer 초기화 실패:', error);
      throw error;
    }
  }

  // 이벤트 리스너 설정
  private setupEventListeners(): void {
    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (event) => {
      console.log('트랙 변경:', event);
      const track = await TrackPlayer.getTrack(event.nextTrack);
      this.updateState({ currentTrack: track });
    });

    TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
      console.log('재생 상태 변경:', event.state);
      await this.updatePlaybackState(event.state);
    });

    TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
      console.error('재생 오류:', event);
      this.updateState({
        error: event.message || '재생 중 오류가 발생했습니다.',
        isPlaying: false,
        isPaused: false,
      });
    });

    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
      this.updateState({
        currentTime: event.position,
        duration: event.duration,
      });
    });
  }

  // 재생 상태 업데이트
  private async updatePlaybackState(state: State): Promise<void> {
    const isPlaying = state === State.Playing;
    const isPaused = state === State.Paused;
    const isBuffering = state === State.Buffering;

    this.updateState({
      isPlaying,
      isPaused,
      isBuffering,
      error: null,
    });
  }

  // 상태 변경 콜백 등록
  onStateChange(callback: (state: TrackPlayerState) => void): void {
    this.onStateChangeCallbacks.push(callback);
  }

  // 상태 변경 콜백 제거
  removeStateChangeCallback(callback: (state: TrackPlayerState) => void): void {
    this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(
      cb => cb !== callback,
    );
  }

  // 상태 업데이트 및 콜백 호출
  private updateState(updates: Partial<TrackPlayerState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.onStateChangeCallbacks.forEach(callback =>
      callback(this.currentState),
    );
  }

  // 지역별 스트리밍 시작
  async playRegion(regionId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const regionName = RegionService.getRegionName(regionId) || regionId;
      const streamUrl = RegionService.getStreamUrl(regionId);
      
      if (!streamUrl) {
        throw new Error(`스트리밍 URL을 찾을 수 없습니다: ${regionId}`);
      }

      this.currentStreamUrl = streamUrl;

      // 기존 트랙 제거
      await TrackPlayer.reset();

      // 새 트랙 추가
      await TrackPlayer.add({
        id: regionId,
        url: streamUrl,
        title: regionName,
        artist: 'TBN Radio',
        artwork: undefined,
        duration: 0, // 라이브 스트림이므로 0
      });

      // 재생 시작
      await TrackPlayer.play();
      
      console.log(`스트리밍 시작: ${regionName} (${streamUrl})`);
      return true;
    } catch (error) {
      console.error('스트리밍 시작 실패:', error);
      this.updateState({
        isPlaying: false,
        isPaused: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
      return false;
    }
  }

  // 재생 일시정지
  async pause(): Promise<void> {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('일시정지 실패:', error);
    }
  }

  // 재생 재개
  async resume(): Promise<void> {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('재생 재개 실패:', error);
    }
  }

  // 재생 정지
  async stop(): Promise<void> {
    try {
      await TrackPlayer.reset();
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        currentTrack: null,
      });
    } catch (error) {
      console.error('재생 정지 실패:', error);
    }
  }

  // 볼륨 설정
  async setVolume(volume: number): Promise<void> {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      await TrackPlayer.setVolume(clampedVolume);
      console.log(`볼륨 설정: ${clampedVolume}`);
    } catch (error) {
      console.error('볼륨 설정 실패:', error);
    }
  }

  // 현재 상태 가져오기
  getCurrentState(): TrackPlayerState {
    return { ...this.currentState };
  }

  // 현재 스트리밍 URL 가져오기
  getCurrentStreamUrl(): string | null {
    return this.currentStreamUrl;
  }

  // 백그라운드 재생 설정
  enableBackgroundPlayback(): void {
    console.log('백그라운드 재생 활성화');
    // TrackPlayer는 자동으로 백그라운드 재생을 지원
  }

  // 정리
  async cleanup(): Promise<void> {
    try {
      await TrackPlayer.reset();
      this.isInitialized = false;
      this.currentState = {
        isPlaying: false,
        isPaused: false,
        isBuffering: false,
        currentTime: 0,
        duration: 0,
        error: null,
        currentTrack: null,
      };
    } catch (error) {
      console.error('TrackPlayer 정리 실패:', error);
    }
  }
} 