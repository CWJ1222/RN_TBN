import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Button, LoadingSpinner } from '../../components/common';
import { AudioPlayer } from '../../components/audio';
import { RootState } from '../../store/store';
import {
  setPlaying,
  setPaused,
  setCurrentRegion,
} from '../../store/slices/audioSlice';
import { logout, updateProfile } from '../../store/slices/userSlice';
import { RegionService } from '../../services/regionService';
import { AudioService } from '../../services/audioService';
import { ApiService } from '../../services/apiService';
import RegionSelector from '../../components/RegionSelector/RegionSelector';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const MainScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isPlaying, currentRegion } = useSelector(
    (state: RootState) => state.audio,
  );
  const { email, nickname, isLoggedIn } = useSelector(
    (state: RootState) => state.user,
  );

  const [regionName, setRegionName] = useState('부산');
  const [regionSelectorVisible, setRegionSelectorVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [programInfo, setProgramInfo] = useState<{
    title: string;
    mc: string;
    time: string;
  } | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(true); // 앱 시작 시 로딩 상태로 시작
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newNickname, setNewNickname] = useState(nickname || '');

  useEffect(() => {
    updateRegionName();
    fetchProgramInfo();
  }, [currentRegion]);

  const updateRegionName = () => {
    const name = RegionService.getRegionName(currentRegion);
    if (name) {
      setRegionName(name);
    }
  };

  const fetchProgramInfo = async () => {
    setLoadingProgram(true);
    try {
      console.log('방송 정보 요청 중...', currentRegion);
      const info = await ApiService.getCurrentProgramFromHtml(currentRegion);
      console.log('방송 정보 수신:', info);
      setProgramInfo(info);
    } catch (e) {
      console.error('방송 정보 로드 실패:', e);
      setProgramInfo(null);
    } finally {
      setLoadingProgram(false);
    }
  };

  const handlePlayPress = async () => {
    if (isPlaying) {
      dispatch(setPaused(true));
    } else {
      try {
        const streamUrl = RegionService.getStreamUrl(currentRegion);
        if (streamUrl) {
          // 네이티브에서 직접 재생하므로 오디오 체크 생략
          dispatch(setPlaying(true));
        } else {
          Alert.alert('오류', '스트리밍 URL을 가져올 수 없습니다.');
        }
      } catch (error) {
        console.error('Failed to start streaming:', error);
        Alert.alert('오류', '스트리밍을 시작할 수 없습니다.');
      }
    }
  };

  const handleSmsPress = () => {
    Alert.alert('문자 참여', '문자 참여 기능은 추후 제공될 예정입니다.', [
      { text: '확인' },
    ]);
  };

  const handleRegionPress = () => {
    setRegionSelectorVisible(true);
  };

  const handleRegionSelect = (regionId: string) => {
    dispatch(setCurrentRegion(regionId));
    setRegionSelectorVisible(false);
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleLoginPress = () => {
    setMenuVisible(false);
    (navigation as any).navigate('Login');
  };

  const handleLogoutPress = async () => {
    setMenuVisible(false);

    try {
      // 구글 인증 세션까지 로그아웃
      await GoogleSignin.signOut();
      // 저장된 로그인 정보 삭제
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('nickname');

      // Redux 상태 업데이트
      dispatch(logout());

      Alert.alert('로그아웃', '로그아웃되었습니다.');
    } catch (error) {
      console.error('Failed to logout:', error);
      Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleEditProfile = () => {
    setNewNickname(nickname || '');
    setEditModalVisible(true);
  };

  const handleSaveNickname = async () => {
    try {
      // 저장된 토큰 가져오기
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
        return;
      }

      // 백엔드에 닉네임 수정 요청
      const response = await ApiService.updateNickname(token, newNickname);

      if (response) {
        // 성공 시 Redux 상태 업데이트
        dispatch(updateProfile({ nickname: response.nickname }));

        // AsyncStorage에도 저장
        await AsyncStorage.setItem('nickname', response.nickname);

        setEditModalVisible(false);
        Alert.alert('성공', '닉네임이 수정되었습니다.');
      } else {
        Alert.alert('오류', '닉네임 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update nickname:', error);
      Alert.alert('오류', '닉네임 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.welcomeText}>
          안녕하세요, {nickname ? nickname : email || '사용자'}님!
        </Text>
        <TouchableOpacity
          onPress={handleRegionPress}
          style={styles.regionButton}
        >
          <Text style={styles.regionText}>{regionName}</Text>
          <Text style={styles.regionArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* 방송 정보 표시 */}
        <View style={styles.programInfo}>
          {loadingProgram ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner
                visible={true}
                text="방송 정보를 불러오는 중..."
              />
            </View>
          ) : programInfo ? (
            <>
              <Text style={styles.programTitle}>{programInfo.title}</Text>
              <Text style={styles.programMc}>MC: {programInfo.mc}</Text>
              <Text style={styles.programTime}>{programInfo.time}</Text>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.noProgramText}>
                방송 정보를 가져올 수 없습니다.
              </Text>
              <Button
                title="다시 시도"
                onPress={fetchProgramInfo}
                variant="outline"
                size="small"
                style={styles.retryButton}
              />
            </View>
          )}
        </View>

        {/* 오디오 플레이어 */}
        <AudioPlayer
          streamUrl={RegionService.getStreamUrl(currentRegion) || undefined}
        />

        <View style={styles.controls}>
          <Button
            title="문자 참여"
            onPress={handleSmsPress}
            variant="outline"
            size="large"
            style={styles.smsButton}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>TBN 교통방송 - 실시간 교통정보</Text>
      </View>

      {/* 지역 선택 모달 */}
      <RegionSelector
        visible={regionSelectorVisible}
        onSelect={handleRegionSelect}
        onClose={() => setRegionSelectorVisible(false)}
      />

      {/* 메뉴 모달 */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>메뉴</Text>
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menuItems}>
              {!isLoggedIn ? (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLoginPress}
                >
                  <Text style={styles.menuItemText}>로그인</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleEditProfile}
                  >
                    <Text style={styles.menuItemText}>정보수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleLogoutPress}
                  >
                    <Text style={styles.menuItemText}>로그아웃</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 닉네임 수정 모달 */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditModalVisible(false)}
        >
          <View style={[styles.menuContainer, { paddingTop: 30 }]}>
            <Text style={styles.menuTitle}>닉네임 수정</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E5EA',
                borderRadius: 8,
                padding: 12,
                marginVertical: 16,
              }}
              value={newNickname}
              onChangeText={setNewNickname}
              placeholder="닉네임 입력"
              maxLength={20}
            />
            <Button
              title="저장"
              onPress={handleSaveNickname}
              style={{ width: '100%' }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#007AFF',
  },
  welcomeText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  regionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
  },
  regionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 4,
  },
  regionArrow: {
    fontSize: 12,
    color: '#007AFF',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  programInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  programTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  programMc: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  programTime: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
  },
  noProgramText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  retryButton: {
    marginTop: 12,
  },
  controls: {
    gap: 16,
  },
  smsButton: {
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 20,
    color: '#8E8E93',
  },
  menuItems: {
    paddingTop: 16,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuItemText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default MainScreen;
