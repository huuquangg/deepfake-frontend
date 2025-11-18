import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, type SharedValue } from 'react-native-reanimated';

export interface Face {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  rollAngle?: number;
  yawAngle?: number;
  smilingProbability?: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
}

interface FaceOverlayProps {
  faces: SharedValue<Face[]>;
}

export default function FaceOverlay({ faces }: FaceOverlayProps) {
  const faceCount = useDerivedValue(() => faces.value.length);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Render up to 10 face overlays */}
      {Array.from({ length: 10 }).map((_, index) => (
        <FaceOval key={`face-${index}`} faces={faces} index={index} />
      ))}
    </View>
  );
}

interface FaceOvalProps {
  faces: SharedValue<Face[]>;
  index: number;
}

function FaceOval({ faces, index }: FaceOvalProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const facesList = faces.value;
    
    if (index >= facesList.length) {
      return {
        opacity: 0,
      };
    }

    const face = facesList[index];
    const { origin, size } = face.bounds;

    return {
      position: 'absolute',
      left: origin.x,
      top: origin.y,
      width: size.width,
      height: size.height,
      // make rectangle
      borderRadius: 0,
      borderWidth: 3,
      borderColor: 'rgba(52, 199, 89, 0.8)',
      backgroundColor: 'rgba(52, 199, 89, 0.1)',
      opacity: 1,
    };
  });

  return <Animated.View style={animatedStyle} />;
}
