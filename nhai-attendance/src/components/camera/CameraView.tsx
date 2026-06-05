import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useTheme } from '@theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface CameraViewProps {
  isActive: boolean;
  position?: 'front' | 'back';
  style?: StyleProp<ViewStyle>;
}

export const CameraView: React.FC<CameraViewProps> = ({
  isActive,
  position = 'front',
  style,
}) => {
  const { colors, fontSize } = useTheme();
  const device = useCameraDevice(position);
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: colors.background.tertiary }, style]}>
        <Icon name="camera-off" size={32} color={colors.text.tertiary} />
        <Text style={[styles.fallbackText, { color: colors.text.tertiary, fontSize: fontSize.sm }]}>
          No Camera Permission
        </Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: colors.background.tertiary }, style]}>
        <Icon name="camera-off" size={32} color={colors.text.tertiary} />
        <Text style={[styles.fallbackText, { color: colors.text.tertiary, fontSize: fontSize.sm }]}>
          No Camera Device
        </Text>
      </View>
    );
  }

  return (
    <Camera
      style={[StyleSheet.absoluteFill, style]}
      device={device}
      isActive={isActive}
      photo={true}
    />
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    marginTop: 8,
  },
});
