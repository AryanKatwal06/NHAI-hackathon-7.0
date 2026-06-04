// Mock implementation for liveness detection

export async function analyzeLivenessSequence(frames: string[]): Promise<number> {
  if (frames.length === 0) {
    return 0;
  }

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 800));

  // High score if multiple frames are provided
  return frames.length > 2 ? 0.92 : 0.45;
}
