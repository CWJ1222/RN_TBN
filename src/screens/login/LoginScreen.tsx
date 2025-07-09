import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Button, LoadingSpinner } from '../../components/common';
import { login } from '../../store/slices/userSlice';
import { useNavigation } from '@react-navigation/native';
import { ApiService } from '../../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 구글 로그인 관련 import
import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from '@react-native-google-signin/google-signin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // 저장된 로그인 정보 확인
    checkSavedLogin();
  }, []);

  // 저장된 로그인 정보 확인
  const checkSavedLogin = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('authToken');
      const savedEmail = await AsyncStorage.getItem('email');
      const savedNickname = await AsyncStorage.getItem('nickname');

      if (savedToken && savedEmail) {
        // 저장된 토큰이 있으면 자동 로그인
        dispatch(login({ email: savedEmail, nickname: savedNickname || '' }));
        (navigation as any).goBack();
      }
    } catch (error) {
      console.error('Failed to check saved login:', error);
    }
  };

  // 로그인 정보 저장
  const saveLoginInfo = async (
    token: string,
    email: string,
    nickname: string,
  ) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('nickname', nickname);
    } catch (error) {
      console.error('Failed to save login info:', error);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // 구글 로그인 구현
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('google user info: ', userInfo);
      const info: any = userInfo;

      // idToken 추출 보완
      const idToken = info.idToken || (info.data && info.data.idToken);
      const user = info.user || (info.data && info.data.user);

      if (!idToken) {
        Alert.alert('로그인 실패', 'Google ID 토큰을 받을 수 없습니다.');
        return;
      }

      try {
        const response = await ApiService.googleLogin(idToken);
        console.log('서버 응답:', response);

        if (response) {
          // 로그인 정보 저장
          await saveLoginInfo(
            response.token,
            response.email,
            response.nickname,
          );

          // Redux 상태 업데이트
          dispatch(
            login({ email: response.email, nickname: response.nickname }),
          );

          // Alert.alert('로그인 성공', '구글 계정으로 로그인되었습니다.');
          (navigation as any).goBack();
        } else {
          Alert.alert('로그인 실패', '서버 연결에 실패했습니다.');
        }
      } catch (e) {
        console.log('로그인 API 실패:', e);
        Alert.alert('로그인 실패', '서버 연결에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Google login failed:', error);

      // 구글 로그인 에러 처리
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('로그인 취소', '로그인이 취소되었습니다.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('로그인 진행 중', '이미 로그인이 진행 중입니다.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          '서비스 오류',
          'Google Play Services를 사용할 수 없습니다.',
        );
      } else {
        Alert.alert('로그인 실패', '구글 로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };
  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   Alert.alert('구글 로그인 버튼 클릭됨');
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     Alert.alert('userInfo: ' + JSON.stringify(userInfo.data?.idToken));
  //     const signInResult = userInfo as any;

  //     if (!signInResult.data?.idToken) {
  //       Alert.alert('idToken 없음');
  //       return;
  //     }

  //     Alert.alert('idToken 있음, googleLogin 호출');
  //     const idToken = signInResult.data?.idToken;
  //     const user = signInResult.user;

  //     await ApiService.googleLogin(idToken);
  //     Alert.alert('googleLogin 호출 완료');
  //   } catch (error) {
  //     Alert.alert('에러: ' + error);
  //     console.error('Google login failed:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      // 애플 로그인 구현 (추후 구현)
      Alert.alert('준비 중', '애플 로그인은 추후 제공될 예정입니다.');
    } catch (error) {
      console.error('Apple login failed:', error);
      Alert.alert('로그인 실패', '애플 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    (navigation as any).goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Button
          title="← 뒤로"
          onPress={handleBackPress}
          variant="outline"
          size="small"
          style={styles.backButton}
        />
        <Text style={styles.title}>로그인</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>TBN</Text>
          <Text style={styles.subtitle}>교통방송</Text>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.description}>
            소셜 계정으로 간편하게 로그인하세요
          </Text>

          {Platform.OS === 'android' ? (
            <Button
              title="Google로 로그인"
              onPress={handleGoogleLogin}
              loading={loading}
              style={styles.googleButton}
            />
          ) : (
            <Button
              title="Apple로 로그인"
              onPress={handleAppleLogin}
              loading={loading}
              style={styles.appleButton}
            />
          )}
        </View>
      </View>

      <LoadingSpinner visible={loading} text="로그인 중..." overlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
  },
  loginContainer: {
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    width: '100%',
  },
  appleButton: {
    backgroundColor: '#000000',
    width: '100%',
  },
});

export default LoginScreen;
