declare module 'crypto-js' {
  export interface CipherParams {
    ciphertext: any;
    key: any;
    iv: any;
    salt: any;
    algorithm: any;
  }

  export interface WordArray {
    words: number[];
    sigBytes: number;
    toString(encoder?: any): string;
  }

  export const AES: {
    encrypt(message: string, key: string): CipherParams;
    decrypt(ciphertext: string, key: string): WordArray;
  };

  export const enc: {
    Utf8: any;
    Hex: any;
    Base64: any;
  };
}

export * from 'crypto-js';
