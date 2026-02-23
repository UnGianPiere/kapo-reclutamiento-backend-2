import * as CryptoJS from 'crypto-js';

// Clave de encriptación (debe ser la misma en frontend y backend)
const ENCRYPTION_KEY = process.env['ENCRYPTION_KEY'] || 'default-key-change-in-prod';

export class CryptoUtil {
  static encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  }

  static decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }
}
