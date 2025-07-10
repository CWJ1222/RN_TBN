import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { AudioService } from '../../services/audioService';

interface AudioPlayerProps {
  streamUrl?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ streamUrl }) => {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      AudioService.stop();
      setIsPlaying(false);
    } else {
      if (streamUrl) {
        AudioService.play(streamUrl);
        setIsPlaying(true);
      }
    }
  };

  const handleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    AudioService.setVolume(newMuted ? 0 : volume);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    setMuted(value === 0);
    AudioService.setVolume(value);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
        <Text style={styles.buttonText}>{isPlaying ? '⏸️' : '▶️'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.muteButton} onPress={handleMute}>
        <Text style={styles.buttonText}>{muted ? '🔇' : '🔊'}</Text>
      </TouchableOpacity>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onValueChange={handleVolumeChange}
        step={0.01}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16 },
  button: { backgroundColor: '#2196F3', margin: 4, padding: 12, borderRadius: 8 },
  muteButton: { backgroundColor: '#888', margin: 4, padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 24 },
  slider: { width: 120, marginLeft: 8 },
});

export default AudioPlayer;
