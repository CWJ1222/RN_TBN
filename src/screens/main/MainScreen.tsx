import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Button, LoadingSpinner } from '../../components/common';
import { RootState } from '../../store/store';
import {
  setPlaying,
  setPaused,
  setCurrentProgram,
} from '../../store/slices/audioSlice';
import { ApiService } from '../../services/apiService';
import { RegionService } from '../../services/regionService';

const MainScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isPlaying, currentProgram, currentRegion } = useSelector(
    (state: RootState) => state.audio,
  );
  const { username } = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(false);
  const [regionName, setRegionName] = useState('부산');

  useEffect(() => {
    loadCurrentProgram();
    updateRegionName();
  }, [currentRegion]);

  const updateRegionName = () => {
    const name = RegionService.getRegionName(currentRegion);
    if (name) {
      setRegionName(name);
    }
  };

  const loadCurrentProgram = async () => {
    setLoading(true);
    try {
      const program = await ApiService.getCurrentProgram(currentRegion);
      if (program) {
        dispatch(setCurrentProgram(program));
      }
    } catch (error) {
      console.error('Failed to load current program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPress = async () => {
    if (isPlaying) {
      dispatch(setPaused(true));
    } else {
      try {
        const streamUrl = ApiService.getStreamUrl(currentRegion);
        if (streamUrl) {
          // 여기서 실제 오디오 스트리밍을 시작합니다
          // react-native-track-player를 사용할 예정
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
    const smsNumber = ApiService.getSmsNumber(
      currentRegion,
      currentProgram || undefined,
    );
    Alert.alert(
      '문자 참여',
      `문자 번호: ${smsNumber}\n\n문자 앱으로 이동하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            // 여기서 SMS 앱을 열거나 웹뷰로 문자 참여 페이지를 열 수 있습니다
            console.log('SMS 참여:', smsNumber);
          },
        },
      ],
    );
  };

  const handleRegionPress = () => {
    Alert.alert('지역 선택', '지역 선택 기능은 추후 구현됩니다.', [
      { text: '확인' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          안녕하세요, {username || '게스트'}님!
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
        <View style={styles.programInfo}>
          {currentProgram ? (
            <>
              <Text style={styles.programTitle}>{currentProgram.title}</Text>
              <Text style={styles.programMc}>MC: {currentProgram.mc}</Text>
              <Text style={styles.programTime}>
                {currentProgram.startTime} - {currentProgram.endTime}
              </Text>
              {currentProgram.description && (
                <Text style={styles.programDescription}>
                  {currentProgram.description}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.noProgramText}>
              현재 방송 정보를 불러오는 중...
            </Text>
          )}
        </View>

        <View style={styles.controls}>
          <Button
            title={isPlaying ? '일시정지' : '재생'}
            onPress={handlePlayPress}
            size="large"
            style={styles.playButton}
          />

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

      <LoadingSpinner visible={loading} text="방송 정보 로딩 중..." overlay />
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  programTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  programMc: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 8,
  },
  programTime: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  programDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  noProgramText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  controls: {
    gap: 16,
  },
  playButton: {
    marginBottom: 8,
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
});

export default MainScreen;
