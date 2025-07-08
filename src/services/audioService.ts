import { Region } from '../types';
import { RegionService } from './regionService';

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
}

export class AudioService {
  private static instance: AudioService;
  private playerRef: any = null;
  private currentStreamUrl: string | null = null;
  private onStateChangeCallbacks: ((state: AudioPlayerState) => void)[] = [];

  private currentState: AudioPlayerState = {
    isPlaying: false,
    isPaused: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    error: null,
  };

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
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

  // 플레이어 참조 설정
  setPlayerRef(ref: any) {
    this.playerRef = ref;
  }

  // 상태 변경 콜백 등록
  onStateChange(callback: (state: AudioPlayerState) => void) {
    this.onStateChangeCallbacks.push(callback);
  }

  // 상태 변경 콜백 제거
  removeStateChangeCallback(callback: (state: AudioPlayerState) => void) {
    this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(
      cb => cb !== callback,
    );
  }

  // 상태 업데이트 및 콜백 호출
  private updateState(updates: Partial<AudioPlayerState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.onStateChangeCallbacks.forEach(callback =>
      callback(this.currentState),
    );
  }

  // 지역별 스트리밍 시작
  async playRegion(regionId: string): Promise<boolean> {
    try {
      // getRegionById 제거, 지역 이름은 getRegionName 사용
      const regionName = RegionService.getRegionName(regionId) || regionId;
      const streamUrl = RegionService.getStreamUrl(regionId);
      if (!streamUrl) {
        throw new Error(`스트리밍 URL을 찾을 수 없습니다: ${regionId}`);
      }
      this.currentStreamUrl = streamUrl;
      this.updateState({
        isPlaying: true,
        isPaused: false,
        isBuffering: true,
        error: null,
      });
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
  pause(): void {
    if (this.playerRef) {
      this.updateState({
        isPlaying: false,
        isPaused: true,
      });
    }
  }

  // 재생 재개
  resume(): void {
    if (this.playerRef) {
      this.updateState({
        isPlaying: true,
        isPaused: false,
      });
    }
  }

  // 재생 정지
  stop(): void {
    if (this.playerRef) {
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
      });
    }
  }

  // 볼륨 설정
  setVolume(volume: number): void {
    if (this.playerRef) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      // react-native-video의 volume prop을 통해 설정
      console.log(`볼륨 설정: ${clampedVolume}`);
    }
  }

  // 현재 상태 가져오기
  getCurrentState(): AudioPlayerState {
    return { ...this.currentState };
  }

  // 현재 스트리밍 URL 가져오기
  getCurrentStreamUrl(): string | null {
    return this.currentStreamUrl;
  }

  // 오디오 포커스 요청 (Android)
  requestAudioFocus(): void {
    // Android에서 오디오 포커스를 요청하는 로직
    console.log('오디오 포커스 요청');
  }

  // 오디오 포커스 해제 (Android)
  abandonAudioFocus(): void {
    // Android에서 오디오 포커스를 해제하는 로직
    console.log('오디오 포커스 해제');
  }

  // 백그라운드 재생 설정
  enableBackgroundPlayback(): void {
    // 백그라운드 재생을 위한 설정
    console.log('백그라운드 재생 활성화');
  }

  // 에러 처리
  handleError(error: any): void {
    console.error('오디오 재생 오류:', error);
    this.updateState({
      isPlaying: false,
      isPaused: false,
      error: error?.message || '오디오 재생 중 오류가 발생했습니다.',
    });
  }

  // 버퍼링 상태 처리
  handleBuffering(isBuffering: boolean): void {
    this.updateState({ isBuffering });
  }

  // 재생 진행 상태 처리
  handleProgress(currentTime: number, duration: number): void {
    this.updateState({ currentTime, duration });
  }

  // 재생 완료 처리
  handleEnd(): void {
    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    });
  }

  // 리소스 정리
  cleanup(): void {
    this.stop();
    this.onStateChangeCallbacks = [];
    this.playerRef = null;
    this.currentStreamUrl = null;
  }
}

export default AudioService;
