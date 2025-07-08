import { Program, TrafficNews } from '../types';
import { RegionService, toRegionCode } from './regionService';

const BASE_URL = 'http://10.0.2.2:8080';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      // HTTP 에러 처리
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${text}`,
        );
      }

      // Content-Type 체크
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Invalid content-type: ${contentType}, body: ${text}`);
      }

      return await response.json();
    } catch (error) {
      // JSON 파싱 실패 등 모든 예외를 래핑
      throw new Error(
        `API request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  // 현재 방송 정보 가져오기
  static async getCurrentProgram(regionId: string): Promise<Program | null> {
    try {
      const code = aCode(regionId);
      const response = await this.request<Program>(
        `/api/program/${code}/current`,
      );
      return response;
    } catch (error) {
      console.error('Failed to get current program:', error);
      return null;
    }
  }

  // 지역별 프로그램 정보 가져오기
  static async getPrograms(regionId: string): Promise<Program[]> {
    try {
      const code = toRegionCode(regionId);
      const response = await this.request<Program[]>(`/api/program/${code}`);
      return response;
    } catch (error) {
      console.error('Failed to get programs:', error);
      return [];
    }
  }

  // 교통정보 가져오기
  static async getTrafficNews(regionId?: string): Promise<TrafficNews[]> {
    try {
      const code = regionId ? toRegionCode(regionId) : undefined;
      const endpoint = code ? `/api/traffic/${code}` : '/api/traffic';
      const response = await this.request<TrafficNews[]>(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get traffic news:', error);
      return [];
    }
  }

  // 스트리밍 URL 가져오기
  static getStreamUrl(regionId: string): string | null {
    return RegionService.getStreamUrl(regionId);
  }

  // 문자 참여 번호 가져오기
  static getSmsNumber(regionId: string, program?: Program): string {
    // 프로그램별 특별 번호가 있으면 사용, 없으면 지역 기본 번호 사용
    if (program?.sms) {
      return program.sms;
    }
    // RegionService.getSmsNumber 제거, 기본값 반환
    return '#9977';
  }

  // 방송 상태 확인
  static async checkStreamStatus(regionId: string): Promise<boolean> {
    try {
      const streamUrl = this.getStreamUrl(regionId);
      if (!streamUrl) return false;

      const response = await fetch(streamUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Failed to check stream status:', error);
      return false;
    }
  }

  // 서버 상태 확인
  static async checkServerHealth(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string }>('/api/health');
      return response.status === 'ok';
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }

  // 지역별 onair HTML에서 방송 정보 파싱 (정규식 기반)
  static async getCurrentProgramFromHtml(regionId: string): Promise<{
    title: string;
    mc: string;
    time: string;
    regionCode?: string;
    regionName?: string;
  } | null> {
    try {
      // regionId(숫자 코드)를 그대로 사용
      const response = await this.request<{
        title: string;
        mc: string;
        time: string;
        regionCode?: string;
        regionName?: string;
      }>(`/api/tbn/broadcast/${regionId}`);
      return response;
    } catch (error) {
      console.error('Failed to parse program info from HTML:', error);
      return null;
    }
  }
}
