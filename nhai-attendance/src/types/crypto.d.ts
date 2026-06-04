declare module 'crypto' {
  export function createHash(algorithm: string): unknown;
  export function randomBytes(size: number): unknown;
}
