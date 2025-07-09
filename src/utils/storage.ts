import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  private static readonly KEYS = {
    USER_INFO: 'user_info',
    CURRENT_REGION: 'current_region',
    AUDIO_SETTINGS: 'audio_settings',
    RECORDING_SETTINGS: 'recording_settings',
    APP_SETTINGS: 'app_settings',
  };

  // 사용자 정보 저장
  static async saveUserInfo(userInfo: { email: string }): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Failed to save user info:', error);
    }
  }

  // 사용자 정보 가져오기
  static async getUserInfo(): Promise<{ email: string } | null> {
    try {
      const userInfo = await AsyncStorage.getItem(this.KEYS.USER_INFO);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // 현재 지역 저장
  static async saveCurrentRegion(regionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.CURRENT_REGION, regionId);
    } catch (error) {
      console.error('Failed to save current region:', error);
    }
  }

  // 현재 지역 가져오기
  static async getCurrentRegion(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.KEYS.CURRENT_REGION);
    } catch (error) {
      console.error('Failed to get current region:', error);
      return null;
    }
  }

  // 오디오 설정 저장
  static async saveAudioSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.AUDIO_SETTINGS,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }

  // 오디오 설정 가져오기
  static async getAudioSettings(): Promise<any | null> {
    try {
      const settings = await AsyncStorage.getItem(this.KEYS.AUDIO_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Failed to get audio settings:', error);
      return null;
    }
  }

  // 앱 설정 저장
  static async saveAppSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.APP_SETTINGS,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.error('Failed to save app settings:', error);
    }
  }

  // 앱 설정 가져오기
  static async getAppSettings(): Promise<any | null> {
    try {
      const settings = await AsyncStorage.getItem(this.KEYS.APP_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Failed to get app settings:', error);
      return null;
    }
  }

  // 모든 데이터 삭제 (로그아웃 시)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.KEYS.USER_INFO]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // 특정 키 삭제
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }

  // 모든 키 가져오기
  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return Array.from(keys); // Convert readonly array to mutable array
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }
}
