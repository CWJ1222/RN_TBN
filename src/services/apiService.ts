import { Program, TrafficNews } from '../types';
import { RegionService } from './regionService';

const BASE_URL = 'https://radio2.tbn.or.kr:442';

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 현재 방송 정보 가져오기
  static async getCurrentProgram(regionId: string): Promise<Program | null> {
    try {
      const response = await this.request<Program>(
        `/api/program/${regionId}/current`,
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
      const response = await this.request<Program[]>(
        `/api/program/${regionId}`,
      );
      return response;
    } catch (error) {
      console.error('Failed to get programs:', error);
      return [];
    }
  }

  // 교통정보 가져오기
  static async getTrafficNews(regionId?: string): Promise<TrafficNews[]> {
    try {
      const endpoint = regionId ? `/api/traffic/${regionId}` : '/api/traffic';
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
    return RegionService.getSmsNumber(regionId) || '#9977';
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
}
