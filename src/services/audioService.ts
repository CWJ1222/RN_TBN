import { NativeModules, Platform } from 'react-native';

const { AudioPlayerModule } = NativeModules;

export class AudioService {
  static play(url: string) {
    if (Platform.OS === 'android') {
      AudioPlayerModule.play(url);
    }
  }
  static pause() {
    if (Platform.OS === 'android') {
      AudioPlayerModule.pause();
    }
  }
  static resume() {
    if (Platform.OS === 'android') {
      AudioPlayerModule.resume();
    }
  }
  static stop() {
    if (Platform.OS === 'android') {
      AudioPlayerModule.stop();
    }
  }
  static setVolume(volume: number) {
    if (Platform.OS === 'android') {
      AudioPlayerModule.setVolume(volume);
    }
  }
}
