export interface Worker {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  phoneNumber?: string;
  enrolledAt: string;
  updatedAt: string;
  isActive: boolean;
  worksiteId: string;
  enrolledDeviceId?: string;
}

export interface WorkerEnrollmentInput {
  employeeId: string;
  name: string;
  designation: string;
  phoneNumber?: string;
  worksiteId: string;
}

export interface WorkerFaceEmbedding {
  workerId: string;
  embeddingData: string;
  embeddingVersion: string;
  captureCount: number;
  createdAt: string;
}
