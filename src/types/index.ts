// 사용자 관련 타입
export interface User {
  id: string;
  username: string;
  nickname?: string;
  isLoggedIn: boolean;
}

// 방송 프로그램 타입
export interface Program {
  id: string;
  title: string;
  mc: string;
  startTime: string;
  endTime: string;
  sms?: string;
  description?: string;
}

// 지역 타입
export interface Region {
  id: string;
  name: string;
  code: string;
  streamUrl: string;
  smsNumber: string;
}

// 오디오 상태 타입
export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentProgram: Program | null;
  currentRegion: string;
  volume: number;
}

// 녹음 파일 타입
export interface Recording {
  id: string;
  title: string;
  filePath: string;
  duration: number;
  createdAt: Date;
  size: number;
}

// 교통정보 타입
export interface TrafficNews {
  id: string;
  title: string;
  content: string;
  region: string;
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
}
