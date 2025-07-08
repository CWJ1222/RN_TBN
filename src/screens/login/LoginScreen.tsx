import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, LoadingSpinner } from '../../components/common';
import { login } from '../../store/slices/userSlice';
import { StorageService } from '../../utils/storage';
import { RootState } from '../../store/store';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  useEffect(() => {
    // 저장된 로그인 정보 불러오기
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const credentials = await StorageService.getCredentials();
      if (credentials) {
        setUsername(credentials.username);
        setPassword(credentials.password);
      }
    } catch (error) {
      console.error('Failed to load saved credentials:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = '아이디를 입력해주세요';
    }

    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 4) {
      newErrors.password = '비밀번호는 4자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 로그인 정보 저장
      await StorageService.saveCredentials(username, password);

      // Redux에 로그인 정보 저장
      dispatch(login({ username, password }));

      // 사용자 정보 저장
      const userInfo = {
        id: `user_${Date.now()}`,
        username,
        isLoggedIn: true,
      };
      await StorageService.saveUserInfo(userInfo);

      Alert.alert('로그인 성공', 'TBN 교통방송에 오신 것을 환영합니다!');
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      '게스트 로그인',
      '게스트로 이용하시겠습니까?\n일부 기능이 제한될 수 있습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            dispatch(login({ username: 'guest', password: '' }));
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>TBN 교통방송</Text>
            <Text style={styles.subtitle}>로그인</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="아이디"
              placeholder="아이디를 입력하세요"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              autoCapitalize="none"
            />

            <Input
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              autoCapitalize="none"
            />

            <View style={styles.buttonContainer}>
              <Button
                title="로그인"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />

              <Button
                title="게스트로 이용하기"
                onPress={handleGuestLogin}
                variant="outline"
                style={styles.guestButton}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              로그인 정보는 기기에 안전하게 저장됩니다
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingSpinner visible={loading} text="로그인 중..." overlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
  },
  form: {
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  guestButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default LoginScreen;
