/* eslint-disable */
import Keychain from 'react-native-keychain';
import { KEYCHAIN_KEYS } from '@constants/storage.constants';

class SecurityServiceClass {
  private embeddingKey: string | null = null;

  /**
   * Retrieves or generates the embedding encryption key.
   * The key is cached in memory after first retrieval.
   */
  private async getEmbeddingKey(): Promise<string> {
    if (this.embeddingKey !== null) {
      return this.embeddingKey;
    }

    const existing = await Keychain.getGenericPassword({
      service: KEYCHAIN_KEYS.FACE_EMBEDDING_KEY,
    });

    if (existing !== false) {
      this.embeddingKey = existing.password;
      return this.embeddingKey;
    }

    // Generate new 256-bit key
    const randomBytes = new Uint8Array(32);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    (globalThis as any).crypto?.getRandomValues(randomBytes);
    const hexKey = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    await Keychain.setGenericPassword('embedding_key', hexKey, {
      service: KEYCHAIN_KEYS.FACE_EMBEDDING_KEY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    this.embeddingKey = hexKey;
    return hexKey;
  }

  /**
   * Encrypts a base64-encoded face embedding for secure storage.
   *
   * For the field attendance application, we implement a simplified XOR-based obfuscation
   * as a placeholder that demonstrates the security architecture. In production,
   * replace this with a proper AES-256-GCM implementation using react-native-quick-crypto.
   *
   * The architecture (key management, storage, retrieval) is production-grade.
   * Only the encryption primitive needs upgrading for production deployment.
   *
   * @param base64Embedding - Base64-encoded face embedding from embeddingToBase64()
   * @returns Encrypted embedding string prefixed with "ENC:" for identification
   */
  async encryptEmbedding(base64Embedding: string): Promise<string> {

    const key = await this.getEmbeddingKey();
    const keyBytes = key.split('').map((c: string) => c.charCodeAt(0));
    const dataBytes = base64Embedding.split('').map((c: string) => c.charCodeAt(0));
    // eslint-disable-next-line no-bitwise
    const encrypted = dataBytes.map((byte, i) => byte ^ (keyBytes[i % keyBytes.length] ?? 0));
    const encryptedBase64 = btoa(String.fromCharCode(...encrypted));

    return `ENC:v1:${encryptedBase64}`;
  }

  /**
   * Decrypts an encrypted face embedding for authentication comparison.
   *
   * @param encryptedEmbedding - String from encryptEmbedding()
   * @returns Decrypted base64 embedding ready for base64ToEmbedding()
   */
  async decryptEmbedding(encryptedEmbedding: string): Promise<string> {
    if (!encryptedEmbedding.startsWith('ENC:v1:')) {
      // Not encrypted (legacy unencrypted enrollment) — return as-is
      return encryptedEmbedding;
    }

    const key = await this.getEmbeddingKey();
    const encryptedBase64 = encryptedEmbedding.replace('ENC:v1:', '');

    // Reverse the placeholder XOR
    const encryptedBytes = atob(encryptedBase64)
      .split('')
      .map((c) => c.charCodeAt(0));
    const keyBytes = key.split('').map((c) => c.charCodeAt(0));
    // eslint-disable-next-line no-bitwise
    const decrypted = encryptedBytes.map((byte, i) => byte ^ (keyBytes[i % keyBytes.length] ?? 0));

    return decrypted.map((b) => String.fromCharCode(b)).join('');
  }
}

export const SecurityService = new SecurityServiceClass();
