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
import { AudioPlayer } from '../../components/audio';
import { RootState } from '../../store/store';
import {
  setPlaying,
  setPaused,
  setCurrentRegion,
} from '../../store/slices/audioSlice';
import { RegionService } from '../../services/regionService';
import { AudioService } from '../../services/audioService';
import { ApiService } from '../../services/apiService';
import RegionSelector from '../../components/RegionSelector/RegionSelector';

const MainScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isPlaying, currentRegion } = useSelector(
    (state: RootState) => state.audio,
  );
  const { username } = useSelector((state: RootState) => state.user);

  const [regionName, setRegionName] = useState('부산');
  const [regionSelectorVisible, setRegionSelectorVisible] = useState(false);
  const [programInfo, setProgramInfo] = useState<{
    title: string;
    mc: string;
    time: string;
  } | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(true); // 앱 시작 시 로딩 상태로 시작

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
          const isAudio = await AudioService.checkStreamUrlIsAudio(streamUrl);
          if (!isAudio) {
            Alert.alert(
              '재생 오류',
              '이 URL은 오디오 스트림이 아닙니다. 관리자에게 문의하세요.',
            );
            return;
          }
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
          onError={error => {
            Alert.alert('재생 오류', error);
          }}
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
});

export default MainScreen;
