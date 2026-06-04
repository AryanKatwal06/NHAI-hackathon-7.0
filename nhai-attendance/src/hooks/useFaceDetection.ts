import { useState } from 'react';
import { detectFace } from '@ml/faceRecognition';

export function useFaceDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceScore, setFaceScore] = useState<number | null>(null);

  const detect = async (imagePath: string) => {
    setIsDetecting(true);
    try {
      const result = await detectFace(imagePath);
      setFaceScore(result.score);
      return result.detected;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsDetecting(false);
    }
  };

  return { isDetecting, faceScore, detect };
}
