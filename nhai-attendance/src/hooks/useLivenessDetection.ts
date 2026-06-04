import { useState } from 'react';
import { analyzeLivenessSequence } from '@ml/livenessDetection';

export function useLivenessDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [livenessScore, setLivenessScore] = useState<number | null>(null);

  const analyze = async (frames: string[]) => {
    setIsAnalyzing(true);
    try {
      const score = await analyzeLivenessSequence(frames);
      setLivenessScore(score);
      return score;
    } catch (err) {
      console.error(err);
      return 0;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { isAnalyzing, livenessScore, analyze };
}
