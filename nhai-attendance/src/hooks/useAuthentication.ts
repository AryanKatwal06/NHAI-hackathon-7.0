import { useState } from 'react';
import { completePipeline } from '@services/AuthenticationService';

export function useAuthentication() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async (workerId: string, faceScore: number, livenessScore: number) => {
    setIsAuthenticating(true);
    try {
      // For demo, passing empty precomputed signals
      const result = await completePipeline(
        workerId,
        faceScore,
        livenessScore,
        {} as any,
        Date.now(),
      );
      return result;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return { isAuthenticating, authenticate };
}
