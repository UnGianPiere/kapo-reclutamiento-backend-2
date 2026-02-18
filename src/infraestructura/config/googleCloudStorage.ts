import { Storage } from '@google-cloud/storage';
import { logger } from '../logging';
import { ConfigService } from './ConfigService';

const configService = ConfigService.getInstance();
const config = configService.getGCPConfig();

let storageInstance: Storage | null = null;

export const getStorageClient = (): Storage => {
  if (!storageInstance) {
    // Verificar si tenemos credenciales válidas
    const credentialsJson = process.env['GOOGLE_CLOUD_CREDENTIALS_JSON'];
    
    if (!credentialsJson || config.projectId === 'default-project') {
      logger.warn('⚠️ Upload de archivos deshabilitado - GOOGLE_CLOUD_CREDENTIALS_JSON no configurado o inválido');
      throw new Error('Upload de archivos no disponible - Configuración de GCP requerida');
    }

    const storageOptions: { projectId: string; credentials?: any } = {
      projectId: config.projectId,
    };
    
    try {
      storageOptions.credentials = JSON.parse(credentialsJson);
      logger.info('✅ Credenciales GCP cargadas desde GOOGLE_CLOUD_CREDENTIALS_JSON');
    } catch (error) {
      logger.error('❌ Error al parsear GOOGLE_CLOUD_CREDENTIALS_JSON', { error });
      throw new Error('GOOGLE_CLOUD_CREDENTIALS_JSON no es un JSON válido');
    }
    
    storageInstance = new Storage(storageOptions);
  }
  return storageInstance;
};

export const getBucket = () => {
  if (config.projectId === 'default-project') {
    throw new Error('Upload de archivos no disponible - Configuración de GCP requerida');
  }
  return getStorageClient().bucket(config.bucket);
};

export const getGCPConfig = () => config;

export const verifyGCPConnection = async (): Promise<boolean> => {
  try {
    if (config.projectId === 'default-project') {
      logger.warn('⚠️ Upload de archivos deshabilitado - Configuración de GCP requerida');
      return false;
    }
    await getBucket().exists();
    logger.info('GCP Storage verificado');
    return true;
  } catch (error) {
    logger.error('GCP Storage error', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
};
