/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AudioService } from './src/services/audioService';

const App: React.FC = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '929637116364-eqsl60da7giesc340fk6evl9e9i4bts2.apps.googleusercontent.com',
      offlineAccess: true,
    });

    // AudioService 초기화 및 백그라운드 재생 설정 (삭제)
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;
